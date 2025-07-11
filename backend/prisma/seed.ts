import { PrismaClient } from '@prisma/client';
import seedSouthAfricanData from './seed-south-african';
import { VEHICLE_CLASSES, DISTANCE_BANDS, EXTRA_SERVICES, generateCompletePricingMatrix } from '../src/data/pricing';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // First, seed all pricing data (vehicle classes, distance bands, etc.)
  console.log('🚚 Seeding pricing data (vehicle classes, distance bands, pricing rates)...');
  
  // Seed vehicle classes
  console.log('Seeding vehicle classes...');
  const vehicleClassesMap = new Map();
  
  for (const vehicleClass of VEHICLE_CLASSES) {
    const createdClass = await prisma.vehicleClass.upsert({
      where: { id: vehicleClass.id },
      update: vehicleClass,
      create: vehicleClass
    });
    vehicleClassesMap.set(vehicleClass.id, createdClass);
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

  // Create vehicle instances linked to vehicle classes
  // These are the actual vehicles that can be assigned to drivers and bookings
  console.log('Creating vehicle instances linked to vehicle classes...');
  
  const vehicles = await Promise.all([
    // Mini-Van
    prisma.vehicle.upsert({
      where: { id: 'vehicle-mini-van' },
      update: {
        vehicleClassId: 'mini-van'
      },
      create: {
        id: 'vehicle-mini-van',
        type: 'VAN',
        vehicleClassId: 'mini-van',
        capacity: 0.8,
        maxWeight: 1000,
        name: 'Mini Van',
        description: 'Perfect for small moves and deliveries',
        basePrice: 650,
        pricePerKm: 2.0,
        icon: '🚐',
      },
    }),
    // 1-ton truck
    prisma.vehicle.upsert({
      where: { id: 'vehicle-1-ton' },
      update: {
        vehicleClassId: '1-ton-truck'
      },
      create: {
        id: 'vehicle-1-ton',
        type: 'TRUCK',
        vehicleClassId: '1-ton-truck',
        capacity: 1.0,
        maxWeight: 1000,
        name: '1 Ton Truck',
        description: 'Ideal for small furniture and appliances',
        basePrice: 800,
        pricePerKm: 2.5,
        icon: '🚚',
      },
    }),
    // 2-ton truck
    prisma.vehicle.upsert({
      where: { id: 'vehicle-2-ton' },
      update: {
        vehicleClassId: '2-ton-truck'
      },
      create: {
        id: 'vehicle-2-ton',
        type: 'TRUCK',
        vehicleClassId: '2-ton-truck',
        capacity: 2.0,
        maxWeight: 2000,
        name: '2 Ton Truck',
        description: 'Perfect for 1-2 bedroom moves',
        basePrice: 1050,
        pricePerKm: 3.0,
        icon: '🚚',
      },
    }),
    // 4-ton truck
    prisma.vehicle.upsert({
      where: { id: 'vehicle-4-ton' },
      update: {
        vehicleClassId: '4-ton-truck'
      },
      create: {
        id: 'vehicle-4-ton',
        type: 'TRUCK',
        vehicleClassId: '4-ton-truck',
        capacity: 4.0,
        maxWeight: 4000,
        name: '4 Ton Truck',
        description: 'Suitable for 2-3 bedroom homes',
        basePrice: 1300,
        pricePerKm: 3.5,
        icon: '🚛',
      },
    }),
  ]);

  console.log(`✅ Created ${vehicles.length} vehicles linked to their respective vehicle classes`);

  // Seed South African specific data (provincial adjustments, fuel surcharge)
  await seedSouthAfricanData();

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        email: 'customer@example.com',
        phone: '+27821234567',
        firstName: 'John',
        lastName: 'Doe',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfNfnfpVm9kL6Vu', // password123
        role: 'USER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'driver@example.com' },
      update: {},
      create: {
        email: 'driver@example.com',
        phone: '+27821234568',
        firstName: 'James',
        lastName: 'Wilson',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfNfnfpVm9kL6Vu', // password123
        role: 'DRIVER',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        phone: '+27821234569',
        firstName: 'Admin',
        lastName: 'User',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfNfnfpVm9kL6Vu', // password123
        role: 'ADMIN',
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create driver profile for the driver user
  const driverUser = users.find(u => u.role === 'DRIVER');
  if (driverUser) {
    const driver = await prisma.driver.upsert({
      where: { userId: driverUser.id },
      update: {},
      create: {
        userId: driverUser.id,
        licenseNumber: 'DL123456789',
        vehicleId: vehicles[1].id, // 1 Ton Truck
        rating: 4.8,
        totalTrips: 127,
        isOnline: true,
        currentLatitude: -26.2041,
        currentLongitude: 28.0473,
        currentAddress: '123 Main Street, Johannesburg',
        licenseDoc: '/docs/license.pdf',
        idDoc: '/docs/id.pdf',
        vehicleRegDoc: '/docs/vehicle_reg.pdf',
        insuranceDoc: '/docs/insurance.pdf',
        accountNumber: '1234567890',
        bankName: 'Standard Bank',
        accountHolder: 'James Wilson',
      },
    });

    console.log(`✅ Created driver profile for ${driverUser.firstName} ${driverUser.lastName}`);
  }

  // Create sample donation items
  const customerUser = users.find(u => u.role === 'USER');
  if (customerUser) {
    const donations = await Promise.all([
      prisma.donationItem.create({
        data: {
          title: 'Dining Table Set',
          description: 'Beautiful wooden dining table with 6 chairs. Great condition, just moving overseas.',
          category: 'FURNITURE',
          condition: 'GOOD',
          images: ['/images/dining-table.jpg'],
          latitude: -26.2041,
          longitude: 28.0473,
          address: '123 Main St',
          city: 'Johannesburg',
          state: 'Gauteng',
          postalCode: '2000',
          country: 'South Africa',
          donorId: customerUser.id,
          status: 'AVAILABLE',
        },
      }),
      prisma.donationItem.create({
        data: {
          title: 'Samsung 55" Smart TV',
          description: 'Excellent condition smart TV. Includes original remote and box.',
          category: 'ELECTRONICS',
          condition: 'LIKE_NEW',
          images: ['/images/samsung-tv.jpg'],
          latitude: -26.1951,
          longitude: 28.0289,
          address: '456 Oak Avenue',
          city: 'Johannesburg',
          state: 'Gauteng',
          postalCode: '2001',
          country: 'South Africa',
          donorId: customerUser.id,
          status: 'AVAILABLE',
        },
      }),
    ]);

    console.log(`✅ Created ${donations.length} donation items`);
  }

  // === Fleet & Safety Management Demo Data ===
  console.log('Seeding South African FleetOwner, DriverProfile, and Truck...');

  // 1. Create FleetOwner user
  const demoFleetOwnerUser = await prisma.user.upsert({
    where: { email: 'sibusiso@mthembufreight.co.za' },
    update: {},
    create: {
      email: 'sibusiso@mthembufreight.co.za',
      phone: '+27824567890',
      firstName: 'Sibusiso',
      lastName: 'Mthembu',
      password: 'hashed-password',
      role: 'FLEET_OWNER',
      isVerified: true,
      avatar: null,
    },
  });

  // 2. Create FleetOwner profile
  const demoFleetOwner = await prisma.fleetOwner.upsert({
    where: { userId: demoFleetOwnerUser.id },
    update: {},
    create: {
      userId: demoFleetOwnerUser.id,
      businessName: 'Mthembu Freight Logistics',
      businessRegNumber: '2023/123456/07',
      phoneNumber: '+27824567890',
      address: '123 Freight Rd',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2001',
      verificationStatus: 'VERIFIED',
      idDocument: 'https://example.com/docs/sibusiso_id.pdf',
      businessRegDoc: 'https://example.com/docs/cipc.pdf',
      proofOfOwnership: 'https://example.com/docs/ownership.pdf',
      profilePhoto: 'https://example.com/photos/sibusiso.jpg',
      trustScore: 95,
      reportCount: 0,
      flaggedForReview: false,
    },
  });

  // 3. Create DriverProfile user
  const demoDriverUser = await prisma.user.upsert({
    where: { email: 'lerato.dlamini@drivers.co.za' },
    update: {},
    create: {
      email: 'lerato.dlamini@drivers.co.za',
      phone: '+27761234567',
      firstName: 'Lerato',
      lastName: 'Dlamini',
      password: 'hashed-password',
      role: 'DRIVER',
      isVerified: true,
      avatar: null,
    },
  });

  // 4. Create DriverProfile
  const demoDriverProfile = await prisma.driverProfile.upsert({
    where: { userId: demoDriverUser.id },
    update: {},
    create: {
      userId: demoDriverUser.id,
      fleetOwnerId: demoFleetOwner.id,
      phoneNumber: '+27761234567',
      address: '456 Driver St',
      city: 'Pretoria',
      province: 'Gauteng',
      postalCode: '0002',
      profilePhoto: 'https://example.com/photos/lerato.jpg',
      emergencyContact: 'Nomsa Dlamini',
      emergencyPhone: '+27769876543',
      licenseNumber: '548321',
      licenseType: 'CODE_14',
      pdpNumber: '548321',
      licenseExpiry: new Date('2027-12-31'),
      pdpExpiry: new Date('2026-06-30'),
      licenseDoc: 'https://example.com/docs/lerato_license.pdf',
      pdpDoc: 'https://example.com/docs/lerato_pdp.pdf',
      idDocument: 'https://example.com/docs/lerato_id.pdf',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      totalTrips: 120,
      completedTrips: 118,
      cancelledTrips: 2,
      isOnline: false,
      isAvailable: true,
      trustScore: 90,
      reportCount: 0,
      flaggedForReview: false,
      backgroundCheckStatus: 'VERIFIED',
    },
  });

  // 5. Create Truck
  const demoTruck = await prisma.truck.upsert({
    where: { licensePlate: 'CF 456 WP' },
    update: {},
    create: {
      fleetOwnerId: demoFleetOwner.id,
      name: 'Isuzu FTR 850',
      licensePlate: 'CF 456 WP',
      vehicleType: 'LARGE_TRUCK',
      capacity: 45,
      maxWeight: 16000,
      year: 2022,
      make: 'Isuzu',
      model: 'FTR 850',
      color: 'White',
      registrationDoc: 'https://example.com/docs/isuzu_reg.pdf',
      insuranceDoc: 'https://example.com/docs/isuzu_insurance.pdf',
      roadworthyDoc: 'https://example.com/docs/isuzu_roadworthy.pdf',
      permitDoc: 'https://example.com/docs/isuzu_permit.pdf',
      verificationStatus: 'VERIFIED',
      isActive: true,
      gpsEnabled: true,
      lastKnownLat: -26.2041,
      lastKnownLng: 28.0473,
      lastSeen: new Date(),
    },
  });

  // 6. Assign Driver to Truck (TruckAssignment)
  await prisma.truckAssignment.create({
    data: {
      truckId: demoTruck.id,
      driverId: demoDriverProfile.id,
      assignedAt: new Date(),
      isActive: true,
      notes: 'Primary driver for Gauteng routes',
    },
  });

  // 7. Document Verification (example)
  await prisma.documentVerification.createMany({
    data: [
      {
        documentType: 'BUSINESS_REGISTRATION',
        documentUrl: 'https://example.com/docs/cipc.pdf',
        entityType: 'FLEET_OWNER',
        entityId: demoFleetOwner.id,
        status: 'VERIFIED',
        uploadedAt: new Date(),
        verifiedAt: new Date(),
      },
      {
        documentType: 'DRIVERS_LICENSE',
        documentUrl: 'https://example.com/docs/lerato_license.pdf',
        entityType: 'DRIVER',
        entityId: demoDriverProfile.id,
        status: 'VERIFIED',
        uploadedAt: new Date(),
        verifiedAt: new Date(),
      },
      {
        documentType: 'VEHICLE_REGISTRATION',
        documentUrl: 'https://example.com/docs/isuzu_reg.pdf',
        entityType: 'TRUCK',
        entityId: demoTruck.id,
        status: 'VERIFIED',
        uploadedAt: new Date(),
        verifiedAt: new Date(),
      },
    ],
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
