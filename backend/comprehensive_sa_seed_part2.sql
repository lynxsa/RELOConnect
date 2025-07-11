-- Comprehensive South African Realistic Data Seed - Part 2
-- Driver Profiles, Assignments, Bookings, and More

\set AUTOCOMMIT off
BEGIN;

-- ===== DRIVER PROFILES =====
INSERT INTO driver_profiles (id, user_id, fleet_owner_id, phone_number, address, city, province, postal_code, profile_photo, emergency_contact, emergency_phone, license_number, license_type, pdp_number, license_expiry, pdp_expiry, license_doc, pdp_doc, id_document, verification_status, rating, total_trips, completed_trips, cancelled_trips, is_online, is_available, trust_score, report_count, flagged_for_review, background_check_status, created_at, updated_at) VALUES
('driver_profile_1', 'driver_1', 'fleet_1', '+27761234567', '456 Driver St, Soweto', 'Johannesburg', 'Gauteng', '1818', 'https://reloconnect.s3.amazonaws.com/photos/lerato.jpg', 'Nomsa Dlamini', '+27769876543', '548321GP', 'CODE_14', 'PDP548321', '2027-12-31', '2026-06-30', 'https://reloconnect.s3.amazonaws.com/docs/lerato_license.pdf', 'https://reloconnect.s3.amazonaws.com/docs/lerato_pdp.pdf', 'https://reloconnect.s3.amazonaws.com/docs/lerato_id.pdf', 'VERIFIED', 4.9, 120, 118, 2, false, true, 92.5, 0, false, 'VERIFIED', NOW(), NOW()),

('driver_profile_2', 'driver_2', 'fleet_1', '+27787654321', '789 Katlehong Ext 5', 'Ekurhuleni', 'Gauteng', '1431', 'https://reloconnect.s3.amazonaws.com/photos/johannes.jpg', 'Maria Molefe', '+27823456789', '612789GP', 'CODE_14', 'PDP612789', '2026-08-15', '2025-12-31', 'https://reloconnect.s3.amazonaws.com/docs/johannes_license.pdf', 'https://reloconnect.s3.amazonaws.com/docs/johannes_pdp.pdf', 'https://reloconnect.s3.amazonaws.com/docs/johannes_id.pdf', 'VERIFIED', 4.7, 95, 93, 2, true, true, 89.2, 0, false, 'VERIFIED', NOW(), NOW()),

('driver_profile_3', 'driver_3', 'fleet_2', '+27798765432', '321 Centurion Central', 'Centurion', 'Gauteng', '0157', 'https://reloconnect.s3.amazonaws.com/photos/sarah.jpg', 'John Adams', '+27845123456', '789456GP', 'CODE_10', 'PDP789456', '2028-03-20', '2027-01-15', 'https://reloconnect.s3.amazonaws.com/docs/sarah_license.pdf', 'https://reloconnect.s3.amazonaws.com/docs/sarah_pdp.pdf', 'https://reloconnect.s3.amazonaws.com/docs/sarah_id.pdf', 'VERIFIED', 4.8, 76, 75, 1, true, true, 91.7, 0, false, 'VERIFIED', NOW(), NOW()),

('driver_profile_4', 'driver_4', 'fleet_2', '+27826547891', '654 KwaMashu Section J', 'Durban', 'KwaZulu-Natal', '4360', 'https://reloconnect.s3.amazonaws.com/photos/mandla.jpg', 'Thandi Ngcobo', '+27734567890', '456123NL', 'CODE_14', 'PDP456123', '2027-07-10', '2026-03-25', 'https://reloconnect.s3.amazonaws.com/docs/mandla_license.pdf', 'https://reloconnect.s3.amazonaws.com/docs/mandla_pdp.pdf', 'https://reloconnect.s3.amazonaws.com/docs/mandla_id.pdf', 'VERIFIED', 4.6, 82, 80, 2, false, true, 87.3, 1, false, 'VERIFIED', NOW(), NOW()),

