#!/usr/bin/env python3
"""
Script automático para corregir errores TS2561 basado en sugerencias de TypeScript
"""

import re
import subprocess
import sys
from pathlib import Path
from collections import defaultdict

def get_ts2561_errors():
    """Obtiene todos los errores TS2561 de producción"""
    result = subprocess.run(
        ['npm', 'run', 'type-check'],
        capture_output=True,
        text=True,
        cwd='/Users/ja/v4/bmad-nextjs-app'
    )

    errors = []
    # TypeScript outputs to both stdout and stderr
    output = result.stdout + result.stderr
    for line in output.split('\n'):
        if 'error TS2561' in line and not any(x in line for x in ['scripts/', '__tests__/', 'tests/', 'padelyzer-mobile/', 'prisma/seed']):
            errors.append(line)

    return errors

def parse_error(error_line):
    """Extrae información del error TS2561"""
    # Formato: file(line,col): error TS2561: ... but 'wrong' does not exist ... Did you mean to write 'correct'?
    match = re.match(r'^([^(]+)\((\d+),(\d+)\).*but \'([^\']+)\' does not exist.*Did you mean to write \'([^\']+)\'', error_line)

    if match:
        return {
            'file': match.group(1),
            'line': int(match.group(2)),
            'col': int(match.group(3)),
            'wrong': match.group(4),
            'correct': match.group(5)
        }
    return None

def fix_file(file_path, line_num, wrong, correct):
    """Corrige un error específico en un archivo"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        if line_num > len(lines):
            return False

        # Obtener la línea (índice 0-based)
        line_idx = line_num - 1
        original_line = lines[line_idx]

        # Reemplazar wrong por correct en esta línea específica
        # Buscar patrón de include/where con el nombre incorrecto
        patterns = [
            (rf'\b{wrong}(\s*):', rf'{correct}\1:'),  # property: pattern
            (rf'\b{wrong}(\s*)\{{', rf'{correct}\1{{'),  # property { pattern
        ]

        new_line = original_line
        for pattern, replacement in patterns:
            new_line = re.sub(pattern, replacement, new_line)

        if new_line != original_line:
            lines[line_idx] = new_line

            # Backup
            backup_path = str(file_path) + '.ts2561.bak'
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(''.join(lines))

            # Write fix
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)

            return True

        return False

    except Exception as e:
        print(f"❌ Error fixing {file_path}:{line_num}: {e}", file=sys.stderr)
        return False

def main():
    base = Path('/Users/ja/v4/bmad-nextjs-app')

    print("🔍 Analizando errores TS2561...")
    errors = get_ts2561_errors()

    if not errors:
        print("✅ No hay errores TS2561")
        return

    print(f"📊 Encontrados {len(errors)} errores TS2561")

    # Agrupar por archivo
    by_file = defaultdict(list)
    for error in errors:
        parsed = parse_error(error)
        if parsed:
            by_file[parsed['file']].append(parsed)

    print(f"📁 Archivos afectados: {len(by_file)}")

    fixed_count = 0
    file_count = 0

    for file_rel, file_errors in sorted(by_file.items()):
        file_path = base / file_rel

        if not file_path.exists():
            print(f"⚠️  {file_rel} (no encontrado)")
            continue

        file_fixed = 0
        # Procesar errores en orden inverso (de abajo hacia arriba) para no afectar números de línea
        for error in sorted(file_errors, key=lambda e: e['line'], reverse=True):
            if fix_file(file_path, error['line'], error['wrong'], error['correct']):
                fixed_count += 1
                file_fixed += 1

        if file_fixed > 0:
            print(f"✓ {file_rel} ({file_fixed} correcciones)")
            file_count += 1
        else:
            print(f"○ {file_rel} (sin cambios)")

    print(f"\n✅ Corregidos {fixed_count} errores en {file_count} archivos")
    print("💾 Backups: *.ts2561.bak")

if __name__ == '__main__':
    main()
