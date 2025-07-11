-- Insert demo users with correct column names
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
) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

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
) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;
