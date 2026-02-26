#!/bin/bash

# Replace with your forwarded Codespace URL
BASE_URL="https://5000-sturdy-rotary-phone-v69ggx7v7vg92p9w4.githubpreview.dev"

echo "=== Creating a new order ==="
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/order" \
-H "Content-Type: application/json" \
-d '{
  "customer": {"name": "Charlie", "address": "456 Oak St"},
  "items": [{"name": "Mobile C", "qty": 1, "price": 200}],
  "total": 200,
  "paymentMethod": "Debit Card"
}')

echo "Response: $CREATE_RESPONSE"

# Extract tracking number
TRACKING_NUMBER=$(echo $CREATE_RESPONSE | grep -o '"trackingNumber":"[^"]*"' | cut -d':' -f2 | tr -d '"')
echo "Tracking Number: $TRACKING_NUMBER"

echo "=== Adding a tracking update ==="
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/order/$TRACKING_NUMBER" \
-H "Content-Type: application/json" \
-d '{
  "status": "In Transit",
  "location": "Distribution Center",
  "debitNote": "DN-005"
}')

echo "Response: $UPDATE_RESPONSE"

echo "=== Fetching the full order ==="
curl -s "$BASE_URL/api/order/$TRACKING_NUMBER" | jq