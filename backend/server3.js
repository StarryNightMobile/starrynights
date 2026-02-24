// Starry Night Mobiles Backend with Logistics Tracking History
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File-based storage
const ordersFile = path.join(__dirname, 'orders.json');
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, JSON.stringify([]));

// Generate tracking number
function generateTrackingNumber() {
  return 'SNM-' + Math.floor(100000 + Math.random() * 900000);
}

// Create new order
app.post('/api/order', (req, res) => {
  try {
    const { customer, items, total, paymentMethod, createdAt } = req.body;
    if (!customer || !items || items.length === 0 || !total || !paymentMethod) {
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
      status: 'Processing',
      trackingHistory: [] // Array of updates { status, location, debitNote, timestamp }
    };

    const orders = JSON.parse(fs.readFileSync(ordersFile));
    orders.push(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    res.json({ trackingNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order: add tracking entry (status/location/debitNote)
app.patch('/api/order/:trackingNumber', (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { status, location, debitNote } = req.body;

    if (!status && !location && !debitNote) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const orders = JSON.parse(fs.readFileSync(ordersFile));
    const order = orders.find(o => o.trackingNumber === trackingNumber);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Add a new tracking history entry
    const entry = {
      timestamp: new Date().toISOString(),
      status: status || order.status,
      location: location || null,
      debitNote: debitNote || null
    };
    order.trackingHistory.push(entry);

    // Optionally update current status
    if (status) order.status = status;

    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    res.json({ message: 'Tracking updated', trackingEntry: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order by tracking number
app.get('/api/order/:trackingNumber', (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  const order = orders.find(o => o.trackingNumber === req.params.trackingNumber);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// Get all orders (for admin/testing)
app.get('/api/orders', (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersFile));
  res.json(orders);
});

// Test route
app.get('/', (req, res) => {
  res.send('Starry Night Mobiles API with full logistics tracking running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});