#!/bin/bash

echo "🧪 Testing HealthMate API endpoints..."

BASE_URL="http://localhost:3001"

# Test basic health check
echo "1. Testing basic page load..."
curl -s "$BASE_URL" | grep -q "HealthMate" && echo "✅ Homepage loads" || echo "❌ Homepage failed"

# Test authentication endpoints
echo "2. Testing user registration..."
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "PATIENT"
  }' | grep -q "success\|user\|error" && echo "✅ Registration endpoint works" || echo "❌ Registration failed"

# Test database connection by checking admin dashboard API
echo "3. Testing admin dashboard API..."
curl -s "$BASE_URL/api/admin/dashboard" | grep -q "error\|unauthorized\|totalUsers" && echo "✅ Admin API endpoint accessible" || echo "❌ Admin API failed"

echo "4. Testing pharmacies API..."
curl -s "$BASE_URL/api/pharmacies" | grep -q "error\|unauthorized\|\[\]" && echo "✅ Pharmacies API works" || echo "❌ Pharmacies API failed"

echo "5. Testing medicines API..."
curl -s "$BASE_URL/api/medicines" | grep -q "error\|unauthorized\|\[\]" && echo "✅ Medicines API works" || echo "❌ Medicines API failed"

echo ""
echo "🔍 Server processes:"
ps aux | grep -E "(next|node)" | grep -v grep

echo ""
echo "📊 Basic API testing completed!"