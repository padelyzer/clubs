import { prisma } from '../lib/config/prisma'

async function fixClubPricing() {
  try {
    console.log('🔧 Corrigiendo precios del club...')

    // Actualizar el precio incorrecto de 500 centavos a 60000 centavos
    const updated = await prisma.pricing.updateMany({
      where: {
        price: {
          lt: 10000 // Menor a 100 MXN (10000 centavos)
        }
      },
      data: {
        price: 60000 // 600 MXN en centavos
      }
    })

    console.log(`✅ Se actualizaron ${updated.count} configuraciones de precios`)

    // Verificar los precios actualizados
    const allPricing = await prisma.pricing.findMany({
      include: {
        Club: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })

    console.log('\n📊 Precios actualizados:')
    for (const price of allPricing) {
      console.log(`${price.Club.name}: ${price.startTime}-${price.endTime} = $${price.price / 100} MXN`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixClubPricing()