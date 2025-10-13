#!/usr/bin/env python3
"""
Script quirúrgico para corregir capitalizaciones de relaciones Prisma.
Solo corrige patrones específicos y obvios en contextos include/select/where.
"""

import re
from pathlib import Path
from typing import Dict, List, Tuple

# Mapeo correcto desde schema.prisma
# Solo relaciones que se usan en include/select/where
RELATION_FIXES = {
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

def fix_include_select_blocks(content: str) -> Tuple[str, int]:
    """
    Corrige relaciones dentro de bloques include y select SOLAMENTE.
    Patrón: include: { club: true } → include: { Club: true }
    NO cambia: tx.club, result.club, booking.court (propiedades de objetos)
    """
    changes = 0

    for incorrect, correct in RELATION_FIXES.items():
        # Solo cambiar dentro de include/select
        # Patrón más restrictivo: debe estar dentro de un bloque include o select

        # Buscar bloques include/select y cambiar solo dentro de ellos
        # Patrón: include: { ... club: true ... }
        def replace_in_include_select(match):
            block_content = match.group(0)
            for inc, cor in RELATION_FIXES.items():
                # Cambiar { club: true } o , club: true dentro del bloque
                block_content = re.sub(
                    r'(\{\s*)' + re.escape(inc) + r'(\s*:\s*(true|\{))',
                    r'\1' + cor + r'\2',
                    block_content
                )
                block_content = re.sub(
                    r'(,\s*)' + re.escape(inc) + r'(\s*:\s*(true|\{))',
                    r'\1' + cor + r'\2',
                    block_content
                )
            return block_content

        # Buscar bloques include/select con su contenido
        pattern = r'(include|select)\s*:\s*\{[^}]*\}'
        content, count = re.subn(pattern, replace_in_include_select, content)
        changes += count

    return content, changes

def fix_where_blocks(content: str) -> Tuple[str, int]:
    """
    Corrige relaciones en bloques where.
    Patrón: where: { booking: { ... } } → where: { Booking: { ... } }
    """
    changes = 0

    for incorrect, correct in RELATION_FIXES.items():
        # Solo dentro de where: { ... }
        pattern = r'(where:\s*\{\s*)' + re.escape(incorrect) + r'(\s*:\s*\{)'
        replacement = r'\1' + correct + r'\2'
        content, count = re.subn(pattern, replacement, content)
        changes += count

    return content, changes

def fix_property_access(content: str) -> Tuple[str, int]:
    """
    Corrige acceso a propiedades de relaciones.
    Patrón: booking.court.name → booking.Court.name
    PERO NO: prisma.booking (esto está correcto)
    """
    changes = 0

    for incorrect, correct in RELATION_FIXES.items():
        # Patrón: cualquier cosa seguida de .court. pero NO prisma.court.
        pattern = r'(?<!prisma)(\.\s*)' + re.escape(incorrect) + r'(\s*\.)'
        replacement = r'\1' + correct + r'\2'
        content, count = re.subn(pattern, replacement, content)
        changes += count

    return content, changes

def process_file(file_path: Path, dry_run: bool = False) -> Dict[str, int]:
    """Procesa un archivo aplicando todas las correcciones."""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content

        total_changes = 0

        # Aplicar correcciones
        content, changes1 = fix_include_select_blocks(content)
        total_changes += changes1

        content, changes2 = fix_where_blocks(content)
        total_changes += changes2

        content, changes3 = fix_property_access(content)
        total_changes += changes3

        # Escribir solo si hay cambios
        if total_changes > 0 and not dry_run:
            file_path.write_text(content, encoding='utf-8')
            return {'changed': 1, 'fixes': total_changes}
        elif total_changes > 0 and dry_run:
            print(f"  Would fix {total_changes} issues in {file_path.relative_to(Path.cwd())}")
            return {'changed': 1, 'fixes': total_changes}

        return {'changed': 0, 'fixes': 0}

    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return {'changed': 0, 'fixes': 0, 'errors': 1}

def main():
    base_dir = Path(__file__).parent.parent

    # Archivos a procesar (TypeScript/TypeScriptReact)
    patterns = ['**/*.ts', '**/*.tsx']

    # Directorios a excluir
    exclude_dirs = {'.next', 'node_modules', '.git', 'dist', 'build'}

    files_to_process = []
    for pattern in patterns:
        for file_path in base_dir.glob(pattern):
            # Excluir directorios
            if any(excluded in file_path.parts for excluded in exclude_dirs):
                continue
            files_to_process.append(file_path)

    print(f"🔍 Encontrados {len(files_to_process)} archivos TS/TSX")
    print("\n🧪 DRY RUN - Mostrando primeros 10 archivos con cambios...\n")

    # Dry run en primeros archivos
    dry_run_stats = {'changed': 0, 'fixes': 0}
    shown = 0

    for file_path in files_to_process:
        result = process_file(file_path, dry_run=True)
        dry_run_stats['changed'] += result.get('changed', 0)
        dry_run_stats['fixes'] += result.get('fixes', 0)

        if result.get('changed', 0) > 0:
            shown += 1
            if shown >= 10:
                break

    print(f"\n📊 Dry run completado:")
    print(f"   - Archivos con cambios: {dry_run_stats['changed']}")
    print(f"   - Total correcciones: {dry_run_stats['fixes']}")

    # Preguntar confirmación
    print("\n⚠️  Para aplicar los cambios, ejecuta:")
    print("   python scripts/fix_relations_surgical.py --apply")

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
        print(f"   - Correcciones aplicadas: {stats['fixes']}")
        print(f"   - Errores: {stats['errors']}")

        print("\n🔍 Ejecuta 'npm run type-check' para validar")
    else:
        main()
