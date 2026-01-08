import requests
import sys
import json
from datetime import datetime

class HipnotikAPITester:
    def __init__(self, base_url="https://hipnotik.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.superadmin_token = None
        self.employee_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, description=""):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_superadmin_login(self):
        """Test SuperAdmin login"""
        success, response = self.run_test(
            "SuperAdmin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "piedad@hipnotik.com", "password": "demo123"},
            description="Login with SuperAdmin credentials"
        )
        if success and 'access_token' in response:
            self.superadmin_token = response['access_token']
            print(f"   SuperAdmin role: {response.get('user', {}).get('role', 'Unknown')}")
            return True
        return False

    def test_employee_login(self):
        """Test Employee login"""
        success, response = self.run_test(
            "Employee Login",
            "POST",
            "auth/login",
            200,
            data={"email": "tai@demo.com", "password": "demo123"},
            description="Login with Employee credentials"
        )
        if success and 'access_token' in response:
            self.employee_token = response['access_token']
            print(f"   Employee role: {response.get('user', {}).get('role', 'Unknown')}")
            return True
        return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"},
            description="Should fail with invalid credentials"
        )
        return success

    def test_auth_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User (SuperAdmin)",
            "GET",
            "auth/me",
            200,
            token=self.superadmin_token,
            description="Get SuperAdmin user info"
        )
        return success

    def test_dashboard_kpis(self):
        """Test dashboard KPIs endpoint"""
        success, response = self.run_test(
            "Dashboard KPIs",
            "GET",
            "dashboard/kpis",
            200,
            token=self.superadmin_token,
            description="Get dashboard KPIs and metrics"
        )
        if success:
            print(f"   Sales today: {response.get('sales_today', 0)}")
            print(f"   Sales month: {response.get('sales_month', 0)}")
            print(f"   Incidents: {response.get('incidents', {})}")
        return success

    def test_dashboard_ranking(self):
        """Test team ranking endpoint"""
        success, response = self.run_test(
            "Team Ranking",
            "GET",
            "dashboard/ranking",
            200,
            token=self.superadmin_token,
            description="Get team sales ranking"
        )
        return success

    def test_clients_crud(self):
        """Test clients CRUD operations"""
        # Create client
        client_data = {
            "name": "Test Client API",
            "phone": "600123456",
            "email": "testclient@api.com",
            "city": "Madrid"
        }
        
        success, response = self.run_test(
            "Create Client",
            "POST",
            "clients",
            200,
            data=client_data,
            token=self.superadmin_token,
            description="Create a new client"
        )
        
        if not success:
            return False
            
        client_id = response.get('id')
        
        # Get clients list
        success, response = self.run_test(
            "Get Clients List",
            "GET",
            "clients",
            200,
            token=self.superadmin_token,
            description="Get all clients"
        )
        
        if not success:
            return False
            
        # Search clients
        success, response = self.run_test(
            "Search Clients",
            "GET",
            "clients?search=Test",
            200,
            token=self.superadmin_token,
            description="Search clients by name"
        )
        
        if not success:
            return False
            
        # Get specific client
        if client_id:
            success, response = self.run_test(
                "Get Client Detail",
                "GET",
                f"clients/{client_id}",
                200,
                token=self.superadmin_token,
                description="Get specific client details"
            )
        
        return success

    def test_sales_crud(self):
        """Test sales CRUD operations"""
        # Create sale with client data
        sale_data = {
            "client_data": {
                "name": "Sale Test Client",
                "phone": "600987654",
                "email": "saleclient@test.com"
            },
            "company": "Jazztel",
            "pack_type": "Solo Móvil",
            "mobile_lines": [{
                "number": "600987654",
                "type": "Postpago"
            }]
        }
        
        success, response = self.run_test(
            "Create Sale",
            "POST",
            "sales",
            200,
            data=sale_data,
            token=self.superadmin_token,
            description="Create a new sale"
        )
        
        if not success:
            return False
            
        sale_id = response.get('id')
        
        # Get sales list
        success, response = self.run_test(
            "Get Sales List",
            "GET",
            "sales",
            200,
            token=self.superadmin_token,
            description="Get all sales"
        )
        
        if not success:
            return False
            
        # Update sale status
        if sale_id:
            success, response = self.run_test(
                "Update Sale Status",
                "PATCH",
                f"sales/{sale_id}/status?status=Subido a compañía",
                200,
                token=self.superadmin_token,
                description="Update sale status"
            )
        
        return success

    def test_packs_crud(self):
        """Test packs/tarifas CRUD operations"""
        # Get packs list
        success, response = self.run_test(
            "Get Packs List",
            "GET",
            "packs",
            200,
            token=self.superadmin_token,
            description="Get all packs/tarifas"
        )
        
        if not success:
            return False
            
        # Create pack (SuperAdmin only)
        pack_data = {
            "company": "Jazztel",
            "name": "Test Pack API",
            "type": "Solo Móvil",
            "price": 25.99,
            "features": "Test features for API pack",
            "active": True,
            "observations": "Test observations"
        }
        
        success, response = self.run_test(
            "Create Pack (SuperAdmin)",
            "POST",
            "packs",
            200,
            data=pack_data,
            token=self.superadmin_token,
            description="Create new pack as SuperAdmin"
        )
        
        if not success:
            return False
            
        pack_id = response.get('id')
        
        # Try to create pack as employee (should fail)
        success, response = self.run_test(
            "Create Pack (Employee - Should Fail)",
            "POST",
            "packs",
            403,
            data=pack_data,
            token=self.employee_token,
            description="Employee should not be able to create packs"
        )
        
        return success

    def test_incidents_crud(self):
        """Test incidents CRUD operations"""
        # First get a client ID
        success, clients_response = self.run_test(
            "Get Clients for Incident",
            "GET",
            "clients",
            200,
            token=self.superadmin_token
        )
        
        if not success or not clients_response:
            return False
            
        client_id = clients_response[0]['id'] if clients_response else "demo-client-1"
        
        # Create incident
        incident_data = {
            "client_id": client_id,
            "title": "Test Incident API",
            "description": "Test incident description",
            "priority": "Alta",
            "type": "Técnica"
        }
        
        success, response = self.run_test(
            "Create Incident",
            "POST",
            "incidents",
            200,
            data=incident_data,
            token=self.superadmin_token,
            description="Create a new incident"
        )
        
        if not success:
            return False
            
        incident_id = response.get('id')
        
        # Get incidents list
        success, response = self.run_test(
            "Get Incidents List",
            "GET",
            "incidents",
            200,
            token=self.superadmin_token,
            description="Get all incidents"
        )
        
        if not success:
            return False
            
        # Add comment to incident
        if incident_id:
            success, response = self.run_test(
                "Add Incident Comment",
                "POST",
                f"incidents/{incident_id}/comments",
                200,
                data={"comment": "Test comment for incident"},
                token=self.superadmin_token,
                description="Add comment to incident"
            )
        
        return success

    def test_objectives_permissions(self):
        """Test objectives with permission restrictions"""
        # SuperAdmin should be able to access objectives
        success, response = self.run_test(
            "Get Objectives (SuperAdmin)",
            "GET",
            "objectives",
            200,
            token=self.superadmin_token,
            description="SuperAdmin should access objectives"
        )
        
        if not success:
            return False
            
        # Employee should NOT be able to access objectives
        success, response = self.run_test(
            "Get Objectives (Employee - Should Fail)",
            "GET",
            "objectives",
            403,
            token=self.employee_token,
            description="Employee should NOT access objectives"
        )
        
        if not success:
            return False
            
        # Create objective (SuperAdmin only)
        objective_data = {
            "month": datetime.now().month,
            "year": datetime.now().year,
            "team_target": 100
        }
        
        success, response = self.run_test(
            "Create Objective (SuperAdmin)",
            "POST",
            "objectives",
            200,
            data=objective_data,
            token=self.superadmin_token,
            description="Create monthly objective as SuperAdmin"
        )
        
        return success

    def test_fichajes(self):
        """Test fichajes (time tracking) functionality"""
        # Create entrada fichaje
        success, response = self.run_test(
            "Create Fichaje Entrada",
            "POST",
            "fichajes",
            200,
            data={"type": "Entrada"},
            token=self.employee_token,
            description="Register entrada (check-in)"
        )
        
        if not success:
            return False
            
        # Get fichajes list
        success, response = self.run_test(
            "Get Fichajes List",
            "GET",
            "fichajes",
            200,
            token=self.employee_token,
            description="Get fichajes history"
        )
        
        if not success:
            return False
            
        # Create salida fichaje
        success, response = self.run_test(
            "Create Fichaje Salida",
            "POST",
            "fichajes",
            200,
            data={"type": "Salida"},
            token=self.employee_token,
            description="Register salida (check-out)"
        )
        
        return success

    def test_contacts_crud(self):
        """Test contacts CRUD operations"""
        # Create contact
        contact_data = {
            "name": "Test Contact API",
            "company": "Test Company",
            "phone": "600111222",
            "whatsapp": "600111222",
            "email": "contact@test.com",
            "notes": "Test contact notes"
        }
        
        success, response = self.run_test(
            "Create Contact",
            "POST",
            "contacts",
            200,
            data=contact_data,
            token=self.superadmin_token,
            description="Create a new contact"
        )
        
        if not success:
            return False
            
        contact_id = response.get('id')
        
        # Get contacts list
        success, response = self.run_test(
            "Get Contacts List",
            "GET",
            "contacts",
            200,
            token=self.superadmin_token,
            description="Get all contacts"
        )
        
        if not success:
            return False
            
        # Delete contact (SuperAdmin only)
        if contact_id:
            success, response = self.run_test(
                "Delete Contact (SuperAdmin)",
                "DELETE",
                f"contacts/{contact_id}",
                200,
                token=self.superadmin_token,
                description="Delete contact as SuperAdmin"
            )
            
            if not success:
                return False
                
            # Try to delete as employee (should fail)
            success, response = self.run_test(
                "Delete Contact (Employee - Should Fail)",
                "DELETE",
                f"contacts/{contact_id}",
                403,
                token=self.employee_token,
                description="Employee should NOT be able to delete contacts"
            )
        
        return success

    def test_notifications(self):
        """Test notifications functionality"""
        success, response = self.run_test(
            "Get Notifications",
            "GET",
            "notifications",
            200,
            token=self.superadmin_token,
            description="Get user notifications"
        )
        return success

    def test_calculator(self):
        """Test calculator/recommendations functionality"""
        success, response = self.run_test(
            "Calculate Recommendations",
            "POST",
            "calculator/recommend",
            200,
            data={"pack_type": "Solo Móvil", "origin_company": "Vodafone"},
            token=self.superadmin_token,
            description="Get pack recommendations"
        )
        return success

    def test_export_permissions(self):
        """Test export functionality with permissions"""
        # SuperAdmin should be able to export CSV
        success, response = self.run_test(
            "Export CSV (SuperAdmin)",
            "GET",
            "export/sales/csv",
            200,
            token=self.superadmin_token,
            description="Export sales to CSV as SuperAdmin"
        )
        
        if not success:
            return False
            
        # SuperAdmin should be able to export PDF
        success, response = self.run_test(
            "Export PDF (SuperAdmin)",
            "GET",
            "export/sales/pdf",
            200,
            token=self.superadmin_token,
            description="Export sales to PDF as SuperAdmin"
        )
        
        if not success:
            return False
            
        # Employee should NOT be able to export
        success, response = self.run_test(
            "Export CSV (Employee - Should Fail)",
            "GET",
            "export/sales/csv",
            403,
            token=self.employee_token,
            description="Employee should NOT be able to export"
        )
        
        return success

    def test_demo_data_management(self):
        """Test demo data seeding and cleaning (SuperAdmin only)"""
        # Clean demo data first
        success, response = self.run_test(
            "Clean Demo Data (SuperAdmin)",
            "DELETE",
            "demo/clean",
            200,
            token=self.superadmin_token,
            description="Clean existing demo data"
        )
        
        if not success:
            return False
            
        # Seed demo data
        success, response = self.run_test(
            "Seed Demo Data (SuperAdmin)",
            "POST",
            "demo/seed",
            200,
            token=self.superadmin_token,
            description="Create demo data"
        )
        
        if not success:
            return False
            
        # Employee should NOT be able to manage demo data
        success, response = self.run_test(
            "Seed Demo Data (Employee - Should Fail)",
            "POST",
            "demo/seed",
            403,
            token=self.employee_token,
            description="Employee should NOT manage demo data"
        )
        
        return success

