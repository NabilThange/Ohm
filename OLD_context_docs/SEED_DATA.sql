-- =====================================================================
-- OHM DATABASE SEED SCRIPT
-- Populates the database with a rich Component Library and Templates.
-- Run this AFTER running DATABASE_SCHEMA.sql
-- =====================================================================

-- ============================================
-- 1. COMPONENT TEMPLATES (The "Master Catalog")
-- ============================================

-- MICROCONTROLLERS
INSERT INTO component_templates (name, category, manufacturer, pins, voltage_range, interface_types, description, common_uses) VALUES
('ESP32-WROOM-32', 'Microcontroller', 'Espressif', 
 '{"3V3": {"type": "power", "x": 0, "y": 0}, "GND": {"type": "ground", "x": 0, "y": 1}, "EN": {"type": "input"}, "GPIO36": {"type": "analog_in"}, "GPIO39": {"type": "analog_in"}, "GPIO34": {"type": "analog_in"}, "GPIO35": {"type": "analog_in"}, "GPIO32": {"type": "digital_io"}, "GPIO33": {"type": "digital_io"}, "GPIO25": {"type": "digital_io", "dac": true}, "GPIO26": {"type": "digital_io", "dac": true}, "GPIO27": {"type": "digital_io"}, "GPIO14": {"type": "digital_io"}, "GPIO12": {"type": "digital_io"}, "GPIO13": {"type": "digital_io"}, "GPIO21": {"type": "digital_io", "i2c": "SDA"}, "GPIO22": {"type": "digital_io", "i2c": "SCL"}, "TX": {"type": "uart_tx"}, "RX": {"type": "uart_rx"}}'::jsonb,
 '3.0V - 3.6V', ARRAY['WiFi', 'Bluetooth', 'I2C', 'SPI', 'UART'], 'Powerful dual-core Wi-Fi & Bluetooth MCU.', ARRAY['IoT', 'Smart Home', 'Web Server']),

('Arduino Uno R3', 'Microcontroller', 'Arduino',
 '{"5V": {"type": "power"}, "3.3V": {"type": "power"}, "GND": {"type": "ground"}, "VIN": {"type": "power_in"}, "A0": {"type": "analog_in"}, "A1": {"type": "analog_in"}, "A2": {"type": "analog_in"}, "A3": {"type": "analog_in"}, "A4": {"type": "analog_in", "i2c": "SDA"}, "A5": {"type": "analog_in", "i2c": "SCL"}, "D0": {"type": "digital_io", "uart": "RX"}, "D1": {"type": "digital_io", "uart": "TX"}, "D2": {"type": "digital_io"}, "D3": {"type": "digital_io", "pwm": true}, "D4": {"type": "digital_io"}, "D5": {"type": "digital_io", "pwm": true}, "D6": {"type": "digital_io", "pwm": true}, "D7": {"type": "digital_io"}, "D8": {"type": "digital_io"}, "D9": {"type": "digital_io", "pwm": true}, "D10": {"type": "digital_io", "pwm": true}, "D11": {"type": "digital_io", "pwm": true}, "D12": {"type": "digital_io"}, "D13": {"type": "digital_io"}}'::jsonb,
 '7V - 12V (VIN), 5V (USB)', ARRAY['UART', 'I2C', 'SPI'], 'The classic starter board.', ARRAY['Education', 'prototyping', 'robotics']),

('Raspberry Pi Pico', 'Microcontroller', 'Raspberry Pi',
 '{"VBUS": {"type": "power_in"}, "VSYS": {"type": "power_in"}, "3V3": {"type": "power"}, "GND": {"type": "ground"}, "GP0": {"type": "digital_io", "uart": "TX"}, "GP1": {"type": "digital_io", "uart": "RX"}, "GP16": {"type": "digital_io", "spi": "MISO"}, "GP17": {"type": "digital_io", "spi": "CS"}}'::jsonb,
 '1.8V - 5.5V', ARRAY['SPI', 'I2C', 'UART'], 'Dual-core ARM Cortex-M0+ RP2040.', ARRAY['Low power', 'USB HID', 'Edge AI']);

