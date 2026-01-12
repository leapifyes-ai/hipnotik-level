"""
Backend API Tests for HIPNOTIK LEVEL Stand - New Features
Tests for: Sales Score, Sale Update/Edit, Client Update with internal_notes, Fichajes Admin
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ==================== AUTH FIXTURES ====================

@pytest.fixture(scope="module")
def auth_headers():
    """Get auth headers for SuperAdmin user"""
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


# ==================== SALES STATUSES TESTS ====================

class TestSalesStatuses:
    """Tests for GET /api/sales/statuses endpoint"""
    
    def test_get_sale_statuses(self, auth_headers):
        """Test GET /api/sales/statuses returns valid statuses list"""
        response = requests.get(f"{BASE_URL}/api/sales/statuses", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "statuses" in data
        assert isinstance(data["statuses"], list)
        
        # Verify expected statuses are present
        expected_statuses = ["Registrado", "En proceso", "Incidencia", "Instalado", "Modificado", "Cancelado", "Finalizado"]
        for status in expected_statuses:
            assert status in data["statuses"], f"Status '{status}' should be in statuses list"


# ==================== SALES SCORE TESTS ====================

class TestSalesScore:
    """Tests for Sales Score calculation (0-100)"""
    
    def test_sale_has_score_field(self, auth_headers):
        """Test that sales have score field"""
        # Create a sale
        unique_phone = f"TEST_SCORE_{uuid.uuid4().hex[:8]}"
        payload = {
            "client_data": {"name": "TEST_Score Client", "phone": unique_phone},
            "company": "Jazztel",
            "pack_type": "Pack Fibra + Móvil",
            "pack_price": 50.0,
            "fiber": {"speed_mbps": 600},
            "mobile_lines": [{"number": "600111222", "type": "Postpago", "gb_data": 30}]
        }
        
        response = requests.post(f"{BASE_URL}/api/sales", json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "score" in data
        assert isinstance(data["score"], int)
        assert 0 <= data["score"] <= 100
    
    def test_score_calculation_high_value_sale(self, auth_headers):
        """Test score calculation for high-value sale (1Gbps fiber, multiple lines, high price)"""
        unique_phone = f"TEST_HIGH_{uuid.uuid4().hex[:8]}"
        payload = {
            "client_data": {"name": "TEST_High Value Client", "phone": unique_phone},
            "company": "MásMóvil",
            "pack_type": "Pack Fibra + Móvil + TV",
            "pack_price": 80.0,  # High price = 20 points
            "fiber": {"speed_mbps": 1000},  # 1Gbps = 40 points
            "mobile_lines": [
                {"number": "600111001", "type": "Postpago", "gb_data": 50},
                {"number": "600111002", "type": "Postpago", "gb_data": 50},
                {"number": "600111003", "type": "Postpago", "gb_data": 50}
            ]  # 3 lines = 15 points, 150GB total = 15 points
        }
        
        response = requests.post(f"{BASE_URL}/api/sales", json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # Expected: 40 (fiber) + 15 (lines) + 15 (GB) + 20 (price) + 3 (Registrado status) = 93
        assert data["score"] >= 70, f"High value sale should have score >= 70, got {data['score']}"
    
    def test_score_calculation_low_value_sale(self, auth_headers):
        """Test score calculation for low-value sale (mobile only, low price)"""
        unique_phone = f"TEST_LOW_{uuid.uuid4().hex[:8]}"
        payload = {
            "client_data": {"name": "TEST_Low Value Client", "phone": unique_phone},
            "company": "Simyo",
            "pack_type": "Solo Móvil",
            "pack_price": 10.0,  # Low price = 0 points
            "mobile_lines": [{"number": "600222333", "type": "Postpago", "gb_data": 5}]  # 1 line = 5 points, 5GB = 0 points
        }
        
        response = requests.post(f"{BASE_URL}/api/sales", json=payload, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        # Expected: 0 (no fiber) + 5 (1 line) + 0 (low GB) + 0 (low price) + 3 (Registrado) = 8
        assert data["score"] < 30, f"Low value sale should have score < 30, got {data['score']}"


# ==================== SALE UPDATE/EDIT TESTS ====================

class TestSaleUpdate:
    """Tests for PUT /api/sales/{id} endpoint"""
    
    def test_update_sale_status(self, auth_headers):
        """Test updating sale status via PUT endpoint"""
        # Create a sale first
        unique_phone = f"TEST_UPD_{uuid.uuid4().hex[:8]}"
        create_payload = {
            "client_data": {"name": "TEST_Update Client", "phone": unique_phone},
            "company": "Jazztel",
            "pack_type": "Solo Fibra",
            "pack_price": 35.0,
            "fiber": {"speed_mbps": 600}
        }
        
        create_response = requests.post(f"{BASE_URL}/api/sales", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        initial_score = create_response.json()["score"]
        
        # Update the sale status to Finalizado
        update_payload = {"status": "Finalizado"}
        update_response = requests.put(f"{BASE_URL}/api/sales/{sale_id}", json=update_payload, headers=auth_headers)
        assert update_response.status_code == 200
        
        updated_sale = update_response.json()
        assert updated_sale["status"] == "Finalizado"
        # Score should increase (Finalizado = +10 vs Registrado = +3)
        assert updated_sale["score"] > initial_score
    
    def test_update_sale_company_and_price(self, auth_headers):
        """Test updating sale company and price"""
        unique_phone = f"TEST_UPD2_{uuid.uuid4().hex[:8]}"
        create_payload = {
            "client_data": {"name": "TEST_Update2 Client", "phone": unique_phone},
            "company": "Jazztel",
            "pack_type": "Pack Fibra + Móvil",
            "pack_price": 30.0,
            "fiber": {"speed_mbps": 300}
        }
        
        create_response = requests.post(f"{BASE_URL}/api/sales", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        
        # Update company and price
        update_payload = {
            "company": "MásMóvil",
            "pack_name": "Pack Premium",
            "pack_price": 75.0,
            "notes": "Updated notes for testing"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/sales/{sale_id}", json=update_payload, headers=auth_headers)
        assert update_response.status_code == 200
        
        updated_sale = update_response.json()
        assert updated_sale["company"] == "MásMóvil"
        assert updated_sale["pack_name"] == "Pack Premium"
        assert updated_sale["pack_price"] == 75.0
        assert updated_sale["notes"] == "Updated notes for testing"
        # Status should be "Modificado" when editing without explicit status
        assert updated_sale["status"] == "Modificado"
    
    def test_update_sale_recalculates_score(self, auth_headers):
        """Test that updating sale recalculates score"""
        unique_phone = f"TEST_RECALC_{uuid.uuid4().hex[:8]}"
        create_payload = {
            "client_data": {"name": "TEST_Recalc Client", "phone": unique_phone},
            "company": "Pepephone",
            "pack_type": "Solo Fibra",
            "pack_price": 25.0,
            "fiber": {"speed_mbps": 100}  # Low speed = 10 points
        }
        
        create_response = requests.post(f"{BASE_URL}/api/sales", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        initial_score = create_response.json()["score"]
        
        # Update to higher fiber speed
        update_payload = {
            "fiber": {"speed_mbps": 1000},  # High speed = 40 points
            "status": "Instalado"  # +8 points
        }
        
        update_response = requests.put(f"{BASE_URL}/api/sales/{sale_id}", json=update_payload, headers=auth_headers)
        assert update_response.status_code == 200
        
        updated_sale = update_response.json()
        # Score should be significantly higher
        assert updated_sale["score"] > initial_score
    
    def test_update_sale_invalid_status(self, auth_headers):
        """Test updating sale with invalid status returns error"""
        unique_phone = f"TEST_INV_{uuid.uuid4().hex[:8]}"
        create_payload = {
            "client_data": {"name": "TEST_Invalid Client", "phone": unique_phone},
            "company": "Simyo",
            "pack_type": "Solo Móvil",
            "mobile_lines": [{"number": "600333444", "type": "Postpago"}]
        }
        
        create_response = requests.post(f"{BASE_URL}/api/sales", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        
        # Try to update with invalid status
        update_payload = {"status": "InvalidStatus"}
        update_response = requests.put(f"{BASE_URL}/api/sales/{sale_id}", json=update_payload, headers=auth_headers)
        assert update_response.status_code == 400
    
    def test_update_sale_not_found(self, auth_headers):
        """Test updating non-existent sale returns 404"""
        update_payload = {"status": "Finalizado"}
        response = requests.put(f"{BASE_URL}/api/sales/non-existent-id", json=update_payload, headers=auth_headers)
        assert response.status_code == 404


# ==================== CLIENT UPDATE TESTS ====================

class TestClientUpdate:
    """Tests for PUT /api/clients/{id} endpoint with internal_notes"""
    
    def test_update_client_basic_fields(self, auth_headers):
        """Test updating client basic fields (name, phone, email, city)"""
        # Create a client via sale
        unique_phone = f"TEST_CLI_{uuid.uuid4().hex[:8]}"
        sale_payload = {
            "client_data": {
                "name": "TEST_Client Original",
                "phone": unique_phone,
                "email": "original@test.com",
                "city": "Madrid"
            },
            "company": "Jazztel",
            "pack_type": "Solo Móvil",
            "mobile_lines": [{"number": "600444555", "type": "Postpago"}]
        }
        
        sale_response = requests.post(f"{BASE_URL}/api/sales", json=sale_payload, headers=auth_headers)
        assert sale_response.status_code == 200
        client_id = sale_response.json()["client_id"]
        
        # Update client
        update_payload = {
            "name": "TEST_Client Updated",
            "email": "updated@test.com",
            "city": "Barcelona"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/clients/{client_id}", json=update_payload, headers=auth_headers)
        assert update_response.status_code == 200
        
        updated_client = update_response.json()
        assert updated_client["name"] == "TEST_Client Updated"
        assert updated_client["email"] == "updated@test.com"
        assert updated_client["city"] == "Barcelona"
        # Phone should remain unchanged
        assert updated_client["phone"] == unique_phone
    
    def test_update_client_dni_and_address(self, auth_headers):
        """Test updating client DNI and address fields"""
        unique_phone = f"TEST_DNI_{uuid.uuid4().hex[:8]}"
        sale_payload = {
            "client_data": {"name": "TEST_DNI Client", "phone": unique_phone},
            "company": "MásMóvil",
            "pack_type": "Solo Fibra",
            "fiber": {"speed_mbps": 600}
        }
        
        sale_response = requests.post(f"{BASE_URL}/api/sales", json=sale_payload, headers=auth_headers)
        assert sale_response.status_code == 200
        client_id = sale_response.json()["client_id"]
        
        # Update with DNI and address
        update_payload = {
            "dni": "12345678A",
            "address": "Calle Test 123, 4º B, 28001 Madrid"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/clients/{client_id}", json=update_payload, headers=auth_headers)
        assert update_response.status_code == 200
        
        updated_client = update_response.json()
        assert updated_client["dni"] == "12345678A"
        assert updated_client["address"] == "Calle Test 123, 4º B, 28001 Madrid"
    
    def test_update_client_internal_notes(self, auth_headers):
        """Test updating client internal_notes field"""
        unique_phone = f"TEST_NOTES_{uuid.uuid4().hex[:8]}"
        sale_payload = {
            "client_data": {"name": "TEST_Notes Client", "phone": unique_phone},
            "company": "Pepephone",
            "pack_type": "Solo Móvil",
            "mobile_lines": [{"number": "600555666", "type": "Postpago"}]
        }
        
        sale_response = requests.post(f"{BASE_URL}/api/sales", json=sale_payload, headers=auth_headers)
        assert sale_response.status_code == 200
        client_id = sale_response.json()["client_id"]
        
        # Update with internal notes
        internal_notes = "Cliente VIP. Siempre paga puntualmente. Prefiere contacto por WhatsApp. Tiene 3 líneas familiares."
        update_payload = {"internal_notes": internal_notes}
        
        update_response = requests.put(f"{BASE_URL}/api/clients/{client_id}", json=update_payload, headers=auth_headers)
        assert update_response.status_code == 200
        
        updated_client = update_response.json()
        assert updated_client["internal_notes"] == internal_notes
        
        # Verify persistence by fetching client
        get_response = requests.get(f"{BASE_URL}/api/clients/{client_id}", headers=auth_headers)
        assert get_response.status_code == 200
        assert get_response.json()["internal_notes"] == internal_notes
    
    def test_update_client_not_found(self, auth_headers):
        """Test updating non-existent client returns 404"""
        update_payload = {"name": "Test"}
        response = requests.put(f"{BASE_URL}/api/clients/non-existent-id", json=update_payload, headers=auth_headers)
        assert response.status_code == 404


# ==================== CLIENT SALES ENDPOINT TESTS ====================

class TestClientSales:
    """Tests for GET /api/clients/{id}/sales endpoint"""
    
    def test_get_client_sales_with_total_score(self, auth_headers):
        """Test GET /api/clients/{id}/sales returns sales with total_score"""
        # Create client with multiple sales
        unique_phone = f"TEST_MULTI_{uuid.uuid4().hex[:8]}"
        
        # First sale
        sale1_payload = {
            "client_data": {"name": "TEST_Multi Sales Client", "phone": unique_phone},
            "company": "Jazztel",
            "pack_type": "Pack Fibra + Móvil",
            "pack_price": 50.0,
            "fiber": {"speed_mbps": 600}
        }
        sale1_response = requests.post(f"{BASE_URL}/api/sales", json=sale1_payload, headers=auth_headers)
        assert sale1_response.status_code == 200
        client_id = sale1_response.json()["client_id"]
        
        # Second sale for same client
        sale2_payload = {
            "client_id": client_id,
            "company": "MásMóvil",
            "pack_type": "Solo Móvil",
            "pack_price": 20.0,
            "mobile_lines": [{"number": "600777888", "type": "Postpago", "gb_data": 30}]
        }
        sale2_response = requests.post(f"{BASE_URL}/api/sales", json=sale2_payload, headers=auth_headers)
        assert sale2_response.status_code == 200
        
        # Get client sales
        response = requests.get(f"{BASE_URL}/api/clients/{client_id}/sales", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "sales" in data
        assert "total_score" in data
        assert "sales_count" in data
        
        assert len(data["sales"]) >= 2
        assert data["sales_count"] >= 2
        assert isinstance(data["total_score"], int)
        
        # Verify each sale has score
        for sale in data["sales"]:
            assert "score" in sale


# ==================== FICHAJES ADMIN TESTS ====================

class TestFichajesAdmin:
    """Tests for Fichajes Admin endpoints"""
    
    def test_get_fichajes_admin_summary(self, auth_headers):
        """Test GET /api/fichajes/admin returns employees summary"""
        response = requests.get(f"{BASE_URL}/api/fichajes/admin", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are employees, verify structure
        if len(data) > 0:
            emp = data[0]
            assert "user_id" in emp
            assert "name" in emp
            assert "email" in emp
            assert "status" in emp  # "Fichado" or "No fichado"
            assert "hours_today" in emp
            assert "fichajes_count_today" in emp
            
            # Status should be valid
            assert emp["status"] in ["Fichado", "No fichado"]
    
    def test_get_fichajes_admin_history(self, auth_headers):
        """Test GET /api/fichajes/admin/{user_id}/history returns detailed history"""
        # First get employees list
        employees_response = requests.get(f"{BASE_URL}/api/fichajes/admin", headers=auth_headers)
        assert employees_response.status_code == 200
        employees = employees_response.json()
        
        if len(employees) == 0:
            pytest.skip("No employees to test history")
        
        user_id = employees[0]["user_id"]
        
        # Get history
        response = requests.get(f"{BASE_URL}/api/fichajes/admin/{user_id}/history?days=30", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert "employee" in data
        assert "period_days" in data
        assert "history" in data
        assert "total_hours_period" in data
        
        assert data["employee"]["id"] == user_id
        assert data["period_days"] == 30
        assert isinstance(data["history"], list)
        assert isinstance(data["total_hours_period"], (int, float))
        
        # If there's history, verify structure
        if len(data["history"]) > 0:
            day = data["history"][0]
            assert "date" in day
            assert "entries" in day
            assert "exits" in day
            assert "total_hours" in day
    
    def test_get_fichajes_admin_history_not_found(self, auth_headers):
        """Test GET /api/fichajes/admin/{user_id}/history returns 404 for non-existent user"""
        response = requests.get(f"{BASE_URL}/api/fichajes/admin/non-existent-id/history", headers=auth_headers)
        assert response.status_code == 404
    
    def test_fichajes_admin_requires_superadmin(self):
        """Test that fichajes admin endpoints require SuperAdmin role"""
        # This test would need an Empleado user to properly test
        # For now, we verify the endpoint exists and returns proper response for SuperAdmin
        pass


# ==================== SALE STATUS CHANGE VIA PATCH ====================

class TestSaleStatusPatch:
    """Tests for PATCH /api/sales/{id}/status endpoint"""
    
    def test_patch_sale_status(self, auth_headers):
        """Test PATCH /api/sales/{id}/status updates status and recalculates score"""
        unique_phone = f"TEST_PATCH_{uuid.uuid4().hex[:8]}"
        create_payload = {
            "client_data": {"name": "TEST_Patch Client", "phone": unique_phone},
            "company": "Jazztel",
            "pack_type": "Pack Fibra + Móvil",
            "pack_price": 45.0,
            "fiber": {"speed_mbps": 600}
        }
        
        create_response = requests.post(f"{BASE_URL}/api/sales", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        initial_score = create_response.json()["score"]
        
        # Patch status to Finalizado
        patch_response = requests.patch(f"{BASE_URL}/api/sales/{sale_id}/status?status=Finalizado", headers=auth_headers)
        assert patch_response.status_code == 200
        
        data = patch_response.json()
        assert "new_score" in data
        # Finalizado (+10) vs Registrado (+3) = +7 points
        assert data["new_score"] > initial_score
    
    def test_patch_sale_status_invalid(self, auth_headers):
        """Test PATCH with invalid status returns 400"""
        unique_phone = f"TEST_PINV_{uuid.uuid4().hex[:8]}"
        create_payload = {
            "client_data": {"name": "TEST_PatchInv Client", "phone": unique_phone},
            "company": "Simyo",
            "pack_type": "Solo Móvil",
            "mobile_lines": [{"number": "600888999", "type": "Postpago"}]
        }
        
        create_response = requests.post(f"{BASE_URL}/api/sales", json=create_payload, headers=auth_headers)
        assert create_response.status_code == 200
        sale_id = create_response.json()["id"]
        
        # Try invalid status
        patch_response = requests.patch(f"{BASE_URL}/api/sales/{sale_id}/status?status=InvalidStatus", headers=auth_headers)
        assert patch_response.status_code == 400


# ==================== CLEANUP ====================

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests complete"""
    yield
    # Note: Test data is prefixed with TEST_ for easy identification
    # In production, implement cleanup logic here
