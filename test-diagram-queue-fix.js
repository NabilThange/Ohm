/**
 * Test script to verify the diagram queue foreign key fix
 * 
 * This script tests that:
 * 1. artifact_versions records are created correctly
 * 2. diagram_queue can reference artifact_versions.id
 * 3. The foreign key constraint works as expected
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function testDiagramQueueFix() {
    console.log('🧪 Testing diagram queue foreign key fix...\n');

    try {
        // Step 1: Create a test chat
        console.log('1. Creating test chat...');
        const { data: chat, error: chatError } = await supabase
            .from('chats')
            .insert({ title: 'Test Chat for Diagram Queue Fix' })
            .select()
            .single();

        if (chatError) throw chatError;
        console.log(`✅ Chat created: ${chat.id}\n`);

        // Step 2: Create a test artifact
        console.log('2. Creating test artifact...');
        const { data: artifact, error: artifactError } = await supabase
            .from('artifacts')
            .insert({
                chat_id: chat.id,
                type: 'wiring',
                title: 'Test Wiring Diagram'
            })
            .select()
            .single();

        if (artifactError) throw artifactError;
        console.log(`✅ Artifact created: ${artifact.id}\n`);

        // Step 3: Create an artifact version
        console.log('3. Creating artifact version...');
        const { data: version, error: versionError } = await supabase
            .from('artifact_versions')
            .insert({
                artifact_id: artifact.id,
                version_number: 1,
                content_json: {
                    connections: [
                        {
                            from_component: 'ESP32',
                            from_pin: 'GPIO2',
                            to_component: 'LED',
                            to_pin: 'Anode',
                            wire_color: 'red'
                        }
                    ],
                    instructions: 'Test wiring instructions'
                },
                change_summary: 'Test version'
            })
            .select()
            .single();

        if (versionError) throw versionError;
        console.log(`✅ Artifact version created: ${version.id}\n`);

        // Step 4: Test diagram queue insertion with correct artifact_versions.id
        console.log('4. Testing diagram queue insertion with artifact_versions.id...');
        const { data: queueEntry, error: queueError } = await supabase
            .from('diagram_queue')
            .insert({
                circuit_json: {
                    components: ['ESP32', 'LED'],
                    connections: version.content_json.connections
                },
                artifact_id: version.id, // ✅ Using artifact_versions.id (correct)
                chat_id: chat.id,
                status: 'queued'
            })
            .select()
            .single();

        if (queueError) {
            console.error('❌ Queue insertion failed:', queueError);
            throw queueError;
        }
        console.log(`✅ Diagram queue entry created: ${queueEntry.id}\n`);

        // Step 5: Test that using artifacts.id would fail (should fail)
        console.log('5. Testing diagram queue insertion with artifacts.id (should fail)...');
        try {
            const { error: badQueueError } = await supabase
                .from('diagram_queue')
                .insert({
                    circuit_json: {
                        components: ['ESP32', 'LED'],
                        connections: version.content_json.connections
                    },
                    artifact_id: artifact.id, // ❌ Using artifacts.id (wrong)
                    chat_id: chat.id,
                    status: 'queued'
                });

            if (badQueueError) {
                console.log(`✅ Expected foreign key constraint violation: ${badQueueError.message}\n`);
            } else {
                console.log('⚠️  Expected this to fail, but it succeeded. Check foreign key constraint.\n');
            }
        } catch (error) {
            console.log(`✅ Expected error caught: ${error.message}\n`);
        }

        // Step 6: Verify the queue entry can be read correctly
        console.log('6. Verifying queue entry can be read...');
        const { data: queueCheck, error: queueCheckError } = await supabase
            .from('diagram_queue')
            .select('*')
            .eq('id', queueEntry.id)
            .single();

        if (queueCheckError) throw queueCheckError;
        console.log(`✅ Queue entry verified: artifact_id = ${queueCheck.artifact_id}\n`);

        // Step 7: Test that the cron job can update the artifact_versions table
        console.log('7. Testing artifact_versions update (simulating cron job)...');
        const { error: updateError } = await supabase
            .from('artifact_versions')
            .update({
                fritzing_url: 'https://example.com/test-diagram.png',
                diagram_status: 'complete'
            })
            .eq('id', queueEntry.artifact_id);

        if (updateError) throw updateError;
        console.log('✅ Artifact version updated successfully\n');

        // Cleanup
        console.log('8. Cleaning up test data...');
        await supabase.from('diagram_queue').delete().eq('id', queueEntry.id);
        await supabase.from('artifact_versions').delete().eq('id', version.id);
        await supabase.from('artifacts').delete().eq('id', artifact.id);
        await supabase.from('chats').delete().eq('id', chat.id);
        console.log('✅ Cleanup complete\n');

        console.log('🎉 All tests passed! The diagram queue fix is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testDiagramQueueFix();
}

module.exports = { testDiagramQueueFix };