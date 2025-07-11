-- Fleet Owners table
CREATE TABLE IF NOT EXISTS fleet_owners (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    business_name TEXT,
    business_reg_number TEXT,
    phone_number TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    verified_by TEXT,
    rejection_reason TEXT,
    business_reg_doc TEXT,
    proof_of_ownership TEXT,
    id_document TEXT NOT NULL,
    profile_photo TEXT,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret TEXT,
    backup_codes TEXT[] DEFAULT '{}',
    trust_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    flagged_for_review BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trucks table
CREATE TABLE IF NOT EXISTS trucks (
    id TEXT PRIMARY KEY,
    fleet_owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    license_plate TEXT UNIQUE NOT NULL,
    vehicle_type TEXT NOT NULL,
    capacity DOUBLE PRECISION NOT NULL,
    max_weight INTEGER NOT NULL,
    year INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    color TEXT NOT NULL,
    registration_doc TEXT NOT NULL,
    insurance_doc TEXT NOT NULL,
    roadworthy_doc TEXT,
    permit_doc TEXT,
    verification_status TEXT NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    gps_enabled BOOLEAN NOT NULL DEFAULT false,
    last_known_lat DOUBLE PRECISION,
    last_known_lng DOUBLE PRECISION,
    last_seen TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Driver Profiles table  
CREATE TABLE IF NOT EXISTS driver_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    fleet_owner_id TEXT,
    phone_number TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    profile_photo TEXT,
    emergency_contact TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    license_type TEXT NOT NULL,
    pdp_number TEXT UNIQUE NOT NULL,
    license_expiry TIMESTAMP NOT NULL,
    pdp_expiry TIMESTAMP NOT NULL,
    license_doc TEXT NOT NULL,
    pdp_doc TEXT NOT NULL,
    id_document TEXT NOT NULL,
    medical_cert TEXT,
    verification_status TEXT NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    verified_by TEXT,
    rejection_reason TEXT,
    rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_trips INTEGER NOT NULL DEFAULT 0,
    completed_trips INTEGER NOT NULL DEFAULT 0,
    cancelled_trips INTEGER NOT NULL DEFAULT 0,
    is_online BOOLEAN NOT NULL DEFAULT false,
    is_available BOOLEAN NOT NULL DEFAULT true,
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    current_address TEXT,
    last_location_update TIMESTAMP,
    trust_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    flagged_for_review BOOLEAN NOT NULL DEFAULT false,
    background_check_status TEXT NOT NULL DEFAULT 'PENDING',
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret TEXT,
    backup_codes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Truck Assignments table
CREATE TABLE IF NOT EXISTS truck_assignments (
    id TEXT PRIMARY KEY,
    truck_id TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT
);

-- Safety Reports table
CREATE TABLE IF NOT EXISTS safety_reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    report_type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM',
    status TEXT NOT NULL DEFAULT 'PENDING',
    reported_driver_id TEXT,
    reported_fleet_owner_id TEXT,
    reported_truck_id TEXT,
    reported_booking_id TEXT,
    reporter_driver_id TEXT,
    evidence_urls TEXT[] DEFAULT '{}',
    witness_contacts TEXT[] DEFAULT '{}',
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    action_taken TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Document Verifications table
CREATE TABLE IF NOT EXISTS document_verifications (
    id TEXT PRIMARY KEY,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP,
    verified_by TEXT,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    extracted_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add new columns to existing tables
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS truck_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS new_driver_id TEXT;
