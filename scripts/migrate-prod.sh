#!/bin/bash

echo "🔐 Migraciones de Producción"
echo "=========================="
echo ""
echo "⚠️  IMPORTANTE: Necesitas el DATABASE_URL de producción"
echo ""
echo "Opciones:"
echo "1. Obtén el DATABASE_URL desde Vercel:"
echo "   - Ve a tu proyecto en Vercel"
echo "   - Settings → Environment Variables"
echo "   - Copia el valor de DATABASE_URL"
echo ""
echo "2. Ejecuta este comando con el DATABASE_URL:"
echo ""
echo "   DATABASE_URL='postgresql://...' npm run prisma:migrate:prod"
echo ""
echo "3. O usa Vercel CLI:"
echo "   vercel env pull .env.production.local"
echo "   source .env.production.local"
echo "   npm run prisma:migrate:prod"
echo ""
echo "¿Quieres continuar? (y/n)"
read -r response

if [[ "$response" != "y" ]]; then
    echo "Cancelado."
    exit 0
fi

# Verificar si DATABASE_URL está configurado
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL no está configurado"
    echo "Por favor, configura DATABASE_URL antes de continuar"
    exit 1
fi

# Mostrar a qué base de datos nos conectaremos (ocultando credenciales)
echo ""
echo "📊 Conectando a: ${DATABASE_URL//:*@/:****@}"
echo ""

# Verificar estado actual
echo "🔍 Verificando estado de migraciones..."
npx prisma migrate status

echo ""
echo "¿Deseas aplicar las migraciones? (y/n)"
read -r confirm

if [[ "$confirm" != "y" ]]; then
    echo "Cancelado."
    exit 0
fi

# Aplicar migraciones
echo ""
echo "🚀 Aplicando migraciones..."
npx prisma migrate deploy --skip-seed

echo ""
echo "✅ Migraciones completadas!"