import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Supabase data...')
  
  try {
    // Check clubs
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true
      }
    })
    console.log(`📍 Found ${clubs.length} clubs:`)
    clubs.forEach(club => {
      console.log(`   - ${club.name} (${club.slug}) [${club.status}]`)
    })
    
    // Check existing packages
    const packages = await prisma.saasPackage.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        isDefault: true
      }
    })
    console.log(`\n📦 Found ${packages.length} packages:`)
    packages.forEach(pkg => {
      console.log(`   - ${pkg.displayName} (${pkg.name}) ${pkg.isDefault ? '[DEFAULT]' : ''}`)
    })
    
    // Check club packages
    const clubPackages = await prisma.clubPackage.findMany({
      include: {
        club: { select: { name: true, slug: true } },
        package: { select: { displayName: true } }
      }
    })
    console.log(`\n🔗 Found ${clubPackages.length} club-package assignments:`)
    clubPackages.forEach(cp => {
      console.log(`   - ${cp.club.name} → ${cp.package.displayName}`)
    })
    
    // Check modules
    const modules = await prisma.saasModule.findMany({
      select: {
        code: true,
        name: true,
        isActive: true
      }
    })
    console.log(`\n🔧 Found ${modules.length} modules:`)
    modules.forEach(mod => {
      console.log(`   - ${mod.name} (${mod.code}) ${mod.isActive ? '✅' : '❌'}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking data:', error)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('💥 Failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })