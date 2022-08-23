const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51HCSmCAQgwEW0kk8kfhc4KIECR2atsiXQtKo2s8A3KLnNkv1ntjh5U0NdhLaT5etxnug17o4xj7mhl9fXKhhyeQT00OnHrNgzz');


async function subStripe(req) {
  const { email, payment_method } = req;

  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: 'price_1LVsEtAQgwEW0kk871jAlGMe' }],
    expand: ['latest_invoice.payment_intent']
  });

  const status = subscription['latest_invoice']['payment_intent']['status']
  const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']
  const invoice = subscription['latest_invoice']['invoice_pdf']

  //res.json(subscription);
  return { 'client_secret': client_secret, 'status': status, 'invoice': invoice };
}

const generateResponse = (intent) => {
  if (intent.status === 'succeeded') {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment
    return {
      success: true
    };
  } else {
    // Invalid status
    return {
      error: 'Invalid PaymentIntent status'
    };
  }
}


async function payStripe(req) {
  try {
    // Create the PaymentIntent
    let intent = await stripe.paymentIntents.create({
      payment_method: req.payment_method_id,
      description: "Test payment",
      amount: req.amount * 100,
      currency: 'usd',
      confirmation_method: 'manual',
      confirm: true
    });
    // Send the response to the client
    return generateResponse(intent);

  } catch (e) {
    // Display error on client
    return { error: e.message };
  }
}


module.exports = {
  payStripe,
  subStripe
};
