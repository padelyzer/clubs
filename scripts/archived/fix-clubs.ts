import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Limpiando y arreglando clubs...')
  
  // Eliminar Club Pádel México si existe
  const deleted = await prisma.club.deleteMany({
    where: { 
      OR: [
        { slug: 'club-padel-mexico' },
        { name: 'Club Pádel México' }
      ]
    }
  })
  
  if (deleted.count > 0) {
    console.log('✅ Club Pádel México eliminado')
  }
  
  // Verificar que Club Padel Puebla existe
  const club = await prisma.club.findFirst({
    where: { slug: 'club-padel-puebla' }
  })
  
  if (club) {
    console.log('✅ Club Padel Puebla encontrado:', club.name)
    console.log('   ID:', club.id)
    
    // Actualizar todos los usuarios para usar este club
    const updated = await prisma.user.updateMany({
      where: {},
      data: { clubId: club.id }
    })
    console.log(`✅ ${updated.count} usuarios actualizados para usar Club Padel Puebla`)
    
    // Eliminar cualquier ClubSettings que no sea de este club
    await prisma.clubSettings.deleteMany({
      where: { 
        NOT: { clubId: club.id }
      }
    })
    console.log('✅ Configuraciones de otros clubs eliminadas')
    
  } else {
    console.log('❌ Club Padel Puebla no encontrado')
  }
  
  // Mostrar todos los clubs restantes
  const allClubs = await prisma.club.findMany()
  console.log('\n📋 Clubs en la base de datos:')
  allClubs.forEach(c => {
    console.log(`   - ${c.name} (ID: ${c.id}, Slug: ${c.slug})`)
  })
  
  console.log('\n✨ Limpieza completada!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })