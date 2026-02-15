const axios = require("axios");

exports.handler = async (event) => {
  try {
    const { amount, phone, email } = JSON.parse(event.body);

    const PAYNOW_INTEGRATION_ID = process.env.PAYNOW_INTEGRATION_ID;
    const PAYNOW_INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY;

    const paymentData = {
      id: PAYNOW_INTEGRATION_ID,
      key: PAYNOW_INTEGRATION_KEY,
      amount: amount,
      phone: phone,
      email: email,
      method: "ecocash",
      returnurl: "https://starrmobiles.netlify.app/success",
      resulturl: "https://starrmobiles.netlify.app/success",
    };

    const response = await axios.post(
      "https://www.paynow.co.zw/interface/initiatetransaction",
      paymentData
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        paynow: response.data,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message }),
    };
  }
};

                                                                               