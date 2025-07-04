-- Manual table creation for RELOConnect
-- Based on Prisma schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    password TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle classes table
CREATE TABLE IF NOT EXISTS vehicle_classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity TEXT NOT NULL,
    "maxWeight" INTEGER NOT NULL,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    "order" INTEGER NOT NULL
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    "vehicleClassId" TEXT,
    capacity DOUBLE PRECISION NOT NULL,
    "maxWeight" INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "pricePerKm" DOUBLE PRECISION NOT NULL,
    icon TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("vehicleClassId") REFERENCES vehicle_classes(id)
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL,
    "licenseNumber" TEXT UNIQUE NOT NULL,
    "vehicleId" TEXT NOT NULL,
    rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "currentAddress" TEXT,
    "licenseDoc" TEXT NOT NULL,
    "idDoc" TEXT NOT NULL,
    "vehicleRegDoc" TEXT NOT NULL,
    "insuranceDoc" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("vehicleId") REFERENCES vehicles(id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    "pickupLatitude" DOUBLE PRECISION NOT NULL,
    "pickupLongitude" DOUBLE PRECISION NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupCity" TEXT NOT NULL,
    "pickupState" TEXT NOT NULL,
    "pickupPostalCode" TEXT NOT NULL,
    "pickupCountry" TEXT NOT NULL,
    "dropoffLatitude" DOUBLE PRECISION NOT NULL,
    "dropoffLongitude" DOUBLE PRECISION NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "dropoffCity" TEXT NOT NULL,
    "dropoffState" TEXT NOT NULL,
    "dropoffPostalCode" TEXT NOT NULL,
    "dropoffCountry" TEXT NOT NULL,
    "scheduledDateTime" TIMESTAMP(3) NOT NULL,
    "estimatedDistance" DOUBLE PRECISION NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "actualDistance" DOUBLE PRECISION,
    "actualDuration" INTEGER,
    "packageDescription" TEXT NOT NULL,
    "packageWeight" DOUBLE PRECISION,
    "packageVolume" DOUBLE PRECISION,
    "isFragile" BOOLEAN NOT NULL DEFAULT false,
    "isValuable" BOOLEAN NOT NULL DEFAULT false,
    "loadingService" BOOLEAN NOT NULL DEFAULT false,
    "stairsCount" INTEGER NOT NULL DEFAULT 0,
    "packingService" BOOLEAN NOT NULL DEFAULT false,
    "cleaningService" BOOLEAN NOT NULL DEFAULT false,
    "expressService" BOOLEAN NOT NULL DEFAULT false,
    "insuranceService" BOOLEAN NOT NULL DEFAULT false,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "driverId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id),
    FOREIGN KEY ("driverId") REFERENCES drivers(id),
    FOREIGN KEY ("vehicleId") REFERENCES vehicles(id)
);

-- Donation items table
CREATE TABLE IF NOT EXISTS donation_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    country TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "requesterId" TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("donorId") REFERENCES users(id),
    FOREIGN KEY ("requesterId") REFERENCES users(id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'TEXT',
    "bookingId" TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("senderId") REFERENCES users(id),
    FOREIGN KEY ("receiverId") REFERENCES users(id),
    FOREIGN KEY ("bookingId") REFERENCES bookings(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    currency TEXT NOT NULL DEFAULT 'ZAR',
    method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    FOREIGN KEY ("bookingId") REFERENCES bookings(id),
    FOREIGN KEY ("userId") REFERENCES users(id)
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    "imageUrl" TEXT,
    source TEXT NOT NULL,
    author TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ports table
CREATE TABLE IF NOT EXISTS ports (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timezone TEXT NOT NULL,
    facilities TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vessels table
CREATE TABLE IF NOT EXISTS vessels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    imo TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    flag TEXT NOT NULL,
    length DOUBLE PRECISION,
    width DOUBLE PRECISION,
    draft DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Port schedules table
CREATE TABLE IF NOT EXISTS port_schedules (
    id TEXT PRIMARY KEY,
    "portId" TEXT NOT NULL,
    "vesselId" TEXT NOT NULL,
    eta TIMESTAMP(3) NOT NULL,
    etd TIMESTAMP(3) NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    berth TEXT,
    cargo TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("portId") REFERENCES ports(id),
    FOREIGN KEY ("vesselId") REFERENCES vessels(id)
);

-- Distance bands table
CREATE TABLE IF NOT EXISTS distance_bands (
    id TEXT PRIMARY KEY,
    "minKm" DOUBLE PRECISION NOT NULL,
    "maxKm" DOUBLE PRECISION,
    label TEXT NOT NULL
);

-- Pricing rates table
CREATE TABLE IF NOT EXISTS pricing_rates (
    id TEXT PRIMARY KEY,
    "vehicleClassId" TEXT NOT NULL,
    "distanceBandId" TEXT NOT NULL,
    "baseFare" DOUBLE PRECISION NOT NULL,
    FOREIGN KEY ("vehicleClassId") REFERENCES vehicle_classes(id),
    FOREIGN KEY ("distanceBandId") REFERENCES distance_bands(id),
    UNIQUE ("vehicleClassId", "distanceBandId")
);

-- Extra services table
CREATE TABLE IF NOT EXISTS extra_services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    "priceType" TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    unit TEXT,
    icon TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings("userId");
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings("driverId");
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donation_items("donorId");
CREATE INDEX IF NOT EXISTS idx_donations_status ON donation_items(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages("senderId", "receiverId");
