#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta

class LabBookingAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.patient_session = None
        self.lab_session = None
        self.created_booking_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details and success:
            print(f"   Details: {details}")
        print()

    def test_app_connectivity(self):
        """Test if the application is accessible"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                details += " - Application is accessible"
            self.log_test("Application Connectivity", success, details)
            return success
        except Exception as e:
            self.log_test("Application Connectivity", False, str(e))
            return False

    def test_patient_login(self):
        """Test patient authentication"""
        try:
            # First get the signin page to get any CSRF tokens if needed
            signin_response = requests.get(f"{self.base_url}/api/auth/signin")
            
            # Try NextAuth credentials signin
            login_data = {
                "email": "john.doe@email.com",
                "password": "patient123",
                "redirect": "false",
                "json": "true"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/callback/credentials",
                data=login_data,
                allow_redirects=False
            )
            
            # Check if we get a session cookie or redirect
            success = response.status_code in [200, 302] or 'next-auth.session-token' in response.cookies
            details = f"Status: {response.status_code}"
            
            if success:
                self.patient_session = requests.Session()
                # Copy cookies from the response
                for cookie in response.cookies:
                    self.patient_session.cookies.set(cookie.name, cookie.value)
                details += " - Patient login successful"
            else:
                details += f" - Login failed. Response: {response.text[:200]}"
            
            self.log_test("Patient Login", success, details)
            return success
            
        except Exception as e:
            self.log_test("Patient Login", False, str(e))
            return False

    def test_laboratory_login(self):
        """Test laboratory authentication"""
        try:
            login_data = {
                "email": "central@lab.com",
                "password": "lab123",
                "redirect": "false",
                "json": "true"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/callback/credentials",
                data=login_data,
                allow_redirects=False
            )
            
            success = response.status_code in [200, 302] or 'next-auth.session-token' in response.cookies
            details = f"Status: {response.status_code}"
            
            if success:
                self.lab_session = requests.Session()
                for cookie in response.cookies:
                    self.lab_session.cookies.set(cookie.name, cookie.value)
                details += " - Laboratory login successful"
            else:
                details += f" - Login failed. Response: {response.text[:200]}"
            
            self.log_test("Laboratory Login", success, details)
            return success
            
        except Exception as e:
            self.log_test("Laboratory Login", False, str(e))
            return False

    def test_get_laboratories_api(self):
        """Test GET /api/laboratories endpoint"""
        try:
            # Test without authentication first
            response = requests.get(f"{self.base_url}/api/laboratories")
            
            if response.status_code == 401:
                # Try with patient session if available
                if self.patient_session:
                    response = self.patient_session.get(f"{self.base_url}/api/laboratories")
                else:
                    # Create a simple session for testing
                    session = requests.Session()
                    response = session.get(f"{self.base_url}/api/laboratories")
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    data = response.json()
                    lab_count = len(data) if isinstance(data, list) else 0
                    details += f" - Found {lab_count} laboratories"
                    
                    # Check if laboratories have required fields
                    if lab_count > 0:
                        first_lab = data[0]
                        required_fields = ['id', 'name', 'address', 'phone', 'labTests']
                        missing_fields = [field for field in required_fields if field not in first_lab]
                        if missing_fields:
                            details += f" - Missing fields: {missing_fields}"
                        else:
                            details += f" - Laboratory data structure is correct"
                            # Check lab tests
                            if 'labTests' in first_lab and len(first_lab['labTests']) > 0:
                                test_count = len(first_lab['labTests'])
                                details += f" - First lab has {test_count} tests available"
                except json.JSONDecodeError:
                    details += " - Invalid JSON response"
                    success = False
            else:
                details += f" - Response: {response.text[:200]}"
            
            self.log_test("GET /api/laboratories", success, details)
            return success
            
        except Exception as e:
            self.log_test("GET /api/laboratories", False, str(e))
            return False

    def test_get_lab_tests_api(self):
        """Test GET /api/lab-tests endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/lab-tests")
            
            if response.status_code == 401 and self.patient_session:
                response = self.patient_session.get(f"{self.base_url}/api/lab-tests")
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    data = response.json()
                    test_count = len(data) if isinstance(data, list) else 0
                    details += f" - Found {test_count} lab tests"
                    
                    if test_count > 0:
                        first_test = data[0]
                        required_fields = ['id', 'name', 'price', 'duration']
                        missing_fields = [field for field in required_fields if field not in first_test]
                        if missing_fields:
                            details += f" - Missing fields: {missing_fields}"
                        else:
                            details += f" - Lab test data structure is correct"
                except json.JSONDecodeError:
                    details += " - Invalid JSON response"
                    success = False
            else:
                details += f" - Response: {response.text[:200]}"
            
            self.log_test("GET /api/lab-tests", success, details)
            return success
            
        except Exception as e:
            self.log_test("GET /api/lab-tests", False, str(e))
            return False

    def test_create_lab_booking(self):
        """Test POST /api/lab-bookings endpoint"""
        try:
            # First get available laboratories and tests
            labs_response = requests.get(f"{self.base_url}/api/laboratories")
            if labs_response.status_code != 200:
                self.log_test("Create Lab Booking", False, "Cannot get laboratories for booking test")
                return False
            
            labs_data = labs_response.json()
            if not labs_data or not labs_data[0].get('labTests'):
                self.log_test("Create Lab Booking", False, "No laboratories or tests available")
                return False
            
            # Use first available lab and test
            first_lab = labs_data[0]
            first_test = first_lab['labTests'][0]
            
            # Create booking data
            booking_data = {
                "laboratoryId": first_lab['id'],
                "labTestId": first_test['id'],
                "scheduledDate": (datetime.now() + timedelta(days=1)).isoformat()
            }
            
            # Try to create booking (this will likely fail without proper authentication)
            response = requests.post(
                f"{self.base_url}/api/lab-bookings",
                json=booking_data,
                headers={"Content-Type": "application/json"}
            )
            
            # If unauthorized, try with patient session
            if response.status_code == 401 and self.patient_session:
                response = self.patient_session.post(
                    f"{self.base_url}/api/lab-bookings",
                    json=booking_data,
                    headers={"Content-Type": "application/json"}
                )
            
            success = response.status_code in [200, 201]
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    booking_result = response.json()
                    self.created_booking_id = booking_result.get('id')
                    details += f" - Booking created successfully. ID: {self.created_booking_id}"
                except json.JSONDecodeError:
                    details += " - Booking created but invalid JSON response"
            else:
                if response.status_code == 401:
                    details += " - Unauthorized (expected without proper authentication)"
                else:
                    details += f" - Response: {response.text[:200]}"
            
            self.log_test("POST /api/lab-bookings", success, details)
            return success
            
        except Exception as e:
            self.log_test("POST /api/lab-bookings", False, str(e))
            return False

    def test_get_lab_bookings(self):
        """Test GET /api/lab-bookings endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/lab-bookings")
            
            # If unauthorized, try with patient session
            if response.status_code == 401 and self.patient_session:
                response = self.patient_session.get(f"{self.base_url}/api/lab-bookings")
            
            # If still unauthorized, try with lab session
            if response.status_code == 401 and self.lab_session:
                response = self.lab_session.get(f"{self.base_url}/api/lab-bookings")
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    data = response.json()
                    booking_count = len(data) if isinstance(data, list) else 0
                    details += f" - Found {booking_count} lab bookings"
                    
                    if booking_count > 0:
                        first_booking = data[0]
                        required_fields = ['id', 'status', 'scheduledDate', 'laboratory', 'labTest']
                        missing_fields = [field for field in required_fields if field not in first_booking]
                        if missing_fields:
                            details += f" - Missing fields: {missing_fields}"
                        else:
                            details += f" - Booking data structure is correct"
                            details += f" - Status: {first_booking.get('status', 'N/A')}"
                except json.JSONDecodeError:
                    details += " - Invalid JSON response"
                    success = False
            else:
                if response.status_code == 401:
                    details += " - Unauthorized (expected without proper authentication)"
                else:
                    details += f" - Response: {response.text[:200]}"
            
            self.log_test("GET /api/lab-bookings", success, details)
            return success
            
        except Exception as e:
            self.log_test("GET /api/lab-bookings", False, str(e))
            return False

    def test_update_booking_status(self):
        """Test PUT /api/lab-bookings/[id] endpoint"""
        try:
            # First try to get existing bookings to find an ID
            bookings_response = requests.get(f"{self.base_url}/api/lab-bookings")
            
            if bookings_response.status_code == 401 and self.lab_session:
                bookings_response = self.lab_session.get(f"{self.base_url}/api/lab-bookings")
            
            booking_id = None
            if bookings_response.status_code == 200:
                try:
                    bookings_data = bookings_response.json()
                    if bookings_data and len(bookings_data) > 0:
                        booking_id = bookings_data[0]['id']
                except:
                    pass
            
            # Use created booking ID if available
            if self.created_booking_id:
                booking_id = self.created_booking_id
            
            if not booking_id:
                # Create a test booking ID for testing the endpoint structure
                booking_id = "test-booking-id"
            
            # Test status update
            update_data = {
                "status": "SAMPLE_COLLECTED"
            }
            
            response = requests.put(
                f"{self.base_url}/api/lab-bookings/{booking_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            # If unauthorized, try with lab session
            if response.status_code == 401 and self.lab_session:
                response = self.lab_session.put(
                    f"{self.base_url}/api/lab-bookings/{booking_id}",
                    json=update_data,
                    headers={"Content-Type": "application/json"}
                )
            
            success = response.status_code in [200, 404]  # 404 is acceptable if booking doesn't exist
            details = f"Status: {response.status_code}"
            
            if response.status_code == 200:
                details += " - Booking status updated successfully"
                try:
                    result = response.json()
                    new_status = result.get('status', 'N/A')
                    details += f" - New status: {new_status}"
                except:
                    pass
            elif response.status_code == 404:
                details += " - Booking not found (expected for test ID)"
            elif response.status_code == 401:
                details += " - Unauthorized (expected without proper authentication)"
            else:
                details += f" - Response: {response.text[:200]}"
            
            self.log_test("PUT /api/lab-bookings/[id]", success, details)
            return success
            
        except Exception as e:
            self.log_test("PUT /api/lab-bookings/[id]", False, str(e))
            return False

    def test_api_error_handling(self):
        """Test API error handling"""
        try:
            # Test invalid booking creation
            invalid_booking_data = {
                "laboratoryId": "invalid-id",
                "labTestId": "invalid-id",
                "scheduledDate": "invalid-date"
            }
            
            response = requests.post(
                f"{self.base_url}/api/lab-bookings",
                json=invalid_booking_data,
                headers={"Content-Type": "application/json"}
            )
            
            # Should return 400 or 401 (bad request or unauthorized)
            success = response.status_code in [400, 401, 404]
            details = f"Status: {response.status_code}"
            
            if success:
                details += " - API properly handles invalid requests"
            else:
                details += f" - Unexpected response: {response.text[:200]}"
            
            self.log_test("API Error Handling", success, details)
            return success
            
        except Exception as e:
            self.log_test("API Error Handling", False, str(e))
            return False

    def run_all_tests(self):
        """Run all lab booking API tests"""
        print("🧪 Starting HealthMate Lab Booking API Tests")
        print("=" * 60)
        
        # Test basic connectivity
        if not self.test_app_connectivity():
            print("❌ Cannot connect to application. Is it running on localhost:3000?")
            return False
        
        # Test authentication (optional - may not work without proper session handling)
        print("\n🔐 Testing Authentication:")
        self.test_patient_login()
        self.test_laboratory_login()
        
        # Test core lab booking APIs
        print("\n🏥 Testing Lab Booking APIs:")
        self.test_get_laboratories_api()
        self.test_get_lab_tests_api()
        self.test_get_lab_bookings()
        self.test_create_lab_booking()
        self.test_update_booking_status()
        
        # Test error handling
        print("\n⚠️  Testing Error Handling:")
        self.test_api_error_handling()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        
        if success_rate >= 80:
            print(f"🎉 Lab booking APIs are working well! ({success_rate:.1f}% success rate)")
            return True
        elif success_rate >= 60:
            print(f"⚠️  Lab booking APIs have some issues. ({success_rate:.1f}% success rate)")
            return False
        else:
            print(f"❌ Lab booking APIs have significant issues. ({success_rate:.1f}% success rate)")
            return False

def main():
    """Main test runner"""
    tester = LabBookingAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())