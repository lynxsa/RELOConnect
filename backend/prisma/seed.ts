import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { id: 'vehicle-1' },
      update: {},
      create: {
        id: 'vehicle-1',
        type: 'MOTORCYCLE',
        capacity: 0.2,
        maxWeight: 50,
        name: 'Motorcycle',
        description: 'Perfect for small packages and documents',
        basePrice: 40,
        pricePerKm: 1.5,
        icon: '🏍️',
      },
    }),
    prisma.vehicle.upsert({
      where: { id: 'vehicle-2' },
      update: {},
      create: {
        id: 'vehicle-2',
        type: 'PICKUP',
        capacity: 2.0,
        maxWeight: 1000,
        name: 'Pickup Truck',
        description: 'Great for medium-sized items and furniture',
        basePrice: 60,
        pricePerKm: 2,
        icon: '🛻',
      },
    }),
    prisma.vehicle.upsert({
      where: { id: 'vehicle-3' },
      update: {},
      create: {
        id: 'vehicle-3',
        type: 'VAN',
        capacity: 3.5,
        maxWeight: 1500,
        name: 'Small Van',
        description: 'Perfect for small to medium moves',
        basePrice: 80,
        pricePerKm: 2.5,
        icon: '🚐',
      },
    }),
    prisma.vehicle.upsert({
      where: { id: 'vehicle-4' },
      update: {},
      create: {
        id: 'vehicle-4',
        type: 'TRUCK',
        capacity: 15.0,
        maxWeight: 3500,
        name: 'Moving Truck',
        description: 'For large moves and commercial deliveries',
        basePrice: 120,
        pricePerKm: 3.5,
        icon: '🚚',
      },
    }),
  ]);

  console.log(`✅ Created ${vehicles.length} vehicles`);

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
        vehicleId: vehicles[1].id, // Pickup truck
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
