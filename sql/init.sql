-- PINnode System Database Initialization
-- PostgreSQL initialization script

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Brand Projects Table
CREATE TABLE IF NOT EXISTS brand_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    colors JSONB,
    logo_svg TEXT,
    logo_png TEXT,
    exported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Archived Entries Table
CREATE TABLE IF NOT EXISTS archived_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    content TEXT,
    encrypted_content TEXT,
    tags TEXT[],
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size INTEGER,
    mime_type VARCHAR(100)
);

-- Brand Assets Table
CREATE TABLE IF NOT EXISTS brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES brand_projects(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'logo', 'color_palette', 'font', 'style_guide'
    asset_data JSONB NOT NULL,
    file_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table (for authentication)
CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Sales/Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    plan_type VARCHAR(50) NOT NULL, -- 'basic', 'pro', 'enterprise'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(255),
    metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brand_projects_industry ON brand_projects(industry);
CREATE INDEX IF NOT EXISTS idx_brand_projects_created_at ON brand_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_archived_entries_filename ON archived_entries(filename);
CREATE INDEX IF NOT EXISTS idx_archived_entries_tags ON archived_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_archived_entries_created_at ON archived_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_brand_assets_project_id ON brand_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_type ON brand_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Insert sample data for testing
INSERT INTO brand_projects (name, description, industry, colors, exported) VALUES 
('Talism.ai', 'Magiczny asystent AI do automatyzacji zadań', 'Technology', '["#6366f1", "#8b5cf6", "#06b6d4"]', false),
('SpellBay.shop', 'Sklep z zaklęciami AI i narzędziami magicznymi', 'E-commerce', '["#f59e0b", "#eab308", "#84cc16"]', false),
('HealthTrack.app', 'Aplikacja do monitoringu zdrowia', 'Healthcare', '["#3b82f6", "#1d4ed8", "#0ea5e9"]', false)
ON CONFLICT DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brand_projects_updated_at BEFORE UPDATE ON brand_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();