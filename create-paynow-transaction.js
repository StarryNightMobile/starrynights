const fetch = require("node-fetch");
const crypto = require("crypto");

const INTEGRATOR_ID = process.env.PAYNOW_INTEGRATOR_ID;
const INTEGRATOR_KEY = process.env.PAYNOW_INTEGRATOR_KEY;
const RETURN_URL = process.env.PAYNOW_RETURN_URL || (process.env.SITE_URL || '') + "/confirmation.html";

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { amount, reference, return_url } = body;
    if (!amount || !reference) {
      return { statusCode: 400, body: "Missing amount or reference" };
    }

    const payload = {
      amount: Number(amount).toFixed(2),
      reference,
      return_url: return_url || RETURN_URL,
      id: INTEGRATOR_ID
    };

    const sign = crypto.createHmac('sha256', INTEGRATOR_KEY || '').update(payload.reference + payload.amount).digest('hex');
    payload.signature = sign;

    const redirectUrl = `https://www.paynow.co.zw/?reference=${encodeURIComponent(reference)}&amount=${payload.amount}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ url: redirectUrl })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};
