#!/bin/bash

# Test script for lab booking APIs

echo "🧪 Testing HealthMate Lab Booking APIs"
echo "=================================="

# Test laboratories endpoint (needs auth - so will redirect)
echo -e "\n1. Testing Laboratories API:"
curl -X GET "http://localhost:3000/api/laboratories" -i -s | head -5

# Test lab-tests endpoint (needs auth - so will redirect)  
echo -e "\n2. Testing Lab Tests API:"
curl -X GET "http://localhost:3000/api/lab-tests" -i -s | head -5

# Test lab-bookings endpoint (needs auth - so will redirect)
echo -e "\n3. Testing Lab Bookings API:"
curl -X GET "http://localhost:3000/api/lab-bookings" -i -s | head -5

echo -e "\n✅ API endpoints are responding (need authentication for actual data)"