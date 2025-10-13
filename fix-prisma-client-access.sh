#!/bin/bash

# Script para corregir PrismaClient model access (mayúsculas → minúsculas)
# Solo afecta calls directos a prisma.ModelName, NO afecta relations ni includes

echo "🔧 Corrigiendo PrismaClient model access..."

# Lista de archivos a procesar (producción solamente)
files=$(find app lib components -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*")

count=0
for file in $files; do
  if grep -q "prisma\.\(Club\|Booking\|Court\|User\|Payment\|Tournament\|Class\|Student\|Coach\|Invoice\)\." "$file"; then
    # Hacer backup
    cp "$file" "$file.bak"

    # Aplicar correcciones
    sed -i '' \
      -e 's/prisma\.Club\./prisma.club./g' \
      -e 's/prisma\.Booking\./prisma.booking./g' \
      -e 's/prisma\.Court\./prisma.court./g' \
      -e 's/prisma\.User\./prisma.user./g' \
      -e 's/prisma\.Payment\./prisma.payment./g' \
      -e 's/prisma\.Tournament\./prisma.tournament./g' \
      -e 's/prisma\.Class\./prisma.class./g' \
      -e 's/prisma\.Student\./prisma.student./g' \
      -e 's/prisma\.Coach\./prisma.coach./g' \
      -e 's/prisma\.Invoice\./prisma.invoice./g' \
      "$file"

    count=$((count + 1))
    echo "  ✓ $file"
  fi
done

echo "✅ Corregidos $count archivos"
echo "💾 Backups guardados como .bak"
