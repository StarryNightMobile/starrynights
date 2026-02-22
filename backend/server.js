require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(helmet());
app.use(require("cors")());

mongoose.connect(process.env.MONGO_URI);

const OrderSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phone: String,
  products: Array,
  debitNoteNumber: String,
  trackingNumber: String,
  debitNoteImage: String,
  orderLocation: { type: String, default: "Processing" },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

function generateTrackingNumber() {
  return "TRK-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

app.post("/api/order", upload.single("debitNote"), async (req, res) => {
  try {
    const trackingNumber = generateTrackingNumber();

    let debitNoteImage = null;

    if (req.file) {
      debitNoteImage = req.file.path;
    }

    const newOrder = new Order({
      ...req.body,
      trackingNumber,
      debitNoteImage
    });

    await newOrder.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: "Your Tracking Number",
      text: `Your tracking number is ${trackingNumber}`
    });

    res.json({ success: true, trackingNumber });

  } catch (err) {
    res.status(500).json({ error: "Order failed" });
  }
});

app.get("/api/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

app.listen(5000, () => console.log("Server running on port 5000"));