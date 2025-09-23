#!/bin/bash

echo "🚀 Script de Migración de Producción"
echo "===================================="
echo ""
echo "Este script te ayudará a ejecutar las migraciones en producción."
echo ""
echo "Necesitas el DATABASE_URL de producción."
echo "Puedes obtenerlo de:"
echo "1. Vercel Dashboard → Settings → Environment Variables"
echo "2. O usando: vercel env pull"
echo ""
echo "Pega el DATABASE_URL aquí (se ocultará):"
read -s DATABASE_URL
echo ""

if [ -z "$DATABASE_URL" ]; then
    echo "❌ No se proporcionó DATABASE_URL"
    exit 1
fi

echo "✅ DATABASE_URL configurado"
echo ""

# Verificar conexión
echo "🔍 Verificando conexión a la base de datos..."
export DATABASE_URL
npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Conexión exitosa"
else
    echo "❌ No se pudo conectar a la base de datos"
    echo "   Verifica que el DATABASE_URL sea correcto"
    exit 1
fi

# Mostrar estado
echo ""
echo "📊 Estado actual de las migraciones:"
npx prisma migrate status

echo ""
echo "¿Deseas continuar con las migraciones? (s/n)"
read respuesta

if [ "$respuesta" != "s" ]; then
    echo "Cancelado."
    exit 0
fi

# Ejecutar migraciones
echo ""
echo "🚀 Ejecutando migraciones..."
npm run prisma:migrate:prod

echo ""
echo "✅ ¡Proceso completado!"
echo ""
echo "Verifica que tu aplicación funcione correctamente en:"
echo "https://pdzr4.vercel.app"