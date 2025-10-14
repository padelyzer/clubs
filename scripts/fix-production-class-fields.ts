import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()

  console.log('🔍 Verificando campos en tabla Class...')

  try {
    // Verificar si los campos existen
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Class' 
      AND column_name IN ('courtCost', 'instructorCost');
    `
    
    const existingColumns: any = await prisma.$queryRawUnsafe(checkQuery)
    const existingColumnNames = existingColumns.map((col: any) => col.column_name)
    
    console.log('✅ Columnas existentes:', existingColumnNames)

    // Agregar courtCost si no existe
    if (!existingColumnNames.includes('courtCost')) {
      console.log('➕ Agregando campo courtCost...')
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Class" ADD COLUMN "courtCost" INTEGER NOT NULL DEFAULT 0;
      `)
      console.log('✅ Campo courtCost agregado')
    } else {
      console.log('ℹ️  Campo courtCost ya existe')
    }

    // Agregar instructorCost si no existe
    if (!existingColumnNames.includes('instructorCost')) {
      console.log('➕ Agregando campo instructorCost...')
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Class" ADD COLUMN "instructorCost" INTEGER NOT NULL DEFAULT 0;
      `)
      console.log('✅ Campo instructorCost agregado')
    } else {
      console.log('ℹ️  Campo instructorCost ya existe')
    }

    // Verificar que se agregaron correctamente
    console.log('\n🔍 Verificación final...')
    const finalCheck: any = await prisma.$queryRawUnsafe(checkQuery)
    const finalColumnNames = finalCheck.map((col: any) => col.column_name)
    
    console.log('✅ Columnas finales:', finalColumnNames)
    
    if (finalColumnNames.includes('courtCost') && finalColumnNames.includes('instructorCost')) {
      console.log('\n✅ ¡Migración completada exitosamente!')
    } else {
      console.log('\n❌ Error: Algunos campos no se agregaron correctamente')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
