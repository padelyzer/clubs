#!/usr/bin/env python3
"""
Script para analizar nombres de relaciones en schema.prisma
y validar errores TS2551 y TS2561 basándose en la fuente de verdad.

Este script:
1. Parsea schema.prisma para extraer nombres exactos de relaciones
2. Detecta errores de capitalización (court vs Court, booking vs Booking)
3. Muestra impacto estimado de correcciones
"""

import re
import subprocess
from pathlib import Path
from collections import defaultdict

# Colores para output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def parse_prisma_schema(schema_path: Path) -> dict:
    """
    Parsea schema.prisma y extrae nombres de relaciones correctos.

    Returns:
        dict: {
            'Booking': ['Club', 'Court', 'Player', 'BookingGroup', 'Notification', 'Payment', 'SplitPayment', 'Transaction'],
            'Club': ['Booking', 'BookingGroup', 'Court', 'Class', ...],
            ...
        }
    """
    schema_content = schema_path.read_text()

    # Regex para encontrar modelos y sus relaciones
    model_pattern = re.compile(r'^model\s+(\w+)\s*{(.*?)^}', re.MULTILINE | re.DOTALL)

    # Regex para encontrar campos de relación
    # Formato: nombreCampo  TipoRelacion  @relation(...)
    # o:       nombreCampo  TipoRelacion? @relation(...)
    # o:       nombreCampo  TipoRelacion[]
    relation_pattern = re.compile(r'^\s+(\w+)\s+([\w\?]+)\s+(?:@relation|$)', re.MULTILINE)

    models = {}

    for model_match in model_pattern.finditer(schema_content):
        model_name = model_match.group(1)
        model_body = model_match.group(2)

        relations = []

        for line in model_body.split('\n'):
            line = line.strip()

            # Saltar líneas vacías, comentarios, y campos que no son relaciones
            if not line or line.startswith('//') or line.startswith('@@'):
                continue

            # Buscar campos de relación
            # Formato: NombreCampo TipoRelacion (@relation o sin nada más)
            # Ejemplos:
            #   Club                Club           @relation(...)
            #   Court               Court          @relation(...)
            #   Booking             Booking[]
            #   BookingGroup?       BookingGroup?  @relation(...)

            parts = line.split()
            if len(parts) >= 2:
                field_name = parts[0]
                field_type = parts[1]

                # Remover ? y [] del tipo
                clean_type = field_type.rstrip('?').rstrip('[]')

                # Verificar si es un modelo (empieza con mayúscula)
                if clean_type and clean_type[0].isupper():
                    # Verificar que sea una relación (tiene @relation o es un array/opcional)
                    if '@relation' in line or '[]' in field_type or '?' in field_type:
                        relations.append(field_name)

        models[model_name] = sorted(set(relations))

    return models

def get_typescript_errors(error_code: str) -> list:
    """Obtiene errores TypeScript específicos del proyecto."""
    try:
        result = subprocess.run(
            ['npm', 'run', 'type-check'],
            capture_output=True,
            text=True,
            timeout=120,
            cwd='/users/ja/v4/bmad-nextjs-app'
        )

        output = result.stdout + result.stderr

        # Filtrar solo errores del tipo especificado
        errors = []
        for line in output.split('\n'):
            if f'error {error_code}' in line:
                errors.append(line)

        return errors
    except Exception as e:
        print(f"{Colors.FAIL}Error ejecutando type-check: {e}{Colors.ENDC}")
        return []

def analyze_relation_errors(models: dict) -> dict:
    """
    Analiza errores TS2551 y TS2561 buscando problemas de capitalización.

    Returns:
        dict: {
            'errors': [lista de errores encontrados],
            'fixes': {
                'incorrect_name': 'CorrectName',
                ...
            },
            'stats': {contadores}
        }
    """
    print(f"\n{Colors.HEADER}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}ANÁLISIS DE ERRORES DE RELACIONES PRISMA{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*80}{Colors.ENDC}\n")

    # Obtener errores TS2551 y TS2561
    print(f"{Colors.CYAN}📊 Obteniendo errores TypeScript...{Colors.ENDC}")

    ts2551_errors = get_typescript_errors('TS2551')
    ts2561_errors = get_typescript_errors('TS2561')

    print(f"{Colors.GREEN}✓ TS2551: {len(ts2551_errors)} errores{Colors.ENDC}")
    print(f"{Colors.GREEN}✓ TS2561: {len(ts2561_errors)} errores{Colors.ENDC}")

    # Crear mapa de nombres válidos
    valid_relation_names = set()
    for model_name, relations in models.items():
        valid_relation_names.update(relations)

    print(f"\n{Colors.CYAN}📝 Nombres de relación válidos encontrados en schema.prisma:{Colors.ENDC}")
    for name in sorted(valid_relation_names):
        print(f"  • {name}")

    # Analizar errores
    incorrect_usage = defaultdict(list)
    fixes = {}

    # Patrones comunes de error
    error_patterns = {
        # TS2561: Object literal may only specify known properties, but 'X' does not exist
        'TS2561': re.compile(r"'(\w+)' does not exist.*Did you mean to write '(\w+)'"),
        # TS2551: Property 'X' does not exist. Did you mean 'Y'?
        'TS2551': re.compile(r"Property '(\w+)' does not exist.*Did you mean '(\w+)'"),
    }

    # Analizar TS2561
    print(f"\n{Colors.CYAN}🔍 Analizando TS2561 (incorrect property in object literals)...{Colors.ENDC}")
    for error in ts2561_errors:
        match = error_patterns['TS2561'].search(error)
        if match:
            incorrect = match.group(1)
            correct = match.group(2)

            if correct in valid_relation_names:
                incorrect_usage[incorrect].append(error)
                fixes[incorrect] = correct

    # Analizar TS2551
    print(f"{Colors.CYAN}🔍 Analizando TS2551 (property access on objects)...{Colors.ENDC}")
    for error in ts2551_errors:
        match = error_patterns['TS2551'].search(error)
        if match:
            incorrect = match.group(1)
            correct = match.group(2)

            if correct in valid_relation_names:
                incorrect_usage[incorrect].append(error)
                fixes[incorrect] = correct

    # Estadísticas
    stats = {
        'total_errors': len(ts2551_errors) + len(ts2561_errors),
        'ts2551': len(ts2551_errors),
        'ts2561': len(ts2561_errors),
        'fixable_patterns': len(fixes),
        'total_fixable_errors': sum(len(errs) for errs in incorrect_usage.values()),
    }

    return {
        'errors': incorrect_usage,
        'fixes': fixes,
        'stats': stats,
        'valid_names': valid_relation_names,
    }

