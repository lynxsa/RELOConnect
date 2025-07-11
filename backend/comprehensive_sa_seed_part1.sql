-- Comprehensive South African Realistic Data Seed
-- RELOConnect Production-Ready Database

-- Clear terminal issues and start fresh
\set AUTOCOMMIT off
BEGIN;

-- ===== USERS =====
-- Fleet Owners
INSERT INTO users (id, email, phone, "firstName", "lastName", password, role, "isVerified", "createdAt", "updatedAt") VALUES
('fleet_owner_1', 'sibusiso@mthembufreight.co.za', '+27824567890', 'Sibusiso', 'Mthembu', '$2b$10$hashedpassword', 'FLEET_OWNER', true, NOW(), NOW()),
('fleet_owner_2', 'thabo@mapolatransport.co.za', '+27836541234', 'Thabo', 'Mapola', '$2b$10$hashedpassword', 'FLEET_OWNER', true, NOW(), NOW()),
('fleet_owner_3', 'nomsa@joburgtruck.co.za', '+27845678901', 'Nomsa', 'Khumalo', '$2b$10$hashedpassword', 'FLEET_OWNER', true, NOW(), NOW()),
('fleet_owner_4', 'pieter@capelogistics.co.za', '+27217894561', 'Pieter', 'van der Merwe', '$2b$10$hashedpassword', 'FLEET_OWNER', true, NOW(), NOW()),
('fleet_owner_5', 'fatima@durbanmovers.co.za', '+27312345678', 'Fatima', 'Patel', '$2b$10$hashedpassword', 'FLEET_OWNER', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Drivers
INSERT INTO users (id, email, phone, "firstName", "lastName", password, role, "isVerified", "createdAt", "updatedAt") VALUES
('driver_1', 'lerato.dlamini@drivers.co.za', '+27761234567', 'Lerato', 'Dlamini', '$2b$10$hashedpassword', 'DRIVER', true, NOW(), NOW()),
('driver_2', 'johannes.molefe@drivers.co.za', '+27787654321', 'Johannes', 'Molefe', '$2b$10$hashedpassword', 'DRIVER', true, NOW(), NOW()),
('driver_3', 'sarah.adams@drivers.co.za', '+27798765432', 'Sarah', 'Adams', '$2b$10$hashedpassword', 'DRIVER', true, NOW(), NOW()),
('driver_4', 'mandla.ngcobo@drivers.co.za', '+27826547891', 'Mandla', 'Ngcobo', '$2b$10$hashedpassword', 'DRIVER', true, NOW(), NOW()),
('driver_5', 'ahmed.hassan@drivers.co.za', '+27834567123', 'Ahmed', 'Hassan', '$2b$10$hashedpassword', 'DRIVER', true, NOW(), NOW()),
('driver_6', 'susan.botha@drivers.co.za', '+27768901234', 'Susan', 'Botha', '$2b$10$hashedpassword', 'DRIVER', true, NOW(), NOW()),
('driver_7', 'sipho.mtshali@drivers.co.za', '+27823456789', 'Sipho', 'Mtshali', '$2b$10$hashedpassword', 'DRIVER', true, NOW(), NOW()),
('driver_8', 'priya.reddy@drivers.co.za', '+27845612378', 'Priya', 'Reddy', '$2b$10$hashedpassword', 'DRIVER', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Regular Users (Customers)
INSERT INTO users (id, email, phone, "firstName", "lastName", password, role, "isVerified", "createdAt", "updatedAt") VALUES
('user_1', 'tebogo.mokoena@gmail.com', '+27725634891', 'Tebogo', 'Mokoena', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_2', 'nicole.williams@yahoo.com', '+27846789012', 'Nicole', 'Williams', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_3', 'kgothatso.mabena@outlook.com', '+27734512678', 'Kgothatso', 'Mabena', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_4', 'raj.patel@gmail.com', '+27823456781', 'Raj', 'Patel', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_5', 'zinhle.mthembu@icloud.com', '+27765432109', 'Zinhle', 'Mthembu', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_6', 'connor.oconnor@gmail.com', '+27812345679', 'Connor', 'O''Connor', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_7', 'thandiwe.sithole@yahoo.com', '+27798765431', 'Thandiwe', 'Sithole', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_8', 'bradley.smith@outlook.com', '+27834567892', 'Bradley', 'Smith', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_9', 'naledi.moloi@gmail.com', '+27756789123', 'Naledi', 'Moloi', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW()),
('user_10', 'david.johnson@yahoo.com', '+27867891234', 'David', 'Johnson', '$2b$10$hashedpassword', 'USER', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Admin Users
INSERT INTO users (id, email, phone, "firstName", "lastName", password, role, "isVerified", "createdAt", "updatedAt") VALUES
('admin_1', 'admin@reloconnect.co.za', '+27115551234', 'Mpho', 'Sebata', '$2b$10$hashedpassword', 'ADMIN', true, NOW(), NOW()),
('admin_2', 'support@reloconnect.co.za', '+27214445678', 'Lisa', 'Fourie', '$2b$10$hashedpassword', 'ADMIN', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ===== FLEET OWNERS =====
INSERT INTO fleet_owners (id, user_id, business_name, business_reg_number, phone_number, address, city, province, postal_code, verification_status, id_document, business_reg_doc, proof_of_ownership, profile_photo, trust_score, report_count, flagged_for_review, created_at, updated_at) VALUES
('fleet_1', 'fleet_owner_1', 'Mthembu Freight Logistics', '2023/123456/07', '+27824567890', '123 Freight Road, Germiston', 'Johannesburg', 'Gauteng', '1401', 'VERIFIED', 'https://reloconnect.s3.amazonaws.com/docs/sibusiso_id.pdf', 'https://reloconnect.s3.amazonaws.com/docs/mthembu_cipc.pdf', 'https://reloconnect.s3.amazonaws.com/docs/mthembu_ownership.pdf', 'https://reloconnect.s3.amazonaws.com/photos/sibusiso.jpg', 95.5, 0, false, NOW(), NOW()),
('fleet_2', 'fleet_owner_2', 'Mapola Transport Solutions', '2022/789012/07', '+27836541234', '456 Industrial Ave, Rosslyn', 'Pretoria', 'Gauteng', '0182', 'VERIFIED', 'https://reloconnect.s3.amazonaws.com/docs/thabo_id.pdf', 'https://reloconnect.s3.amazonaws.com/docs/mapola_cipc.pdf', 'https://reloconnect.s3.amazonaws.com/docs/mapola_ownership.pdf', 'https://reloconnect.s3.amazonaws.com/photos/thabo.jpg', 88.3, 1, false, NOW(), NOW()),
('fleet_3', 'fleet_owner_3', 'Joburg Truck Hire', '2021/345678/07', '+27845678901', '789 Main Reef Rd, Johannesburg', 'Johannesburg', 'Gauteng', '2001', 'VERIFIED', 'https://reloconnect.s3.amazonaws.com/docs/nomsa_id.pdf', 'https://reloconnect.s3.amazonaws.com/docs/joburg_cipc.pdf', 'https://reloconnect.s3.amazonaws.com/docs/joburg_ownership.pdf', 'https://reloconnect.s3.amazonaws.com/photos/nomsa.jpg', 92.1, 0, false, NOW(), NOW()),
('fleet_4', 'fleet_owner_4', 'Cape Town Logistics Co', '2020/901234/07', '+27217894561', '321 Victoria Rd, Goodwood', 'Cape Town', 'Western Cape', '7460', 'VERIFIED', 'https://reloconnect.s3.amazonaws.com/docs/pieter_id.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cape_cipc.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cape_ownership.pdf', 'https://reloconnect.s3.amazonaws.com/photos/pieter.jpg', 90.7, 0, false, NOW(), NOW()),
('fleet_5', 'fleet_owner_5', 'Durban Metro Movers', '2023/567890/07', '+27312345678', '654 Point Rd, Durban', 'Durban', 'KwaZulu-Natal', '4001', 'PENDING', 'https://reloconnect.s3.amazonaws.com/docs/fatima_id.pdf', 'https://reloconnect.s3.amazonaws.com/docs/durban_cipc.pdf', 'https://reloconnect.s3.amazonaws.com/docs/durban_ownership.pdf', 'https://reloconnect.s3.amazonaws.com/photos/fatima.jpg', 85.0, 0, false, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ===== TRUCKS =====
INSERT INTO trucks (id, fleet_owner_id, name, license_plate, vehicle_type, capacity, max_weight, year, make, model, color, registration_doc, insurance_doc, roadworthy_doc, permit_doc, verification_status, is_active, gps_enabled, last_known_lat, last_known_lng, last_seen, created_at, updated_at) VALUES
-- Mthembu Fleet
('truck_1', 'fleet_1', 'Isuzu FTR 850', 'CF 456 GP', 'LARGE_TRUCK', 45, 16000, 2022, 'Isuzu', 'FTR 850', 'White', 'https://reloconnect.s3.amazonaws.com/docs/cf456_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cf456_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cf456_roadworthy.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cf456_permit.pdf', 'VERIFIED', true, true, -26.2041, 28.0473, NOW(), NOW(), NOW()),
('truck_2', 'fleet_1', 'Mercedes Atego', 'BF 789 GP', 'MEDIUM_TRUCK', 25, 8000, 2021, 'Mercedes-Benz', 'Atego 1218', 'Blue', 'https://reloconnect.s3.amazonaws.com/docs/bf789_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/bf789_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/bf789_roadworthy.pdf', NULL, 'VERIFIED', true, true, -26.1951, 28.0312, NOW(), NOW(), NOW()),

-- Mapola Fleet
('truck_3', 'fleet_2', 'Volvo FH16', 'CY 123 GP', 'LARGE_TRUCK', 50, 20000, 2023, 'Volvo', 'FH16 750', 'Red', 'https://reloconnect.s3.amazonaws.com/docs/cy123_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cy123_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cy123_roadworthy.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cy123_permit.pdf', 'VERIFIED', true, true, -25.7479, 28.2293, NOW(), NOW(), NOW()),
('truck_4', 'fleet_2', 'Isuzu NPR', 'DY 456 GP', 'SMALL_TRUCK', 15, 3500, 2020, 'Isuzu', 'NPR 400', 'White', 'https://reloconnect.s3.amazonaws.com/docs/dy456_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/dy456_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/dy456_roadworthy.pdf', NULL, 'VERIFIED', true, false, -25.7615, 28.2792, NOW(), NOW(), NOW()),

-- Joburg Fleet
('truck_5', 'fleet_3', 'Scania R500', 'JB 789 GP', 'LARGE_TRUCK', 55, 22000, 2022, 'Scania', 'R 500', 'Green', 'https://reloconnect.s3.amazonaws.com/docs/jb789_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/jb789_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/jb789_roadworthy.pdf', 'https://reloconnect.s3.amazonaws.com/docs/jb789_permit.pdf', 'VERIFIED', true, true, -26.2023, 28.0436, NOW(), NOW(), NOW()),
('truck_6', 'fleet_3', 'Furniture Van', 'KB 321 GP', 'FURNITURE_VAN', 35, 10000, 2021, 'Isuzu', 'FRR 600', 'Yellow', 'https://reloconnect.s3.amazonaws.com/docs/kb321_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/kb321_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/kb321_roadworthy.pdf', NULL, 'VERIFIED', true, true, -26.1849, 28.0653, NOW(), NOW(), NOW()),

-- Cape Town Fleet
('truck_7', 'fleet_4', 'MAN TGX', 'CA 654 WC', 'LARGE_TRUCK', 48, 18000, 2023, 'MAN', 'TGX 26.480', 'Blue', 'https://reloconnect.s3.amazonaws.com/docs/ca654_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/ca654_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/ca654_roadworthy.pdf', 'https://reloconnect.s3.amazonaws.com/docs/ca654_permit.pdf', 'VERIFIED', true, true, -33.9249, 18.4241, NOW(), NOW(), NOW()),
('truck_8', 'fleet_4', 'Refrigerated Truck', 'CB 987 WC', 'REFRIGERATED', 30, 12000, 2022, 'Iveco', 'Daily 70C21', 'White', 'https://reloconnect.s3.amazonaws.com/docs/cb987_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cb987_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/cb987_roadworthy.pdf', NULL, 'VERIFIED', true, true, -33.8986, 18.4987, NOW(), NOW(), NOW()),

-- Durban Fleet
('truck_9', 'fleet_5', 'DAF XF', 'ND 159 NL', 'LARGE_TRUCK', 52, 19000, 2023, 'DAF', 'XF 530', 'Orange', 'https://reloconnect.s3.amazonaws.com/docs/nd159_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/nd159_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/nd159_roadworthy.pdf', 'https://reloconnect.s3.amazonaws.com/docs/nd159_permit.pdf', 'PENDING', true, true, -29.8587, 31.0218, NOW(), NOW(), NOW()),
('truck_10', 'fleet_5', 'Container Truck', 'NE 753 NL', 'CONTAINER', 40, 15000, 2021, 'Freightliner', 'Cascadia', 'Gray', 'https://reloconnect.s3.amazonaws.com/docs/ne753_reg.pdf', 'https://reloconnect.s3.amazonaws.com/docs/ne753_insurance.pdf', 'https://reloconnect.s3.amazonaws.com/docs/ne753_roadworthy.pdf', NULL, 'VERIFIED', true, false, -29.8734, 31.0456, NOW(), NOW(), NOW())
ON CONFLICT (license_plate) DO NOTHING;

COMMIT;
