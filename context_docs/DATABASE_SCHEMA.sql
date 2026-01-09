-- =====================================================================
-- OHM DATABASE SCHEMA v4.0 - PRODUCTION COMPLETE
-- The definitive schema for the OHM Hardware Lifecycle Orchestrator.
-- Includes: Multi-Agent State, Rate Limiting, Component Library, 
-- Visual Wiring, Git-style Versioning, and Business Logistics.
-- =====================================================================

-- ============================================
-- 1. USERS & PROFILES (Setting the Stage)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Global AI Preferences
  ai_preferences JSONB DEFAULT '{
    "default_budget_range": "standard",
    "preferred_code_style": "modular",
    "show_beginner_tips": true,
    "auto_add_level_shifters": true,
    "preferred_units": "metric"
  }'::jsonb,
  
  -- Usage Stats
  total_chats INTEGER DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' -- free, pro, enterprise
);

-- ============================================
-- 2. USER QUOTAS (Business Logic & Rate Limiting)
-- ============================================
CREATE TABLE user_quotas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message Limits
  messages_this_month INTEGER DEFAULT 0,
  messages_limit INTEGER DEFAULT 100, -- Free tier default
  
  -- Project Limits
  projects_this_month INTEGER DEFAULT 0,
  projects_limit INTEGER DEFAULT 3,
  
  -- AI Cost Tracking
  tokens_used_this_month INTEGER DEFAULT 0,
  tokens_limit INTEGER DEFAULT 100000,
  cost_this_month DECIMAL(10, 4) DEFAULT 0.0000,
  
  quota_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. COMPONENT TEMPLATES (The "Master Catalog")
-- ============================================
CREATE TABLE component_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- e.g. "ESP32-WROOM-32" (Model Number)
  category TEXT NOT NULL,    -- Microcontroller, Sensor, Actuator, Power
  manufacturer TEXT,
  
  -- VISUAL ASSETS (For Diagram Generation)
  svg_symbol TEXT,            -- SVG code for schematic view
  breadboard_image_url TEXT,  -- URL for realistic breadboard view
  pinout_diagram_url TEXT,
  
  -- TECHNICAL SPECIFICATIONS
  -- Structure: {"GPIO4": {"type": "digital", "voltage": "3.3V", "pwm": true}, ...}
  pins JSONB NOT NULL,
  
  voltage_range TEXT,         -- e.g. "3.0V - 3.6V"
  interface_types TEXT[],     -- ["I2C", "SPI", "UART"]
  default_specs JSONB,        -- {"current_draw_ma": 50}
  
  -- AI Hints
  description TEXT,
  common_uses TEXT[],         -- ["IoT", "WiFi", "Bluetooth"]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. PROJECTS
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  goal TEXT,
  location TEXT,
  target_budget DECIMAL(10, 2),
  current_estimated_cost DECIMAL(10, 2),
  status TEXT DEFAULT 'draft',
  is_locked BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. CHATS
-- ============================================
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'New Hardware Project',
  is_archived BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. CHAT SESSIONS (Multi-Agent State Machine)
-- ============================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  
  -- State Tracking
  current_agent TEXT, -- 'orchestrator', 'conversational', 'bomGenerator'
  agent_context JSONB, -- Conversation memory/scratchpad for agents
  
  -- Workflow Flags
  is_plan_locked BOOLEAN DEFAULT false,
  locked_blueprint JSONB, -- The "Golden Blueprint"
  
  -- User Inputs State
  budget_range TEXT, -- 'low', 'standard', 'premium'
  budget_target DECIMAL(10, 2),
  
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. MESSAGES
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Traceability
  agent_name TEXT, 
  agent_model TEXT,
  intent TEXT,
  
  -- Cost Tracking
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  
  created_artifact_ids UUID[] DEFAULT '{}'::uuid[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Full Text Search
  content_search TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);

-- ============================================
-- 8. AGENT EXECUTIONS (Performance & Debugging)
-- ============================================
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  
  agent_name TEXT NOT NULL,
  agent_model TEXT NOT NULL,
  
  status TEXT CHECK (status IN ('running', 'completed', 'failed', 'timeout')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  duration_ms INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd DECIMAL(10, 4),
  
  error_message TEXT,
  input_payload JSONB,
  output_payload JSONB
);

-- ============================================
-- 9. ARTIFACTS
-- ============================================
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'context', 'mvp', 'prd', 'bom', 'code', 'wiring', 'circuit', 'budget'
  )),
  title TEXT NOT NULL,
  current_version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. ARTIFACT VERSIONS (The Git Hub)
-- ============================================
CREATE TABLE artifact_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id UUID REFERENCES artifacts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  
  -- Content Containers
  content TEXT,              -- Markdown text / Code
  content_json JSONB,        -- Structured data (BOM/Wiring)
  
  -- Code Specific
  filename TEXT,
  language TEXT,
  file_path TEXT,
  
  -- Diagram Specific (Visual Wiring)
  diagram_svg TEXT,
  diagram_metadata JSONB,    -- Component coordinates {esp32: {x: 10, y: 10}}
  
  change_summary TEXT,
  parent_version_id UUID REFERENCES artifact_versions(id),
  created_by_message_id UUID REFERENCES messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(artifact_id, version_number)
);

