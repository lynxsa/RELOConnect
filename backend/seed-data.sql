-- South African Vehicle Classes
INSERT INTO vehicle_classes (id, name, capacity, "maxWeight", icon, description, "order") VALUES
('mini-van', 'Mini-Van', '<1 ton', 1000, '🚐', 'Perfect for small moves and deliveries', 1),
('1-ton-truck', '1 Ton Truck', '1 ton', 1000, '🚚', 'Ideal for small furniture and appliances', 2),
('1.5-ton-truck', '1.5 Ton Truck', '1.5 ton', 1500, '🚛', 'Great for studio apartments', 3),
('2-ton-truck', '2 Ton Truck', '2 ton', 2000, '🚚', 'Perfect for 1-2 bedroom moves', 4),
('4-ton-truck', '4 Ton Truck', '4 ton', 4000, '🚛', 'Suitable for 2-3 bedroom homes', 5),
('5-ton-truck', '5 Ton Truck', '5 ton', 5000, '🚚', 'Great for larger homes', 6),
('8-ton-truck', '8 Ton Truck', '8 ton', 8000, '🚛', 'For commercial and large moves', 7),
('10-ton-truck', '10 Ton Truck', '10 ton', 10000, '🚚', 'Heavy-duty commercial transport', 8)
ON CONFLICT (id) DO NOTHING;

-- Distance Bands
INSERT INTO distance_bands (id, "minKm", "maxKm", label) VALUES
('band-0-5', 0, 5, '0 – 5 km'),
('band-5-10', 5, 10, '5 – 10 km'),
('band-10-15', 10, 15, '10 – 15 km'),
('band-15-20', 15, 20, '15 – 20 km'),
('band-20-25', 20, 25, '20 – 25 km'),
('band-25-30', 25, 30, '25 – 30 km'),
('band-30-40', 30, 40, '30 – 40 km'),
('band-40-50', 40, 50, '40 – 50 km'),
('band-50-60', 50, 60, '50 – 60 km'),
('band-60-70', 60, 70, '60 – 70 km'),
('band-70-80', 70, 80, '70 – 80 km'),
('band-80-90', 80, 90, '80 – 90 km'),
('band-90-100', 90, 100, '90 – 100 km'),
('band-100-125', 100, 125, '100 – 125 km'),
('band-125-150', 125, 150, '125 – 150 km'),
('band-150-175', 150, 175, '150 – 175 km'),
('band-175-200', 175, 200, '175 – 200 km'),
('band-200-250', 200, 250, '200 – 250 km'),
('band-250-300', 250, 300, '250 – 300 km'),
('band-300-400', 300, 400, '300 – 400 km'),
('band-400-500', 400, 500, '400 – 500 km'),
('band-500-600', 500, 600, '500 – 600 km'),
('band-600-800', 600, 800, '600 – 800 km'),
('band-800-1000', 800, 1000, '800 – 1 000 km'),
('band-1000-plus', 1000, NULL, '1 000+ km');

-- Extra Services
INSERT INTO extra_services (id, name, code, description, "priceType", price, unit, icon, "createdAt", "updatedAt") VALUES
('loading-service', 'Loading / Unloading', 'LOADING', 'Professional loading and unloading service', 'per_unit', 350, 'person', '👷', NOW(), NOW()),
('stairs', 'Stair Flights', 'STAIRS', 'Additional charge per flight of stairs', 'per_unit', 150, 'flight', '🪜', NOW(), NOW()),
('packing', 'Boxes & Bubble-Wrap', 'PACKING', '10 boxes + bubble wrap package', 'flat', 200, NULL, '📦', NOW(), NOW()),
('cleaning', 'Cleaning Service', 'CLEANING', 'Professional cleaning service', 'flat', 500, NULL, '🧽', NOW(), NOW()),
('express', 'Express Delivery', 'EXPRESS', 'Same-day delivery service', 'flat', 500, NULL, '⚡', NOW(), NOW()),
('insurance', 'Insurance', 'INSURANCE', 'Comprehensive item insurance', 'percentage', 5, NULL, '🛡️', NOW(), NOW()),
('waiting-time', 'Waiting Time', 'WAITING', 'Additional waiting time charge', 'per_unit', 100, '15min', '⏰', NOW(), NOW()),
('security-escort', 'Security Escort', 'SECURITY', 'Security escort for valuable items or high-risk areas', 'flat', 750, NULL, '🛡️', NOW(), NOW()),
('customs-handling', 'Customs Handling', 'CUSTOMS', 'Assistance with cross-border documentation and customs', 'flat', 1200, NULL, '📋', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- South African Provincial Adjustments
INSERT INTO provincial_adjustments (id, province, adjustment, description, "createdAt", "updatedAt") VALUES
('pa-eastern-cape', 'Eastern Cape', 1.08, 'Variable road conditions, rural areas', NOW(), NOW()),
('pa-free-state', 'Free State', 1.03, 'Good highway network, some rural challenges', NOW(), NOW()),
('pa-gauteng', 'Gauteng', 1.00, 'Excellent infrastructure, high volume', NOW(), NOW()),
('pa-kwazulu-natal', 'KwaZulu-Natal', 1.05, 'Coastal and inland variations, high humidity', NOW(), NOW()),
('pa-limpopo', 'Limpopo', 1.10, 'Rural infrastructure, border province', NOW(), NOW()),
('pa-mpumalanga', 'Mpumalanga', 1.07, 'Mountainous terrain in parts', NOW(), NOW()),
('pa-north-west', 'North West', 1.06, 'Mining areas, variable road quality', NOW(), NOW()),
('pa-northern-cape', 'Northern Cape', 1.12, 'Long distances, sparse population', NOW(), NOW()),
('pa-western-cape', 'Western Cape', 1.02, 'Good infrastructure, some mountain passes', NOW(), NOW())
ON CONFLICT (province) DO NOTHING;

-- Current Fuel Surcharge
INSERT INTO fuel_surcharges (id, "effectiveFrom", "petrolPrice", "dieselPrice", "surchargeRate", "isActive", "createdAt", "updatedAt") VALUES
('fs-2025-07', '2025-07-01', 24.75, 23.90, 0.025, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
