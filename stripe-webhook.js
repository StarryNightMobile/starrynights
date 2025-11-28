const stripe = require("stripe")(process.env.STRIPE_SECRET);
const fetch = require("node-fetch");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_ORDERS_PATH = process.env.GITHUB_ORDERS_PATH || "orders/orders.csv";

function sendEmail(subject, htmlContent) {
  if (!SENDGRID_API_KEY || !process.env.ADMIN_EMAIL) return Promise.resolve();
  const body = {
    personalizations: [{ to: [{ email: process.env.ADMIN_EMAIL }] }],
    from: { email: process.env.SENDER_EMAIL || process.env.ADMIN_EMAIL },
    subject,
    content: [{ type: "text/html", value: htmlContent }]
  };
  return fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

async function appendOrderToGithubCSV(line) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) return;
  const apiBase = "https://api.github.com";
  const getUrl = `${apiBase}/repos/${GITHUB_REPO}/contents/${encodeURIComponent(GITHUB_ORDERS_PATH)}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(getUrl, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
  let sha = null;
  let existing = "";
  if (res.status === 200) {
    const data = await res.json();
    sha = data.sha;
    existing = Buffer.from(data.content, data.encoding).toString();
  } else {
    existing = "date,items,total_usd,name,contact,email,notes\n";
  }
  const updated = existing + line + "\n";
  const putUrl = `${apiBase}/repos/${GITHUB_REPO}/contents/${encodeURIComponent(GITHUB_ORDERS_PATH)}`;
  const payload = {
    message: `Add order ${new Date().toISOString()}`,
    content: Buffer.from(updated).toString("base64"),
    branch: GITHUB_BRANCH
  };
  if (sha) payload.sha = sha;
  await fetch(putUrl, {
    method: "PUT",
    headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let evt;
  try {
    evt = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (evt.type === "checkout.session.completed") {
    const session = evt.data.object;
    const customer = session.customer_details || {};
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    const itemsDesc = lineItems.data.map(li => `${li.description} x${li.quantity}`).join("; ");
    const total = (session.amount_total || 0) / 100;
    const name = customer.name || session.metadata.name || "—";
    const email = customer.email || session.customer_email || session.metadata.email || "—";
    const contact = session.metadata.contact || "—";
    const notes = session.metadata.notes || "";
    const csvLine = `${new Date().toISOString()},"${itemsDesc}",${total},"${name}","${contact}","${email}","${notes}"`;

    const html = `<p>New order received:</p>
      <ul>
        <li><strong>Items:</strong> ${itemsDesc}</li>
        <li><strong>Total (USD):</strong> ${total}</li>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Contact:</strong> ${contact}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Notes:</strong> ${notes}</li>
      </ul>`;

    await sendEmail("New order received — Starry Mobile", html);
    await appendOrderToGithubCSV(csvLine);
  }

  return { statusCode: 200, body: "ok" };
};
