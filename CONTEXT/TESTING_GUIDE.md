# Visual Wiring Diagram Testing Guide

## Prerequisites

Before testing, ensure the following are complete:

### 1. Environment Configuration

Add to `.env.local`:
```env
BYTEZ_API_KEY=your_bytez_api_key_here
```

Get your BYTEZ API key from: https://bytez.com

### 2. Supabase Storage

Create the `wiring-images` bucket in Supabase (see `CONTEXT/SUPABASE_STORAGE_SETUP.md`)

### 3. Test BYTEZ API Connection

Run the test script to verify your API key works:

```bash
node scripts/test-bytez-api.js
```

Expected output:
```
🧪 Testing BYTEZ API...
✅ API Response received
📦 Response structure:
{
  error: null,
  output: 'https://...'
}
✅ Image URL: https://image-endpoint.bytez.com/...
```

If you see errors, check:
- Your BYTEZ_API_KEY is correct
- You have API credits remaining
- Your network connection is working

## Test Plan

### Phase 8.1: Basic Functionality Test

**Objective**: Verify the complete visual wiring pipeline works end-to-end

**Steps**:

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Create New Chat**
   - Go to http://localhost:3000
   - Sign in with your account
   - Click "New Chat" or similar

3. **Request Simple Wiring Diagram**
   
   Enter this prompt:
   ```
   Create a wiring diagram for an Arduino Uno with:
   - 1 red LED on pin 13
   - 1 220Ω resistor
   - Connect LED anode to pin 13, cathode through resistor to GND
   ```

4. **Verify Table View (Immediate)**
   
   Within 1 second, you should see:
   - WiringDrawer opens
   - "Table" tab is active by default
   - Connection table showing:
     ```
     Component A | Pin A | Component B | Pin B
     Arduino Uno | 13    | LED Red     | Anode
     LED Red     | Cathode | Resistor  | Terminal 1
     Resistor    | Terminal 2 | Arduino Uno | GND
     ```
   - All data is accurate

5. **Verify SVG Schematic (1-2 seconds)**
   
   Click the "SVG Schematic" tab:
   - SVG circuit diagram appears
   - Components are laid out logically:
     - Power connections at top
     - Regular components in middle
     - Ground connections at bottom
   - Wires are color-coded
   - Legend shows wire mapping
   - Zoom controls work (+/- buttons)
   - Download button works

6. **Verify AI Breadboard (10-15 seconds)**
   
   Click the "Breadboard" tab:
   - Initially shows progress bar
   - Progress updates:
     - "Building prompt template..." (10%)
     - "Generating AI image..." (30%)
     - "Downloading image..." (90%)
     - "Complete!" (100%)
   - Tab automatically switches to breadboard when complete
   - Realistic breadboard photo appears showing:
     - Arduino Uno board
     - Red LED
     - Resistor
     - Jumper wires connecting components
     - Breadboard layout
   - Image is clear and resembles a real breadboard setup
   - Download button works

7. **Verify Supabase Storage**
   
   In Supabase Dashboard:
   - Navigate to Storage > wiring-images
   - Find folder with your chat ID
   - See `wiring-{timestamp}.png` file
   - Click to view - should show the same breadboard image
   - Copy public URL - should work in browser

**Expected Results**:
- ✅ All 3 views render without errors
- ✅ Table data is accurate
- ✅ SVG is properly formatted and downloadable
- ✅ AI image generates successfully within 15 seconds
- ✅ Image is stored in Supabase Storage
- ✅ No console errors
- ✅ UI is responsive and intuitive

### Phase 8.2: Error Handling Test

**Objective**: Verify graceful error handling

**Test 8.2.1: Invalid BYTEZ API Key**

1. Temporarily change BYTEZ_API_KEY in `.env.local` to invalid value
2. Restart dev server
3. Request wiring diagram
4. Check behavior:
   - Table view works ✅
   - SVG schematic works ✅
   - Breadboard tab shows error message ✅
   - Error message is helpful (e.g., "Failed to generate image: API authentication failed")
   - No crash or white screen
   - Console shows error but app continues working

**Test 8.2.2: Supabase Storage Bucket Missing**

1. Temporarily rename the bucket in Supabase (or delete it)
2. Request wiring diagram
3. Check behavior:
   - Table view works ✅
   - SVG schematic works ✅
   - AI image generates but upload fails
   - Breadboard tab shows error: "Failed to upload image to storage"
   - No crash

