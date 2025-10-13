#!/usr/bin/env python3
"""
Script de corrección quirúrgica de nombres de relaciones Prisma.

Basado en schema.prisma como única fuente de verdad.
Corrige errores TS2551 y TS2561 relacionados con capitalización de relaciones.

IMPORTANTE: Este script solo corrige relaciones que EXISTEN en el schema.
No inventa nombres ni hace suposiciones.
"""

import re
import json
from pathlib import Path
from collections import defaultdict

# Colores
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def load_fix_mapping() -> dict:
    """Carga el mapeo de correcciones desde relation_fixes.json"""
    fixes_path = Path('/users/ja/v4/bmad-nextjs-app/scripts/relation_fixes.json')

    if not fixes_path.exists():
        print(f"{Colors.FAIL}❌ Error: No se encontró relation_fixes.json{Colors.ENDC}")
        print(f"{Colors.WARNING}Ejecuta primero: python3 scripts/analyze_relation_names.py{Colors.ENDC}")
        return {}

    data = json.loads(fixes_path.read_text())
    return data['fixes']

def parse_prisma_schema_full() -> dict:
    """
    Parsea schema.prisma para obtener el mapeo completo de relaciones.

    Returns:
        dict: {
            'Booking': {
                'Club': 'Club',
                'Court': 'Court',
                'BookingGroup': 'BookingGroup',
                'clubId': 'clubId',  # IDs también para referencia
                ...
            },
            ...
        }
    """
    schema_path = Path('/users/ja/v4/bmad-nextjs-app/prisma/schema.prisma')
    schema_content = schema_path.read_text()

    model_pattern = re.compile(r'^model\s+(\w+)\s*{(.*?)^}', re.MULTILINE | re.DOTALL)

    models_relations = {}

    for model_match in model_pattern.finditer(schema_content):
        model_name = model_match.group(1)
        model_body = model_match.group(2)

        relations = {}

        for line in model_body.split('\n'):
            line = line.strip()

            if not line or line.startswith('//') or line.startswith('@@'):
                continue

            parts = line.split()
            if len(parts) >= 2:
                field_name = parts[0]
                field_type = parts[1]

                # Limpiar tipo
                clean_type = field_type.rstrip('?').rstrip('[]')

                # Si empieza con mayúscula, es una relación
                if clean_type and clean_type[0].isupper():
                    relations[field_name] = clean_type

        models_relations[model_name] = relations

    return models_relations

def fix_include_statements(content: str, fixes: dict) -> tuple[str, int]:
    """
    Corrige nombres de relaciones en statements de include/select.

    Ejemplos:
        include: { booking: true } -> include: { Booking: true }
        include: { court: true } -> include: { Court: true }
    """
    new_content = content
    changes = 0

    # Patrón para encontrar includes con nombres incorrectos
    # Busca: include: { nombreIncorrecto: ...
    # o:     select: { nombreIncorrecto: ...

    for incorrect, correct in fixes.items():
        # Caso 1: include: { incorrect: true }
        # Escapar llaves en regex con doble \\
        pattern1 = re.compile(
            r'\b(include|select)\s*:\s*\{([^}]*\s)' + re.escape(incorrect) + r'\s*:',
            re.MULTILINE
        )

        def replace1(match):
            nonlocal changes
            changes += 1
            prefix = match.group(1)
            whitespace = match.group(2)
            return f"{prefix}: {{{whitespace}{correct}:"

        new_content = pattern1.sub(replace1, new_content)

        # Caso 2: include: { incorrect: { ... } }
        # Ya cubierto por pattern1

        # Caso 3: where: { incorrect: ... } (solo si incorrect es una relación)
        # Necesitamos ser cuidadosos aquí porque donde puede tener IDs también

    return new_content, changes

def fix_property_access(content: str, fixes: dict) -> tuple[str, int]:
    """
    Corrige accesos a propiedades de relaciones.

    Ejemplos:
        booking.court.name -> booking.Court.name
        payment.booking.id -> payment.Booking.id
    """
    new_content = content
    changes = 0

    for incorrect, correct in fixes.items():
        # Solo corregir accesos de propiedades (obj.incorrect.algo)
        # No corregir IDs sueltos

        # Patrón: .incorrect. seguido de otra propiedad
        pattern = re.compile(
            rf'\.{re.escape(incorrect)}\.',
            re.MULTILINE
        )

        replacement = f'.{correct}.'

        count = len(pattern.findall(new_content))
        if count > 0:
            new_content = pattern.sub(replacement, new_content)
            changes += count

    return new_content, changes

def fix_file(file_path: Path, fixes: dict, dry_run: bool = True) -> dict:
    """
    Corrige un archivo específico.

    Returns:
        dict: {
            'file': str,
            'changes': int,
            'include_fixes': int,
            'access_fixes': int,
            'modified': bool
        }
    """
    try:
        original_content = file_path.read_text()
        content = original_content

        # Aplicar correcciones
        content, include_changes = fix_include_statements(content, fixes)
        content, access_changes = fix_property_access(content, fixes)

        total_changes = include_changes + access_changes

        if total_changes > 0 and not dry_run:
            file_path.write_text(content)

        return {
            'file': str(file_path),
            'changes': total_changes,
            'include_fixes': include_changes,
            'access_fixes': access_changes,
            'modified': total_changes > 0 and not dry_run
        }

    except Exception as e:
        print(f"{Colors.FAIL}Error procesando {file_path}: {e}{Colors.ENDC}")
        return {
            'file': str(file_path),
            'changes': 0,
            'include_fixes': 0,
            'access_fixes': 0,
            'modified': False,
            'error': str(e)
        }

