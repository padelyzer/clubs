import { PrismaClient } from '@prisma/client'
import { subYears, subMonths, subDays } from 'date-fns'

const prisma = new PrismaClient()

async function createClients() {
  console.log('👥 CREANDO 20 CLIENTES REALES PARA EL CLUB\n')
  console.log('=' .repeat(60))
  
  try {
    // Get the first club
    const club = await prisma.club.findFirst()
    if (!club) {
      throw new Error('No se encontró ningún club. Ejecuta el seed principal primero.')
    }
    
    console.log(`📍 Club: ${club.name}\n`)
    
    // Datos de 20 clientes mexicanos reales
    const clientsData = [
      {
        name: 'Carlos Hernández López',
        email: 'carlos.hernandez@gmail.com',
        phone: '2221456789',
        birthDate: new Date('1985-03-15'),
        level: 'INTERMEDIATE',
        gender: 'male',
        memberSince: subMonths(new Date(), 8),
        totalBookings: 45,
        totalSpent: 1350000, // $13,500 MXN
        lastBookingAt: subDays(new Date(), 3)
      },
      {
        name: 'María Guadalupe Ramírez',
        email: 'lupita.ramirez@hotmail.com',
        phone: '2223567890',
        birthDate: new Date('1990-07-22'),
        level: 'BEGINNER',
        gender: 'female',
        memberSince: subMonths(new Date(), 2),
        totalBookings: 8,
        totalSpent: 240000, // $2,400 MXN
        lastBookingAt: subDays(new Date(), 7)
      },
      {
        name: 'José Antonio Martínez',
        email: 'jose.martinez@yahoo.com',
        phone: '2224678901',
        birthDate: new Date('1978-11-03'),
        level: 'ADVANCED',
        gender: 'male',
        memberSince: subYears(new Date(), 2),
        totalBookings: 120,
        totalSpent: 3600000, // $36,000 MXN
        lastBookingAt: subDays(new Date(), 1)
      },
      {
        name: 'Ana Sofía García Pérez',
        email: 'anasofia.garcia@gmail.com',
        phone: '2225789012',
        birthDate: new Date('1995-05-18'),
        level: 'INTERMEDIATE',
        gender: 'female',
        memberSince: subMonths(new Date(), 6),
        totalBookings: 32,
        totalSpent: 960000, // $9,600 MXN
        lastBookingAt: subDays(new Date(), 5)
      },
      {
        name: 'Roberto Sánchez Villa',
        email: 'roberto.sanchez@outlook.com',
        phone: '2226890123',
        birthDate: new Date('1982-09-27'),
        level: 'INTERMEDIATE',
        gender: 'male',
        memberSince: subMonths(new Date(), 10),
        totalBookings: 55,
        totalSpent: 1650000, // $16,500 MXN
        lastBookingAt: subDays(new Date(), 2)
      },
      {
        name: 'Fernanda Torres Mendoza',
        email: 'fer.torres@gmail.com',
        phone: '2227901234',
        birthDate: new Date('1988-12-10'),
        level: 'BEGINNER',
        gender: 'female',
        memberSince: subMonths(new Date(), 3),
        totalBookings: 15,
        totalSpent: 450000, // $4,500 MXN
        lastBookingAt: subDays(new Date(), 10)
      },
      {
        name: 'Miguel Ángel Flores',
        email: 'miguel.flores@gmail.com',
        phone: '2228012345',
        birthDate: new Date('1975-06-05'),
        level: 'ADVANCED',
        gender: 'male',
        memberSince: subYears(new Date(), 3),
        totalBookings: 180,
        totalSpent: 5400000, // $54,000 MXN
        lastBookingAt: subDays(new Date(), 1)
      },
      {
        name: 'Patricia Morales Castro',
        email: 'paty.morales@hotmail.com',
        phone: '2229123456',
        birthDate: new Date('1992-02-28'),
        level: 'INTERMEDIATE',
        gender: 'female',
        memberSince: subMonths(new Date(), 7),
        totalBookings: 38,
        totalSpent: 1140000, // $11,400 MXN
        lastBookingAt: subDays(new Date(), 4)
      },
      {
        name: 'Alejandro Jiménez Ruiz',
        email: 'alex.jimenez@yahoo.com',
        phone: '2220234567',
        birthDate: new Date('1987-08-14'),
        level: 'INTERMEDIATE',
        gender: 'male',
        memberSince: subMonths(new Date(), 9),
        totalBookings: 48,
        totalSpent: 1440000, // $14,400 MXN
        lastBookingAt: subDays(new Date(), 6)
      },
      {
        name: 'Daniela Gutiérrez Luna',
        email: 'dani.gutierrez@gmail.com',
        phone: '2221345678',
        birthDate: new Date('1993-04-20'),
        level: 'BEGINNER',
        gender: 'female',
        memberSince: subMonths(new Date(), 1),
        totalBookings: 4,
        totalSpent: 120000, // $1,200 MXN
        lastBookingAt: subDays(new Date(), 14)
      },
      {
        name: 'Francisco Javier Díaz',
        email: 'francisco.diaz@outlook.com',
        phone: '2222456789',
        birthDate: new Date('1980-10-08'),
        level: 'ADVANCED',
        gender: 'male',
        memberSince: subYears(new Date(), 1.5),
        totalBookings: 90,
        totalSpent: 2700000, // $27,000 MXN
        lastBookingAt: subDays(new Date(), 2)
      },
      {
        name: 'Mariana Castillo Vega',
        email: 'mariana.castillo@gmail.com',
        phone: '2223567891',
        birthDate: new Date('1991-01-12'),
        level: 'INTERMEDIATE',
        gender: 'female',
        memberSince: subMonths(new Date(), 5),
        totalBookings: 28,
        totalSpent: 840000, // $8,400 MXN
        lastBookingAt: subDays(new Date(), 8)
      },
      {
        name: 'Eduardo Vargas Solís',
        email: 'eduardo.vargas@hotmail.com',
        phone: '2224678902',
        birthDate: new Date('1986-07-30'),
        level: 'INTERMEDIATE',
        gender: 'male',
        memberSince: subMonths(new Date(), 11),
        totalBookings: 60,
        totalSpent: 1800000, // $18,000 MXN
        lastBookingAt: subDays(new Date(), 3)
      },
      {
        name: 'Claudia Rivera Aguilar',
        email: 'claudia.rivera@yahoo.com',
        phone: '2225789013',
        birthDate: new Date('1984-11-25'),
        level: 'BEGINNER',
        gender: 'female',
        memberSince: subMonths(new Date(), 4),
        totalBookings: 20,
        totalSpent: 600000, // $6,000 MXN
        lastBookingAt: subDays(new Date(), 9)
      },
      {
        name: 'Ricardo Mendoza Paredes',
        email: 'ricardo.mendoza@gmail.com',
        phone: '2226890124',
        birthDate: new Date('1979-05-17'),
        level: 'ADVANCED',
        gender: 'male',
        memberSince: subYears(new Date(), 2.5),
        totalBookings: 150,
        totalSpent: 4500000, // $45,000 MXN
        lastBookingAt: subDays(new Date(), 1)
      },
      {
        name: 'Sofía Alejandra Cruz',
        email: 'sofia.cruz@outlook.com',
        phone: '2227901235',
        birthDate: new Date('1996-09-02'),
        level: 'BEGINNER',
        gender: 'female',
        memberSince: subMonths(new Date(), 2),
        totalBookings: 10,
        totalSpent: 300000, // $3,000 MXN
        lastBookingAt: subDays(new Date(), 12)
      },
      {
        name: 'Juan Pablo Ortega',
        email: 'juanpablo.ortega@gmail.com',
        phone: '2228012346',
        birthDate: new Date('1983-03-09'),
        level: 'INTERMEDIATE',
        gender: 'male',
        memberSince: subMonths(new Date(), 8),
        totalBookings: 42,
        totalSpent: 1260000, // $12,600 MXN
        lastBookingAt: subDays(new Date(), 5)
      },
      {
        name: 'Valeria Romero Soto',
        email: 'valeria.romero@hotmail.com',
        phone: '2229123457',
        birthDate: new Date('1989-06-21'),
        level: 'INTERMEDIATE',
        gender: 'female',
        memberSince: subMonths(new Date(), 6),
        totalBookings: 35,
        totalSpent: 1050000, // $10,500 MXN
        lastBookingAt: subDays(new Date(), 4)
      },
      {
        name: 'Luis Fernando Navarro',
        email: 'luisfer.navarro@yahoo.com',
        phone: '2220234568',
        birthDate: new Date('1977-12-15'),
        level: 'ADVANCED',
        gender: 'male',
        memberSince: subYears(new Date(), 4),
        totalBookings: 200,
        totalSpent: 6000000, // $60,000 MXN
        lastBookingAt: subDays(new Date(), 1)
      },
      {
        name: 'Andrea Escobar Mejía',
        email: 'andrea.escobar@gmail.com',
        phone: '2221345679',
        birthDate: new Date('1994-08-07'),
        level: 'BEGINNER',
        gender: 'female',
        memberSince: subMonths(new Date(), 3),
        totalBookings: 18,
        totalSpent: 540000, // $5,400 MXN
        lastBookingAt: subDays(new Date(), 11)
      }
    ]
    
    console.log('📝 Creando clientes...\n')
    
    const createdClients = []
    
    for (const [index, clientData] of clientsData.entries()) {
      const clientNumber = `C${String(index + 1).padStart(4, '0')}`
      
      const client = await prisma.player.create({
        data: {
          clubId: club.id,
          clientNumber,
          ...clientData,
          phoneVerified: true,
          active: true,
          notes: `Cliente regular del club. Nivel: ${clientData.level}`
        }
      })
      
      createdClients.push(client)
      console.log(`   ✅ ${clientNumber} - ${client.name}`)
    }
    
    console.log('\n' + '=' .repeat(60))
    console.log('📊 RESUMEN DE CLIENTES CREADOS\n')
    
    // Estadísticas
    const stats = {
      total: createdClients.length,
      porNivel: {
        principiante: createdClients.filter(c => c.level === 'BEGINNER').length,
        intermedio: createdClients.filter(c => c.level === 'INTERMEDIATE').length,
        avanzado: createdClients.filter(c => c.level === 'ADVANCED').length
      },
      porGenero: {
        hombres: createdClients.filter(c => c.gender === 'male').length,
        mujeres: createdClients.filter(c => c.gender === 'female').length
      },
      promedios: {
        reservas: Math.round(createdClients.reduce((sum, c) => sum + c.totalBookings, 0) / createdClients.length),
        gasto: Math.round(createdClients.reduce((sum, c) => sum + c.totalSpent, 0) / createdClients.length / 100)
      }
    }
    
    console.log(`   Total de clientes: ${stats.total}`)
    console.log(`\n   Por nivel:`)
    console.log(`   - Principiantes: ${stats.porNivel.principiante}`)
    console.log(`   - Intermedios: ${stats.porNivel.intermedio}`)
    console.log(`   - Avanzados: ${stats.porNivel.avanzado}`)
    console.log(`\n   Por género:`)
    console.log(`   - Hombres: ${stats.porGenero.hombres}`)
    console.log(`   - Mujeres: ${stats.porGenero.mujeres}`)
    console.log(`\n   Promedios:`)
    console.log(`   - Reservas por cliente: ${stats.promedios.reservas}`)
    console.log(`   - Gasto por cliente: $${stats.promedios.gasto} MXN`)
    
    // Top 5 clientes
    const topClientes = createdClients
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
    
    console.log('\n🏆 TOP 5 CLIENTES POR GASTO:')
    topClientes.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.name} - $${client.totalSpent / 100} MXN`)
    })
    
    console.log('\n' + '=' .repeat(60))
    console.log('✨ CLIENTES CREADOS EXITOSAMENTE')
    console.log('=' .repeat(60))
    
    return createdClients
    
  } catch (error) {
    console.error('❌ Error creando clientes:', error)
    throw error
  }
}

createClients()
  .then((clients) => {
    console.log(`\n✅ Proceso completado. ${clients.length} clientes agregados.`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })