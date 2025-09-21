const bcrypt = require('bcryptjs');
const argon2 = require('argon2');

async function testAuth() {
  const password = 'password123';
  
  // Test with user's actual hash
  const actualUserHash = await getActualHash();
  
    // [REMOVED: Sensitive log for security];
  console.log('Hash from DB:', actualUserHash.substring(0, 30) + '...');
  
  // Test Argon2
  try {
    const argon2Valid = await argon2.verify(actualUserHash, password);
    console.log('Argon2 result:', argon2Valid);
  } catch (err) {
    console.log('Argon2 failed:', err.message);
  }
  
  // Test bcrypt
  try {
    const bcryptValid = await bcrypt.compare(password, actualUserHash);
    console.log('Bcrypt result:', bcryptValid);
  } catch (err) {
    console.log('Bcrypt failed:', err.message);
  }
}

async function getActualHash() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  const user = await prisma.user.findUnique({
    where: { email: 'basic5@padelyzer.com' }
  });
  
  await prisma.$disconnect();
  return user?.password || '';
}

testAuth().catch(console.error);
