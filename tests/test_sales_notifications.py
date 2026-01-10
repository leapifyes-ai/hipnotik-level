"""
Backend API Tests for Sales Management System - HIPNOTIK LEVEL Stand
Tests for: Sales detail view, New sale form with extended fields, Notifications system
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuth:
    """Authentication endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@hipnotik.com",
            "password": "test123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        # Try to register if login fails
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test@hipnotik.com",
            "password": "test123",
            "name": "Test SuperAdmin",
            "role": "SuperAdmin"
        })
        if register_response.status_code == 200:
            return register_response.json().get("access_token")
        pytest.skip("Authentication failed - cannot get token")
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@hipnotik.com",
            "password": "test123"
        })
        # If user doesn't exist, register first
        if response.status_code == 401:
            register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "test@hipnotik.com",
                "password": "test123",
                "name": "Test SuperAdmin",
                "role": "SuperAdmin"
            })
            assert register_response.status_code == 200
            data = register_response.json()
            assert "access_token" in data
            assert "user" in data
            return
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@hipnotik.com"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401


class TestSalesEndpoints:
    """Sales CRUD and detail endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@hipnotik.com",
            "password": "test123"
        })
        if response.status_code != 200:
            # Register if not exists
            response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "test@hipnotik.com",
                "password": "test123",
                "name": "Test SuperAdmin",
                "role": "SuperAdmin"
            })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_sales_list(self, auth_headers):
        """Test GET /api/sales returns list of sales"""
        response = requests.get(f"{BASE_URL}/api/sales", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_sale_with_extended_fields(self, auth_headers):
        """Test POST /api/sales with new extended fields (fiber speed, mobile lines, notes)"""
        unique_phone = f"TEST_{uuid.uuid4().hex[:8]}"
        
        payload = {
            "client_data": {
                "name": "TEST_Juan García Extended",
                "phone": unique_phone,
                "email": "test_juan@example.com",
                "city": "Madrid"
            },
            "company": "Jazztel",
            "pack_type": "Pack Fibra + Móvil",
            "pack_name": "Pack Familia 600Mb",
            "pack_price": 45.99,
            "mobile_lines": [
                {
                    "number": "600111222",
                    "type": "Postpago",
                    "gb_data": 50,
                    "iccid": None,
                    "origin_company": "Movistar"
                },
                {
                    "number": "600333444",
                    "type": "Prepago",
                    "gb_data": 20,
                    "iccid": "8934123456789",
                    "origin_company": None
                }
            ],
            "fiber": {
                "speed_mbps": 600,
                "address": "Calle Test 123, Madrid"
            },
            "notes": "Cliente viene de Movistar. Promoción especial aplicada. Instalación urgente."
        }
        
        response = requests.post(f"{BASE_URL}/api/sales", json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["company"] == "Jazztel"
        assert data["pack_type"] == "Pack Fibra + Móvil"
        assert data["pack_name"] == "Pack Familia 600Mb"
        assert data["pack_price"] == 45.99
        assert data["notes"] == "Cliente viene de Movistar. Promoción especial aplicada. Instalación urgente."
        
        # Verify mobile lines
        assert data["mobile_lines"] is not None
        assert len(data["mobile_lines"]) == 2
        assert data["mobile_lines"][0]["number"] == "600111222"
        assert data["mobile_lines"][0]["gb_data"] == 50
        assert data["mobile_lines"][1]["number"] == "600333444"
        
        # Verify fiber data
        assert data["fiber"] is not None
        assert data["fiber"]["speed_mbps"] == 600
        assert data["fiber"]["address"] == "Calle Test 123, Madrid"
        
        # Store sale_id for detail test
        return data["id"]
    
    def test_get_sale_detail(self, auth_headers):
        """Test GET /api/sales/{sale_id} returns detailed sale with client, pack, employee info"""
        # First create a sale
        unique_phone = f"TEST_{uuid.uuid4().hex[:8]}"
        
        create_payload = {
            "client_data": {
                "name": "TEST_Detail Client",
                "phone": unique_phone,
                "email": "detail@test.com",
                "city": "Barcelona"
            },
            "company": "MásMóvil",
            "pack_type": "Solo Fibra",
            "pack_name": "Fibra 1Gb",
            "pack_price": 35.00,
            "fiber": {
                "speed_mbps": 1000,
                "address": "Calle Detail 456"
            },
            "notes": "Test notes for detail view"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/sales", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        
        # Now get the detail
        detail_response = requests.get(f"{BASE_URL}/api/sales/{sale_id}", headers=auth_headers)
        assert detail_response.status_code == 200
        
        data = detail_response.json()
        
        # Verify sale data
        assert "sale" in data
        assert data["sale"]["id"] == sale_id
        assert data["sale"]["company"] == "MásMóvil"
        assert data["sale"]["pack_name"] == "Fibra 1Gb"
        assert data["sale"]["pack_price"] == 35.00
        assert data["sale"]["notes"] == "Test notes for detail view"
        assert data["sale"]["fiber"]["speed_mbps"] == 1000
        
        # Verify client data
        assert "client" in data
        assert data["client"]["name"] == "TEST_Detail Client"
        assert data["client"]["phone"] == unique_phone
        
        # Verify employee data
        assert "employee" in data
        assert data["employee"] is not None
        assert "name" in data["employee"]
    
    def test_get_sale_detail_not_found(self, auth_headers):
        """Test GET /api/sales/{sale_id} returns 404 for non-existent sale"""
        response = requests.get(f"{BASE_URL}/api/sales/non-existent-id", headers=auth_headers)
        assert response.status_code == 404
    
    def test_create_sale_mobile_only(self, auth_headers):
        """Test creating a mobile-only sale with multiple lines"""
        unique_phone = f"TEST_{uuid.uuid4().hex[:8]}"
        
        payload = {
            "client_data": {
                "name": "TEST_Mobile Only Client",
                "phone": unique_phone
            },
            "company": "Pepephone",
            "pack_type": "Solo Móvil",
            "pack_name": "Móvil Smart 30GB",
            "pack_price": 18.00,
            "mobile_lines": [
                {
                    "number": "600555666",
                    "type": "Postpago",
                    "gb_data": 30,
                    "origin_company": "Orange"
                }
            ],
            "notes": "Portabilidad desde Orange"
        }
        
        response = requests.post(f"{BASE_URL}/api/sales", json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["pack_type"] == "Solo Móvil"
        assert data["mobile_lines"] is not None
        assert len(data["mobile_lines"]) == 1
        assert data["fiber"] is None  # No fiber for mobile-only


class TestNotificationEndpoints:
    """Notification system endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@hipnotik.com",
            "password": "test123"
        })
        if response.status_code != 200:
            response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "test@hipnotik.com",
                "password": "test123",
                "name": "Test SuperAdmin",
                "role": "SuperAdmin"
            })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_notifications(self, auth_headers):
        """Test GET /api/notifications returns list of notifications"""
        response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If there are notifications, verify structure
        if len(data) > 0:
            notif = data[0]
            assert "id" in notif
            assert "title" in notif
            assert "message" in notif
            assert "type" in notif
            assert "read" in notif
            assert "created_at" in notif
    
    def test_get_unread_count(self, auth_headers):
        """Test GET /api/notifications/unread-count returns count"""
        response = requests.get(f"{BASE_URL}/api/notifications/unread-count", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        assert data["count"] >= 0
    
    def test_notification_created_on_sale(self, auth_headers):
        """Test that creating a sale creates a notification"""
        # Get initial unread count
        initial_count_response = requests.get(f"{BASE_URL}/api/notifications/unread-count", headers=auth_headers)
        initial_count = initial_count_response.json()["count"]
        
        # Create a sale
        unique_phone = f"TEST_{uuid.uuid4().hex[:8]}"
        payload = {
            "client_data": {
                "name": "TEST_Notification Client",
                "phone": unique_phone
            },
            "company": "Simyo",
            "pack_type": "Solo Móvil",
            "pack_name": "Móvil Básico 10GB",
            "pack_price": 12.00,
            "mobile_lines": [{"number": "600777888", "type": "Postpago", "gb_data": 10}]
        }
        
        sale_response = requests.post(f"{BASE_URL}/api/sales", json=payload, headers=auth_headers)
        assert sale_response.status_code == 200
        sale_id = sale_response.json()["id"]
        
        # Check notifications - should have a new one
        notifs_response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        assert notifs_response.status_code == 200
        notifications = notifs_response.json()
        
        # Find notification for this sale
        sale_notif = None
        for notif in notifications:
            if notif.get("related_id") == sale_id and notif.get("type") == "new_sale":
                sale_notif = notif
                break
        
        assert sale_notif is not None, "Notification for new sale should be created"
        assert sale_notif["related_type"] == "sale"
        assert "Nueva venta" in sale_notif["title"]
    
    def test_mark_notification_read(self, auth_headers):
        """Test PATCH /api/notifications/{id}/read marks notification as read"""
        # Get notifications
        notifs_response = requests.get(f"{BASE_URL}/api/notifications", headers=auth_headers)
        notifications = notifs_response.json()
        
        if len(notifications) == 0:
            pytest.skip("No notifications to test")
        
        # Find an unread notification or use first one
        notif_id = notifications[0]["id"]
        
        # Mark as read
        response = requests.patch(f"{BASE_URL}/api/notifications/{notif_id}/read", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["message"] == "Notification marked as read"
    
    def test_mark_all_notifications_read(self, auth_headers):
        """Test PATCH /api/notifications/mark-all-read marks all as read"""
        response = requests.patch(f"{BASE_URL}/api/notifications/mark-all-read", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["message"] == "All notifications marked as read"
        
        # Verify unread count is 0
        count_response = requests.get(f"{BASE_URL}/api/notifications/unread-count", headers=auth_headers)
        assert count_response.json()["count"] == 0


class TestPacksEndpoints:
    """Packs/Tarifas endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@hipnotik.com",
            "password": "test123"
        })
        if response.status_code != 200:
            response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "test@hipnotik.com",
                "password": "test123",
                "name": "Test SuperAdmin",
                "role": "SuperAdmin"
            })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_packs(self, auth_headers):
        """Test GET /api/packs returns list of packs"""
        response = requests.get(f"{BASE_URL}/api/packs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_active_packs(self, auth_headers):
        """Test GET /api/packs?active_only=true returns only active packs"""
        response = requests.get(f"{BASE_URL}/api/packs?active_only=true", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned packs should be active
        for pack in data:
            assert pack.get("active", True) == True


class TestClientsEndpoints:
    """Client endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@hipnotik.com",
            "password": "test123"
        })
        if response.status_code != 200:
            response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "test@hipnotik.com",
                "password": "test123",
                "name": "Test SuperAdmin",
                "role": "SuperAdmin"
            })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_clients(self, auth_headers):
        """Test GET /api/clients returns list of clients"""
        response = requests.get(f"{BASE_URL}/api/clients", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_search_clients(self, auth_headers):
        """Test GET /api/clients?search=xxx filters clients"""
        response = requests.get(f"{BASE_URL}/api/clients?search=TEST", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestDashboardEndpoints:
    """Dashboard KPIs and ranking endpoint tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@hipnotik.com",
            "password": "test123"
        })
        if response.status_code != 200:
            response = requests.post(f"{BASE_URL}/api/auth/register", json={
                "email": "test@hipnotik.com",
                "password": "test123",
                "name": "Test SuperAdmin",
                "role": "SuperAdmin"
            })
        token = response.json().get("access_token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_dashboard_kpis(self, auth_headers):
        """Test GET /api/dashboard/kpis returns KPI data"""
        response = requests.get(f"{BASE_URL}/api/dashboard/kpis", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert "sales_today" in data
        assert "sales_month" in data
        assert "incidents" in data
    
    def test_get_team_ranking(self, auth_headers):
        """Test GET /api/dashboard/ranking returns team ranking"""
        response = requests.get(f"{BASE_URL}/api/dashboard/ranking", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# Cleanup fixture to remove test data
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests complete"""
    yield
    # Note: In production, you would delete test data here
    # For now, we leave it as test data is prefixed with TEST_
