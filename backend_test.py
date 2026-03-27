#!/usr/bin/env python3
"""
Backend API Testing for Alaxico Medical Equipment E-commerce App
Testing Cloudinary image upload integration and existing endpoints
"""

import requests
import json
import os
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://init-point.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def test_cloudinary_signature_endpoint():
    """Test GET /api/cloudinary/signature endpoint"""
    print_test_header("Cloudinary Signature Endpoint")
    
    try:
        # Test 1: Default parameters (image, alaxico/products)
        print_info("Testing default parameters...")
        response = requests.get(f"{API_BASE}/cloudinary/signature")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["signature", "timestamp", "cloud_name", "api_key", "folder", "resource_type"]
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                print_error(f"Missing required fields: {missing_fields}")
                return False
            
            # Verify cloud_name
            if data["cloud_name"] != "de6hn1eu1":
                print_error(f"Expected cloud_name 'de6hn1eu1', got '{data['cloud_name']}'")
                return False
            
            # Verify default folder
            if data["folder"] != "alaxico/products":
                print_error(f"Expected default folder 'alaxico/products', got '{data['folder']}'")
                return False
            
            # Verify default resource_type
            if data["resource_type"] != "image":
                print_error(f"Expected default resource_type 'image', got '{data['resource_type']}'")
                return False
            
            # Verify API key is present
            if not data["api_key"]:
                print_error("API key is empty")
                return False
            
            print_success("Default parameters test passed")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            
        else:
            print_error(f"Request failed with status {response.status_code}: {response.text}")
            return False
        
        # Test 2: Different resource_type (video)
        print_info("Testing with resource_type=video...")
        response = requests.get(f"{API_BASE}/cloudinary/signature?resource_type=video")
        
        if response.status_code == 200:
            data = response.json()
            if data["resource_type"] != "video":
                print_error(f"Expected resource_type 'video', got '{data['resource_type']}'")
                return False
            print_success("Video resource_type test passed")
        else:
            print_error(f"Video resource_type test failed: {response.status_code}")
            return False
        
        # Test 3: Different folder
        print_info("Testing with different folder...")
        response = requests.get(f"{API_BASE}/cloudinary/signature?folder=alaxico/reviews")
        
        if response.status_code == 200:
            data = response.json()
            if data["folder"] != "alaxico/reviews":
                print_error(f"Expected folder 'alaxico/reviews', got '{data['folder']}'")
                return False
            print_success("Different folder test passed")
        else:
            print_error(f"Different folder test failed: {response.status_code}")
            return False
        
        # Test 4: Invalid folder (should fail)
        print_info("Testing with invalid folder...")
        response = requests.get(f"{API_BASE}/cloudinary/signature?folder=invalid/folder")
        
        if response.status_code == 400:
            print_success("Invalid folder correctly rejected")
        else:
            print_warning(f"Expected 400 for invalid folder, got {response.status_code}")
        
        # Test 5: Combined parameters
        print_info("Testing combined parameters...")
        response = requests.get(f"{API_BASE}/cloudinary/signature?resource_type=video&folder=alaxico/users")
        
        if response.status_code == 200:
            data = response.json()
            if data["resource_type"] == "video" and data["folder"] == "alaxico/users":
                print_success("Combined parameters test passed")
            else:
                print_error("Combined parameters not set correctly")
                return False
        else:
            print_error(f"Combined parameters test failed: {response.status_code}")
            return False
        
        return True
        
    except requests.exceptions.RequestException as e:
        print_error(f"Network error: {e}")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

def test_existing_endpoints():
    """Test existing endpoints to ensure they still work"""
    print_test_header("Existing Endpoints")
    
    success_count = 0
    total_tests = 2
    
    try:
        # Test 1: GET /api/products
        print_info("Testing GET /api/products...")
        response = requests.get(f"{API_BASE}/products")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_success(f"Products endpoint working - returned {len(data)} products")
                success_count += 1
            else:
                print_error("Products endpoint returned non-list data")
        else:
            print_error(f"Products endpoint failed: {response.status_code}")
        
        # Test 2: GET /api/categories
        print_info("Testing GET /api/categories...")
        response = requests.get(f"{API_BASE}/categories")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print_success(f"Categories endpoint working - returned {len(data)} categories")
                success_count += 1
            else:
                print_error("Categories endpoint returned non-list data")
        else:
            print_error(f"Categories endpoint failed: {response.status_code}")
        
        return success_count == total_tests
        
    except requests.exceptions.RequestException as e:
        print_error(f"Network error: {e}")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

def test_cloudinary_configuration():
    """Test Cloudinary configuration values"""
    print_test_header("Cloudinary Configuration")
    
    try:
        response = requests.get(f"{API_BASE}/cloudinary/signature")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check cloud_name
            expected_cloud_name = "de6hn1eu1"
            if data.get("cloud_name") == expected_cloud_name:
                print_success(f"Cloud name correct: {expected_cloud_name}")
            else:
                print_error(f"Expected cloud_name '{expected_cloud_name}', got '{data.get('cloud_name')}'")
                return False
            
            # Check API key is present (don't log the actual key)
            if data.get("api_key"):
                print_success("API key is present")
            else:
                print_error("API key is missing")
                return False
            
            # Check signature is generated
            if data.get("signature"):
                print_success("Signature is generated")
            else:
                print_error("Signature is missing")
                return False
            
            # Check timestamp is present and recent
            if data.get("timestamp"):
                timestamp = data.get("timestamp")
                current_time = datetime.now().timestamp()
                if abs(current_time - timestamp) < 60:  # Within 1 minute
                    print_success("Timestamp is recent")
                else:
                    print_warning("Timestamp seems old")
            else:
                print_error("Timestamp is missing")
                return False
            
            return True
        else:
            print_error(f"Failed to get signature: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Configuration test error: {e}")
        return False

def check_backend_logs():
    """Check backend logs for any errors"""
    print_test_header("Backend Logs Check")
    
    try:
        import subprocess
        result = subprocess.run(
            ["tail", "-n", "50", "/var/log/supervisor/backend.err.log"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            error_logs = result.stdout.strip()
            if error_logs:
                print_warning("Found error logs:")
                print(error_logs)
                return False
            else:
                print_success("No recent error logs found")
                return True
        else:
            print_info("Could not read error logs (file may not exist)")
            return True
            
    except subprocess.TimeoutExpired:
        print_warning("Log check timed out")
        return True
    except Exception as e:
        print_info(f"Could not check logs: {e}")
        return True

def main():
    """Run all tests"""
    print(f"{Colors.BOLD}Alaxico Backend API Testing{Colors.ENDC}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Testing started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = []
    
    # Test Cloudinary signature endpoint
    test_results.append(("Cloudinary Signature Endpoint", test_cloudinary_signature_endpoint()))
    
    # Test Cloudinary configuration
    test_results.append(("Cloudinary Configuration", test_cloudinary_configuration()))
    
    # Test existing endpoints
    test_results.append(("Existing Endpoints", test_existing_endpoints()))
    
    # Check backend logs
    test_results.append(("Backend Logs", check_backend_logs()))
    
    # Print summary
    print_test_header("Test Summary")
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        if result:
            print_success(f"{test_name}: PASSED")
            passed += 1
        else:
            print_error(f"{test_name}: FAILED")
            failed += 1
    
    print(f"\n{Colors.BOLD}Overall Results:{Colors.ENDC}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.ENDC}")
    print(f"{Colors.RED}Failed: {failed}{Colors.ENDC}")
    print(f"{Colors.BLUE}Total: {passed + failed}{Colors.ENDC}")
    
    if failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All tests passed! Cloudinary integration is working correctly.{Colors.ENDC}")
        return True
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ {failed} test(s) failed. Please check the issues above.{Colors.ENDC}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)