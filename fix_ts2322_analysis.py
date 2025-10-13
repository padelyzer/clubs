#!/usr/bin/env python3
"""
Análisis de errores TS2322 (Type not assignable) para identificar patrones
"""
import re
import sys
from collections import defaultdict

def parse_ts2322_errors(tsc_output):
    """Parsea errores TS2322 del output de TypeScript"""
    errors = []
    lines = tsc_output.strip().split('\n')

    for line in lines:
        # Formato: file(line,col): error TS2322: Type 'X' is not assignable to type 'Y'.
        match = re.match(r'^([^(]+)\((\d+),(\d+)\): error TS2322: Type \'([^\']+)\' is not assignable to type \'([^\']+)\'', line)
        if match:
            errors.append({
                'file': match.group(1),
                'line': int(match.group(2)),
                'col': int(match.group(3)),
                'from_type': match.group(4),
                'to_type': match.group(5)
            })

    return errors

def categorize_errors(errors):
    """Categoriza errores por patrones comunes"""
    categories = {
        'variant_mismatch': [],  # Variantes de tipos (outline vs primary, etc)
        'string_to_date': [],  # string → Date
        'prisma_type': [],  # Tipos generados de Prisma
        'component_props': [],  # Props de componentes
        'enum_values': [],  # Valores de enums
        'array_types': [],  # Arrays con tipos incompatibles
        'object_shape': [],  # Forma de objetos no coincide
        'other': []
    }

    # Patrones de variantes (buttons, badges, etc)
    variant_keywords = ['outline', 'primary', 'secondary', 'ghost', 'warning', 'success',
                        'danger', 'info', 'default', 'glass', 'glow', 'gradient']

    for error in errors:
        from_type = error['from_type'].lower()
        to_type = error['to_type'].lower()

        # Detectar problemas de variantes
        if any(v in from_type or v in to_type for v in variant_keywords):
            categories['variant_mismatch'].append(error)

        # Detectar string → Date
        elif 'string' in from_type and 'date' in to_type:
            categories['string_to_date'].append(error)

        # Detectar problemas con tipos Prisma
        elif 'createinput' in from_type.lower() or 'updateinput' in from_type.lower() or \
             'createinput' in to_type.lower() or 'updateinput' in to_type.lower():
            categories['prisma_type'].append(error)

        # Detectar problemas de props de componentes
        elif 'intrinsicattributes' in to_type.lower() or 'props' in to_type.lower():
            categories['component_props'].append(error)

        # Detectar arrays
        elif '[]' in from_type or '[]' in to_type:
            categories['array_types'].append(error)

        # Detectar objetos con propiedades específicas
        elif '{' in from_type or '{' in to_type:
            categories['object_shape'].append(error)

        # Detectar enums
        elif from_type.startswith('"') and to_type.startswith('"'):
            categories['enum_values'].append(error)

        else:
            categories['other'].append(error)

    return categories

def analyze_patterns(errors):
    """Analiza patrones específicos en errores"""
    patterns = {
        'variant_patterns': defaultdict(int),
        'date_conversions': defaultdict(int),
        'prisma_models': defaultdict(int),
        'component_issues': defaultdict(int)
    }

    for error in errors:
        from_type = error['from_type']
        to_type = error['to_type']

        # Analizar conversiones de variantes
        if 'outline' in from_type or 'outline' in to_type:
            patterns['variant_patterns'][f"{from_type} → {to_type}"] += 1

        # Analizar conversiones de fecha
        if 'string' in from_type.lower() and 'Date' in to_type:
            patterns['date_conversions']['string → Date'] += 1

        # Analizar problemas de Prisma
        if 'Input' in from_type or 'Input' in to_type:
            model_name = from_type.split('Create')[0] if 'Create' in from_type else to_type.split('Create')[0]
            patterns['prisma_models'][model_name] += 1

        # Analizar problemas de componentes
        if 'IntrinsicAttributes' in to_type:
            patterns['component_issues'][error['file'].split('/')[-1]] += 1

    return patterns

