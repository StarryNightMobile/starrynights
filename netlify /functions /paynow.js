const axios = require("axios");

exports.handler = async (event) => {
  try {
      const { amount, phone, email } = JSON.parse(event.body);

          const PAYNOW_ID = process.env.PAYNOW_ID;
              const PAYNOW_KEY = process.env.PAYNOW_KEY;

                  const formattedPhone = phone
                        .replace("+", "")
                              .replace(/^0/, "263");

                                  const paymentData = {
                                        id: PAYNOW_ID,
                                              key: PAYNOW_KEY,
                                                    amount,
                                                          phone: formattedPhone,
                                                                email,
                                                                      method: "ecocash",
                                                                            returnurl: "https://starrmobiles.netlify.app/success",
                                                                                  resulturl: "https://starrmobiles.netlify.app/.netlify/functions/verify",
                                                                                      };

                                                                                          const response = await axios.post(
                                                                                                "https://www.paynow.co.zw/interface/initiatetransaction",
                                                                                                      paymentData
                                                                                                          );

                                                                                                              if (response.data.status !== "Ok") {
                                                                                                                    throw new Error(response.data.error);
                                                                                                                        }

                                                                                                                            return {
                                                                                                                                  s
                                                                                                                                  