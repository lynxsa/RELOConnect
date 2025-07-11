import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function executeSqlFile(filePath: string) {
  console.log(`Executing SQL file: ${filePath}`);
  
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL content by statements and execute each one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('\\'));
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('insert') || 
          statement.toLowerCase().includes('update') || 
          statement.toLowerCase().includes('delete')) {
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (error) {
          console.warn(`Warning: Statement failed: ${statement.substring(0, 100)}...`, error);
        }
      }
    }
    
    console.log(`✅ Successfully executed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error executing ${filePath}:`, error);
    throw error;
  }
}

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeding...');
  
  try {
    // Execute the three comprehensive seed files in order
    const seedFiles = [
      'comprehensive_sa_seed_part1.sql',
      'comprehensive_sa_seed_part2.sql', 
      'comprehensive_sa_seed_part3.sql'
    ];
    
    for (const seedFile of seedFiles) {
      const filePath = path.join(__dirname, seedFile);
      if (fs.existsSync(filePath)) {
        await executeSqlFile(filePath);
      } else {
        console.warn(`⚠️  Seed file not found: ${filePath}`);
      }
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Verify the seeding by checking record counts
    const userCount = await prisma.user.count();
    const fleetOwnerCount = await prisma.fleetOwner.count();
    const driverProfileCount = await prisma.driverProfile.count();
    const truckCount = await prisma.truck.count();
    const bookingCount = await prisma.booking.count();
    const donationCount = await prisma.donationItem.count();
    
    console.log('\n📊 Seeded Data Summary:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Fleet Owners: ${fleetOwnerCount}`);
    console.log(`- Driver Profiles: ${driverProfileCount}`);
    console.log(`- Trucks: ${truckCount}`);
    console.log(`- Bookings: ${bookingCount}`);
    console.log(`- Donations: ${donationCount}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
