import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding comprehensive South African data...');

  // Clear existing data first
  console.log('🧹 Clearing existing data...');
  await prisma.truckAssignment.deleteMany();
  await prisma.documentVerification.deleteMany();
  await prisma.safetyReport.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.fleetOwner.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.donationItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  console.log('👥 Creating users...');
  const users = await prisma.user.createMany({
    data: [
      // Fleet Owners
      {
        id: 'fleet_owner_1',
        email: 'sibusiso@mthembufreight.co.za',
        phone: '+27824567890',
        firstName: 'Sibusiso',
        lastName: 'Mthembu',
        password: '$2b$10$hashedpassword',
        role: 'FLEET_OWNER',
        isVerified: true,
      },
      {
        id: 'fleet_owner_2',
        email: 'thabo@mapolatransport.co.za',
        phone: '+27836541234',
        firstName: 'Thabo',
        lastName: 'Mapola',
        password: '$2b$10$hashedpassword',
        role: 'FLEET_OWNER',
        isVerified: true,
      },
      {
        id: 'fleet_owner_3',
        email: 'nomsa@joburgtruck.co.za',
        phone: '+27845678901',
        firstName: 'Nomsa',
        lastName: 'Khumalo',
        password: '$2b$10$hashedpassword',
        role: 'FLEET_OWNER',
        isVerified: true,
      },
      {
        id: 'fleet_owner_4',
        email: 'pieter@capelogistics.co.za',
        phone: '+27217894561',
        firstName: 'Pieter',
        lastName: 'van der Merwe',
        password: '$2b$10$hashedpassword',
        role: 'FLEET_OWNER',
        isVerified: true,
      },
      {
        id: 'fleet_owner_5',
        email: 'fatima@durbanmovers.co.za',
        phone: '+27312345678',
        firstName: 'Fatima',
        lastName: 'Patel',
        password: '$2b$10$hashedpassword',
        role: 'FLEET_OWNER',
        isVerified: true,
      },
      // Drivers
      {
        id: 'driver_1',
        email: 'lerato.dlamini@drivers.co.za',
        phone: '+27761234567',
        firstName: 'Lerato',
        lastName: 'Dlamini',
        password: '$2b$10$hashedpassword',
        role: 'DRIVER',
        isVerified: true,
      },
      {
        id: 'driver_2',
        email: 'johannes.molefe@drivers.co.za',
        phone: '+27787654321',
        firstName: 'Johannes',
        lastName: 'Molefe',
        password: '$2b$10$hashedpassword',
        role: 'DRIVER',
        isVerified: true,
      },
      {
        id: 'driver_3',
        email: 'sarah.adams@drivers.co.za',
        phone: '+27798765432',
        firstName: 'Sarah',
        lastName: 'Adams',
        password: '$2b$10$hashedpassword',
        role: 'DRIVER',
        isVerified: true,
      },
      {
        id: 'driver_4',
        email: 'mandla.ngcobo@drivers.co.za',
        phone: '+27826547891',
        firstName: 'Mandla',
        lastName: 'Ngcobo',
        password: '$2b$10$hashedpassword',
        role: 'DRIVER',
        isVerified: true,
      },
      {
        id: 'driver_5',
        email: 'ahmed.hassan@drivers.co.za',
        phone: '+27834567123',
        firstName: 'Ahmed',
        lastName: 'Hassan',
        password: '$2b$10$hashedpassword',
        role: 'DRIVER',
        isVerified: true,
      },
      // Regular Users
      {
        id: 'user_1',
        email: 'tebogo.mokoena@gmail.com',
        phone: '+27725634891',
        firstName: 'Tebogo',
        lastName: 'Mokoena',
        password: '$2b$10$hashedpassword',
        role: 'USER',
        isVerified: true,
      },
      {
        id: 'user_2',
        email: 'nicole.williams@yahoo.com',
        phone: '+27846789012',
        firstName: 'Nicole',
        lastName: 'Williams',
        password: '$2b$10$hashedpassword',
        role: 'USER',
        isVerified: true,
      },
      {
        id: 'user_3',
        email: 'kgothatso.mabena@outlook.com',
        phone: '+27734512678',
        firstName: 'Kgothatso',
        lastName: 'Mabena',
        password: '$2b$10$hashedpassword',
        role: 'USER',
        isVerified: true,
      },
      // Admin Users
      {
        id: 'admin_1',
        email: 'admin@reloconnect.co.za',
        phone: '+27115551234',
        firstName: 'Mpho',
        lastName: 'Sebata',
        password: '$2b$10$hashedpassword',
        role: 'ADMIN',
        isVerified: true,
      },
    ],
  });

  // 2. Create Fleet Owners
  console.log('🚛 Creating fleet owners...');
  await prisma.fleetOwner.createMany({
    data: [
      {
        id: 'fleet_1',
        userId: 'fleet_owner_1',
        companyName: 'Mthembu Freight Solutions',
        companyRegistration: 'CK2019/123456/23',
        licenseNumber: 'FL001-GP-2022',
        address: '45 Commissioner Street, Johannesburg CBD',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2001',
        totalTrucks: 15,
        rating: 4.8,
        isVerified: true,
      },
      {
        id: 'fleet_2',
        userId: 'fleet_owner_2',
        companyName: 'Mapola Transport & Logistics',
        companyRegistration: 'CK2020/789012/23',
        licenseNumber: 'FL002-MP-2023',
        address: '123 Nelson Mandela Drive, Polokwane',
        city: 'Polokwane',
        province: 'Limpopo',
        postalCode: '0699',
        totalTrucks: 8,
        rating: 4.6,
        isVerified: true,
      },
      {
        id: 'fleet_3',
        userId: 'fleet_owner_3',
        companyName: 'Joburg Truck Rental',
        companyRegistration: 'CK2018/345678/23',
        licenseNumber: 'FL003-GP-2021',
        address: '78 Main Reef Road, Roodepoort',
        city: 'Roodepoort',
        province: 'Gauteng',
        postalCode: '1724',
        totalTrucks: 25,
        rating: 4.7,
        isVerified: true,
      },
      {
        id: 'fleet_4',
        userId: 'fleet_owner_4',
        companyName: 'Cape Logistics Express',
        companyRegistration: 'CK2021/456789/23',
        licenseNumber: 'FL004-WC-2023',
        address: '56 Long Street, Cape Town City Centre',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '8001',
        totalTrucks: 12,
        rating: 4.9,
        isVerified: true,
      },
      {
        id: 'fleet_5',
        userId: 'fleet_owner_5',
        companyName: 'Durban Movers & Packers',
        companyRegistration: 'CK2022/567890/23',
        licenseNumber: 'FL005-KZN-2024',
        address: '234 Point Road, Durban Central',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        postalCode: '4001',
        totalTrucks: 10,
        rating: 4.5,
        isVerified: true,
      },
    ],
  });

  // 3. Create Driver Profiles
  console.log('👨‍✈️ Creating driver profiles...');
  await prisma.driverProfile.createMany({
    data: [
      {
        id: 'driver_profile_1',
        userId: 'driver_1',
        licenseNumber: 'DL123456789-GP',
        licenseClass: 'C1',
        licenseExpiry: new Date('2026-06-15'),
        experienceYears: 8,
        nationalId: '8712154321087',
        address: '45 Soweto Street, Orlando East',
        city: 'Soweto',
        province: 'Gauteng',
        postalCode: '1804',
        rating: 4.8,
        totalTrips: 156,
        isAvailable: true,
        isVerified: true,
      },
      {
        id: 'driver_profile_2',
        userId: 'driver_2',
        licenseNumber: 'DL987654321-GP',
        licenseClass: 'C',
        licenseExpiry: new Date('2025-11-30'),
        experienceYears: 12,
        nationalId: '7508234567891',
        address: '123 Tembisa Street, Tembisa',
        city: 'Tembisa',
        province: 'Gauteng',
        postalCode: '1632',
        rating: 4.9,
        totalTrips: 234,
        isAvailable: true,
        isVerified: true,
      },
      {
        id: 'driver_profile_3',
        userId: 'driver_3',
        licenseNumber: 'DL456789123-WC',
        licenseClass: 'C1',
        licenseExpiry: new Date('2027-03-20'),
        experienceYears: 5,
        nationalId: '9203156789012',
        address: '67 Athlone Avenue, Athlone',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '7764',
        rating: 4.6,
        totalTrips: 89,
        isAvailable: true,
        isVerified: true,
      },
      {
        id: 'driver_profile_4',
        userId: 'driver_4',
        licenseNumber: 'DL789123456-KZN',
        licenseClass: 'C',
        licenseExpiry: new Date('2026-09-10'),
        experienceYears: 15,
        nationalId: '7012234567890',
        address: '89 Chatsworth Road, Chatsworth',
        city: 'Durban',
        province: 'KwaZulu-Natal',
        postalCode: '4092',
        rating: 4.7,
        totalTrips: 312,
        isAvailable: true,
        isVerified: true,
      },
      {
        id: 'driver_profile_5',
        userId: 'driver_5',
        licenseNumber: 'DL321654987-WC',
        licenseClass: 'C1',
        licenseExpiry: new Date('2025-12-05'),
        experienceYears: 6,
        nationalId: '8605123456789',
        address: '34 Mitchell''s Plain Avenue, Mitchell''s Plain',
        city: 'Cape Town',
        province: 'Western Cape',
        postalCode: '7785',
        rating: 4.4,
        totalTrips: 97,
        isAvailable: true,
        isVerified: true,
      },
    ],
  });

  // 4. Create Trucks
  console.log('🚚 Creating trucks...');
  await prisma.truck.createMany({
    data: [
      {
        id: 'truck_1',
        fleetOwnerId: 'fleet_1',
        registrationNumber: 'GP123456',
        make: 'Isuzu',
        model: 'NPR 400',
        year: 2021,
        truckType: 'LIGHT_DUTY',
        capacity: 3500,
        length: 4.5,
        width: 2.0,
        height: 2.2,
        fuelType: 'DIESEL',
        mileage: 45000,
        insuranceNumber: 'INS-GP-001-2024',
        insuranceExpiry: new Date('2025-08-15'),
        lastServiceDate: new Date('2024-11-01'),
        nextServiceDue: new Date('2025-02-01'),
        isAvailable: true,
        status: 'ACTIVE',
      },
      {
        id: 'truck_2',
        fleetOwnerId: 'fleet_1',
        registrationNumber: 'GP789012',
        make: 'Mercedes-Benz',
        model: 'Atego 1518',
        year: 2020,
        truckType: 'MEDIUM_DUTY',
        capacity: 7500,
        length: 7.2,
        width: 2.3,
        height: 2.8,
        fuelType: 'DIESEL',
        mileage: 67000,
        insuranceNumber: 'INS-GP-002-2024',
        insuranceExpiry: new Date('2025-09-20'),
        lastServiceDate: new Date('2024-10-15'),
        nextServiceDue: new Date('2025-01-15'),
        isAvailable: true,
        status: 'ACTIVE',
      },
      {
        id: 'truck_3',
        fleetOwnerId: 'fleet_2',
        registrationNumber: 'LIM345678',
        make: 'Volvo',
        model: 'FH460',
        year: 2019,
        truckType: 'HEAVY_DUTY',
        capacity: 15000,
        length: 12.0,
        width: 2.5,
        height: 3.5,
        fuelType: 'DIESEL',
        mileage: 89000,
        insuranceNumber: 'INS-LIM-001-2024',
        insuranceExpiry: new Date('2025-07-10'),
        lastServiceDate: new Date('2024-09-30'),
        nextServiceDue: new Date('2024-12-30'),
        isAvailable: true,
        status: 'ACTIVE',
      },
      {
        id: 'truck_4',
        fleetOwnerId: 'fleet_3',
        registrationNumber: 'GP456789',
        make: 'Scania',
        model: 'R450',
        year: 2022,
        truckType: 'HEAVY_DUTY',
        capacity: 18000,
        length: 13.6,
        width: 2.5,
        height: 4.0,
        fuelType: 'DIESEL',
        mileage: 32000,
        insuranceNumber: 'INS-GP-003-2024',
        insuranceExpiry: new Date('2025-11-05'),
        lastServiceDate: new Date('2024-11-20'),
        nextServiceDue: new Date('2025-02-20'),
        isAvailable: true,
        status: 'ACTIVE',
      },
      {
        id: 'truck_5',
        fleetOwnerId: 'fleet_4',
        registrationNumber: 'WC123789',
        make: 'DAF',
        model: 'XF 480',
        year: 2021,
        truckType: 'HEAVY_DUTY',
        capacity: 16500,
        length: 13.6,
        width: 2.5,
        height: 4.0,
        fuelType: 'DIESEL',
        mileage: 54000,
        insuranceNumber: 'INS-WC-001-2024',
        insuranceExpiry: new Date('2025-10-12'),
        lastServiceDate: new Date('2024-10-01'),
        nextServiceDue: new Date('2025-01-01'),
        isAvailable: true,
        status: 'ACTIVE',
      },
    ],
  });

  // 5. Create Truck Assignments
  console.log('🔗 Creating truck assignments...');
  await prisma.truckAssignment.createMany({
    data: [
      {
        id: 'assignment_1',
        truckId: 'truck_1',
        driverProfileId: 'driver_profile_1',
        assignedDate: new Date('2024-11-01'),
        status: 'ACTIVE',
      },
      {
        id: 'assignment_2',
        truckId: 'truck_2',
        driverProfileId: 'driver_profile_2',
        assignedDate: new Date('2024-11-15'),
        status: 'ACTIVE',
      },
      {
        id: 'assignment_3',
        truckId: 'truck_3',
        driverProfileId: 'driver_profile_4',
        assignedDate: new Date('2024-10-20'),
        status: 'ACTIVE',
      },
      {
        id: 'assignment_4',
        truckId: 'truck_4',
        driverProfileId: 'driver_profile_3',
        assignedDate: new Date('2024-11-10'),
        status: 'ACTIVE',
      },
      {
        id: 'assignment_5',
        truckId: 'truck_5',
        driverProfileId: 'driver_profile_5',
        assignedDate: new Date('2024-11-05'),
        status: 'ACTIVE',
      },
    ],
  });

  // 6. Create Sample Bookings
  console.log('📦 Creating bookings...');
  await prisma.booking.createMany({
    data: [
      {
        id: 'booking_1',
        userId: 'user_1',
        pickupAddress: '123 Sandton Drive, Sandton, Johannesburg',
        deliveryAddress: '456 Rosebank Mall, Rosebank, Johannesburg',
        pickupDate: new Date('2024-12-15'),
        deliveryDate: new Date('2024-12-15'),
        status: 'PENDING',
        totalAmount: 850.00,
        paymentStatus: 'PENDING',
        serviceType: 'LOCAL_DELIVERY',
        packageDetails: 'Office furniture and equipment',
        specialInstructions: 'Handle with care - fragile items',
      },
      {
        id: 'booking_2',
        userId: 'user_2',
        pickupAddress: '789 Sea Point Promenade, Cape Town',
        deliveryAddress: '321 Stellenbosch Wine Farm, Stellenbosch',
        pickupDate: new Date('2024-12-20'),
        deliveryDate: new Date('2024-12-20'),
        status: 'CONFIRMED',
        totalAmount: 1200.00,
        paymentStatus: 'PAID',
        serviceType: 'FURNITURE_MOVING',
        packageDetails: 'Full household furniture',
        specialInstructions: 'Piano requires special handling',
      },
      {
        id: 'booking_3',
        userId: 'user_3',
        pickupAddress: '567 Durban North, Durban',
        deliveryAddress: '890 Pietermaritzburg CBD, Pietermaritzburg',
        pickupDate: new Date('2024-12-18'),
        deliveryDate: new Date('2024-12-18'),
        status: 'IN_PROGRESS',
        totalAmount: 950.00,
        paymentStatus: 'PAID',
        serviceType: 'LONG_DISTANCE',
        packageDetails: 'Business documents and supplies',
        specialInstructions: 'Urgent delivery required',
      },
    ],
  });

  // 7. Create Donation Items
  console.log('💝 Creating donation items...');
  await prisma.donationItem.createMany({
    data: [
      {
        id: 'donation_1',
        donorId: 'user_1',
        title: 'Gently Used Dining Set',
        description: 'Beautiful wooden dining table with 6 chairs, perfect for a family',
        category: 'FURNITURE',
        condition: 'GOOD',
        location: 'Sandton, Johannesburg',
        isAvailable: true,
        images: ['dining_set_1.jpg', 'dining_set_2.jpg'],
      },
      {
        id: 'donation_2',
        donorId: 'user_2',
        title: 'Children\'s Clothing Bundle',
        description: 'Ages 3-8, includes shirts, pants, dresses, and shoes',
        category: 'CLOTHING',
        condition: 'EXCELLENT',
        location: 'Cape Town, Western Cape',
        isAvailable: true,
        images: ['kids_clothes_1.jpg'],
      },
      {
        id: 'donation_3',
        donorId: 'user_3',
        title: 'Kitchen Appliances Set',
        description: 'Microwave, toaster, and blender - all in working condition',
        category: 'ELECTRONICS',
        condition: 'GOOD',
        location: 'Durban, KwaZulu-Natal',
        isAvailable: true,
        images: ['kitchen_appliances_1.jpg', 'kitchen_appliances_2.jpg'],
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');

  // Print summary
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
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
