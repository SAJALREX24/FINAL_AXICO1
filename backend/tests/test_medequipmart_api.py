"""
MedEquipMart API Tests
Tests for: Authentication, Products, Cart, Bulk Enquiries, Admin functionality
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@medequipmart.com"
ADMIN_PASSWORD = "admin123"
USER_EMAIL = "hospital@example.com"
USER_PASSWORD = "demo123"


class TestHealthAndConfig:
    """Basic health and config endpoint tests"""
    
    def test_config_endpoint(self):
        """Test config endpoint returns razorpay and whatsapp info"""
        response = requests.get(f"{BASE_URL}/api/config")
        assert response.status_code == 200
        data = response.json()
        assert "razorpay_key_id" in data
        assert "whatsapp_number" in data
        assert data["whatsapp_number"] == "+919045660485"
    
    def test_categories_endpoint(self):
        """Test categories endpoint returns list"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "Diagnostic Equipment" in data


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
    
    def test_user_login_success(self):
        """Test hospital user login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "user"
        assert data["user"]["email"] == USER_EMAIL
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_auth_me_with_token(self):
        """Test /auth/me endpoint with valid token"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Then get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == USER_EMAIL
    
    def test_auth_me_without_token(self):
        """Test /auth/me endpoint without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 403


class TestProducts:
    """Product CRUD tests"""
    
    def test_get_all_products(self):
        """Test getting all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify product structure
        product = data[0]
        assert "id" in product
        assert "name" in product
        assert "price" in product
        assert "category" in product
    
    def test_get_products_by_category(self):
        """Test filtering products by category"""
        response = requests.get(f"{BASE_URL}/api/products?category=Diagnostic Equipment")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for product in data:
            assert product["category"] == "Diagnostic Equipment"
    
    def test_get_products_by_search(self):
        """Test searching products by name"""
        response = requests.get(f"{BASE_URL}/api/products?search=Blood")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_single_product(self):
        """Test getting a single product by ID"""
        # First get all products
        products_response = requests.get(f"{BASE_URL}/api/products")
        products = products_response.json()
        product_id = products[0]["id"]
        
        # Then get single product
        response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == product_id
    
    def test_get_nonexistent_product(self):
        """Test getting a non-existent product returns 404"""
        response = requests.get(f"{BASE_URL}/api/products/nonexistent-id")
        assert response.status_code == 404


