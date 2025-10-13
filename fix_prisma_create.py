#!/usr/bin/env python3
"""
Agrega campos faltantes en prisma.*.create() para Payment, Transaction, Notification
"""
import re
import sys
from pathlib import Path

def fix_prisma_creates(file_path):
    """Agrega updatedAt a create() calls"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        modifications = 0

        # Buscar patrones de prisma.payment.create({ data: { ... } })
        # y agregar updatedAt si no existe

        lines = content.split('\n')
        new_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]
            new_lines.append(line)

            # Detectar inicio de create
            if 'prisma.payment.create(' in line or 'prisma.transaction.create(' in line or \
               'prisma.notification.create(' in line:
                # Buscar la línea con 'data: {'
                j = i + 1
                while j < len(lines) and 'data: {' not in lines[j]:
                    new_lines.append(lines[j])
                    j += 1

                if j < len(lines):
                    # Encontramos data: {
                    new_lines.append(lines[j])
                    j += 1

                    # Buscar el cierre de data
                    indent_count = lines[j].index(lines[j].lstrip()) if lines[j].strip() else 0
                    has_updated_at = False

                    # Leer todas las propiedades dentro de data
                    props_start = j
                    brace_count = 1
                    while j < len(lines) and brace_count > 0:
                        if 'updatedAt' in lines[j]:
                            has_updated_at = True
                        if '{' in lines[j]:
                            brace_count += lines[j].count('{')
                        if '}' in lines[j]:
                            brace_count -= lines[j].count('}')

                        # Si llegamos al cierre y no tiene updatedAt, agregarlo
                        if brace_count == 0 and not has_updated_at and '}' in lines[j]:
                            # Insertar antes del cierre
                            indent = ' ' * indent_count
                            new_lines.append(f"{indent}updatedAt: new Date()")
                            modifications += 1

                        new_lines.append(lines[j])
                        j += 1

                    i = j - 1

            i += 1

        new_content = '\n'.join(new_lines)

        if modifications > 0:
            # Crear backup
            backup_path = f"{file_path}.prisma_create_bak"
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(original_content)

            # Escribir contenido corregido
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

        return modifications

    except Exception as e:
        print(f"❌ Error procesando {file_path}: {e}")
        return 0

def find_files_with_prisma_create():
    """Encuentra archivos con prisma.create()"""
    import subprocess

    cmd = "grep -rl 'prisma\\.\\(payment\\|transaction\\|notification\\)\\.create(' app/ lib/ --include='*.ts' --include='*.tsx' 2>/dev/null"

    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        files = [f.strip() for f in result.stdout.split('\n') if f.strip()]
        return files
    except:
        return []

def main():
    print("=" * 80)
    print("🔧 CORRECCIÓN: Prisma create() - Agregar updatedAt")
    print("=" * 80)
    print()

    print("🔍 Buscando archivos con prisma.create()...")
    files = find_files_with_prisma_create()

    if not files:
        print("✅ No se encontraron archivos con prisma.create()")
        return

    print(f"📁 Encontrados {len(files)} archivos")
    print()

    total_modifications = 0
    files_modified = 0

    for file_path in files:
        modifications = fix_prisma_creates(file_path)
        if modifications > 0:
            files_modified += 1
            total_modifications += modifications
            print(f"✓ {file_path} ({modifications} modificaciones)")

    print()
    print("=" * 80)
    print(f"✅ Agregado updatedAt en {total_modifications} create() calls en {files_modified} archivos")
    print("💾 Backups: *.prisma_create_bak")
    print("=" * 80)

if __name__ == '__main__':
    main()