def find_typescript_files() -> list[Path]:
    """Encuentra todos los archivos TypeScript del proyecto (excluyendo node_modules)."""
    project_root = Path('/users/ja/v4/bmad-nextjs-app')

    patterns = [
        'app/**/*.ts',
        'app/**/*.tsx',
        'lib/**/*.ts',
        'lib/**/*.tsx',
        'components/**/*.ts',
        'components/**/*.tsx',
    ]

    files = []
    for pattern in patterns:
        files.extend(project_root.glob(pattern))

    # Excluir node_modules, .next, etc.
    excluded = {'node_modules', '.next', 'dist', 'build', '.git'}

    filtered_files = []
    for file in files:
        if not any(exc in file.parts for exc in excluded):
            filtered_files.append(file)

    return filtered_files

def main():
    print(f"\n{Colors.HEADER}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}CORRECCIÓN QUIRÚRGICA DE NOMBRES DE RELACIONES PRISMA{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*80}{Colors.ENDC}\n")

    # Cargar mapeo de correcciones
    print(f"{Colors.CYAN}📂 Cargando mapeo de correcciones...{Colors.ENDC}")
    fixes = load_fix_mapping()

    if not fixes:
        print(f"{Colors.FAIL}❌ No hay correcciones para aplicar{Colors.ENDC}")
        return

    print(f"{Colors.GREEN}✓ {len(fixes)} patrones de corrección cargados{Colors.ENDC}\n")

    # Mostrar correcciones
    print(f"{Colors.BOLD}Correcciones a aplicar:{Colors.ENDC}")
    for incorrect, correct in sorted(fixes.items(), key=lambda x: x[0]):
        print(f"  {Colors.WARNING}{incorrect:25}{Colors.ENDC} → {Colors.GREEN}{correct}{Colors.ENDC}")

    print(f"\n{Colors.CYAN}🔍 Buscando archivos TypeScript...{Colors.ENDC}")
    files = find_typescript_files()
    print(f"{Colors.GREEN}✓ {len(files)} archivos encontrados{Colors.ENDC}\n")

    # Preguntar modo
    print(f"{Colors.BOLD}Modo de ejecución:{Colors.ENDC}")
    print(f"  1. {Colors.CYAN}DRY RUN{Colors.ENDC} - Solo análisis, sin cambios")
    print(f"  2. {Colors.WARNING}APLICAR CAMBIOS{Colors.ENDC} - Modificar archivos")

    mode = input(f"\n{Colors.BOLD}Selecciona modo [1/2]: {Colors.ENDC}").strip()

    dry_run = mode != '2'

    if dry_run:
        print(f"\n{Colors.CYAN}🔍 Ejecutando en modo DRY RUN (sin cambios){Colors.ENDC}\n")
    else:
        print(f"\n{Colors.WARNING}⚠️  APLICANDO CAMBIOS A ARCHIVOS{Colors.ENDC}\n")

    # Procesar archivos
    results = []
    total_changes = 0
    total_include_fixes = 0
    total_access_fixes = 0
    modified_files = 0

    for i, file_path in enumerate(files, 1):
        result = fix_file(file_path, fixes, dry_run)
        results.append(result)

        total_changes += result['changes']
        total_include_fixes += result['include_fixes']
        total_access_fixes += result['access_fixes']

        if result['modified']:
            modified_files += 1

        if result['changes'] > 0:
            # Mostrar progreso para archivos con cambios
            rel_path = Path(result['file']).relative_to('/users/ja/v4/bmad-nextjs-app')
            print(f"  {Colors.GREEN}✓{Colors.ENDC} {rel_path}")
            print(f"    {result['include_fixes']} include fixes, {result['access_fixes']} property access fixes")

        # Progress bar cada 50 archivos
        if i % 50 == 0:
            print(f"{Colors.CYAN}    Procesados {i}/{len(files)} archivos...{Colors.ENDC}")

    # Reporte final
    print(f"\n{Colors.HEADER}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}REPORTE FINAL{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*80}{Colors.ENDC}\n")

    print(f"{Colors.BOLD}📊 Estadísticas:{Colors.ENDC}\n")
    print(f"  Archivos procesados:     {len(files):,}")
    print(f"  Archivos modificados:    {Colors.GREEN}{modified_files:,}{Colors.ENDC}")
    print(f"  Total de cambios:        {Colors.GREEN}{total_changes:,}{Colors.ENDC}")
    print(f"    ├─ Include/Select fixes: {total_include_fixes:,}")
    print(f"    └─ Property access fixes: {total_access_fixes:,}")

    # Top archivos modificados
    top_files = sorted(
        [r for r in results if r['changes'] > 0],
        key=lambda x: x['changes'],
        reverse=True
    )[:10]

    if top_files:
        print(f"\n{Colors.BOLD}📁 Top 10 archivos más modificados:{Colors.ENDC}\n")
        for i, result in enumerate(top_files, 1):
            rel_path = Path(result['file']).relative_to('/users/ja/v4/bmad-nextjs-app')
            print(f"  {i:2}. {str(rel_path):70} ({result['changes']:3} cambios)")

    if dry_run:
        print(f"\n{Colors.CYAN}ℹ️  Esto fue un DRY RUN. No se modificaron archivos.{Colors.ENDC}")
        print(f"{Colors.CYAN}   Ejecuta en modo 2 para aplicar cambios.{Colors.ENDC}")
    else:
        print(f"\n{Colors.GREEN}✓ Cambios aplicados exitosamente{Colors.ENDC}")
        print(f"\n{Colors.BOLD}Próximos pasos:{Colors.ENDC}")
        print(f"  1. Ejecuta: {Colors.CYAN}npm run type-check{Colors.ENDC}")
        print(f"  2. Verifica reducción de errores TS2551/TS2561")
        print(f"  3. Ejecuta tests si es necesario")

if __name__ == '__main__':
    main()
