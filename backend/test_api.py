import requests
import json

# Test the API endpoints
BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print("Health Check:", response.json())
    return response.status_code == 200

def test_entity_types():
    """Test the entity types endpoint"""
    response = requests.get(f"{BASE_URL}/entity-types")
    print("Entity Types:", response.json())
    return response.status_code == 200

def test_extract_entities():
    """Test the entity extraction endpoint"""
    test_text = """
    RESIDENTIAL LEASE AGREEMENT
    
    This Lease Agreement ("Agreement") is entered into on May 26, 2025, by and between:
    
    LESSOR: Ashley Martinez ("Landlord")
    LESSEE: Sarah Williams ("Tenant")
    
    PROPERTY: The Landlord hereby leases to the Tenant the residential property located at:
    5316 Pine Rd, Franklin, CA 70457
    
    1. TERM OF LEASE
    The term of this lease shall commence on May 26, 2025 and shall terminate on May 26, 2026.
    
    2. RENT
    The Tenant agrees to pay the Landlord a monthly rent of $1038.
    
    3. SECURITY DEPOSIT
    Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of $1245 as a security deposit.
    """
    
    payload = {"text": test_text}
    response = requests.post(f"{BASE_URL}/extract-entities", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print("Extracted Entities:")
        for entity in result["entities"]:
            print(f"  - {entity['text']} ({entity['label']}) at positions {entity['start']}-{entity['end']}")
        return True
    else:
        print("Error:", response.text)
        return False

if __name__ == "__main__":
    print("Testing Lease Buddy NER API...")
    
    # Test health endpoint
    if test_health():
        print("✓ Health check passed")
    else:
        print("✗ Health check failed")
    
    # Test entity types endpoint
    if test_entity_types():
        print("✓ Entity types endpoint working")
    else:
        print("✗ Entity types endpoint failed")
    
    # Test entity extraction
    if test_extract_entities():
        print("✓ Entity extraction working")
    else:
        print("✗ Entity extraction failed") 