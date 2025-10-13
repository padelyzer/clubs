#!/usr/bin/env python3
"""
Script FINAL para corregir capitalizaciones de relaciones Prisma.
Versión optimizada con regex precompilados.
"""

import re
from pathlib import Path
from typing import Dict, List, Tuple

# Mapeo de relaciones singulares
SINGULAR_RELATIONS = {
    'club': 'Club',
    'court': 'Court',
    'booking': 'Booking',
    'player': 'Player',
    'payment': 'Payment',
    'user': 'User',
    'tournament': 'Tournament',
    'notification': 'Notification',
    'pricing': 'Pricing',
    'schedule': 'Schedule',
}

# Relaciones plurales (arrays en schema) - solo las más comunes
PLURAL_RELATIONS = {
    'courts': 'Court',
    'bookings': 'Booking',
    'players': 'Player',
    'payments': 'Payment',
    'users': 'User',
    'schedules': 'Schedule',
    'splitPayments': 'SplitPayment',
}

# Prefijos seguros para property access
SAFE_PREFIXES = ['booking', 'court', 'club', 'player', 'payment', 'user', 'item', 'row', 'record', 'splitPayment']

# Pre-compilar patrones para rendimiento
COMPILED_PATTERNS: List[Tuple[re.Pattern, str]] = []

def compile_patterns():
    """Pre-compila todos los patrones de regex para mejor rendimiento."""
    global COMPILED_PATTERNS

    # PATRÓN 1: { club: true } → { Club: true }
    for inc, cor in SINGULAR_RELATIONS.items():
        COMPILED_PATTERNS.append((
            re.compile(r'(\{\s*)' + re.escape(inc) + r'(\s*:\s*(true|\{))'),
            r'\1' + cor + r'\2'
        ))
        COMPILED_PATTERNS.append((
            re.compile(r'(,\s*)' + re.escape(inc) + r'(\s*:\s*(true|\{))'),
            r'\1' + cor + r'\2'
        ))

    # PATRÓN 2: booking.club.id → booking.Club.id
    for inc, cor in SINGULAR_RELATIONS.items():
        for prefix in SAFE_PREFIXES:
            COMPILED_PATTERNS.append((
                re.compile(r'\b' + prefix + r'\.' + re.escape(inc) + r'\.'),
                prefix + '.' + cor + '.'
            ))

    # PATRÓN 3: { bookings: → { Booking:
    for inc, cor in PLURAL_RELATIONS.items():
        COMPILED_PATTERNS.append((
            re.compile(r'(\{\s*)' + re.escape(inc) + r'(\s*:)'),
            r'\1' + cor + r'\2'
        ))
        COMPILED_PATTERNS.append((
            re.compile(r'(,\s*)' + re.escape(inc) + r'(\s*:)'),
            r'\1' + cor + r'\2'
        ))

# Compilar patrones al inicio
compile_patterns()

def process_file(file_path: Path, dry_run: bool = False) -> Dict[str, int]:
    """Procesa un archivo aplicando todos los patrones precompilados."""
    try:
        content = file_path.read_text(encoding='utf-8')
        lines = content.split('\n')
        changes = 0

        for i, line in enumerate(lines):
            original_line = line

            # Aplicar todos los patrones precompilados
            for pattern, replacement in COMPILED_PATTERNS:
                line = pattern.sub(replacement, line)

            if line != original_line:
                lines[i] = line
                changes += 1

        # Escribir solo si hay cambios
        if changes > 0 and not dry_run:
            file_path.write_text('\n'.join(lines), encoding='utf-8')
            return {'changed': 1, 'fixes': changes}
        elif changes > 0 and dry_run:
            rel_path = file_path.relative_to(Path.cwd())
            print(f"  Would fix {changes} lines in {rel_path}")
            return {'changed': 1, 'fixes': changes}

        return {'changed': 0, 'fixes': 0}

    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return {'changed': 0, 'fixes': 0, 'errors': 1}

def main():
    base_dir = Path(__file__).parent.parent

    # Archivos a procesar
    patterns = ['**/*.ts', '**/*.tsx']
    exclude_dirs = {'.next', 'node_modules', '.git', 'dist', 'build', '.vercel'}

    files_to_process = []
    for pattern in patterns:
        for file_path in base_dir.glob(pattern):
            if any(excluded in file_path.parts for excluded in exclude_dirs):
                continue
            files_to_process.append(file_path)

    print(f"🔍 Encontrados {len(files_to_process)} archivos TS/TSX")
    print("\n🧪 DRY RUN - Mostrando primeros 30 archivos con cambios...\n")

    dry_run_stats = {'changed': 0, 'fixes': 0}
    shown = 0

    for file_path in files_to_process:
        result = process_file(file_path, dry_run=True)
        dry_run_stats['changed'] += result.get('changed', 0)
        dry_run_stats['fixes'] += result.get('fixes', 0)

        if result.get('changed', 0) > 0:
            shown += 1
            if shown >= 30:
                break

    print(f"\n📊 Dry run completado:")
    print(f"   - Archivos con cambios: {dry_run_stats['changed']}")
    print(f"   - Total líneas corregidas: {dry_run_stats['fixes']}")

    print("\n⚠️  Para aplicar los cambios, ejecuta:")
    print("   python scripts/fix_relations_final.py --apply")
    print("\n💡 Luego valida con:")
    print("   npm run type-check")

if __name__ == '__main__':
    import sys

    if '--apply' in sys.argv:
        base_dir = Path(__file__).parent.parent
        patterns = ['**/*.ts', '**/*.tsx']
        exclude_dirs = {'.next', 'node_modules', '.git', 'dist', 'build', '.vercel'}

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