**Test 8.2.3: Network Timeout**

This is harder to test manually, but verify the code has retry logic:
- Check `lib/diagram/image-generator.ts` has `maxRetries: 3`
- Confirm exponential backoff delays: 2s, 4s, 8s
- Non-retriable errors (400, 401, 403) don't retry

### Phase 8.3: Complex Wiring Test

**Objective**: Test with more complex circuits

**Test Circuit: Arduino with Multiple Components**

Prompt:
```
Create a wiring diagram for:
- Arduino Uno
- DHT22 temperature sensor (data pin to Arduino D2, power to 5V, ground to GND)
- OLED display (SDA to A4, SCL to A5, VCC to 5V, GND to GND)
- Push button (one side to D3, other to GND with 10kΩ pullup resistor to 5V)
- Buzzer (positive to D8, negative to GND)
```

Verify:
- Table shows all connections (should be ~15 rows)
- SVG is more complex but still readable
- Power rails (5V, GND) are clearly distinguished
- AI breadboard image shows all components in logical arrangement
- No overlapping wires or components in AI image

### Phase 8.4: Multiple Diagrams Test

**Objective**: Verify multiple diagrams in same chat

**Steps**:

1. Request first wiring diagram (simple LED circuit)
2. Wait for completion
3. Request second wiring diagram (different circuit, e.g., servo motor)
4. Verify:
   - First diagram remains accessible in sidebar
   - Second diagram generates successfully
   - Both diagrams are independent
   - Both have separate entries in Supabase Storage

### Phase 8.5: Realtime Updates Test

**Objective**: Verify Supabase realtime subscriptions work

**Steps**:

1. Open chat in two browser tabs/windows
2. In Tab 1: Request wiring diagram
3. In Tab 2: Watch the WiringDrawer
4. Verify:
   - Tab 2 automatically updates when table data arrives
   - Tab 2 automatically updates when SVG generates
   - Tab 2 automatically updates when AI image completes
   - No need to refresh page

### Phase 8.6: Edge Cases

**Test 8.6.1: Very Simple Circuit**

Prompt: "Connect an LED directly to Arduino pin 13 (no resistor)"

Verify:
- Still generates all 3 views
- SVG is simple but correct
- AI image shows the simple setup

**Test 8.6.2: Large Circuit**

Prompt: "Create a wiring diagram for Arduino with 8 LEDs on pins 2-9, each with 220Ω resistor"

Verify:
- Table shows all 16+ connections
- SVG is crowded but uses layout algorithm to minimize overlaps
- AI image may take slightly longer (up to 20 seconds)
- Image resolution is sufficient to see all components

**Test 8.6.3: Component Without Pins**

Prompt: "Add a battery pack to power the Arduino"

Verify:
- Handles components with generic connections (not specific pins)
- Gracefully represents in all 3 views

## Performance Benchmarks

Expected timings:

| Operation | Target Time | Acceptable Range |
|-----------|-------------|------------------|
| Table view render | < 1 second | 0.5s - 2s |
| SVG generation | < 2 seconds | 1s - 3s |
| AI image generation | 10-15 seconds | 8s - 25s |
| Total end-to-end | < 20 seconds | 15s - 30s |

If times exceed acceptable range:
- Check BYTEZ API status
- Verify network connection
- Check Supabase performance
- Monitor CPU/memory usage

## Regression Testing

After future updates to the codebase, re-run this checklist:

- [ ] Table view renders correctly
- [ ] SVG schematic generates
- [ ] AI breadboard image generates
- [ ] Download buttons work
- [ ] Zoom controls work
- [ ] Realtime updates work
- [ ] Error handling works
- [ ] Multiple diagrams in one chat work
- [ ] Supabase Storage stores images
- [ ] No console errors or warnings

## Known Limitations

Document these as "expected behavior":

