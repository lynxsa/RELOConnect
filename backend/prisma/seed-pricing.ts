import { PrismaClient } from '@prisma/client';
import { VEHICLE_CLASSES, DISTANCE_BANDS, EXTRA_SERVICES, generateCompletePricingMatrix } from '../src/data/pricing';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding the database...');
  
  // Seed vehicle classes
  console.log('Seeding vehicle classes...');
  for (const vehicleClass of VEHICLE_CLASSES) {
    await prisma.vehicleClass.upsert({
      where: { id: vehicleClass.id },
      update: vehicleClass,
      create: vehicleClass
    });
  }

  // Seed distance bands
  console.log('Seeding distance bands...');
  for (const band of DISTANCE_BANDS) {
    await prisma.distanceBand.upsert({
      where: { id: band.id },
      update: {
        minKm: band.minKm,
        maxKm: band.maxKm,
        label: band.label
      },
      create: {
        id: band.id,
        minKm: band.minKm,
        maxKm: band.maxKm,
        label: band.label
      }
    });
  }

  // Generate and seed pricing rates
  console.log('Seeding pricing rates...');
  const pricingRates = generateCompletePricingMatrix();
  for (const rate of pricingRates) {
    // Skip custom quote rates
    if (rate.baseFare > 0) {
      await prisma.pricingRate.upsert({
        where: { 
          vehicleClassId_distanceBandId: {
            vehicleClassId: rate.vehicleClassId,
            distanceBandId: rate.distanceBandId
          }
        },
        update: { baseFare: rate.baseFare },
        create: {
          id: rate.id,
          vehicleClassId: rate.vehicleClassId,
          distanceBandId: rate.distanceBandId,
          baseFare: rate.baseFare
        }
      });
    }
  }

  // Seed extra services
  console.log('Seeding extra services...');
  for (const service of EXTRA_SERVICES) {
    await prisma.extraService.upsert({
      where: { code: service.code },
      update: {
        name: service.name,
        description: service.description,
        priceType: service.priceType,
        price: service.price,
        unit: service.unit,
        icon: service.icon
      },
      create: {
        id: service.id,
        code: service.code,
        name: service.name,
        description: service.description,
        priceType: service.priceType,
        price: service.price,
        unit: service.unit,
        icon: service.icon
      }
    });
  }
  
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
