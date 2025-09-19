#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class HealthMateAPITester:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.patient_credentials = None
        self.pharmacy_credentials = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details:
            print(f"   Details: {details}")
        print()

    def test_home_page(self):
        """Test if the home page loads"""
        try:
            response = self.session.get(f"{self.base_url}/")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                details += " - Home page loaded successfully"
            self.log_test("Home Page Load", success, details)
            return success
        except Exception as e:
            self.log_test("Home Page Load", False, str(e))
            return False

    def test_auth_pages(self):
        """Test authentication pages load"""
        pages = [
            ("/auth/signin", "Sign In Page"),
            ("/auth/signup", "Sign Up Page")
        ]
        
        all_passed = True
        for path, name in pages:
            try:
                response = self.session.get(f"{self.base_url}{path}")
                success = response.status_code == 200
                details = f"Status: {response.status_code}"
                self.log_test(name, success, details)
                if not success:
                    all_passed = False
            except Exception as e:
                self.log_test(name, False, str(e))
                all_passed = False
        
        return all_passed

    def test_patient_registration(self):
        """Test patient registration"""
        patient_data = {
            "name": "Test Patient",
            "email": "patient@test.com",
            "password": "test123",
            "confirmPassword": "test123",
            "role": "PATIENT"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=patient_data,
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code in [200, 201]
            details = f"Status: {response.status_code}"
            
            if success:
                self.patient_credentials = {
                    "email": patient_data["email"],
                    "password": patient_data["password"]
                }
                details += " - Patient registered successfully"
            else:
                try:
                    error_data = response.json()
                    details += f" - Error: {error_data.get('error', 'Unknown error')}"
                except:
                    details += f" - Response: {response.text[:100]}"
            
            self.log_test("Patient Registration", success, details)
            return success
            
        except Exception as e:
            self.log_test("Patient Registration", False, str(e))
            return False

    def test_pharmacy_registration(self):
        """Test pharmacy registration"""
        pharmacy_data = {
            "name": "John Smith",
            "email": "pharmacy@test.com",
            "password": "test123",
            "confirmPassword": "test123",
            "role": "PHARMACY",
            "pharmacyName": "Green Cross Pharmacy",
            "address": "123 Main St",
            "phone": "555-0123",
            "license": "PH12345"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=pharmacy_data,
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code in [200, 201]
            details = f"Status: {response.status_code}"
            
            if success:
                self.pharmacy_credentials = {
                    "email": pharmacy_data["email"],
                    "password": pharmacy_data["password"]
                }
                details += " - Pharmacy registered successfully"
            else:
                try:
                    error_data = response.json()
                    details += f" - Error: {error_data.get('error', 'Unknown error')}"
                except:
                    details += f" - Response: {response.text[:100]}"
            
            self.log_test("Pharmacy Registration", success, details)
            return success
            
        except Exception as e:
            self.log_test("Pharmacy Registration", False, str(e))
            return False

    def test_nextauth_signin(self):
        """Test NextAuth signin endpoint"""
        if not self.patient_credentials:
            self.log_test("NextAuth Patient Sign In", False, "No patient credentials available")
            return False
        
        try:
            # Test NextAuth credentials endpoint
            signin_data = {
                "email": self.patient_credentials["email"],
                "password": self.patient_credentials["password"],
                "redirect": "false"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/signin/credentials",
                data=signin_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            # NextAuth might return different status codes
            success = response.status_code in [200, 302]
            details = f"Status: {response.status_code}"
            
            if success:
                details += " - NextAuth signin endpoint accessible"
            else:
                details += f" - Response: {response.text[:100]}"
            
            self.log_test("NextAuth Sign In Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("NextAuth Sign In Endpoint", False, str(e))
            return False

    def test_dashboard_access(self):
        """Test dashboard page accessibility (without authentication)"""
        dashboard_pages = [
            ("/dashboard/patient", "Patient Dashboard"),
            ("/dashboard/pharmacy", "Pharmacy Dashboard")
        ]
        
        all_accessible = True
        for path, name in dashboard_pages:
            try:
                response = self.session.get(f"{self.base_url}{path}")
                # Dashboard pages should either load (200) or redirect to signin (302/307)
                success = response.status_code in [200, 302, 307]
                details = f"Status: {response.status_code}"
                
                if response.status_code in [302, 307]:
                    details += " - Redirected (likely to signin - expected behavior)"
                elif response.status_code == 200:
                    details += " - Page loaded"
                
                self.log_test(f"{name} Access", success, details)
                if not success:
                    all_accessible = False
                    
            except Exception as e:
                self.log_test(f"{name} Access", False, str(e))
                all_accessible = False
        
        return all_accessible

    def test_api_routes_exist(self):
        """Test that API routes exist and return proper responses"""
        api_routes = [
            ("/api/auth/register", "Registration API"),
            ("/api/auth/signin", "NextAuth Sign In API"),
            ("/api/auth/session", "NextAuth Session API")
        ]
        
        all_exist = True
        for path, name in api_routes:
            try:
                response = self.session.get(f"{self.base_url}{path}")
                # API routes should not return 404
                success = response.status_code != 404
                details = f"Status: {response.status_code}"
                
                if response.status_code == 405:
                    details += " - Method not allowed (expected for some endpoints)"
                elif response.status_code == 200:
                    details += " - Endpoint accessible"
                elif response.status_code == 401:
                    details += " - Unauthorized (expected for protected endpoints)"
                
                self.log_test(f"{name} Exists", success, details)
                if not success:
                    all_exist = False
                    
            except Exception as e:
                self.log_test(f"{name} Exists", False, str(e))
                all_exist = False
        
        return all_exist

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting HealthMate Backend API Tests")
        print("=" * 50)
        
        # Test basic connectivity
        if not self.test_home_page():
            print("❌ Cannot connect to application. Is it running on localhost:3001?")
            return False
        
        # Test page accessibility
        self.test_auth_pages()
        self.test_dashboard_access()
        
        # Test API routes exist
        self.test_api_routes_exist()
        
        # Test registration endpoints
        self.test_patient_registration()
        self.test_pharmacy_registration()
        
        # Test authentication
        self.test_nextauth_signin()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend APIs are working correctly.")
            return True
        else:
            failed = self.tests_run - self.tests_passed
            print(f"⚠️  {failed} test(s) failed. Check the details above.")
            return False

def main():
    """Main test runner"""
    tester = HealthMateAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())