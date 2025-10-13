#!/usr/bin/env python3
"""
Script quirúrgico para remover updatedAt: new Date() SOLO en prisma.*.create()
Solo procesa archivos de producción (app/, lib/) y excluye backups
"""
import re
from pathlib import Path

# Solo estos 3 modelos tienen @updatedAt
MODELS_WITH_AUTO_UPDATED = ['payment', 'notification', 'transaction']

def should_remove_updated_at(line_before, line_with_updated, model_name):
    """
    Determina si debe remover updatedAt basándose en contexto
    """
    # Verificar que estamos en un .create() de los modelos específicos
    for model in MODELS_WITH_AUTO_UPDATED:
        if f'prisma.{model}.create' in line_before.lower():
            return True
    return False

def fix_file(file_path):
    """
    Remueve updatedAt: new Date() solo en contextos seguros
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    modified = False
    new_lines = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Buscar líneas con updatedAt: new Date()
        if 'updatedAt:' in line and 'new Date()' in line:
            # Obtener contexto (10 líneas anteriores para buscar prisma.*.create)
            context_before = ''.join(lines[max(0, i-10):i])

            # Verificar si debemos remover
            should_remove = False
            for model in MODELS_WITH_AUTO_UPDATED:
                if f'prisma.{model}.create' in context_before.lower():
                    should_remove = True
                    break

            if should_remove:
                # Remover esta línea
                modified = True
                print(f"  ✂️  Removing updatedAt from line {i+1}")
                i += 1
                continue

        new_lines.append(line)
        i += 1

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        return True
    return False

def main():
    """
    Procesa solo archivos de producción
    """
    count = 0

    # Procesar solo app/ y lib/, excluyendo backups
    for directory in ['app', 'lib']:
        for file_path in Path(directory).rglob('*.ts*'):
            # Excluir archivos innecesarios
            if (
                'node_modules' in str(file_path) or
                '.next' in str(file_path) or
                '.bak' in str(file_path) or
                '.backup' in str(file_path) or
                '_bak' in str(file_path) or
                '__tests__' in str(file_path) or
                '.test.ts' in str(file_path)
            ):
                continue

            if fix_file(file_path):
                print(f"✅ Fixed: {file_path}")
                count += 1

    print(f"\n📊 Total files fixed: {count}")
    print(f"\n🔍 Models with @updatedAt: {', '.join(MODELS_WITH_AUTO_UPDATED)}")

if __name__ == '__main__':
    main()
