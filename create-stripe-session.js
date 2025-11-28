const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { items, success_url, cancel_url, metadata } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: "No items provided" };
    }

    const line_items = items.map(i => ({
      price_data: {
        currency: "usd",
        product_data: { name: i.name },
        unit_amount: Math.round(Number(i.price) * 100)
      },
      quantity: i.qty || 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: success_url || (process.env.SITE_URL || '') + "/confirmation.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancel_url || (process.env.SITE_URL || '') + "/",
      metadata: metadata || {}
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