def print_analysis(categories, patterns):
    """Imprime análisis detallado"""
    print("=" * 80)
    print("📊 ANÁLISIS DE ERRORES TS2322 - Type not assignable")
    print("=" * 80)
    print()

    total = sum(len(errors) for errors in categories.values())
    print(f"Total errores analizados: {total}")
    print()

    # Resumen por categoría
    print("📁 DISTRIBUCIÓN POR CATEGORÍA")
    print("─" * 80)
    for category, errors in sorted(categories.items(), key=lambda x: len(x[1]), reverse=True):
        if errors:
            percentage = (len(errors) / total * 100) if total > 0 else 0
            print(f"{category.upper().replace('_', ' '):<25} {len(errors):>4} errores ({percentage:>5.1f}%)")
    print()

    # Detalle de cada categoría
    for category, errors in categories.items():
        if errors:
            print(f"\n{'═' * 80}")
            print(f"📌 {category.upper().replace('_', ' ')}: {len(errors)} errores")
            print(f"{'═' * 80}")

            # Top archivos afectados
            file_counts = defaultdict(int)
            for error in errors:
                file_counts[error['file']] += 1

            print("\n🔸 Top archivos afectados:")
            for file, count in sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"  • {file}: {count} errores")

            # Conversiones más comunes
            print("\n🔸 Conversiones más comunes:")
            type_conversions = defaultdict(int)
            for error in errors:
                conversion = f"{error['from_type']} → {error['to_type']}"
                type_conversions[conversion] += 1

            for conversion, count in sorted(type_conversions.items(), key=lambda x: x[1], reverse=True)[:10]:
                # Truncar conversiones muy largas
                if len(conversion) > 70:
                    conversion = conversion[:67] + "..."
                print(f"  • {conversion}: {count} veces")

def suggest_corrections(categories):
    """Sugiere estrategias de corrección"""
    print("\n" + "=" * 80)
    print("💡 ESTRATEGIAS DE CORRECCIÓN SUGERIDAS")
    print("=" * 80)

    if categories['variant_mismatch']:
        print("\n1️⃣ VARIANTES DE COMPONENTES (Automatizable)")
        print("   • Problema: 'outline' no está en union type de variantes")
        print("   • Solución: Añadir 'outline' a tipos de variantes OR cambiar a variante válida")
        print("   • Ejemplo: variant='outline' → variant='ghost' o variant='primary'")
        print(f"   📊 {len(categories['variant_mismatch'])} errores")

    if categories['string_to_date']:
        print("\n2️⃣ STRING → DATE (Automatizable)")
        print("   • Problema: Asignar string a campo Date")
        print("   • Solución: new Date(stringValue)")
        print("   • Cuidado: Verificar formato de fecha")
        print(f"   📊 {len(categories['string_to_date'])} errores")

    if categories['prisma_type']:
        print("\n3️⃣ TIPOS DE PRISMA (Manual)")
        print("   • Problema: Tipos generados de Prisma no coinciden")
        print("   • Solución: Ajustar propiedades según schema")
        print("   • Verificar campos requeridos vs opcionales")
        print(f"   📊 {len(categories['prisma_type'])} errores")

    if categories['component_props']:
        print("\n4️⃣ PROPS DE COMPONENTES (Manual)")
        print("   • Problema: Props no definidas en componente")
        print("   • Solución: Añadir props al tipo del componente")
        print("   • O remover props no usadas")
        print(f"   📊 {len(categories['component_props'])} errores")

    if categories['array_types']:
        print("\n5️⃣ TIPOS DE ARRAYS (Manual)")
        print("   • Problema: Array con elementos de tipo incorrecto")
        print("   • Solución: Transformar elementos con .map()")
        print("   • O ajustar tipo esperado")
        print(f"   📊 {len(categories['array_types'])} errores")

    if categories['object_shape']:
        print("\n6️⃣ FORMA DE OBJETOS (Manual)")
        print("   • Problema: Objetos con propiedades faltantes/extra")
        print("   • Solución: Ajustar estructura del objeto")
        print("   • O usar type assertion con cuidado")
        print(f"   📊 {len(categories['object_shape'])} errores")

def main():
    if len(sys.argv) < 2:
        print("Uso: python fix_ts2322_analysis.py <archivo_con_errores_tsc.txt>")
        print("\nEjemplo:")
        print("  npm run type-check 2>&1 | grep 'error TS2322' > errors_ts2322.txt")
        print("  python fix_ts2322_analysis.py errors_ts2322.txt")
        sys.exit(1)

    input_file = sys.argv[1]

    with open(input_file, 'r', encoding='utf-8') as f:
        tsc_output = f.read()

    errors = parse_ts2322_errors(tsc_output)

    if not errors:
        print("❌ No se encontraron errores TS2322 en el archivo")
        sys.exit(1)

    categories = categorize_errors(errors)
    patterns = analyze_patterns(errors)
    print_analysis(categories, patterns)
    suggest_corrections(categories)

    print("\n" + "=" * 80)
    print("✅ Análisis completado")
    print("=" * 80)

if __name__ == '__main__':
    main()
