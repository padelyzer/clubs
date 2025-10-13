#!/bin/bash

# Script para corregir Prisma include statements
# Cambia lowercase → Capitalized en includes

echo "🔧 Corrigiendo Prisma include statements..."

files=$(find app lib components -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" -not -path "*/.next/*")

count=0
for file in $files; do
  if grep -q "include.*{" "$file"; then
    # Hacer backup
    cp "$file" "$file.inc.bak"

    # Correcciones de include relations (minúsculas → Capitalizadas)
    sed -i '' \
      -e 's/\bclub: {/Club: {/g' \
      -e 's/\bcourt: {/Court: {/g' \
      -e 's/\bbooking: {/Booking: {/g' \
      -e 's/\buser: {/User: {/g' \
      -e 's/\bpayment: {/Payment: {/g' \
      -e 's/\btournament: {/Tournament: {/g' \
      -e 's/\bclass: {/Class: {/g' \
      -e 's/\bstudent: {/Student: {/g' \
      -e 's/\bcoach: {/Coach: {/g' \
      -e 's/\binvoice: {/Invoice: {/g' \
      -e 's/\binstructor: {/Instructor: {/g' \
      -e 's/\bplayer: {/Player: {/g' \
      "$file"

    # Correcciones para _count.select (Capitalizadas → minúsculas)
    sed -i '' \
      -e 's/_count.*select.*{.*Booking:/_count: { select: { booking:/g' \
      -e 's/_count.*select.*{.*Payment:/_count: { select: { payment:/g' \
      -e 's/_count.*select.*{.*User:/_count: { select: { user:/g' \
      "$file"

    count=$((count + 1))
    echo "  ✓ $file"
  fi
done

echo "✅ Corregidos $count archivos"
echo "💾 Backups guardados como .inc.bak"
