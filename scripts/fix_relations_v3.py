#!/usr/bin/env python3
"""
Script quirúrgico V3 para corregir capitalizaciones de relaciones Prisma.
Enfoque dual:
1. Corregir include/select/where (club: true → Club: true)
2. Corregir acceso a propiedades de relaciones (court.club.id → court.Club.id)
"""

import re
from pathlib import Path
from typing import Dict, Tuple

# Mapeo correcto desde schema.prisma
# Nota: booking-singular es relación, bookings-plural es array
SINGULAR_RELATIONS = {
    'club': 'Club',
    'court': 'Court',
    'booking': 'Booking',
    'player': 'Player',
    'payment': 'Payment',
    'user': 'User',
    'tournament': 'Tournament',
    'tournamentRegistration': 'TournamentRegistration',
    'tournamentMatch': 'TournamentMatch',
    'tournamentRound': 'TournamentRound',
    'notification': 'Notification',
    'pricing': 'Pricing',
    'schedule': 'Schedule',
    'attendance': 'Attendance',
}

# Relaciones plurales (arrays)
PLURAL_RELATIONS = {
    'courts': 'Court',
    'bookings': 'Booking',
    'players': 'Player',
    'payments': 'Payment',
    'users': 'User',
    'tournaments': 'Tournament',
    'tournamentRegistrations': 'TournamentRegistration',
    'tournamentMatches': 'TournamentMatch',
    'tournamentRounds': 'TournamentRound',
    'notifications': 'Notification',
    'pricings': 'Pricing',
    'schedules': 'Schedule',
    'attendances': 'Attendance',
    'splitPayments': 'SplitPayment',
}

def fix_include_select(line: str, in_include_block: bool) -> Tuple[str, bool]:
    """
    Corrige relaciones en include/select:
    - club: true → Club: true
    - courts: true → Court: true (array)

    Retorna: (línea corregida, estamos en bloque include)
    """
    # Detectar si entramos en un bloque include/select
    if re.search(r'\b(include|select)\s*:\s*\{', line):
        in_include_block = True

    # Si estamos en bloque include/select, aplicar correcciones
    if in_include_block:
        # Corregir relaciones singulares
        for incorrect, correct in SINGULAR_RELATIONS.items():
            # { club: o , club:
            line = re.sub(
                r'(\{\s*)' + re.escape(incorrect) + r'(\s*:\s*(true|\{))',
                r'\1' + correct + r'\2',
                line
            )
            line = re.sub(
                r'(,\s*)' + re.escape(incorrect) + r'(\s*:\s*(true|\{))',
                r'\1' + correct + r'\2',
                line
            )

        # Corregir relaciones plurales (arrays)
        for incorrect, correct in PLURAL_RELATIONS.items():
            # { bookings: o , bookings:
            line = re.sub(
                r'(\{\s*)' + re.escape(incorrect) + r'(\s*:)',
                r'\1' + correct + r'\2',
                line
            )
            line = re.sub(
                r'(,\s*)' + re.escape(incorrect) + r'(\s*:)',
                r'\1' + correct + r'\2',
                line
            )

        # Detectar si salimos del bloque (línea con })
        # Contamos llaves para saber cuándo salimos
        if '}' in line and '{' not in line:
            in_include_block = False

    return line, in_include_block

def fix_property_access(line: str) -> str:
    """
    Corrige acceso a propiedades de relaciones:
    - court.club.id → court.Club.id
    - booking.court.name → booking.Court.name

    NO corrige:
    - prisma.club (esto es un modelo)
    - tx.club (modelo en transacción)
    - result.club (propiedad de objeto plano)
    """
    for incorrect, correct in SINGULAR_RELATIONS.items():
        # Patrón: .club. pero NO prisma.club. y NO tx.club. y NO result.club.
        # Solo cambiar si viene después de una variable que probablemente sea un resultado de DB
        # Patrones seguros: booking.club, court.club, player.club, etc.

        # Lista de prefijos que indican que es un resultado de DB
        safe_prefixes = ['booking', 'court', 'club', 'player', 'payment', 'user',
                        'tournament', 'notification', 'splitPayment', 'item', 'row']

        for prefix in safe_prefixes:
            pattern = r'\b' + prefix + r'\.' + re.escape(incorrect) + r'\.'
            replacement = prefix + '.' + correct + '.'
            line = re.sub(pattern, replacement, line)

    return line