('driver_profile_5', 'driver_5', 'fleet_3', '+27834567123', '987 Lenasia South', 'Johannesburg', 'Gauteng', '1827', 'https://reloconnect.s3.amazonaws.com/photos/ahmed.jpg', 'Fatima Hassan', '+27867890123', '234567GP', 'CODE_14', 'PDP234567', '2029-01-05', '2027-09-30', 'https://reloconnect.s3.amazonaws.com/docs/ahmed_license.pdf', 'https://reloconnect.s3.amazonaws.com/docs/ahmed_pdp.pdf', 'https://reloconnect.s3.amazonaws.com/docs/ahmed_id.pdf', 'VERIFIED', 4.9, 145, 144, 1, true, true, 94.8, 0, false, 'VERIFIED', NOW(), NOW()),

('driver_profile_6', 'driver_6', 'fleet_4', '+27768901234', '123 Bellville South', 'Cape Town', 'Western Cape', '7530', 'https://reloconnect.s3.amazonaws.com/photos/susan.jpg', 'Pieter Botha', '+27821234567', '678901WC', 'CODE_10', 'PDP678901', '2026-11-12', '2025-08-20', 'https://reloconnect.s3.amazonaws.com/docs/susan_license.pdf', 'https://reloconnect.s3.amazonaws.com/docs/susan_pdp.pdf', 'https://reloconnect.s3.amazonaws.com/docs/susan_id.pdf', 'VERIFIED', 4.5, 67, 65, 2, false, true, 85.1, 0, false, 'VERIFIED', NOW(), NOW()),

('driver_profile_7', 'driver_7', 'fleet_3', '+27823456789', '456 Alexandra Township', 'Johannesburg', 'Gauteng', '2090', 'https://reloconnect.s3.amazonaws.com/photos/sipho.jpg', 'Nomsa Mtshali', '+27789012345', '345678GP', 'CODE_14', 'PDP345678', '2028-05-18', '2027-02-14', 'https://reloconnect.s3.amazonaws.com/docs/sipho_license.pdf', 'https://reloconnect.s3.amazonaws.com/docs/sipho_pdp.pdf', 'https://reloconnect.s3.amazonaws.com/docs/sipho_id.pdf', 'VERIFIED', 4.4, 58, 56, 2, true, true, 83.6, 1, false, 'VERIFIED', NOW(), NOW()),