-- SENSORS
INSERT INTO component_templates (name, category, pins, voltage_range, interface_types, description) VALUES
('DHT22', 'Sensor', 
 '{"VCC": {"type": "power"}, "DATA": {"type": "digital_io"}, "NC": {"type": "nc"}, "GND": {"type": "ground"}}'::jsonb,
 '3.3V - 6V', ARRAY['OneWire'], 'Temperature and Humidity Sensor (Digital).'),

('BME280', 'Sensor',
 '{"VCC": {"type": "power"}, "GND": {"type": "ground"}, "SCL": {"type": "i2c_scl"}, "SDA": {"type": "i2c_sda"}, "CSB": {"type": "spi_cs"}, "SDO": {"type": "spi_miso"}}'::jsonb,
 '1.7V - 3.6V', ARRAY['I2C', 'SPI'], 'Precision Temp, Humidity, Pressure Sensor.'),

('HC-SR04', 'Sensor',
 '{"VCC": {"type": "power"}, "TRIG": {"type": "digital_out"}, "ECHO": {"type": "digital_in"}, "GND": {"type": "ground"}}'::jsonb,
 '5V', ARRAY['Digital'], 'Ultrasonic Distance Sensor.'),

('MPU-6050', 'Sensor',
 '{"VCC": {"type": "power"}, "GND": {"type": "ground"}, "SCL": {"type": "i2c_scl"}, "SDA": {"type": "i2c_sda"}, "INT": {"type": "digital_out"}}'::jsonb,
 '2.3V - 3.4V', ARRAY['I2C'], '6-Axis Accelerometer and Gyroscope.'),

('PIR Module (HC-SR501)', 'Sensor',
 '{"VCC": {"type": "power"}, "OUT": {"type": "digital_out"}, "GND": {"type": "ground"}}'::jsonb,
 '4.5V - 20V', ARRAY['Digital'], 'Passive Infrared Motion Sensor.');

-- ACTUATORS & DISPLAYS
INSERT INTO component_templates (name, category, pins, voltage_range, interface_types, description) VALUES
('SG90 Micro Servo', 'Actuator',
 '{"VCC": {"type": "power", "color": "red"}, "GND": {"type": "ground", "color": "brown"}, "PWM": {"type": "pwm", "color": "orange"}}'::jsonb,
 '4.8V - 6V', ARRAY['PWM'], 'Small 9g rotary servo motor.'),

('OLED 0.96 I2C', 'Display',
 '{"GND": {"type": "ground"}, "VCC": {"type": "power"}, "SCL": {"type": "i2c_scl"}, "SDA": {"type": "i2c_sda"}}'::jsonb,
 '3.3V - 5V', ARRAY['I2C'], '128x64 Pixel OLED Display (SSD1306).'),

('5V Relay Module 1-Channel', 'Actuator',
 '{"VCC": {"type": "power"}, "GND": {"type": "ground"}, "IN": {"type": "digital_in", "active": "low"}, "NO": {"type": "switch"}, "COM": {"type": "switch"}, "NC": {"type": "switch"}}'::jsonb,
 '5V', ARRAY['Digital'], 'Controls high voltage devices via logic signal.'),

('L298N Motor Driver', 'Driver',
 '{"12V": {"type": "power_in"}, "GND": {"type": "ground"}, "5V": {"type": "power_out"}, "ENA": {"type": "pwm_in"}, "IN1": {"type": "digital_in"}, "IN2": {"type": "digital_in"}, "IN3": {"type": "digital_in"}, "IN4": {"type": "digital_in"}, "ENB": {"type": "pwm_in"}, "OUT1": {"type": "motor_out"}, "OUT2": {"type": "motor_out"}, "OUT3": {"type": "motor_out"}, "OUT4": {"type": "motor_out"}}'::jsonb,
 '5V - 35V', ARRAY['PWM', 'Digital'], 'Dual H-Bridge for driving DC motors.');


