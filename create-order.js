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
  try {
    const body = JSON.parse(event.body || "{}");
    const { items, total, name, contact, email, notes } = body;
    if (!items || !total) return { statusCode: 400, body: "Missing order data" };
    const itemsDesc = items.map(i => `${i.name} x${i.qty}`).join("; ");
    const csvLine = `${new Date().toISOString()},"${itemsDesc}",${total},"${name}","${contact}","${email}","${notes}"`;
    const html = `<p>New order received:</p><ul><li><strong>Items:</strong> ${itemsDesc}</li><li><strong>Total (USD):</strong> ${total}</li><li><strong>Name:</strong> ${name}</li><li><strong>Contact:</strong> ${contact}</li><li><strong>Email:</strong> ${email}</li><li><strong>Notes:</strong> ${notes}</li></ul>`;
    await sendEmail("New order received — Starry Mobile", html);
    await appendOrderToGithubCSV(csvLine);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "error" };
  }
};
if (!req.file) {
  const doc = new PDFDocument();
  const filePath = `./uploads/${Date.now()}-debit-note.pdf`;
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("DEBIT NOTE", { align: "center" });
  doc.moveDown();
  doc.text(`Customer: ${req.body.customerName}`);
  doc.text(`Email: ${req.body.email}`);
  doc.text(`Tracking: ${trackingNumber}`);
  doc.end();

  debitNoteImage = filePath;
}