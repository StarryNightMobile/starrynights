// Simple Express backend for Starry Night Mobiles
// Handles order creation and returns tracking number

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple file-based storage (no database yet)
const ordersFile = path.join(__dirname, 'orders.json');

// Ensure orders file exists
if (!fs.existsSync(ordersFile)) {
  fs.writeFileSync(ordersFile, JSON.stringify([]));
}

// Generate tracking number
function generateTrackingNumber() {
  return 'SNM-' + Math.floor(100000 + Math.random() * 900000);
}

// Create order endpoint
app.post('/api/order', (req, res) => {
  try {
    const { customer, items, total, paymentMethod, createdAt } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data' });
    }

    const trackingNumber = generateTrackingNumber();

    const newOrder = {
      trackingNumber,
      customer,
      items,
      total,
      paymentMethod,
      createdAt: createdAt || new Date().toISOString(),
      status: 'Processing'
    };

    const existingOrders = JSON.parse(fs.readFileSync(ordersFile));
    existingOrders.push(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(existingOrders, null, 2));

    res.json({ trackingNumber });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple test route
app.get('/', (req, res) => {
  res.send('Starry Night Mobiles API running...');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});