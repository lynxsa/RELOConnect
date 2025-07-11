-- Comprehensive South African Realistic Data Seed - Part 3
-- Bookings, Donations, Safety Reports, and Document Verifications

\set AUTOCOMMIT off
BEGIN;

-- ===== BOOKINGS =====
INSERT INTO bookings (id, pickup_latitude, pickup_longitude, pickup_address, pickup_city, pickup_state, pickup_postal_code, pickup_country, dropoff_latitude, dropoff_longitude, dropoff_address, dropoff_city, dropoff_state, dropoff_postal_code, dropoff_country, scheduled_date_time, estimated_distance, estimated_duration, package_description, package_weight, package_volume, is_fragile, is_valuable, loading_service, stairs_count, packing_service, cleaning_service, express_service, insurance_service, security_service, terrain_type, province_from, province_to, fuel_surcharge_rate, total_price, adjusted_price, payment_method, status, user_id, driver_id, vehicle_id, truck_id, new_driver_id, created_at, updated_at) VALUES

-- Recent completed bookings
('booking_1', -26.2041, 28.0473, '123 Jan Smuts Ave, Rosebank', 'Johannesburg', 'Gauteng', '2196', 'South Africa', -26.1951, 28.0312, '456 Sandton Drive, Sandton', 'Johannesburg', 'Gauteng', '2146', 'South Africa', NOW() - INTERVAL '5 days', 15.2, 35, 'Office furniture and equipment relocation', 850.5, 12.3, false, true, true, 0, true, false, false, true, false, 'urban', 'Gauteng', 'Gauteng', 0.025, 2850.00, 2921.25, 'CARD', 'COMPLETED', 'user_1', 'driver_1', 'vehicle_1', 'truck_1', 'driver_profile_1', NOW() - INTERVAL '5 days', NOW()),

('booking_2', -33.9249, 18.4241, '789 Voortrekker Rd, Goodwood', 'Cape Town', 'Western Cape', '7460', 'South Africa', -33.8986, 18.4987, '321 Main Rd, Sea Point', 'Cape Town', 'Western Cape', '8005', 'South Africa', NOW() - INTERVAL '3 days', 22.8, 45, 'Household goods - 3 bedroom apartment', 1250.0, 18.7, true, false, true, 15, false, true, false, false, false, 'urban', 'Western Cape', 'Western Cape', 0.025, 3750.00, 3843.75, 'YOCO', 'COMPLETED', 'user_2', 'driver_6', 'vehicle_2', 'truck_7', 'driver_profile_6', NOW() - INTERVAL '3 days', NOW()),

-- Active bookings
('booking_3', -29.8587, 31.0218, '654 Smith Street, Durban CBD', 'Durban', 'KwaZulu-Natal', '4001', 'South Africa', -29.7834, 30.8381, '987 Main Rd, Pietermaritzburg', 'Pietermaritzburg', 'KwaZulu-Natal', '3201', 'South Africa', NOW() + INTERVAL '2 days', 85.6, 120, 'Restaurant equipment and supplies', 980.0, 8.9, true, true, true, 0, false, false, true, true, true, 'urban', 'KwaZulu-Natal', 'KwaZulu-Natal', 0.025, 4250.00, 4356.25, 'CARD', 'CONFIRMED', 'user_3', NULL, 'vehicle_3', 'truck_9', 'driver_profile_8', NOW(), NOW()),

('booking_4', -26.1849, 28.0653, '147 Commissioner St, Johannesburg CBD', 'Johannesburg', 'Gauteng', '2001', 'South Africa', -25.7479, 28.2293, '258 Church St, Pretoria CBD', 'Pretoria', 'Gauteng', '0002', 'South Africa', NOW() + INTERVAL '1 day', 58.3, 75, 'IT equipment and servers', 650.0, 5.2, true, true, false, 0, true, false, true, true, true, 'urban', 'Gauteng', 'Gauteng', 0.025, 3200.00, 3280.00, 'APPLE_PAY', 'IN_PROGRESS', 'user_4', 'driver_2', 'vehicle_2', 'truck_2', 'driver_profile_2', NOW(), NOW()),

