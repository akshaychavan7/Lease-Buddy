// Test script to verify frontend-backend integration
const fs = require('fs');
const path = require('path');

async function testIntegration() {
  console.log('🧪 Testing Frontend-Backend Integration...\n');

  // Test 1: Backend Health Check
  console.log('1. Testing Backend Health...');
  try {
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthData = await healthResponse.json();
    console.log(' Backend Health:', healthData);
  } catch (error) {
    console.log('❌ Backend Health Check Failed:', error.message);
    return;
  }

  // Test 2: Entity Types
  console.log('\n2. Testing Entity Types...');
  try {
    const entityTypesResponse = await fetch('http://localhost:8000/entity-types');
    const entityTypesData = await entityTypesResponse.json();
    console.log(' Entity Types:', entityTypesData.entity_types);
  } catch (error) {
    console.log('❌ Entity Types Check Failed:', error.message);
  }

  // Test 3: NER Extraction
  console.log('\n3. Testing NER Extraction...');
  try {
    const testText = `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into on May 26, 2025, by and between:

LESSOR: Ashley Martinez ("Landlord")
LESSEE: Sarah Williams ("Tenant")

PROPERTY: The Landlord hereby leases to the Tenant the residential property located at:
5316 Pine Rd, Franklin, CA 70457

The term of this lease shall commence on May 26, 2025 and shall terminate on May 26, 2026.

The Tenant agrees to pay the Landlord a monthly rent of $1038.

Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of $1245 as a security deposit.`;

    const nerResponse = await fetch('http://localhost:8000/extract-entities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: testText }),
    });

    const nerData = await nerResponse.json();
    console.log(' NER Extraction Results:');
    nerData.entities.forEach(entity => {
      console.log(`   - ${entity.text} (${entity.label})`);
    });
  } catch (error) {
    console.log('❌ NER Extraction Failed:', error.message);
  }

  // Test 4: Frontend Upload API
  console.log('\n4. Testing Frontend Upload API...');
  try {
    const testFile = fs.readFileSync(path.join(__dirname, 'test_lease.txt'));
    const formData = new FormData();
    formData.append('file', new Blob([testFile], { type: 'text/plain' }), 'test_lease.txt');

    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const uploadData = await uploadResponse.json();
    console.log(' Upload API Response:', uploadData.success);
    if (uploadData.entities) {
      console.log('   Extracted Entities:');
      Object.entries(uploadData.entities).forEach(([type, values]) => {
        if (values.length > 0) {
          console.log(`   - ${type}: ${values.join(', ')}`);
        }
      });
    }
  } catch (error) {
    console.log('❌ Frontend Upload API Failed:', error.message);
  }

  console.log('\n🎉 Integration Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Upload the test_lease.txt file');
  console.log('3. Verify that entities are extracted correctly');
  console.log('4. Test the chat functionality with the extracted entities');
}

// Run the test
testIntegration().catch(console.error); 