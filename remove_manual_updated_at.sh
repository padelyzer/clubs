#!/bin/bash
# Script para eliminar líneas con updatedAt: new Date() en create() calls

echo "🔧 Eliminando updatedAt manual de create() calls..."

# Buscar archivos que tienen prisma.*.create con updatedAt
files=$(grep -rl "updatedAt: new Date()" app/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null)

count=0
for file in $files; do
  if [ -f "$file" ]; then
    # Crear backup
    cp "$file" "$file.remove_updated_at_bak"

    # Eliminar líneas que solo contienen "updatedAt: new Date()" con coma opcional
    # Usar sed para eliminar la línea completa
    sed -i '' '/^\s*updatedAt:\s*new Date()\s*,\?\s*$/d' "$file"

    count=$((count + 1))
    echo "✓ $file"
  fi
done

echo ""
echo "✅ Procesados $count archivos"
echo "💾 Backups: *.remove_updated_at_bak"