('driver_profile_8', 'driver_8', 'fleet_5', '+27845612378', '789 Chatsworth', 'Durban', 'KwaZulu-Natal', '4092', 'https://reloconnect.s3.amazonaws.com/photos/priya.jpg', 'Raj Reddy', '+27856123789', '567890NL', 'CODE_10', 'PDP567890', '2027-09-22', '2026-04-10', 'https://reloconnect.s3.amazonaws.com/docs/priya_license.pdf', 'https://reloconnect.s3.amazonaws.com/docs/priya_pdp.pdf', 'https://reloconnect.s3.amazonaws.com/docs/priya_id.pdf', 'PENDING', 4.2, 34, 33, 1, false, true, 78.9, 0, false, 'PENDING', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ===== TRUCK ASSIGNMENTS =====
INSERT INTO truck_assignments (id, truck_id, driver_id, assigned_at, is_active, notes) VALUES
('assignment_1', 'truck_1', 'driver_profile_1', NOW() - INTERVAL '30 days', true, 'Primary driver for Gauteng routes - excellent performance'),
('assignment_2', 'truck_2', 'driver_profile_2', NOW() - INTERVAL '25 days', true, 'Backup driver for metro deliveries'),
('assignment_3', 'truck_3', 'driver_profile_3', NOW() - INTERVAL '20 days', true, 'Long-haul specialist - inter-provincial routes'),
('assignment_4', 'truck_4', 'driver_profile_4', NOW() - INTERVAL '15 days', false, 'Previously assigned - moved to different vehicle'),
('assignment_5', 'truck_5', 'driver_profile_5', NOW() - INTERVAL '35 days', true, 'Heavy cargo specialist'),
('assignment_6', 'truck_6', 'driver_profile_7', NOW() - INTERVAL '18 days', true, 'Furniture moving expert'),
('assignment_7', 'truck_7', 'driver_profile_6', NOW() - INTERVAL '12 days', true, 'Western Cape regional driver'),
('assignment_8', 'truck_8', 'driver_profile_6', NOW() - INTERVAL '5 days', false, 'Temporary assignment for refrigerated goods'),
('assignment_9', 'truck_9', 'driver_profile_8', NOW() - INTERVAL '8 days', true, 'KZN coastal routes specialist'),
('assignment_10', 'truck_4', 'driver_profile_4', NOW() - INTERVAL '3 days', true, 'Reassigned after route optimization')
ON CONFLICT (id) DO NOTHING;

-- ===== NEWS ARTICLES =====
INSERT INTO news_articles (id, title, description, content, image_url, source, author, published_at, category, tags, created_at, updated_at) VALUES
('news_1', 'South African Logistics Industry Shows Strong Growth in Q1 2025', 'The logistics sector continues to expand with new opportunities in e-commerce and inter-provincial freight.', 'The South African logistics industry has demonstrated remarkable resilience and growth in the first quarter of 2025, with freight volumes increasing by 12% compared to the same period last year. Key drivers include the boom in e-commerce deliveries, increased agricultural exports, and improved infrastructure investments. The sector has benefited from the government''s infrastructure development program, particularly the upgrading of key freight corridors between Johannesburg, Cape Town, and Durban. Industry experts predict continued growth throughout 2025, with particular opportunities in last-mile delivery services and cold chain logistics.', 'https://reloconnect.s3.amazonaws.com/news/logistics-growth-2025.jpg', 'Freight & Trading Weekly', 'Sipho Mthembu', '2025-01-15 08:30:00', 'LOGISTICS', ARRAY['growth', 'south africa', 'freight', 'e-commerce'], NOW(), NOW()),

('news_2', 'New Truck Driver Regulations: PDP Requirements Updated for 2025', 'Transport authorities announce updated Professional Driving Permit requirements for commercial drivers.', 'The Department of Transport has announced significant updates to Professional Driving Permit (PDP) requirements effective from April 2025. All commercial drivers operating vehicles above 3.5 tons must now complete additional safety training modules and undergo annual medical examinations. The new regulations also mandate GPS tracking for all commercial vehicles and introduce stricter penalties for traffic violations. Fleet owners have welcomed the changes, noting that enhanced safety standards will improve industry reputation and reduce insurance costs. Training providers across major centers including Johannesburg, Cape Town, and Durban have already begun offering updated PDP courses to meet the new requirements.', 'https://reloconnect.s3.amazonaws.com/news/pdp-requirements-2025.jpg', 'Transport Today SA', 'Dr. Nomsa Khumalo', '2025-02-03 10:15:00', 'INDUSTRY', ARRAY['regulations', 'pdp', 'safety', 'drivers'], NOW(), NOW()),

('news_3', 'Technology Adoption in SA Freight: IoT and AI Transforming Logistics', 'South African logistics companies increasingly adopting smart technologies for fleet management and route optimization.', 'South African logistics companies are rapidly embracing Internet of Things (IoT) sensors, artificial intelligence, and machine learning to optimize operations and reduce costs. Leading fleet operators report fuel savings of up to 15% through AI-powered route optimization, while IoT sensors help predict vehicle maintenance needs and prevent costly breakdowns. The technology adoption is particularly strong in Gauteng and Western Cape provinces, where tech-savvy fleet owners are leveraging real-time tracking, predictive analytics, and automated dispatch systems. Industry analysts expect technology investment to triple by 2026 as companies seek competitive advantages in an increasingly demanding market.', 'https://reloconnect.s3.amazonaws.com/news/tech-adoption-logistics.jpg', 'TechLogistics SA', 'Ahmed Patel', '2025-02-20 14:45:00', 'TECHNOLOGY', ARRAY['iot', 'ai', 'fleet management', 'innovation'], NOW(), NOW()),

('news_4', 'Cross-Border Freight Opportunities Expand with New SADC Agreements', 'Recent trade agreements open new corridors for South African logistics companies across Southern Africa.', 'New Southern African Development Community (SADC) trade facilitation agreements are creating unprecedented opportunities for South African logistics companies to expand operations across the region. The agreements simplify customs procedures, standardize documentation, and establish common truck permits for cross-border operations. Major routes to Botswana, Namibia, and Mozambique are seeing increased traffic as South African freight companies capitalize on growing trade volumes. Industry leaders project a 25% increase in cross-border freight operations by end-2025, with particular growth in agricultural exports and mining equipment transport.', 'https://reloconnect.s3.amazonaws.com/news/sadc-cross-border.jpg', 'Southern Africa Freight Journal', 'Thabo Mapola', '2025-03-05 11:20:00', 'INDUSTRY', ARRAY['cross-border', 'sadc', 'trade', 'expansion'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== PORTS =====
INSERT INTO ports (id, name, code, country, latitude, longitude, timezone, facilities, created_at, updated_at) VALUES
('port_1', 'Port of Durban', 'ZADUR', 'South Africa', -29.8674, 31.0284, 'Africa/Johannesburg', ARRAY['Container Terminal', 'Bulk Cargo', 'Vehicle Terminal', 'Fuel Terminal'], NOW(), NOW()),
('port_2', 'Port of Cape Town', 'ZACPT', 'South Africa', -33.9081, 18.4213, 'Africa/Johannesburg', ARRAY['Container Terminal', 'Fruit Terminal', 'Grain Terminal', 'Cruise Terminal'], NOW(), NOW()),
('port_3', 'Port Elizabeth (Gqeberha)', 'ZAPEZ', 'South Africa', -33.9577, 25.6104, 'Africa/Johannesburg', ARRAY['Container Terminal', 'Vehicle Terminal', 'General Cargo'], NOW(), NOW()),
('port_4', 'Port of Richards Bay', 'ZARIB', 'South Africa', -28.7830, 32.0377, 'Africa/Johannesburg', ARRAY['Coal Terminal', 'Mineral Terminal', 'Woodchip Terminal'], NOW(), NOW()),
('port_5', 'Port of East London', 'ZAELS', 'South Africa', -33.0145, 27.8867, 'Africa/Johannesburg', ARRAY['Container Terminal', 'Vehicle Terminal', 'General Cargo'], NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ===== VESSELS =====
INSERT INTO vessels (id, name, imo, type, flag, length, width, draft, created_at, updated_at) VALUES
('vessel_1', 'MSC Samba', '9876543210', 'Container Ship', 'Panama', 366.0, 51.2, 16.0, NOW(), NOW()),
('vessel_2', 'Safmarine Nokwanda', '9765432109', 'Container Ship', 'South Africa', 294.0, 32.2, 13.5, NOW(), NOW()),
('vessel_3', 'Cape Verde', '9654321098', 'Bulk Carrier', 'South Africa', 225.0, 32.3, 18.2, NOW(), NOW()),
('vessel_4', 'African Spirit', '9543210987', 'RoRo Cargo', 'South Africa', 180.0, 25.0, 6.8, NOW(), NOW()),
('vessel_5', 'Durban Express', '9432109876', 'Container Ship', 'Singapore', 347.0, 42.8, 14.5, NOW(), NOW())
ON CONFLICT (imo) DO NOTHING;

COMMIT;
