-- Fleet & Safety Management Demo Data for RELOConnect (Corrected)
-- Using snake_case column names as PostgreSQL converts them

-- Insert demo fleet owner user
INSERT INTO users (id, email, phone, first_name, last_name, password, role, is_verified, created_at, updated_at) 
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
INSERT INTO users (id, email, phone, first_name, last_name, password, role, is_verified, created_at, updated_at) 
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
  id, user_id, business_name, business_reg_number, phone_number, 
  address, city, province, postal_code, verification_status, 
  id_document, business_reg_doc, proof_of_ownership, profile_photo,
  trust_score, report_count, flagged_for_review, created_at, updated_at
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
) ON CONFLICT (user_id) DO NOTHING;

-- Insert driver profile
INSERT INTO driver_profiles (
  id, user_id, fleet_owner_id, phone_number, address, city, province, postal_code,
  profile_photo, emergency_contact, emergency_phone, license_number, license_type,
  pdp_number, license_expiry, pdp_expiry, license_doc, pdp_doc, id_document,
  verification_status, rating, total_trips, completed_trips, cancelled_trips,
  is_online, is_available, trust_score, report_count, flagged_for_review,
  background_check_status, created_at, updated_at
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
) ON CONFLICT (user_id) DO NOTHING;

-- Insert truck
INSERT INTO trucks (
  id, fleet_owner_id, name, license_plate, vehicle_type, capacity, max_weight,
  year, make, model, color, registration_doc, insurance_doc, roadworthy_doc,
  permit_doc, verification_status, is_active, gps_enabled, last_known_lat,
  last_known_lng, last_seen, created_at, updated_at
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
) ON CONFLICT (license_plate) DO NOTHING;

-- Assign driver to truck
INSERT INTO truck_assignments (
  id, truck_id, driver_id, assigned_at, is_active, notes
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
  id, document_type, document_url, entity_type, entity_id,
  status, uploaded_at, verified_at, created_at, updated_at
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
