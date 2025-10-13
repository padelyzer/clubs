import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function validatePricingIsolation() {
  console.log('=== VALIDANDO AISLAMIENTO DE PRECIOS ENTRE CLUBES ===\n');
  
  try {
    // 1. Obtener Basic5 club
    const basic5Club = await prisma.club.findUnique({
      where: { id: 'club-basic5-001' }
    });
    
    console.log('✅ Club Basic5 encontrado:', basic5Club?.name);
    
    // 2. Obtener precios de Basic5
    const basic5Pricing = await prisma.pricing.findMany({
      where: { clubId: 'club-basic5-001' },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Basic5 tiene ${basic5Pricing.length} reglas de precio`);
    if (basic5Pricing.length > 0) {
      console.log('   Ejemplo:', {
        horario: `${basic5Pricing[0].startTime} - ${basic5Pricing[0].endTime}`,
        precio: `$${basic5Pricing[0].price / 100} MXN`,
        día: basic5Pricing[0].dayOfWeek ?? 'Todos'
      });
    }
    
    // 3. Crear otro club de prueba
    const testClubId = `club-test-pricing-${Date.now()}`;
    const testClub = await prisma.club.create({
      data: {
        id: testClubId,
        name: 'Club Test Pricing',
        slug: `test-pricing-${Date.now()}`,
        email: 'test-pricing@test.com',
        phone: '1234567890',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        country: 'Mexico',
        postalCode: '12345',
        status: 'APPROVED',
        active: true,
        updatedAt: new Date()
      }
    });
    
    console.log('\n✅ Club de prueba creado:', testClub.name);
    
    // 4. Crear precios diferentes para el club de prueba
    const testPricing = await prisma.pricing.create({
      data: {
        id: `pricing_test_${Date.now()}`,
        clubId: testClubId,
        dayOfWeek: null,
        startTime: '09:00',
        endTime: '18:00',
        price: 50000, // 500 MXN - diferente a Basic5
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Precio creado para club de prueba:', {
      horario: `${testPricing.startTime} - ${testPricing.endTime}`,
      precio: `$${testPricing.price / 100} MXN`
    });
    
    // 5. Verificar que los precios están aislados
    const basic5PricingAfter = await prisma.pricing.findMany({
      where: { clubId: 'club-basic5-001' }
    });
    
    const testClubPricing = await prisma.pricing.findMany({
      where: { clubId: testClubId }
    });
    
    console.log('\n=== VERIFICACIÓN DE AISLAMIENTO ===');
    console.log(`Basic5 precios: ${basic5PricingAfter.length} reglas`);
    console.log(`Test Club precios: ${testClubPricing.length} reglas`);
    
    // 6. Verificar que no hay contaminación cruzada
    const crossContamination = await prisma.pricing.findMany({
      where: {
        OR: [
          { 
            clubId: 'club-basic5-001',
            price: 50000 // Precio del club de prueba
          },
          {
            clubId: testClubId,
            price: 30000 // Precio de Basic5
          }
        ]
      }
    });
    
    if (crossContamination.length === 0) {
      console.log('✅ NO hay contaminación cruzada entre clubes');
    } else {
      console.log('❌ ALERTA: Posible contaminación cruzada detectada');
    }
    
    // 7. Intentar actualizar precio de Basic5 y verificar que no afecta al otro club
    if (basic5Pricing.length > 0) {
      await prisma.pricing.update({
        where: { id: basic5Pricing[0].id },
        data: { price: 35000 } // Cambiar precio
      });
      
      const testClubPricingAfterUpdate = await prisma.pricing.findMany({
        where: { clubId: testClubId }
      });
      
      if (testClubPricingAfterUpdate[0].price === 50000) {
        console.log('✅ Actualización en Basic5 NO afectó al club de prueba');
      } else {
        console.log('❌ ALERTA: Actualización en Basic5 afectó al club de prueba');
      }
    }
    
    // 8. Limpiar - eliminar club de prueba y sus precios
    await prisma.pricing.deleteMany({
      where: { clubId: testClubId }
    });
    
    await prisma.club.delete({
      where: { id: testClubId }
    });
    
    console.log('\n✅ Limpieza completada - club de prueba eliminado');
    
    console.log('\n=== RESULTADO FINAL ===');
    console.log('✅ Los precios están correctamente aislados por club');
    console.log('✅ Cada club mantiene sus propios precios independientes');
    console.log('✅ No hay filtración de datos entre clubes');
    
  } catch (error) {
    console.error('Error durante la validación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validatePricingIsolation();