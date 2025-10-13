#!/usr/bin/env python3
"""
Análisis de errores TS2339 para identificar patrones comunes
y crear estrategias de corrección
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

def parse_ts2339_errors(tsc_output):
    """Parsea errores TS2339 del output de TypeScript"""
    errors = []
    lines = tsc_output.strip().split('\n')

    for line in lines:
        # Formato: file(line,col): error TS2339: Property 'prop' does not exist on type 'Type'.
        match = re.match(r'^([^(]+)\((\d+),(\d+)\): error TS2339: Property \'([^\']+)\' does not exist on type \'([^\']+)\'', line)
        if match:
            errors.append({
                'file': match.group(1),
                'line': int(match.group(2)),
                'col': int(match.group(3)),
                'property': match.group(4),
                'type': match.group(5)
            })

    return errors

def categorize_errors(errors):
    """Categoriza errores por patrones comunes"""
    categories = {
        'relation_access': [],  # Acceso a relaciones no incluidas
        'field_name': [],  # Nombres de campos incorrectos
        'optional_chain': [],  # Propiedades en tipos opcionales
        'response_type': [],  # Propiedades en tipos de respuesta
        'aggregate': [],  # Problemas con agregaciones
        'other': []
    }

    # Palabras clave para detectar relaciones de Prisma
    prisma_relations = ['booking', 'club', 'court', 'player', 'user', 'class', 'tournament',
                        'payment', 'invoice', 'notification', 'instructor', 'package']

    # Propiedades comunes de agregaciones
    aggregate_props = ['_sum', '_count', '_avg', '_min', '_max']

    # Propiedades de respuestas API
    response_props = ['success', 'error', 'errors', 'message', 'data']

    for error in errors:
        prop = error['property']
        type_str = error['type'].lower()

        # Detectar acceso a relaciones
        if prop in ['Booking', 'Club', 'Court', 'Player', 'User', 'Class'] or \
           any(rel in prop.lower() for rel in prisma_relations):
            categories['relation_access'].append(error)

        # Detectar problemas con agregaciones
        elif prop in aggregate_props or '_sum' in type_str or '_count' in type_str:
            categories['aggregate'].append(error)

        # Detectar propiedades de respuesta
        elif prop in response_props:
            categories['response_type'].append(error)

        # Detectar nombres de campos comunes (price vs amount, etc)
        elif prop in ['amount', 'price', 'studentName', 'dueAmount', 'attended',
                      'isGroup', 'isClass', 'color', 'externalInvoice']:
            categories['field_name'].append(error)

        # Detectar cadenas opcionales
        elif 'undefined' in type_str or '| null' in type_str:
            categories['optional_chain'].append(error)

        else:
            categories['other'].append(error)

    return categories

def analyze_field_name_errors(errors):
    """Analiza errores de nombres de campos para encontrar patrones"""
    patterns = defaultdict(list)

    for error in errors:
        prop = error['property']
        patterns[prop].append(error)

    return patterns

def print_analysis(categories):
    """Imprime análisis detallado"""
    print("=" * 80)
    print("📊 ANÁLISIS DE ERRORES TS2339")
    print("=" * 80)
    print()

    total = sum(len(errors) for errors in categories.values())
    print(f"Total errores analizados: {total}")
    print()

    for category, errors in categories.items():
        if errors:
            print(f"\n{'─' * 80}")
            print(f"📁 {category.upper().replace('_', ' ')}: {len(errors)} errores")
            print(f"{'─' * 80}")

            # Mostrar top 5 errores de esta categoría
            print("\nTop archivos afectados:")
            file_counts = defaultdict(int)
            for error in errors:
                file_counts[error['file']] += 1

            for file, count in sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"  • {file}: {count} errores")

            # Mostrar propiedades más comunes
            print("\nPropiedades más frecuentes:")
            prop_counts = defaultdict(int)
            for error in errors:
                prop_counts[error['property']] += 1

            for prop, count in sorted(prop_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
                print(f"  • {prop}: {count} veces")

def suggest_corrections(categories):
    """Sugiere estrategias de corrección"""
    print("\n" + "=" * 80)
    print("💡 ESTRATEGIAS DE CORRECCIÓN SUGERIDAS")
    print("=" * 80)

    if categories['field_name']:
        print("\n1️⃣ NOMBRES DE CAMPOS (Manual o Semi-automático)")
        print("   • Booking.amount → Booking.price")
        print("   • ClassBooking: añadir studentName, dueAmount, attended")
        print("   • Verificar schema de Prisma para nombres correctos")
        print(f"   📊 {len(categories['field_name'])} errores")

    if categories['relation_access']:
        print("\n2️⃣ ACCESO A RELACIONES (Requiere include)")
        print("   • Añadir include: { RelationName: true } en queries")
        print("   • O usar select para especificar campos necesarios")
        print(f"   📊 {len(categories['relation_access'])} errores")

    if categories['response_type']:
        print("\n3️⃣ TIPOS DE RESPUESTA (Type guards)")
        print("   • Usar type guards: if ('success' in response)")
        print("   • O type narrowing con discriminated unions")
        print(f"   📊 {len(categories['response_type'])} errores")

    if categories['aggregate']:
        print("\n4️⃣ AGREGACIONES (Nullish coalescing)")
        print("   • aggregate._sum.amount || 0")
        print("   • Verificar que se solicita el campo correcto en aggregate")
        print(f"   📊 {len(categories['aggregate'])} errores")

    if categories['optional_chain']:
        print("\n5️⃣ CADENAS OPCIONALES (Optional chaining)")
        print("   • obj.prop → obj?.prop")
        print("   • O usar type guards antes de acceder")
        print(f"   📊 {len(categories['optional_chain'])} errores")

def main():
    if len(sys.argv) < 2:
        print("Uso: python fix_ts2339_analysis.py <archivo_con_errores_tsc.txt>")
        print("\nEjemplo:")
        print("  npm run type-check 2>&1 | grep 'error TS2339' > errors_ts2339.txt")
        print("  python fix_ts2339_analysis.py errors_ts2339.txt")
        sys.exit(1)

    input_file = sys.argv[1]

    with open(input_file, 'r', encoding='utf-8') as f:
        tsc_output = f.read()

    errors = parse_ts2339_errors(tsc_output)

    if not errors:
        print("❌ No se encontraron errores TS2339 en el archivo")
        sys.exit(1)

    categories = categorize_errors(errors)
    print_analysis(categories)
    suggest_corrections(categories)

    print("\n" + "=" * 80)
    print("✅ Análisis completado")
    print("=" * 80)

if __name__ == '__main__':
    main()
