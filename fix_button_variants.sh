#!/bin/bash
# Script para corregir variantes de botones incorrectas

echo "🔧 Corrigiendo variantes de botones..."

# Archivos a corregir según análisis
files=(
  "app/(auth)/dashboard/qr/page.tsx"
  "app/c/[clubSlug]/dashboard/qr/page.tsx"
  "components/tournaments/QRCheckIn.tsx"
  "components/tournaments/tournament-qr.tsx"
  "app/(public)/tournament/[slug]/payment-success/page.tsx"
  "app/(public)/tournament/[slug]/register/success/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Crear backup
    cp "$file" "$file.variant_bak"

    # Reemplazar 'outline' con 'ghost' en variantes de botones
    # Casos: variant="outline", variant={'outline'}, variant={... ? 'default' : 'outline'}
    sed -i '' "s/: 'outline'/: 'ghost'/g" "$file"
    sed -i '' 's/variant="outline"/variant="ghost"/g' "$file"

    # Reemplazar 'default' con 'primary' en contexto de variantes
    sed -i '' "s/? 'default' :/? 'primary' :/g" "$file"

    echo "✓ $file"
  fi
done

echo ""
echo "✅ Variantes de botones corregidas"
echo "💾 Backups: *.variant_bak"
