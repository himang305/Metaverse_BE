const express = require("express");
const cors = require('cors');
const filmrare_routes = require("./routes/filmrare_routes");
const bodyParser = require('body-parser');

const stripe = require('stripe')('sk_test_51HCSmCAQgwEW0kk8kfhc4KIECR2atsiXQtKo2s8A3KLnNkv1ntjh5U0NdhLaT5etxnug17o4xj7mhl9fXKhhyeQT00OnHrNgzz');

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "API Connection OK" });
});

app.use("/filmrare", filmrare_routes);

app.use(cors({
  origin: '*'
}));

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// confirm the paymentIntent
app.post('/pay', async (request, response) => {
  try {
    // Create the PaymentIntent
    let intent = await stripe.paymentIntents.create({
      payment_method: request.body.payment_method_id,
      description: "Test payment",
      amount: request.body.amount * 100,
      currency: 'usd',
      confirmation_method: 'manual',
      confirm: true
    });
    // Send the response to the client
    response.send(generateResponse(intent));
  } catch (e) {
    // Display error on client
    return response.send({ error: e.message });
  }
});
app.post('/sub', async (req, res) => {
  try{
    const {email, payment_method} = req.body;

    const customer = await stripe.customers.create({
      payment_method: payment_method,
      email: email,
      invoice_settings: {
        default_payment_method: payment_method,
      },
    });
    console.log(customer.email);
    console.log(customer.id);
    console.log(customer.created);
    var stripe_user_creation_date = new Date(customer.created * 1000);
    console.log(stripe_user_creation_date.toISOString().slice(0, 19).replace('T', ' '));

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: 'price_1LVsEtAQgwEW0kk871jAlGMe' }],
      expand: ['latest_invoice.payment_intent']
    });

    const status = subscription['latest_invoice']['payment_intent']['status']
    const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']
    const invoice = subscription['latest_invoice']['invoice_pdf']
    console.log(status);
   // console.log('sudeep');
    //console.log(subscription);
    //res.json(subscription);

    res.send({'client_secret': client_secret, 'status': status,'invoice':invoice,'success':true});
   // res.json({'client_secret': client_secret, 'status': status,'invoice':invoice,'success':true});
  } catch (e) {
    return res.send({ error: e.message });
  }
})
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
};

app.use("/filmrare", filmrare_routes);

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

app.listen(process.env.PORT || 5020, () => {
  console.log(`Filmrare app listening`);
});