-- ============================================
-- 2. SAMPLE PROJECT (Template to Clone)
-- ============================================

-- Create a dummy "System" user/project owner if needed, or users will fork.
-- For this script, we assume the user exists or we insert without user_id (since it's nullable in chats but required in projects, let's skip actual project insert to avoid FK errors, 
-- but we CAN insert into 'component_templates' safely).

-- NOTE: To insert actual Project Data, you need a valid user_id.
-- Since I cannot query your auth.users table, I will provide the SQL structure
-- that you can run once you have a user ID.

/*
-- EXAMPLE: INSERTING A "WEATHER STATION" PROJECT
DO $$
DECLARE
  v_user_id UUID; -- REPLACE THIS WITH YOUR USER ID
  v_project_id UUID;
  v_esp32_id UUID;
  v_dht22_id UUID;
BEGIN
  -- Get your user ID (manual step)
  -- v_user_id := 'your-uuid-here';

  -- 1. Create Project
  INSERT INTO projects (user_id, name, description, category, status)
  VALUES (v_user_id, 'ESP32 Weather Station', 'Simple temp/humidity monitor with OLED', 'IoT', 'active')
  RETURNING id INTO v_project_id;

  -- 2. Get Template IDs
  SELECT id INTO v_esp32_id FROM component_templates WHERE name = 'ESP32-WROOM-32';
  SELECT id INTO v_dht22_id FROM component_templates WHERE name = 'DHT22';

  -- 3. Add Parts
  INSERT INTO parts (project_id, template_id, name, quantity, price) VALUES
  (v_project_id, v_esp32_id, 'Main Controller', 1, 5.50),
  (v_project_id, v_dht22_id, 'Temp Sensor', 1, 4.20);

  -- 4. Create Wiring Connection (Data -> GPIO4)
  INSERT INTO connections (project_id, from_part_id, from_pin, to_part_id, to_pin)
  SELECT v_project_id, p1.id, 'GPIO4', p2.id, 'DATA'
  FROM parts p1, parts p2 
  WHERE p1.project_id = v_project_id AND p1.template_id = v_esp32_id
    AND p2.project_id = v_project_id AND p2.template_id = v_dht22_id;

END $$;
*/

-- ============================================
-- 3. UTILITY FUNCTIONS (For AI Agents)
-- ============================================

-- Function: Find Component Pinout
CREATE OR REPLACE FUNCTION get_component_pinout(p_name TEXT) 
RETURNS JSONB AS $$
BEGIN
  RETURN (SELECT pins FROM component_templates WHERE name = p_name LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Function: Search Components by Keyword
CREATE OR REPLACE FUNCTION search_components(p_query TEXT) 
RETURNS TABLE(name TEXT, category TEXT, description TEXT) AS $$
BEGIN
  RETURN QUERY 
  SELECT t.name, t.category, t.description
  FROM component_templates t
  WHERE t.name ILIKE '%' || p_query || '%' 
     OR t.description ILIKE '%' || p_query || '%'
     OR t.category ILIKE '%' || p_query || '%';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. BUDGET OPTIMIZER DATA
-- ============================================

-- Add average price data (metadata update)
UPDATE component_templates SET default_specs = default_specs || '{"avg_price_usd": 6.50}'::jsonb WHERE name = 'ESP32-WROOM-32';
UPDATE component_templates SET default_specs = default_specs || '{"avg_price_usd": 24.00}'::jsonb WHERE name = 'Arduino Uno R3';
UPDATE component_templates SET default_specs = default_specs || '{"avg_price_usd": 4.50}'::jsonb WHERE name = 'DHT22';
UPDATE component_templates SET default_specs = default_specs || '{"avg_price_usd": 2.50}'::jsonb WHERE name = 'SG90 Micro Servo';