-- ============================================
-- 11. ARTIFACT SECTIONS & DEPENDENCIES
-- ============================================
CREATE TABLE artifact_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_version_id UUID REFERENCES artifact_versions(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  content TEXT
);

CREATE TABLE artifact_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dependent_id UUID REFERENCES artifacts(id) ON DELETE CASCADE,
  dependency_id UUID REFERENCES artifacts(id) ON DELETE CASCADE,
  rel_type TEXT DEFAULT 'references',
  UNIQUE(dependent_id, dependency_id)
);

-- ============================================
-- 12. PROJECT PARTS (BOM Instances)
-- ============================================
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  template_id UUID REFERENCES component_templates(id), -- Link to Master Catalog
  artifact_id UUID REFERENCES artifacts(id),
  
  name TEXT NOT NULL,
  part_number TEXT,
  category TEXT,
  subcategory TEXT,
  
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2),
  supplier TEXT,
  supplier_url TEXT,
  lead_time_days INTEGER,
  
  -- Diagram Positioning
  position JSONB DEFAULT '{"x": 0, "y": 0, "rotation": 0}'::jsonb,
  
  usage_notes TEXT[],
  specs JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(project_id, part_number),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 13. CONNECTIONS (Wires)
-- ============================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  artifact_id UUID REFERENCES artifacts(id),
  
  from_part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  from_pin TEXT NOT NULL,
  to_part_id UUID REFERENCES parts(id) ON DELETE CASCADE,
  to_pin TEXT NOT NULL,
  
  wire_color TEXT,
  wire_gauge TEXT,
  sequence_number INTEGER,
  
  -- Automated Safety Checks
  validation_result JSONB DEFAULT '{"status": "pending"}'::jsonb,
  notes TEXT,
  
  UNIQUE(from_part_id, from_pin, to_part_id, to_pin),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 14. BUDGET SNAPSHOTS (History)
-- ============================================
CREATE TABLE budget_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  target_budget DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  budget_range TEXT,
  
  trigger_event TEXT, -- 'slider_change', 'part_added'
  suggestions JSONB   -- AI cost-saving tips
);

-- ============================================
-- 15. ATTACHMENTS, FEEDBACK, ERORRS
-- ============================================
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT,
  public_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE message_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  issue_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  chat_id UUID REFERENCES chats(id),
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  request_payload JSONB
);

CREATE TABLE circuit_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id),
  project_id UUID REFERENCES projects(id),
  image_url TEXT NOT NULL,
  status TEXT, -- PASS/FAIL
  confidence TEXT,
  components_detected JSONB,
  issues TEXT[],
  suggestions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE datasheet_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id),
  file_url TEXT NOT NULL,
  component_name TEXT,
  key_specs JSONB,
  pin_mappings JSONB,
  extraction_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 16. INDEXES & TRIGGERS
-- ============================================
CREATE INDEX idx_messages_chat_seq ON messages(chat_id, sequence_number);
CREATE INDEX idx_parts_project ON parts(project_id);
CREATE INDEX idx_connections_project ON connections(project_id);
CREATE INDEX idx_agent_executions_chat ON agent_executions(chat_id);
CREATE INDEX idx_chat_sessions_chat ON chat_sessions(chat_id);

-- Quota Check Trigger
CREATE OR REPLACE FUNCTION check_user_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_limit INTEGER;
  v_uid UUID;
BEGIN
  -- Get User ID (Assuming chat exists)
  SELECT user_id INTO v_uid FROM chats WHERE id = NEW.chat_id;
  
  -- Check Limit
  SELECT messages_this_month, messages_limit INTO v_count, v_limit 
  FROM user_quotas WHERE user_id = v_uid;
  
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Monthly message quota exceeded';
  END IF;
  
  -- Increment
  UPDATE user_quotas SET messages_this_month = messages_this_month + 1 WHERE user_id = v_uid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_quota BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION check_user_quota();

-- ============================================
-- 17. SEED DATA (Start Kits)
-- ============================================
INSERT INTO component_templates (name, category, pins, voltage_range) VALUES
('ESP32-WROOM-32', 'Microcontroller', 
 '{"GPIO4": {"type": "digital", "voltage": "3.3V"}, "3V3": {"type": "power"}, "GND": {"type": "ground"}}'::jsonb, 
 '3.0V-3.6V'),
('Arduino Uno R3', 'Microcontroller', 
 '{"D13": {"type": "digital", "voltage": "5V"}, "5V": {"type": "power"}, "GND": {"type": "ground"}}'::jsonb, 
 '7V-12V (Input)'),
('DHT22', 'Sensor', 
 '{"VCC": {"type": "power", "voltage": "3.3V-5.5V"}, "GND": {"type": "ground"}, "DATA": {"type": "digital"}}'::jsonb, 
 '3.3V-6V');
