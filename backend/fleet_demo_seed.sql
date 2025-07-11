-- Fleet & Safety Management Demo Data for RELOConnect
-- South African realistic sample data

-- Insert demo fleet owner user
INSERT INTO users (id, email, phone, "firstName", "lastName", password, role, "isVerified", "createdAt", "updatedAt") 
VALUES (
  'fleet_owner_demo_1',
  'sibusiso@mthembufreight.co.za',
  '+27824567890',
  'Sibusiso',
  'Mthembu',
  'hashed-password',
  'FLEET_OWNER',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert demo driver user
INSERT INTO users (id, email, phone, "firstName", "lastName", password, role, "isVerified", "createdAt", "updatedAt") 
VALUES (
  'driver_demo_1',
  'lerato.dlamini@drivers.co.za',
  '+27761234567',
  'Lerato',
  'Dlamini',
  'hashed-password',
  'DRIVER',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert fleet owner profile
INSERT INTO fleet_owners (
  id, "userId", "businessName", "businessRegNumber", "phoneNumber", 
  address, city, province, "postalCode", "verificationStatus", 
  "idDocument", "businessRegDoc", "proofOfOwnership", "profilePhoto",
  "trustScore", "reportCount", "flaggedForReview", "createdAt", "updatedAt"
) VALUES (
  'fleet_owner_profile_1',
  'fleet_owner_demo_1',
  'Mthembu Freight Logistics',
  '2023/123456/07',
  '+27824567890',
  '123 Freight Rd',
  'Johannesburg',
  'Gauteng',
  '2001',
  'VERIFIED',
  'https://example.com/docs/sibusiso_id.pdf',
  'https://example.com/docs/cipc.pdf',
  'https://example.com/docs/ownership.pdf',
  'https://example.com/photos/sibusiso.jpg',
  95,
  0,
  false,
  NOW(),
  NOW()
) ON CONFLICT ("userId") DO NOTHING;

-- Insert driver profile
INSERT INTO driver_profiles (
  id, "userId", "fleetOwnerId", "phoneNumber", address, city, province, "postalCode",
  "profilePhoto", "emergencyContact", "emergencyPhone", "licenseNumber", "licenseType",
  "pdpNumber", "licenseExpiry", "pdpExpiry", "licenseDoc", "pdpDoc", "idDocument",
  "verificationStatus", rating, "totalTrips", "completedTrips", "cancelledTrips",
  "isOnline", "isAvailable", "trustScore", "reportCount", "flaggedForReview",
  "backgroundCheckStatus", "createdAt", "updatedAt"
) VALUES (
  'driver_profile_1',
  'driver_demo_1',
  'fleet_owner_profile_1',
  '+27761234567',
  '456 Driver St',
  'Pretoria',
  'Gauteng',
  '0002',
  'https://example.com/photos/lerato.jpg',
  'Nomsa Dlamini',
  '+27769876543',
  '548321',
  'CODE_14',
  '548321',
  '2027-12-31',
  '2026-06-30',
  'https://example.com/docs/lerato_license.pdf',
  'https://example.com/docs/lerato_pdp.pdf',
  'https://example.com/docs/lerato_id.pdf',
  'VERIFIED',
  4.9,
  120,
  118,
  2,
  false,
  true,
  90,
  0,
  false,
  'VERIFIED',
  NOW(),
  NOW()
) ON CONFLICT ("userId") DO NOTHING;

-- Insert truck
INSERT INTO trucks (
  id, "fleetOwnerId", name, "licensePlate", "vehicleType", capacity, "maxWeight",
  year, make, model, color, "registrationDoc", "insuranceDoc", "roadworthyDoc",
  "permitDoc", "verificationStatus", "isActive", "gpsEnabled", "lastKnownLat",
  "lastKnownLng", "lastSeen", "createdAt", "updatedAt"
) VALUES (
  'truck_demo_1',
  'fleet_owner_profile_1',
  'Isuzu FTR 850',
  'CF 456 WP',
  'LARGE_TRUCK',
  45,
  16000,
  2022,
  'Isuzu',
  'FTR 850',
  'White',
  'https://example.com/docs/isuzu_reg.pdf',
  'https://example.com/docs/isuzu_insurance.pdf',
  'https://example.com/docs/isuzu_roadworthy.pdf',
  'https://example.com/docs/isuzu_permit.pdf',
  'VERIFIED',
  true,
  true,
  -26.2041,
  28.0473,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT ("licensePlate") DO NOTHING;

-- Assign driver to truck
INSERT INTO truck_assignments (
  id, "truckId", "driverId", "assignedAt", "isActive", notes
) VALUES (
  'assignment_1',
  'truck_demo_1',
  'driver_profile_1',
  NOW(),
  true,
  'Primary driver for Gauteng routes'
) ON CONFLICT (id) DO NOTHING;

-- Insert document verifications
INSERT INTO document_verifications (
  id, "documentType", "documentUrl", "entityType", "entityId",
  status, "uploadedAt", "verifiedAt", "createdAt", "updatedAt"
) VALUES 
(
  'doc_ver_1',
  'BUSINESS_REGISTRATION',
  'https://example.com/docs/cipc.pdf',
  'FLEET_OWNER',
  'fleet_owner_profile_1',
  'VERIFIED',
  NOW(),
  NOW(),
  NOW(),
  NOW()
),
(
  'doc_ver_2',
  'DRIVERS_LICENSE',
  'https://example.com/docs/lerato_license.pdf',
  'DRIVER',
  'driver_profile_1',
  'VERIFIED',
  NOW(),
  NOW(),
  NOW(),
  NOW()
),
(
  'doc_ver_3',
  'VEHICLE_REGISTRATION',
  'https://example.com/docs/isuzu_reg.pdf',
  'TRUCK',
  'truck_demo_1',
  'VERIFIED',
  NOW(),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 'Fleet Owners' as table_name, COUNT(*) as count FROM fleet_owners
UNION ALL
SELECT 'Driver Profiles' as table_name, COUNT(*) as count FROM driver_profiles
UNION ALL
SELECT 'Trucks' as table_name, COUNT(*) as count FROM trucks
UNION ALL
SELECT 'Truck Assignments' as table_name, COUNT(*) as count FROM truck_assignments
UNION ALL
SELECT 'Document Verifications' as table_name, COUNT(*) as count FROM document_verifications;
