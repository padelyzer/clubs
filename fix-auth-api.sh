#!/bin/bash

# Script para arreglar todos los endpoints que usan requireAuth
echo "🔧 Arreglando endpoints con requireAuth..."

# Lista de archivos a modificar
FILES=(
"/Users/ja/v4/bmad-nextjs-app/app/api/bookings/[id]/checkin/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/bookings/[id]/cancel/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/bookings/[id]/payment/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/bookings/[id]/payment-link/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/bookings/[id]/split-payments/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/classes/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/classes/[id]/attendance/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/classes/[id]/enroll/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/classes/packages/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/classes/packages/purchase/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/dashboard/metrics/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/dashboard/recent-bookings/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/finance/transactions/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/finance/expenses/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/finance/budgets/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/finance/payroll/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/tournaments/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/tournaments/[id]/registrations/route.ts"
"/Users/ja/v4/bmad-nextjs-app/app/api/tournaments/[id]/matches/route.ts"
)

# Función para arreglar un archivo
fix_file() {
    local file=$1
    echo "  📝 Procesando: $(basename $file)"
    
    # 1. Cambiar import
    sed -i '' "s/import { requireAuth }/import { requireAuthAPI }/g" "$file"
    
    # 2. Cambiar llamadas a requireAuth por requireAuthAPI
    sed -i '' "s/await requireAuth()/await requireAuthAPI()/g" "$file"
    
    # 3. Agregar chequeo de sesión después de requireAuthAPI
    # Este es más complejo y requiere un approach diferente
}

# Procesar cada archivo
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        fix_file "$file"
    else
        echo "  ⚠️  Archivo no encontrado: $file"
    fi
done

echo "✅ Proceso completado!"