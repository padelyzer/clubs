import { prisma } from '../lib/config/prisma'

async function checkPricing() {
  try {
    // Obtener todos los precios
    const allPricing = await prisma.pricing.findMany({
      include: {
        Club: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        clubId: 'asc'
      }
    })

    console.log('\n=== Configuración de Precios ===\n')

    for (const price of allPricing) {
      console.log(`Club: ${price.Club.name} (${price.Club.slug})`)
      console.log(`  Horario: ${price.startTime} - ${price.endTime}`)
      console.log(`  Día: ${price.dayOfWeek ? ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][price.dayOfWeek] : 'Todos'}`)
      console.log(`  Precio guardado: ${price.price} centavos`)
      console.log(`  Precio en MXN: $${price.price / 100} MXN`)
      console.log(`  ---`)
    }

    // Buscar precios incorrectos (menores a 10000 centavos = 100 MXN)
    const incorrectPrices = allPricing.filter(p => p.price < 10000)

    if (incorrectPrices.length > 0) {
      console.log('\n⚠️  PRECIOS INCORRECTOS DETECTADOS:')
      console.log(`Hay ${incorrectPrices.length} configuraciones con precios menores a $100 MXN`)

      console.log('\n¿Deseas corregir los precios? Multiplicaré por 100 para convertir de pesos a centavos.')
      console.log('Ejecuta: npm run fix-pricing para corregir')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPricing()