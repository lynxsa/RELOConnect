import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// South African provinces
const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape'
];

// Provincial adjustments based on infrastructure quality and logistics complexity
const PROVINCIAL_ADJUSTMENTS = [
  { province: 'Eastern Cape', adjustment: 1.08, description: 'Variable road conditions, rural areas' },
  { province: 'Free State', adjustment: 1.03, description: 'Good highway network, some rural challenges' },
  { province: 'Gauteng', adjustment: 1.00, description: 'Excellent infrastructure, high volume' },
  { province: 'KwaZulu-Natal', adjustment: 1.05, description: 'Coastal and inland variations, high humidity' },
  { province: 'Limpopo', adjustment: 1.10, description: 'Rural infrastructure, border province' },
  { province: 'Mpumalanga', adjustment: 1.07, description: 'Mountainous terrain in parts' },
  { province: 'North West', adjustment: 1.06, description: 'Mining areas, variable road quality' },
  { province: 'Northern Cape', adjustment: 1.12, description: 'Long distances, sparse population' },
  { province: 'Western Cape', adjustment: 1.02, description: 'Good infrastructure, some mountain passes' }
];

// Current South African fuel prices (as of July 2025)
const CURRENT_FUEL_PRICES = {
  petrol: 24.75, // ZAR per liter (93 Unleaded Inland)
  diesel: 23.90, // ZAR per liter (50ppm Inland)
  surchargeRate: 0.025 // 2.5% surcharge
};

async function seedSouthAfricanData() {
  console.log('Seeding South African specific data...');
  
  // Seed provincial adjustments
  console.log('Seeding provincial adjustments...');
  for (const pa of PROVINCIAL_ADJUSTMENTS) {
    await prisma.provincialAdjustment.upsert({
      where: { province: pa.province },
      update: {
        adjustment: pa.adjustment,
        description: pa.description
      },
      create: {
        id: `pa-${pa.province.toLowerCase().replace(/\s+/g, '-')}`,
        province: pa.province,
        adjustment: pa.adjustment,
        description: pa.description
      }
    });
  }

  // Seed current fuel surcharge
  console.log('Seeding current fuel surcharge...');
  const today = new Date();
  // Set effectiveFrom to first day of current month
  const effectiveFrom = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const surchargeId = `fs-${effectiveFrom.toISOString().slice(0, 7)}`;
  await prisma.fuelSurcharge.upsert({
    where: { 
      id: surchargeId
    },
    update: {
      petrolPrice: CURRENT_FUEL_PRICES.petrol,
      dieselPrice: CURRENT_FUEL_PRICES.diesel,
      surchargeRate: CURRENT_FUEL_PRICES.surchargeRate
    },
    create: {
      id: surchargeId,
      effectiveFrom,
      petrolPrice: CURRENT_FUEL_PRICES.petrol,
      dieselPrice: CURRENT_FUEL_PRICES.diesel,
      surchargeRate: CURRENT_FUEL_PRICES.surchargeRate,
      isActive: true
    }
  });
  
  console.log('South African data seeding complete.');
}

export default seedSouthAfricanData;

// Execute if run directly
if (require.main === module) {
  seedSouthAfricanData()
    .catch((e) => {
      console.error('Error seeding South African data:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
