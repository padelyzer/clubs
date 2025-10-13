#!/usr/bin/env python3
"""
Corrige propiedades incorrectas de ClassBooking:
- studentName → playerName
- studentEmail → playerEmail
- studentPhone → playerPhone
- dueAmount → paidAmount (o calcular)
- attended → checkedIn
"""
import re
import sys
from pathlib import Path

def fix_classbooking_props(file_path):
    """Corrige propiedades de ClassBooking en un archivo"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        corrections = 0

        # Reemplazos directos
        replacements = [
            (r'\.studentName\b', '.playerName'),
            (r'\.studentEmail\b', '.playerEmail'),
            (r'\.studentPhone\b', '.playerPhone'),
            (r'\.attended\b', '.checkedIn'),
            (r'\.dueAmount\b', '.paidAmount'),  # Esto puede necesitar lógica adicional
        ]

        for pattern, replacement in replacements:
            new_content, count = re.subn(pattern, replacement, content)
            if count > 0:
                corrections += count
                content = new_content

        if content != original_content:
            # Crear backup
            backup_path = f"{file_path}.classbooking.bak"
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)

            # Escribir contenido corregido
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

            return corrections

        return 0

    except Exception as e:
        print(f"❌ Error procesando {file_path}: {e}")
        return 0

def find_files_with_classbooking_props():
    """Encuentra archivos con propiedades de ClassBooking incorrectas"""
    import subprocess

    patterns = ['studentName', 'studentEmail', 'studentPhone', 'attended', 'dueAmount']

    files_set = set()
    for pattern in patterns:
        cmd = f"grep -rl '\\.{pattern}' app/ lib/ components/ 2>/dev/null | grep -E '\\.(ts|tsx)$' | grep -v node_modules"
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            files = [f.strip() for f in result.stdout.split('\n') if f.strip()]
            files_set.update(files)
        except:
            pass

    return sorted(list(files_set))

def main():
    print("=" * 80)
    print("🔧 CORRECCIÓN: ClassBooking Properties")
    print("=" * 80)
    print()

    # Encontrar archivos afectados
    print("🔍 Buscando archivos con propiedades incorrectas de ClassBooking...")
    files = find_files_with_classbooking_props()

    if not files:
        print("✅ No se encontraron archivos con propiedades incorrectas")
        return

    print(f"📁 Encontrados {len(files)} archivos")
    print()

    total_corrections = 0
    files_modified = 0

    for file_path in files:
        corrections = fix_classbooking_props(file_path)
        if corrections > 0:
            files_modified += 1
            total_corrections += corrections
            print(f"✓ {file_path} ({corrections} correcciones)")

    print()
    print("=" * 80)
    print(f"✅ Corregidos {total_corrections} errores en {files_modified} archivos")
    print("💾 Backups: *.classbooking.bak")
    print("=" * 80)
    print()
    print("⚠️  NOTA: 'dueAmount' fue reemplazado por 'paidAmount'")
    print("   Verifica si la lógica necesita calcular: Class.price - paidAmount")

if __name__ == '__main__':
    main()