class TestAdminProducts:
    """Admin product management tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_admin_create_product(self, admin_token):
        """Test admin can create a new product"""
        test_product = {
            "name": f"TEST_Product_{uuid.uuid4().hex[:8]}",
            "description": "Test product description for automated testing",
            "category": "Diagnostic Equipment",
            "price": 9999.99,
            "image": "https://example.com/test-image.jpg",
            "availability": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/products",
            json=test_product,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_product["name"]
        assert data["price"] == test_product["price"]
        assert "id" in data
        
        # Verify product was created by fetching it
        product_id = data["id"]
        get_response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert get_response.status_code == 200
        assert get_response.json()["name"] == test_product["name"]
        
        # Cleanup - delete the test product
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
    
    def test_admin_delete_product(self, admin_token):
        """Test admin can delete a product"""
        # First create a product
        test_product = {
            "name": f"TEST_DeleteProduct_{uuid.uuid4().hex[:8]}",
            "description": "Product to be deleted",
            "category": "Hospital Furniture",
            "price": 1000,
            "image": "https://example.com/delete-test.jpg",
            "availability": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/products",
            json=test_product,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        product_id = create_response.json()["id"]
        
        # Delete the product
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
        
        # Verify product is deleted
        get_response = requests.get(f"{BASE_URL}/api/products/{product_id}")
        assert get_response.status_code == 404
    
    def test_non_admin_cannot_create_product(self):
        """Test non-admin user cannot create products"""
        # Login as regular user
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        user_token = login_response.json()["token"]
        
        test_product = {
            "name": "Unauthorized Product",
            "description": "Should not be created",
            "category": "Diagnostic Equipment",
            "price": 100,
            "image": "https://example.com/test.jpg",
            "availability": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/products",
            json=test_product,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403


class TestCart:
    """Cart functionality tests"""
    
    @pytest.fixture
    def user_token(self):
        """Get user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def product_id(self):
        """Get a valid product ID"""
        response = requests.get(f"{BASE_URL}/api/products")
        return response.json()[0]["id"]
    
    def test_add_to_cart(self, user_token, product_id):
        """Test adding item to cart"""
        response = requests.post(
            f"{BASE_URL}/api/cart/add",
            json={"product_id": product_id, "quantity": 2},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Item added to cart"
    
    def test_get_cart(self, user_token):
        """Test getting cart contents"""
        response = requests.get(
            f"{BASE_URL}/api/cart",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
    
    def test_update_cart(self, user_token, product_id):
        """Test updating cart item quantity"""
        # First add to cart
        requests.post(
            f"{BASE_URL}/api/cart/add",
            json={"product_id": product_id, "quantity": 1},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        # Update quantity
        response = requests.put(
            f"{BASE_URL}/api/cart/update",
            json={"product_id": product_id, "quantity": 5},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
    
    def test_remove_from_cart(self, user_token, product_id):
        """Test removing item from cart"""
        # First add to cart
        requests.post(
            f"{BASE_URL}/api/cart/add",
            json={"product_id": product_id, "quantity": 1},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        # Remove from cart
        response = requests.delete(
            f"{BASE_URL}/api/cart/remove/{product_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
    
    def test_cart_requires_auth(self):
        """Test cart endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/cart")
        assert response.status_code == 403


class TestBulkEnquiries:
    """Bulk enquiry tests"""
    
    @pytest.fixture
    def user_token(self):
        """Get user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def product_id(self):
        """Get a valid product ID"""
        response = requests.get(f"{BASE_URL}/api/products")
        return response.json()[0]["id"]
    
    def test_create_bulk_enquiry(self, user_token, product_id):
        """Test creating a bulk enquiry"""
        enquiry_data = {
            "product_id": product_id,
            "buyer_type": "Hospital",
            "quantity": 50,
            "organization_name": "TEST_Hospital_Enquiry",
            "contact_details": {
                "name": "Test Contact",
                "phone": "+919876543210",
                "email": "test@hospital.com"
            },
            "message": "Automated test enquiry"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bulk-enquiries",
            json=enquiry_data,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["organization_name"] == "TEST_Hospital_Enquiry"
        assert data["quantity"] == 50
        assert "id" in data
    
    def test_get_my_enquiries(self, user_token):
        """Test getting user's own enquiries"""
        response = requests.get(
            f"{BASE_URL}/api/bulk-enquiries/my-enquiries",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_admin_get_all_enquiries(self, admin_token):
        """Test admin can get all bulk enquiries"""
        response = requests.get(
            f"{BASE_URL}/api/admin/bulk-enquiries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_admin_update_enquiry_status(self, admin_token, user_token, product_id):
        """Test admin can update enquiry status"""
        # First create an enquiry
        enquiry_data = {
            "product_id": product_id,
            "buyer_type": "Clinic",
            "quantity": 10,
            "organization_name": "TEST_StatusUpdate_Clinic",
            "contact_details": {
                "name": "Status Test",
                "phone": "+919876543210",
                "email": "status@test.com"
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/bulk-enquiries",
            json=enquiry_data,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        enquiry_id = create_response.json()["id"]
        
        # Update status as admin
        update_response = requests.put(
            f"{BASE_URL}/api/admin/bulk-enquiries/{enquiry_id}",
            json={"status": "processing"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert update_response.status_code == 200


class TestAdminEndpoints:
    """Admin-only endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_admin_get_orders(self, admin_token):
        """Test admin can get all orders"""
        response = requests.get(
            f"{BASE_URL}/api/admin/orders",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_admin_get_reviews(self, admin_token):
        """Test admin can get all reviews"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reviews",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_admin_get_verifications(self, admin_token):
        """Test admin can get all verification requests"""
        response = requests.get(
            f"{BASE_URL}/api/admin/verifications",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestReviews:
    """Review functionality tests"""
    
    @pytest.fixture
    def user_token(self):
        """Get user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def product_id(self):
        """Get a valid product ID"""
        response = requests.get(f"{BASE_URL}/api/products")
        return response.json()[0]["id"]
    
    def test_create_review(self, user_token, product_id):
        """Test creating a product review"""
        review_data = {
            "product_id": product_id,
            "rating": 5,
            "comment": "TEST_Review - Excellent product for automated testing"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reviews",
            json=review_data,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["rating"] == 5
        assert "id" in data
    
    def test_get_product_reviews(self, product_id):
        """Test getting reviews for a product"""
        response = requests.get(f"{BASE_URL}/api/reviews/product/{product_id}")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_get_featured_reviews(self):
        """Test getting featured reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews/featured")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestUserOrders:
    """User order tests"""
    
    @pytest.fixture
    def user_token(self):
        """Get user authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        })
        return response.json()["token"]
    
    def test_get_my_orders(self, user_token):
        """Test getting user's orders"""
        response = requests.get(
            f"{BASE_URL}/api/orders/my-orders",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)