1. **AI Image Quality**: Sometimes the AI-generated breadboard may have minor inaccuracies (e.g., wire colors don't perfectly match, slight component placement variations). This is inherent to generative AI.

2. **Generation Time**: AI image generation takes 10-15 seconds. This is expected and cannot be significantly reduced without changing the underlying model.

3. **Component Recognition**: The AI model works best with common components (Arduino, Raspberry Pi, LEDs, resistors). Exotic or custom components may not render as expected.

4. **Breadboard Realism**: The AI generates a "realistic photo" but it may not always perfectly match how you would physically wire it. The SVG schematic is the source of truth.

5. **Rate Limits**: BYTEZ API has rate limits. If you generate many diagrams rapidly, you may hit limits and need to wait.

## Troubleshooting

### Issue: "Generating..." stuck forever

**Possible causes**:
- BYTEZ API key invalid → Check API test script
- Network connectivity issues → Check internet connection
- BYTEZ API service down → Check https://status.bytez.com

**Solutions**:
- Refresh page and try again
- Check browser console for errors
- Verify BYTEZ_API_KEY in `.env.local`

### Issue: SVG looks weird or overlapping

**Possible causes**:
- Complex circuit exceeds layout algorithm capabilities
- Unusual component configurations

**Solutions**:
- This is expected for very complex circuits
- User can still download and manually adjust in vector editor
- Refer to Table view for accurate connection info

### Issue: AI image doesn't match circuit

**Possible causes**:
- Generative AI hallucination
- Prompt ambiguity
- Model limitations

**Solutions**:
- Regenerate the diagram (delete and request again)
- Simplify the circuit
- Refer to SVG schematic and Table view as source of truth
- Consider this a "visual suggestion" not a precise blueprint

### Issue: Images not appearing after generation

**Possible causes**:
- Supabase Storage bucket not created
- Bucket policies incorrect (not public)
- Supabase Storage quota exceeded

**Solutions**:
- Verify bucket exists and is public
- Check Supabase Storage dashboard for errors
- Review `CONTEXT/SUPABASE_STORAGE_SETUP.md`

## Success Criteria

The feature is considered fully working when:

1. ✅ User can request a wiring diagram via chat
2. ✅ Table view appears immediately with accurate data
3. ✅ SVG schematic generates within 3 seconds
4. ✅ AI breadboard image generates within 20 seconds
5. ✅ All views are visually correct and match the requested circuit
6. ✅ Download buttons work for SVG and images
7. ✅ Zoom controls work on SVG
8. ✅ Progress indicators show accurate status
9. ✅ Errors are handled gracefully without crashes
10. ✅ Multiple diagrams in same chat work independently
11. ✅ Realtime updates work across browser tabs
12. ✅ Images are stored in Supabase Storage with public URLs

## Next Steps After Testing

Once all tests pass:

1. **User Documentation**
   - Add feature description to README.md
   - Create user-facing guide: "How to Generate Wiring Diagrams"
   - Add screenshots/GIFs to documentation

2. **Code Cleanup** (if needed)
   - Remove console.log statements
   - Add JSDoc comments to exported functions
   - Ensure all error messages are user-friendly

3. **Performance Optimization** (optional)
   - Consider caching prompt templates
   - Explore image compression for smaller storage
   - Add prefetching for faster perceived performance

4. **Feature Enhancements** (future)
   - Allow regenerating AI image without changing wiring
   - Add "edit" mode to modify wiring visually
   - Support exporting to Fritzing format
   - Add annotation tools for SVG diagrams

## Test Log Template

Use this template to record test results:

```
Test Date: [DATE]
Tester: [NAME]
Environment: [dev/staging/production]
BYTEZ API Key Status: [valid/invalid]
Supabase Storage Status: [configured/not configured]

Phase 8.1 - Basic Functionality: [PASS/FAIL]
  - Table view: [PASS/FAIL] - Notes: ___
  - SVG schematic: [PASS/FAIL] - Notes: ___
  - AI breadboard: [PASS/FAIL] - Notes: ___
  - Storage upload: [PASS/FAIL] - Notes: ___

Phase 8.2 - Error Handling: [PASS/FAIL]
  - Invalid API key: [PASS/FAIL] - Notes: ___
  - Missing bucket: [PASS/FAIL] - Notes: ___
  - Network timeout: [PASS/FAIL] - Notes: ___

Phase 8.3 - Complex Wiring: [PASS/FAIL]
  - Notes: ___

Phase 8.4 - Multiple Diagrams: [PASS/FAIL]
  - Notes: ___

Phase 8.5 - Realtime Updates: [PASS/FAIL]
  - Notes: ___

Phase 8.6 - Edge Cases: [PASS/FAIL]
  - Simple circuit: [PASS/FAIL]
  - Large circuit: [PASS/FAIL]
  - Component without pins: [PASS/FAIL]

Overall Result: [PASS/FAIL]
Issues Found: [LIST]
Follow-up Actions: [LIST]
```

---

**Ready to Test!** Follow this guide systematically to ensure the visual wiring diagram feature works perfectly.