def main():
    print("🚀 Starting HIPNOTIK LEVEL Stand API Testing...")
    print("=" * 60)
    
    tester = HipnotikAPITester()
    
    # Authentication Tests
    print("\n📋 AUTHENTICATION TESTS")
    print("-" * 30)
    if not tester.test_superadmin_login():
        print("❌ SuperAdmin login failed, stopping tests")
        return 1
        
    if not tester.test_employee_login():
        print("❌ Employee login failed, stopping tests")
        return 1
        
    tester.test_invalid_login()
    tester.test_auth_me()
    
    # Dashboard Tests
    print("\n📊 DASHBOARD TESTS")
    print("-" * 30)
    tester.test_dashboard_kpis()
    tester.test_dashboard_ranking()
    
    # CRUD Tests
    print("\n📝 CRUD OPERATIONS TESTS")
    print("-" * 30)
    tester.test_clients_crud()
    tester.test_sales_crud()
    tester.test_packs_crud()
    tester.test_incidents_crud()
    tester.test_contacts_crud()
    
    # Permission Tests
    print("\n🔒 PERMISSION TESTS")
    print("-" * 30)
    tester.test_objectives_permissions()
    tester.test_export_permissions()
    
    # Feature Tests
    print("\n⚙️ FEATURE TESTS")
    print("-" * 30)
    tester.test_fichajes()
    tester.test_notifications()
    tester.test_calculator()
    tester.test_demo_data_management()
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS ({len(tester.failed_tests)}):")
        for i, failure in enumerate(tester.failed_tests, 1):
            print(f"   {i}. {failure}")
    else:
        print("\n✅ All tests passed!")
    
    print("=" * 60)
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())