def print_report(analysis: dict):
    """Imprime reporte detallado del análisis."""

    stats = analysis['stats']
    fixes = analysis['fixes']
    errors = analysis['errors']

    print(f"\n{Colors.HEADER}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}REPORTE DE ANÁLISIS{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*80}{Colors.ENDC}\n")

    # Resumen ejecutivo
    print(f"{Colors.BOLD}📊 Resumen Ejecutivo:{Colors.ENDC}\n")
    print(f"  Total errores TS2551 + TS2561: {Colors.WARNING}{stats['total_errors']}{Colors.ENDC}")
    print(f"  ├─ TS2551 (property access): {stats['ts2551']}")
    print(f"  └─ TS2561 (object literals): {stats['ts2561']}")
    print()
    print(f"  Errores corregibles: {Colors.GREEN}{stats['total_fixable_errors']}{Colors.ENDC} ({stats['total_fixable_errors']/stats['total_errors']*100:.1f}%)")
    print(f"  Patrones de corrección: {len(fixes)}")

    # Correcciones recomendadas
    print(f"\n{Colors.BOLD}🔧 Correcciones Recomendadas:{Colors.ENDC}\n")

    for incorrect, correct in sorted(fixes.items(), key=lambda x: len(errors[x[0]]), reverse=True):
        count = len(errors[incorrect])
        percentage = count / stats['total_errors'] * 100

        print(f"  {Colors.WARNING}{incorrect:20}{Colors.ENDC} → {Colors.GREEN}{correct:20}{Colors.ENDC} ({count:3} errores, {percentage:5.1f}%)")

    # Top 10 archivos más afectados
    print(f"\n{Colors.BOLD}📁 Top 10 Archivos Más Afectados:{Colors.ENDC}\n")

    file_errors = defaultdict(int)
    for error_list in errors.values():
        for error in error_list:
            # Extraer nombre de archivo del error
            if ':' in error:
                file_path = error.split(':')[0]
                file_errors[file_path] += 1

    for i, (file_path, count) in enumerate(sorted(file_errors.items(), key=lambda x: x[1], reverse=True)[:10], 1):
        # Truncar path si es muy largo
        display_path = file_path if len(file_path) <= 70 else '...' + file_path[-67:]
        print(f"  {i:2}. {display_path:70} ({count:2} errores)")

    # Ejemplos de errores
    print(f"\n{Colors.BOLD}📝 Ejemplos de Errores (primeros 5 por patrón):{Colors.ENDC}\n")

    for incorrect, correct in list(fixes.items())[:3]:  # Solo primeros 3 patrones
        print(f"  {Colors.WARNING}{incorrect} → {correct}{Colors.ENDC}")
        for error in errors[incorrect][:2]:  # Solo primeros 2 ejemplos
            # Limpiar y formatear error
            clean_error = error.strip()
            if len(clean_error) > 120:
                clean_error = clean_error[:117] + '...'
            print(f"    • {clean_error}")
        print()

    # Impacto estimado
    print(f"\n{Colors.HEADER}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}IMPACTO ESTIMADO DE CORRECCIONES{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*80}{Colors.ENDC}\n")

    print(f"  Estado actual:       {Colors.WARNING}{stats['total_errors']:,}{Colors.ENDC} errores")
    print(f"  Después de fix:      {Colors.GREEN}{stats['total_errors'] - stats['total_fixable_errors']:,}{Colors.ENDC} errores")
    print(f"  Reducción:           {Colors.GREEN}-{stats['total_fixable_errors']:,}{Colors.ENDC} errores ({Colors.GREEN}-{stats['total_fixable_errors']/stats['total_errors']*100:.1f}%{Colors.ENDC})")
    print()

def main():
    schema_path = Path('/users/ja/v4/bmad-nextjs-app/prisma/schema.prisma')

    if not schema_path.exists():
        print(f"{Colors.FAIL}❌ Error: No se encontró schema.prisma en {schema_path}{Colors.ENDC}")
        return

    print(f"{Colors.CYAN}🔍 Parseando schema.prisma...{Colors.ENDC}")
    models = parse_prisma_schema(schema_path)

    print(f"{Colors.GREEN}✓ {len(models)} modelos encontrados{Colors.ENDC}")

    # Analizar errores
    analysis = analyze_relation_errors(models)

    # Imprimir reporte
    print_report(analysis)

    # Guardar resultados para script de corrección
    import json
    output_path = Path('/users/ja/v4/bmad-nextjs-app/scripts/relation_fixes.json')

    output_data = {
        'fixes': analysis['fixes'],
        'stats': analysis['stats'],
        'valid_names': list(analysis['valid_names']),
    }

    output_path.write_text(json.dumps(output_data, indent=2))

    print(f"\n{Colors.GREEN}✓ Resultados guardados en {output_path}{Colors.ENDC}")
    print(f"\n{Colors.BOLD}Siguiente paso: Ejecutar script de corrección quirúrgica{Colors.ENDC}")

if __name__ == '__main__':
    main()
