-- PINnode System Production Database Schema
-- Version: 1.0.0
-- Date: August 2025

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create main tables
CREATE TABLE IF NOT EXISTS brand_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  logo_svg TEXT,
  colors JSONB,
  fonts JSONB,
  brand_data JSONB,
  exported BOOLEAN DEFAULT false,
  edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS archived_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  content TEXT,
  encrypted BOOLEAN DEFAULT true,
  tags TEXT[],
  category TEXT,
  file_size INTEGER DEFAULT 0,
  mime_type TEXT,
  checksum TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_data JSONB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  response_code INTEGER,
  response_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES brand_projects(id),
  export_type TEXT NOT NULL, -- 'zip', 'pdf', 'assets'
  file_size INTEGER,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_projects_name ON brand_projects USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brand_projects_industry ON brand_projects(industry);
CREATE INDEX IF NOT EXISTS idx_brand_projects_created_at ON brand_projects(created_at);

CREATE INDEX IF NOT EXISTS idx_archived_entries_filename ON archived_entries USING gin(filename gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_archived_entries_tags ON archived_entries USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_archived_entries_category ON archived_entries(category);
CREATE INDEX IF NOT EXISTS idx_archived_entries_created_at ON archived_entries(created_at);

CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brand_projects_updated_at 
    BEFORE UPDATE ON brand_projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_archived_entries_updated_at 
    BEFORE UPDATE ON archived_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO brand_projects (name, description, industry, brand_data) VALUES
('PINnode Demo', 'AI-powered branding solution', 'tech', 
 '{"colors": ["#667eea", "#764ba2"], "fonts": ["Inter", "Roboto"], "logoStyle": "modern"}'),
('FinanceFlow', 'Financial management platform', 'finance', 
 '{"colors": ["#2563eb", "#1d4ed8"], "fonts": ["Poppins", "Open Sans"], "logoStyle": "professional"}'),
('HealthTech Pro', 'Healthcare technology solution', 'healthcare', 
 '{"colors": ["#059669", "#047857"], "fonts": ["Source Sans Pro", "Lato"], "logoStyle": "clean"}')
ON CONFLICT DO NOTHING;

-- Create analytics view
CREATE OR REPLACE VIEW brand_analytics AS
SELECT 
    industry,
    COUNT(*) as total_projects,
    COUNT(CASE WHEN exported = true THEN 1 END) as exported_count,
    ROUND(AVG(CASE WHEN exported = true THEN 1.0 ELSE 0.0 END) * 100, 2) as export_rate,
    MIN(created_at) as first_project,
    MAX(created_at) as latest_project
FROM brand_projects 
GROUP BY industry;

-- Grant permissions (adjust as needed for your production setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pinnode_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pinnode_user;

COMMENT ON TABLE brand_projects IS 'Main table for storing AI-generated brand projects';
COMMENT ON TABLE archived_entries IS 'Encrypted file archive with full-text search capabilities';
COMMENT ON TABLE api_usage IS 'API usage tracking and analytics';
COMMENT ON TABLE export_history IS 'History of all export operations';