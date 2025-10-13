#!/usr/bin/env python3
"""
Script quirúrgico V2 para corregir capitalizaciones de relaciones Prisma.
Enfoque: Solo corregir patrones MUY específicos para evitar falsos positivos.
"""

import re
from pathlib import Path
from typing import Dict, List, Tuple

# Mapeo correcto desde schema.prisma
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

def fix_simple_include_patterns(content: str) -> Tuple[str, int]:
    """
    Corrige SOLO patrones simples y obvios:
    - include: { club: true }
    - include: { club: {...} }
    NO toca:
    - tx.club
    - result.club
    - prisma.club
    """
    changes = 0

    for incorrect, correct in RELATION_FIXES.items():
        # Patrón 1: Después de { o , en contexto de objeto
        # SOLO cuando está seguido de : true o : {

        # { club: true } o { club: {
        pattern1 = r'(\binclude\s*:\s*\{[^}]*\s)' + re.escape(incorrect) + r'(\s*:\s*(true|  \{))'
        replacement1 = r'\1' + correct + r'\2'
        content, count1 = re.subn(pattern1, replacement1, content)
        changes += count1

        # , club: true } o , club: { dentro de include
        pattern2 = r'(\binclude\s*:[^;]*,\s*)' + re.escape(incorrect) + r'(\s*:\s*(true|\{))'
        replacement2 = r'\1' + correct + r'\2'
        content, count2 = re.subn(pattern2, replacement2, content)
        changes += count2

    return content, changes

def fix_file_manual_patterns(file_path: Path) -> Tuple[str, int]:
    """
    Aplica correcciones línea por línea para mayor precisión.
    """
    content = file_path.read_text(encoding='utf-8')
    lines = content.split('\n')
    changes = 0

    for i, line in enumerate(lines):
        original_line = line

        # Solo procesar líneas que contengan include, select, where
        if not any(kw in line for kw in ['include:', 'select:', 'where:']):
            continue

        # Aplicar correcciones
        for incorrect, correct in RELATION_FIXES.items():
            # Patrón: { club: (seguido de true o {)
            line = re.sub(
                r'(\{\s*)' + re.escape(incorrect) + r'(\s*:\s*(true|\{))',
                r'\1' + correct + r'\2',
                line
            )

            # Patrón: , club: (seguido de true o {)
            line = re.sub(
                r'(,\s*)' + re.escape(incorrect) + r'(\s*:\s*(true|\{))',
                r'\1' + correct + r'\2',
                line
            )

        if line != original_line:
            lines[i] = line
            changes += 1

    return '\n'.join(lines), changes

def process_file(file_path: Path, dry_run: bool = False) -> Dict[str, int]:
    """Procesa un archivo aplicando correcciones línea por línea."""
    try:
        new_content, total_changes = fix_file_manual_patterns(file_path)

        # Escribir solo si hay cambios
        if total_changes > 0 and not dry_run:
            file_path.write_text(new_content, encoding='utf-8')
            return {'changed': 1, 'fixes': total_changes}
        elif total_changes > 0 and dry_run:
            print(f"  Would fix {total_changes} lines in {file_path.relative_to(Path.cwd())}")
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
    print(f"   - Total líneas corregidas: {dry_run_stats['fixes']}")

    # Preguntar confirmación
    print("\n⚠️  Para aplicar los cambios, ejecuta:")
    print("   python scripts/fix_relations_v2.py --apply")

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
