const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@wizard.com' },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        active: true,
        name: true
      }
    });
    
    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }
    
    console.log('Usuario encontrado:');
    console.log('- Email:', user.email);
    console.log('- Activo:', user.active);
    console.log('- Rol:', user.role);
    console.log('- Tiene password:', user.password ? true : false);
    console.log('- Password length:', user.password ? user.password.length : 0);
    
    // Verificar contraseña
    if (user.password) {
      const isValid = await bcrypt.compare('test123', user.password);
      console.log('- Password test123 válida:', isValid);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser();