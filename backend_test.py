#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class MedEquipMartAPITester:
    def __init__(self, base_url="https://medshop-alaxico.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add auth token if available
        token = self.admin_token if use_admin and self.admin_token else self.token
        if token:
            test_headers['Authorization'] = f'Bearer {token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_config_endpoint(self):
        """Test config endpoint"""
        success, response = self.run_test(
            "Get Config",
            "GET",
            "config",
            200
        )
        if success:
            required_keys = ['razorpay_key_id', 'whatsapp_number']
            for key in required_keys:
                if key not in response:
                    self.log_test(f"Config - {key} present", False, f"Missing {key}")
                else:
                    self.log_test(f"Config - {key} present", True, f"Value: {response[key]}")
        return success

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@example.com",
            "password": "testpass123",
            "phone": "9876543210"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.log_test("Registration Token Received", True, "Token stored")
        
        return success

    def test_user_login(self):
        """Test user login with provided credentials"""
        login_data = {
            "email": "hospital@example.com",
            "password": "demo123"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            self.log_test("Login Token Received", True, "Token stored")
        
        return success

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@medequipmart.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_id = response['user']['id']
            self.log_test("Admin Token Received", True, "Admin token stored")
        
        return success

    def test_get_current_user(self):
        """Test get current user"""
        if not self.token:
            self.log_test("Get Current User", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_products_endpoints(self):
        """Test product-related endpoints"""
        # Get all products
        success1, products = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        
        # Get categories
        success2, categories = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        
        # Test product search
        success3, search_results = self.run_test(
            "Search Products",
            "GET",
            "products?search=equipment",
            200
        )
        
        # Test category filter
        if success2 and categories:
            category = categories[0] if categories else "Diagnostic Equipment"
            success4, filtered = self.run_test(
                "Filter Products by Category",
                "GET",
                f"products?category={category}",
                200
            )
        else:
            success4 = False
        
        # Test individual product
        if success1 and products:
            product_id = products[0]['id'] if products else None
            if product_id:
                success5, product = self.run_test(
                    "Get Single Product",
                    "GET",
                    f"products/{product_id}",
                    200
                )
            else:
                success5 = False
        else:
            success5 = False
        
        return all([success1, success2, success3, success4, success5])

    def test_cart_operations(self):
        """Test cart operations"""
        if not self.token:
            self.log_test("Cart Operations", False, "No user token")
            return False
        
        # Get empty cart
        success1, cart = self.run_test(
            "Get Empty Cart",
            "GET",
            "cart",
            200
        )
        
        # Get a product to add to cart
        success_prod, products = self.run_test(
            "Get Products for Cart Test",
            "GET",
            "products",
            200
        )
        
        if not success_prod or not products:
            self.log_test("Cart Operations", False, "No products available")
            return False
        
        product_id = products[0]['id']
        
        # Add to cart
        success2, _ = self.run_test(
            "Add to Cart",
            "POST",
            "cart/add",
            200,
            data={"product_id": product_id, "quantity": 2}
        )
        
        # Get cart with items
        success3, cart_with_items = self.run_test(
            "Get Cart with Items",
            "GET",
            "cart",
            200
        )
        
        # Update cart
        success4, _ = self.run_test(
            "Update Cart Quantity",
            "PUT",
            "cart/update",
            200,
            data={"product_id": product_id, "quantity": 3}
        )
        
        # Remove from cart
        success5, _ = self.run_test(
            "Remove from Cart",
            "DELETE",
            f"cart/remove/{product_id}",
            200
        )
        
        return all([success1, success2, success3, success4, success5])

    def test_bulk_enquiry(self):
        """Test bulk enquiry functionality"""
        if not self.token:
            self.log_test("Bulk Enquiry", False, "No user token")
            return False
        
        # Get a product for enquiry
        success_prod, products = self.run_test(
            "Get Products for Enquiry",
            "GET",
            "products",
            200
        )
        
        if not success_prod or not products:
            self.log_test("Bulk Enquiry", False, "No products available")
            return False
        
        product_id = products[0]['id']
        
        # Create bulk enquiry
        enquiry_data = {
            "product_id": product_id,
            "buyer_type": "Hospital",
            "quantity": 10,
            "organization_name": "Test Hospital",
            "contact_details": {
                "name": "Test Contact",
                "phone": "9876543210",
                "email": "test@hospital.com"
            },
            "message": "Test bulk enquiry"
        }
        
        success1, _ = self.run_test(
            "Create Bulk Enquiry",
            "POST",
            "bulk-enquiries",
            200,
            data=enquiry_data
        )
        
        # Get user's enquiries
        success2, _ = self.run_test(
            "Get My Enquiries",
            "GET",
            "bulk-enquiries/my-enquiries",
            200
        )
        
        return success1 and success2

    def test_reviews(self):
        """Test review functionality"""
        if not self.token:
            self.log_test("Reviews", False, "No user token")
            return False
        
        # Get products
        success_prod, products = self.run_test(
            "Get Products for Review",
            "GET",
            "products",
            200
        )
        
        if not success_prod or not products:
            self.log_test("Reviews", False, "No products available")
            return False
        
        product_id = products[0]['id']
        
        # Create review
        review_data = {
            "product_id": product_id,
            "rating": 5,
            "comment": "Excellent product quality!"
        }
        
        success1, _ = self.run_test(
            "Create Review",
            "POST",
            "reviews",
            200,
            data=review_data
        )
        
        # Get product reviews
        success2, _ = self.run_test(
            "Get Product Reviews",
            "GET",
            f"reviews/product/{product_id}",
            200
        )
        
        # Get featured reviews
        success3, _ = self.run_test(
            "Get Featured Reviews",
            "GET",
            "reviews/featured",
            200
        )
        
        return all([success1, success2, success3])

    def test_verification(self):
        """Test verification functionality"""
        if not self.token:
            self.log_test("Verification", False, "No user token")
            return False
        
        # Get verification status
        success1, _ = self.run_test(
            "Get Verification Status",
            "GET",
            "verification/status",
            200
        )
        
        # Submit verification request
        verification_data = {
            "buyer_type": "Hospital",
            "organization_name": "Test Medical Center",
            "documents": {
                "info": "Medical License: ML123456"
            }
        }
        
        success2, _ = self.run_test(
            "Submit Verification",
            "POST",
            "verification/submit",
            200,
            data=verification_data
        )
        
        return success1 and success2

    def test_orders(self):
        """Test order creation (without payment)"""
        if not self.token:
            self.log_test("Orders", False, "No user token")
            return False
        
        # Get user's orders
        success1, _ = self.run_test(
            "Get My Orders",
            "GET",
            "orders/my-orders",
            200
        )
        
        # Test order creation (will fail without proper cart but should return proper error)
        order_data = {
            "items": [
                {
                    "product_id": "test-id",
                    "product_name": "Test Product",
                    "quantity": 1,
                    "price": 1000
                }
            ],
            "total_amount": 1000,
            "delivery_address": {
                "street": "Test Street",
                "city": "Test City",
                "state": "Test State",
                "pincode": "123456",
                "phone": "9876543210"
            }
        }
        
        # This might fail but we test the endpoint
        success2, _ = self.run_test(
            "Create Razorpay Order",
            "POST",
            "orders/create-razorpay-order",
            200,
            data=order_data
        )
        
        return success1  # Only count the successful get orders

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        if not self.admin_token:
            self.log_test("Admin Endpoints", False, "No admin token")
            return False
        
        # Get all orders (admin)
        success1, _ = self.run_test(
            "Admin - Get All Orders",
            "GET",
            "admin/orders",
            200,
            use_admin=True
        )
        
        # Get all bulk enquiries (admin)
        success2, _ = self.run_test(
            "Admin - Get All Bulk Enquiries",
            "GET",
            "admin/bulk-enquiries",
            200,
            use_admin=True
        )
        
        # Get all reviews (admin)
        success3, _ = self.run_test(
            "Admin - Get All Reviews",
            "GET",
            "admin/reviews",
            200,
            use_admin=True
        )
        
        # Get all verifications (admin)
        success4, _ = self.run_test(
            "Admin - Get All Verifications",
            "GET",
            "admin/verifications",
            200,
            use_admin=True
        )
        
        return all([success1, success2, success3, success4])

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting MedEquipMart API Tests...")
        print("=" * 50)
        
        # Basic endpoints
        self.test_config_endpoint()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_admin_login()
        self.test_get_current_user()
        
        # Product tests
        self.test_products_endpoints()
        
        # Cart tests
        self.test_cart_operations()
        
        # Feature tests
        self.test_bulk_enquiry()
        self.test_reviews()
        self.test_verification()
        self.test_orders()
        
        # Admin tests
        self.test_admin_endpoints()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

def main():
    tester = MedEquipMartAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())