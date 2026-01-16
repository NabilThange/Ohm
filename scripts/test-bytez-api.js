/**
 * BYTEZ Text-to-Image API Test Script
 * Run this BEFORE implementing the visual wiring diagram feature
 * 
 * Usage: node scripts/test-bytez-api.js
 * Or: BYTEZ_API_KEY=your_key node scripts/test-bytez-api.js
 */

const fs = require('fs');
const path = require('path');

// Try to read .env.local
let BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;

if (!BYTEZ_API_KEY) {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/BYTEZ_API_KEY=(.+)/);
    if (match) {
      BYTEZ_API_KEY = match[1].trim();
    }
  } catch (e) {
    // .env.local not found, will check environment variable
  }
}
const MODEL = 'dreamlike-art/dreamlike-photoreal-2.0';
const TEST_PROMPT = 'Top-down view of electronics workbench. Arduino Uno on white breadboard with red LED connected via 220 ohm resistor. Photorealistic, professional electronics photography, well-lit, sharp focus.';

async function testBYTEZAPI() {
  console.log('🧪 Testing BYTEZ Text-to-Image API...\n');
  
  if (!BYTEZ_API_KEY) {
    console.error('❌ ERROR: BYTEZ_API_KEY not found in .env.local');
    console.log('Please add: BYTEZ_API_KEY=your_key_here');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', BYTEZ_API_KEY.substring(0, 10) + '...');
  console.log('📝 Model:', MODEL);
  console.log('💬 Test Prompt:', TEST_PROMPT.substring(0, 80) + '...\n');
  
  try {
    console.log('⏳ Sending request to BYTEZ...');
    const startTime = Date.now();
    
    const response = await fetch(
      `https://api.bytez.com/models/v2/${MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': BYTEZ_API_KEY,  // NO "Bearer" prefix!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: TEST_PROMPT  // "text" not "prompt"!
        })
      }
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Response received in ${duration}s`);
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      process.exit(1);
    }
    
    const data = await response.json();
    console.log('\n📦 Response structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // Verify expected format
    if (data.error !== null && data.error !== undefined) {
      console.error('\n❌ API returned an error:', data.error);
      process.exit(1);
    }
    
    if (!data.output) {
      console.error('\n❌ Response missing "output" field');
      console.error('Expected format: { error: null, output: "<image_url>" }');
      process.exit(1);
    }
    
    console.log('\n✅ SUCCESS! Image URL:', data.output);
    
    // Test image URL accessibility
    console.log('\n🔗 Testing image URL accessibility...');
    const imageResponse = await fetch(data.output);
    
    if (!imageResponse.ok) {
      console.error(`❌ Image URL not accessible: ${imageResponse.status}`);
      process.exit(1);
    }
    
    const contentType = imageResponse.headers.get('content-type');
    const contentLength = imageResponse.headers.get('content-length');
    
    console.log('✅ Image accessible!');
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Size: ${(parseInt(contentLength || '0') / 1024).toFixed(2)} KB`);
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('\n✅ BYTEZ API is working correctly');
    console.log('✅ Model endpoint is valid');
    console.log('✅ Response format is correct');
    console.log('✅ Image URL is accessible');
    console.log('\n👉 You can now proceed with Phase 1 implementation\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nFull error:', error);
    console.log('\n⚠️  DO NOT PROCEED with implementation until this test passes!');
    process.exit(1);
  }
}

// Run test
testBYTEZAPI();