def fix_where_filters(line: str) -> str:
    """
    Corrige filtros en where:
    - where: { booking: { → where: { Booking: {
    - where: { club: { → where: { Club: {
    """
    if 'where' not in line:
        return line

    for incorrect, correct in SINGULAR_RELATIONS.items():
        # where: { club: {
        line = re.sub(
            r'(where\s*:\s*\{\s*)' + re.escape(incorrect) + r'(\s*:\s*\{)',
            r'\1' + correct + r'\2',
            line
        )

    return line

def fix_count_selects(line: str) -> str:
    """
    Corrige _count selects:
    - users: true → User: true
    - bookings: true → Booking: true
    """
    if '_count' not in line:
        return line

    for incorrect, correct in PLURAL_RELATIONS.items():
        # users: true → User: true en contexto _count
        line = re.sub(
            r'(\{\s*)' + re.escape(incorrect) + r'(\s*:\s*true)',
            r'\1' + correct + r'\2',
            line
        )
        line = re.sub(
            r'(,\s*)' + re.escape(incorrect) + r'(\s*:\s*true)',
            r'\1' + correct + r'\2',
            line
        )

    return line

def process_file(file_path: Path, dry_run: bool = False) -> Dict[str, int]:
    """Procesa un archivo aplicando correcciones línea por línea."""
    try:
        content = file_path.read_text(encoding='utf-8')
        lines = content.split('\n')
        changes = 0
        in_include_block = False

        for i, line in enumerate(lines):
            original_line = line

            # Aplicar todas las correcciones
            line, in_include_block = fix_include_select(line, in_include_block)
            line = fix_property_access(line)
            line = fix_where_filters(line)
            line = fix_count_selects(line)

            if line != original_line:
                lines[i] = line
                changes += 1

        # Escribir solo si hay cambios
        if changes > 0 and not dry_run:
            file_path.write_text('\n'.join(lines), encoding='utf-8')
            return {'changed': 1, 'fixes': changes}
        elif changes > 0 and dry_run:
            print(f"  Would fix {changes} lines in {file_path.relative_to(Path.cwd())}")
            return {'changed': 1, 'fixes': changes}

        return {'changed': 0, 'fixes': 0}

    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return {'changed': 0, 'fixes': 0, 'errors': 1}

def main():
    base_dir = Path(__file__).parent.parent

    # Archivos a procesar
    patterns = ['**/*.ts', '**/*.tsx']
    exclude_dirs = {'.next', 'node_modules', '.git', 'dist', 'build'}

    files_to_process = []
    for pattern in patterns:
        for file_path in base_dir.glob(pattern):
            if any(excluded in file_path.parts for excluded in exclude_dirs):
                continue
            files_to_process.append(file_path)

    print(f"🔍 Encontrados {len(files_to_process)} archivos TS/TSX")
    print("\n🧪 DRY RUN - Mostrando primeros 20 archivos con cambios...\n")

    dry_run_stats = {'changed': 0, 'fixes': 0}
    shown = 0

    for file_path in files_to_process:
        result = process_file(file_path, dry_run=True)
        dry_run_stats['changed'] += result.get('changed', 0)
        dry_run_stats['fixes'] += result.get('fixes', 0)

        if result.get('changed', 0) > 0:
            shown += 1
            if shown >= 20:
                break

    print(f"\n📊 Dry run completado:")
    print(f"   - Archivos con cambios: {dry_run_stats['changed']}")
    print(f"   - Total líneas corregidas: {dry_run_stats['fixes']}")

    print("\n⚠️  Para aplicar los cambios, ejecuta:")
    print("   python scripts/fix_relations_v3.py --apply")

if __name__ == '__main__':
    import sys

    if '--apply' in sys.argv:
        base_dir = Path(__file__).parent.parent
        patterns = ['**/*.ts', '**/*.tsx']
        exclude_dirs = {'.next', 'node_modules', '.git', 'dist', 'build'}

        files_to_process = []
        for pattern in patterns:
            for file_path in base_dir.glob(pattern):
                if any(excluded in file_path.parts for excluded in exclude_dirs):
                    continue
                files_to_process.append(file_path)

        print(f"🚀 Aplicando correcciones a {len(files_to_process)} archivos...\n")

        stats = {'changed': 0, 'fixes': 0, 'errors': 0}

        for file_path in files_to_process:
            result = process_file(file_path, dry_run=False)
            stats['changed'] += result.get('changed', 0)
            stats['fixes'] += result.get('fixes', 0)
            stats['errors'] += result.get('errors', 0)

        print(f"\n✅ Completado:")
        print(f"   - Archivos modificados: {stats['changed']}")
        print(f"   - Líneas corregidas: {stats['fixes']}")
        print(f"   - Errores: {stats['errors']}")

        print("\n🔍 Ejecuta 'npm run type-check' para validar")
    else:
        main()
