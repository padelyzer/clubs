import { prisma } from '../lib/config/prisma'

async function checkPackages() {
  try {
    console.log('Verificando paquetes en la base de datos...\n')
    
    const packages = await prisma.saasPackage.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    
    console.log('Paquetes encontrados:')
    console.log('=====================')
    
    packages.forEach((pkg) => {
      console.log(`\nNombre: ${pkg.displayName} (${pkg.name})`)
      console.log(`  ID: ${pkg.id}`)
      console.log(`  Precio: $${pkg.basePrice / 100} ${pkg.currency}`)
      console.log(`  Max Canchas: ${pkg.maxCourts === null ? 'ILIMITADAS (null)' : pkg.maxCourts}`)
      console.log(`  Max Usuarios: ${pkg.maxUsers === null ? 'ILIMITADOS (null)' : pkg.maxUsers}`)
      console.log(`  Max Reservas/mes: ${pkg.maxBookingsMonth === null ? 'ILIMITADAS (null)' : pkg.maxBookingsMonth}`)
      console.log(`  Activo: ${pkg.isActive ? 'Sí' : 'No'}`)
      console.log(`  Por defecto: ${pkg.isDefault ? 'Sí' : 'No'}`)
    })
    
    // Buscar el paquete "Básico 5" y actualizarlo si es necesario
    const basicPackage = packages.find(p => p.displayName?.includes('Básico'))
    if (basicPackage && basicPackage.maxCourts === null) {
      console.log('\n⚠️  El paquete Básico tiene maxCourts como NULL')
      console.log('¿Deseas actualizarlo a 5 canchas? (Ejecuta update-package.ts para actualizar)')
    } else if (basicPackage) {
      console.log(`\n✅ El paquete Básico tiene ${basicPackage.maxCourts} canchas configuradas`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPackages()