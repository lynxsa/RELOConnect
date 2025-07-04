-- Manual seeding script for RELOConnect database

-- Insert vehicles
INSERT INTO vehicles (id, type, capacity, "maxWeight", name, description, "basePrice", "pricePerKm", icon) VALUES
('vehicle-1', 'MOTORCYCLE', 0.2, 50, 'Motorcycle', 'Perfect for small packages and documents', 40, 1.5, '🏍️'),
('vehicle-2', 'PICKUP', 2.0, 1000, 'Pickup Truck', 'Great for medium-sized items and furniture', 60, 2, '🛻'),
('vehicle-3', 'VAN', 3.5, 1500, 'Small Van', 'Perfect for small to medium moves', 80, 2.5, '🚐'),
('vehicle-4', 'TRUCK', 8.0, 3000, 'Box Truck', 'Ideal for large household moves', 120, 3, '🚛')
ON CONFLICT (id) DO NOTHING;

-- Insert vehicle classes
INSERT INTO vehicle_classes (id, name, capacity, "maxWeight", icon, description, "order") VALUES
('class-1', 'Motorcycle', '0.2m³', 50, '🏍️', 'For small packages and documents', 1),
('class-2', 'Pickup', '2.0m³', 1000, '🛻', 'For medium-sized items', 2),
('class-3', 'Small Van', '3.5m³', 1500, '🚐', 'For small to medium moves', 3),
('class-4', 'Box Truck', '8.0m³', 3000, '🚛', 'For large household moves', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert distance bands
INSERT INTO distance_bands (id, "minKm", "maxKm", label) VALUES
('band-1', 0, 5, '0-5km'),
('band-2', 5, 10, '5-10km'),
('band-3', 10, 25, '10-25km'),
('band-4', 25, 50, '25-50km'),
('band-5', 50, 100, '50-100km'),
('band-6', 100, NULL, '100km+')
ON CONFLICT (id) DO NOTHING;

-- Insert pricing rates
INSERT INTO pricing_rates (id, "vehicleClassId", "distanceBandId", "baseFare") VALUES
-- Motorcycle rates
('rate-1-1', 'class-1', 'band-1', 60),
('rate-1-2', 'class-1', 'band-2', 80),
('rate-1-3', 'class-1', 'band-3', 120),
('rate-1-4', 'class-1', 'band-4', 180),
('rate-1-5', 'class-1', 'band-5', 250),
('rate-1-6', 'class-1', 'band-6', 350),

-- Pickup rates
('rate-2-1', 'class-2', 'band-1', 120),
('rate-2-2', 'class-2', 'band-2', 150),
('rate-2-3', 'class-2', 'band-3', 220),
('rate-2-4', 'class-2', 'band-4', 320),
('rate-2-5', 'class-2', 'band-5', 450),
('rate-2-6', 'class-2', 'band-6', 600),

-- Small Van rates
('rate-3-1', 'class-3', 'band-1', 180),
('rate-3-2', 'class-3', 'band-2', 220),
('rate-3-3', 'class-3', 'band-3', 320),
('rate-3-4', 'class-3', 'band-4', 450),
('rate-3-5', 'class-3', 'band-5', 650),
('rate-3-6', 'class-3', 'band-6', 850),

-- Box Truck rates
('rate-4-1', 'class-4', 'band-1', 300),
('rate-4-2', 'class-4', 'band-2', 350),
('rate-4-3', 'class-4', 'band-3', 500),
('rate-4-4', 'class-4', 'band-4', 700),
('rate-4-5', 'class-4', 'band-5', 950),
('rate-4-6', 'class-4', 'band-6', 1200)
ON CONFLICT ("vehicleClassId", "distanceBandId") DO NOTHING;

-- Insert extra services
INSERT INTO extra_services (id, name, code, description, "priceType", price, unit, icon) VALUES
('extra-1', 'Loading Service', 'loading', 'Professional loading and unloading', 'per_unit', 50, 'person', '👷'),
('extra-2', 'Stair Carry', 'stairs', 'Additional charge per flight of stairs', 'per_unit', 15, 'flight', '🪜'),
('extra-3', 'Packing Service', 'packing', 'Professional packing materials and service', 'per_unit', 25, '15min', '📦'),
('extra-4', 'Cleaning Service', 'cleaning', 'Post-move cleaning service', 'flat', 150, NULL, '🧹'),
('extra-5', 'Express Service', 'express', 'Priority booking and faster delivery', 'percentage', 25, NULL, '⚡'),
('extra-6', 'Insurance', 'insurance', 'Full coverage insurance for your items', 'percentage', 5, NULL, '🛡️')
ON CONFLICT (code) DO NOTHING;

-- Insert sample news articles
INSERT INTO news_articles (id, title, description, content, "imageUrl", source, author, "publishedAt", category, tags) VALUES
('news-1', 'Moving Industry Trends for 2024', 'Latest trends shaping the relocation industry', 'The moving industry continues to evolve with technology...', NULL, 'Industry Weekly', 'John Smith', NOW() - INTERVAL '2 days', 'INDUSTRY', ARRAY['trends', 'technology']),
('news-2', 'Best Packing Tips for Your Move', 'Professional tips to make your move easier', 'Packing efficiently can save time and money...', NULL, 'Moving Today', 'Jane Doe', NOW() - INTERVAL '1 day', 'RELOCATION', ARRAY['packing', 'tips']),
('news-3', 'Logistics Technology Advances', 'How AI is changing logistics', 'Artificial intelligence is revolutionizing logistics...', NULL, 'Tech Logistics', 'Bob Wilson', NOW() - INTERVAL '3 hours', 'TECHNOLOGY', ARRAY['AI', 'logistics'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample ports
INSERT INTO ports (id, name, code, country, latitude, longitude, timezone, facilities) VALUES
('port-1', 'Port of Cape Town', 'ZACPT', 'South Africa', -33.9249, 18.4241, 'Africa/Johannesburg', ARRAY['Container Terminal', 'RoRo Terminal', 'Multi-purpose Terminal']),
('port-2', 'Port of Durban', 'ZADUR', 'South Africa', -29.8587, 31.0218, 'Africa/Johannesburg', ARRAY['Container Terminal', 'Car Terminal', 'Oil Terminal']),
('port-3', 'Port Elizabeth Port', 'ZAPLZ', 'South Africa', -33.9608, 25.6022, 'Africa/Johannesburg', ARRAY['Container Terminal', 'RoRo Terminal'])
ON CONFLICT (code) DO NOTHING;

-- Insert sample vessels
INSERT INTO vessels (id, name, imo, type, flag, length, width, draft) VALUES
('vessel-1', 'MSC Virtuosa', '9803613', 'Container Ship', 'Liberia', 399.9, 61.5, 16.5),
('vessel-2', 'Cape Town Trader', '9654321', 'RoRo Vessel', 'South Africa', 180.0, 28.0, 7.5),
('vessel-3', 'Atlantic Express', '9789123', 'General Cargo', 'Panama', 150.0, 23.0, 8.2)
ON CONFLICT (imo) DO NOTHING;

-- Create a default admin user
INSERT INTO users (id, email, phone, "firstName", "lastName", role, "isVerified", password) VALUES
('admin-1', 'admin@reloconnect.com', '+27123456789', 'Admin', 'User', 'ADMIN', true, '$2a$10$dummy.hash.for.testing.purposes.only')
ON CONFLICT (email) DO NOTHING;

-- Update vehicle class references
UPDATE vehicles SET "vehicleClassId" = 'class-1' WHERE id = 'vehicle-1';
UPDATE vehicles SET "vehicleClassId" = 'class-2' WHERE id = 'vehicle-2';
UPDATE vehicles SET "vehicleClassId" = 'class-3' WHERE id = 'vehicle-3';
UPDATE vehicles SET "vehicleClassId" = 'class-4' WHERE id = 'vehicle-4';

SELECT 'Database seeded successfully!' as message;