-- Pending bookings
('booking_5', -34.0522, 23.0449, '369 Baron van Reede St, Oudtshoorn', 'Oudtshoorn', 'Western Cape', '6620', 'South Africa', -33.9081, 18.4213, '741 Dock Rd, V&A Waterfront', 'Cape Town', 'Western Cape', '8001', 'South Africa', NOW() + INTERVAL '5 days', 420.5, 360, 'Ostrich products and crafts', 420.0, 15.8, false, false, true, 0, true, false, false, false, false, 'rural', 'Western Cape', 'Western Cape', 0.035, 6800.00, 7038.00, 'EFT', 'PENDING', 'user_5', NULL, 'vehicle_4', NULL, NULL, NOW(), NOW()),

('booking_6', -26.2041, 28.0473, '852 Oxford Rd, Dunkeld', 'Johannesburg', 'Gauteng', '2196', 'South Africa', -29.8587, 31.0218, '159 Anton Lembede St, Durban', 'Durban', 'KwaZulu-Natal', '4001', 'South Africa', NOW() + INTERVAL '7 days', 565.2, 420, 'Medical equipment and pharmaceuticals', 1850.0, 22.4, true, true, true, 0, true, true, true, true, true, 'inter-provincial', 'Gauteng', 'KwaZulu-Natal', 0.035, 12500.00, 12937.50, 'OZOW', 'PENDING', 'user_6', NULL, 'vehicle_5', 'truck_5', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== DONATION ITEMS =====
INSERT INTO donation_items (id, title, description, category, condition, images, latitude, longitude, address, city, state, postal_code, country, donor_id, requester_id, status, created_at, updated_at) VALUES
('donation_1', 'Complete IKEA Bedroom Set', 'King size bed, two nightstands, dresser with mirror. Excellent condition, moving house.', 'FURNITURE', 'LIKE_NEW', ARRAY['https://reloconnect.s3.amazonaws.com/donations/bedroom1.jpg', 'https://reloconnect.s3.amazonaws.com/donations/bedroom2.jpg'], -26.1951, 28.0312, '789 Rivonia Rd, Sandton', 'Johannesburg', 'Gauteng', '2146', 'South Africa', 'user_1', 'user_7', 'REQUESTED', NOW() - INTERVAL '2 days', NOW()),

('donation_2', 'Samsung 55" Smart TV with Stand', 'Working perfectly, upgrading to larger size. Includes original remote and cables.', 'ELECTRONICS', 'GOOD', ARRAY['https://reloconnect.s3.amazonaws.com/donations/tv1.jpg'], -33.9249, 18.4241, '456 Main Rd, Observatory', 'Cape Town', 'Western Cape', '7925', 'South Africa', 'user_2', NULL, 'AVAILABLE', NOW() - INTERVAL '1 day', NOW()),

('donation_3', 'Children''s Books Collection (50+ books)', 'Mix of educational and storybooks for ages 5-12. Great condition, children outgrew them.', 'BOOKS', 'GOOD', ARRAY['https://reloconnect.s3.amazonaws.com/donations/books1.jpg', 'https://reloconnect.s3.amazonaws.com/donations/books2.jpg'], -29.8587, 31.0218, '321 Florida Rd, Morningside', 'Durban', 'KwaZulu-Natal', '4001', 'South Africa', 'user_3', 'user_8', 'COLLECTED', NOW() - INTERVAL '5 days', NOW()),

('donation_4', 'Office Desk and Chair Set', 'Solid wood desk with matching ergonomic chair. Minor scratches but very functional.', 'FURNITURE', 'FAIR', ARRAY['https://reloconnect.s3.amazonaws.com/donations/office1.jpg'], -25.7479, 28.2293, '147 Pretorius St, Pretoria CBD', 'Pretoria', 'Gauteng', '0002', 'South Africa', 'user_4', NULL, 'AVAILABLE', NOW() - INTERVAL '3 days', NOW()),

('donation_5', 'Microwave and Small Kitchen Appliances', 'Samsung microwave, kettle, toaster, and blender. All working, moving overseas.', 'APPLIANCES', 'GOOD', ARRAY['https://reloconnect.s3.amazonaws.com/donations/kitchen1.jpg', 'https://reloconnect.s3.amazonaws.com/donations/kitchen2.jpg'], -26.2041, 28.0473, '258 Jan Smuts Ave, Dunkeld', 'Johannesburg', 'Gauteng', '2196', 'South Africa', 'user_5', 'user_9', 'REQUESTED', NOW() - INTERVAL '1 day', NOW()),

('donation_6', 'Winter Clothing Bundle (Adult Medium)', 'Jackets, sweaters, and warm clothing. Clean and in good condition.', 'CLOTHING', 'GOOD', ARRAY['https://reloconnect.s3.amazonaws.com/donations/clothing1.jpg'], -33.8986, 18.4987, '963 Kloof St, Gardens', 'Cape Town', 'Western Cape', '8001', 'South Africa', 'user_6', NULL, 'AVAILABLE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== SAFETY REPORTS =====
INSERT INTO safety_reports (id, reporter_id, report_type, category, description, severity, status, reported_driver_id, reported_fleet_owner_id, reported_truck_id, reported_booking_id, evidence_urls, witness_contacts, reviewed_by, reviewed_at, review_notes, action_taken, created_at, updated_at) VALUES
('safety_1', 'user_1', 'UNPROFESSIONAL_BEHAVIOR', 'DRIVER_BEHAVIOR', 'Driver was extremely rude and aggressive during delivery. Used inappropriate language and refused to follow delivery instructions.', 'MEDIUM', 'RESOLVED', 'driver_profile_7', NULL, NULL, NULL, ARRAY['https://reloconnect.s3.amazonaws.com/reports/evidence1.jpg'], ARRAY['+27823456789'], 'admin_1', NOW() - INTERVAL '2 days', 'Spoke with driver and fleet owner. Driver received additional customer service training.', 'Warning issued, mandatory training completed', NOW() - INTERVAL '5 days', NOW()),

('safety_2', 'user_3', 'VEHICLE_MISMATCH', 'OPERATIONAL_ISSUE', 'Truck that arrived was different from what was booked. Smaller vehicle caused delays and additional trips.', 'LOW', 'RESOLVED', NULL, 'fleet_2', 'truck_4', 'booking_3', ARRAY[], ARRAY[], 'admin_1', NOW() - INTERVAL '1 day', 'Fleet owner confirmed mix-up in dispatch. Customer compensated for inconvenience.', 'Partial refund issued, dispatch procedures reviewed', NOW() - INTERVAL '3 days', NOW()),

('safety_3', 'user_2', 'DAMAGE_DISPUTE', 'CUSTOMER_SERVICE', 'Item damaged during transport but driver claimed it was pre-existing. No proper documentation of item condition before loading.', 'HIGH', 'INVESTIGATING', 'driver_profile_6', 'fleet_4', 'truck_7', 'booking_2', ARRAY['https://reloconnect.s3.amazonaws.com/reports/damage1.jpg', 'https://reloconnect.s3.amazonaws.com/reports/damage2.jpg'], ARRAY['+27821234567'], NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 day', NOW()),

('safety_4', 'driver_profile_2', 'FRAUD_ATTEMPT', 'PAYMENT_FRAUD', 'Customer attempted to pay with potentially fraudulent payment method. Card was declined multiple times with different details provided.', 'HIGH', 'ESCALATED', NULL, NULL, NULL, 'booking_4', ARRAY[], ARRAY[], 'admin_2', NOW(), 'Investigating payment provider flags. Customer account under review.', 'Payment verification in progress, booking on hold', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ===== DOCUMENT VERIFICATIONS =====
INSERT INTO document_verifications (id, document_type, document_url, entity_type, entity_id, status, uploaded_at, verified_at, verified_by, rejection_reason, extracted_data, created_at, updated_at) VALUES
-- Fleet Owner Documents
('doc_1', 'BUSINESS_REGISTRATION', 'https://reloconnect.s3.amazonaws.com/docs/mthembu_cipc.pdf', 'FLEET_OWNER', 'fleet_1', 'VERIFIED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', 'admin_1', NULL, '{"company_name": "Mthembu Freight Logistics", "registration_number": "2023/123456/07", "registration_date": "2023-03-15"}', NOW() - INTERVAL '15 days', NOW()),
('doc_2', 'ID_DOCUMENT', 'https://reloconnect.s3.amazonaws.com/docs/sibusiso_id.pdf', 'FLEET_OWNER', 'fleet_1', 'VERIFIED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', 'admin_1', NULL, '{"id_number": "7804125432089", "full_name": "Sibusiso Mthembu", "expiry_date": "2034-04-12"}', NOW() - INTERVAL '15 days', NOW()),
('doc_3', 'PROOF_OF_OWNERSHIP', 'https://reloconnect.s3.amazonaws.com/docs/mthembu_ownership.pdf', 'FLEET_OWNER', 'fleet_1', 'VERIFIED', NOW() - INTERVAL '14 days', NOW() - INTERVAL '9 days', 'admin_1', NULL, '{"vehicle_count": 2, "ownership_type": "direct"}', NOW() - INTERVAL '14 days', NOW()),

-- Driver Documents
('doc_4', 'DRIVERS_LICENSE', 'https://reloconnect.s3.amazonaws.com/docs/lerato_license.pdf', 'DRIVER', 'driver_profile_1', 'VERIFIED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days', 'admin_1', NULL, '{"license_number": "548321GP", "license_type": "CODE_14", "expiry_date": "2027-12-31"}', NOW() - INTERVAL '12 days', NOW()),
('doc_5', 'PDP_CERTIFICATE', 'https://reloconnect.s3.amazonaws.com/docs/lerato_pdp.pdf', 'DRIVER', 'driver_profile_1', 'VERIFIED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days', 'admin_1', NULL, '{"pdp_number": "PDP548321", "expiry_date": "2026-06-30"}', NOW() - INTERVAL '12 days', NOW()),
('doc_6', 'ID_DOCUMENT', 'https://reloconnect.s3.amazonaws.com/docs/lerato_id.pdf', 'DRIVER', 'driver_profile_1', 'VERIFIED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days', 'admin_1', NULL, '{"id_number": "9105085432087", "full_name": "Lerato Dlamini"}', NOW() - INTERVAL '12 days', NOW()),

-- Truck Documents
('doc_7', 'VEHICLE_REGISTRATION', 'https://reloconnect.s3.amazonaws.com/docs/cf456_reg.pdf', 'TRUCK', 'truck_1', 'VERIFIED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 days', 'admin_2', NULL, '{"license_plate": "CF 456 GP", "make": "Isuzu", "model": "FTR 850", "year": 2022}', NOW() - INTERVAL '10 days', NOW()),
('doc_8', 'INSURANCE_CERTIFICATE', 'https://reloconnect.s3.amazonaws.com/docs/cf456_insurance.pdf', 'TRUCK', 'truck_1', 'VERIFIED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 days', 'admin_2', NULL, '{"policy_number": "INS789456123", "expiry_date": "2025-12-31"}', NOW() - INTERVAL '10 days', NOW()),

-- Pending Documents
('doc_9', 'DRIVERS_LICENSE', 'https://reloconnect.s3.amazonaws.com/docs/priya_license.pdf', 'DRIVER', 'driver_profile_8', 'PENDING', NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days', NOW()),
('doc_10', 'VEHICLE_REGISTRATION', 'https://reloconnect.s3.amazonaws.com/docs/nd159_reg.pdf', 'TRUCK', 'truck_9', 'UNDER_REVIEW', NOW() - INTERVAL '3 days', NULL, NULL, NULL, '{"license_plate": "ND 159 NL", "verification_needed": "ownership_verification"}', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
