const bodyParser = require('body-parser');
const db = require("./db");
const helper = require("../helper");
const stripe = require('stripe')('sk_test_51HCSmCAQgwEW0kk8kfhc4KIECR2atsiXQtKo2s8A3KLnNkv1ntjh5U0NdhLaT5etxnug17o4xj7mhl9fXKhhyeQT00OnHrNgzz');


async function subStripe(req) {
    try{
      const { email, payment_method } = req;

      const hasStripID = await checkUserHasStripeid(email);
      var customer_id = hasStripID;
      if(hasStripID === ''){
        console.log('new customer, creating account in stripe');
        const customer = await stripe.customers.create({
          payment_method: payment_method,
          email: email,
          invoice_settings: {
            default_payment_method: payment_method,
          },
        });

        var stripe_user_creation_date = new Date(customer.created * 1000);
        var stripe_date = stripe_user_creation_date.toISOString().slice(0, 19).replace('T', ' ');

        // db update after the successfull creation of customer in Stripe
        await stripeUserUpdate(customer.email, customer.id, stripe_date);
        //console.log(customer.id);
        var customer_id = customer.id;
      }

      console.log('subscrption creating process started');
      console.log(customer_id);
      //creating subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer_id,
        items: [{ plan: 'price_1LVsEtAQgwEW0kk871jAlGMe' }],
        expand: ['latest_invoice.payment_intent']
      });

      await stripeSubscription(email,customer_id,subscription);

      const status = subscription['latest_invoice']['payment_intent']['status']
      const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']
      const invoice = subscription['latest_invoice']['invoice_pdf']

      if (status === 'succeeded') {
        // The payment didn’t need any additional actions and completed!
        // Handle post-payment fulfillment
        return { 'client_secret': client_secret, 'status': status, 'invoice': invoice,'success':true };
        //res.json(subscription);
      } else { // Invalid status
        return { error: 'Invalid PaymentIntent status' };}


    }
    catch (e) {
      return { error: e.message };
    }


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

async function checkUserHasStripeid(email) {
  console.log(email);
  user_filter = ` where email = "${email}"`;
  const rows = await db.query(`SELECT stripe_id FROM user_master ${user_filter} `);
  const stripeId = helper.emptyOrRows(rows);
  let returnValue = "";
  if(stripeId[0].stripe_id !== null ){
  returnValue = stripeId[0].stripe_id;
  }
  return returnValue;
}

async function stripeUserUpdate(email, stripe_id, stripe_date) {
  console.log('inside stripeUserUpdate');
  console.log(email);
  console.log(stripe_id);
  console.log(stripe_date);

  const result = await db.query(
      `UPDATE user_master 
    SET stripe_id="${stripe_id}", stripe_account_creation_date="${stripe_date}"
    WHERE email="${email}"`
  );

  let message = "Error in updating user master";

  if (result.affectedRows) {
    message = "user master updated successfully";
  }

  return { message };
}

async function stripeSubscription(email, customer_id, subscriptionData) {
  console.log('inside stripeSubscription')
  console.log(customer_id)
  console.log(email)
  console.log(subscriptionData);
  console.log(subscriptionData['id']);
  const subId = subscriptionData['id'];
  const planId = subscriptionData['plan']['id'];
  console.log(subscriptionData['billing_cycle_anchor']);
  console.log(subscriptionData['current_period_end']);
  var quantity = 1;
  var current_period_end = new Date(subscriptionData['current_period_end'] * 1000);
  var stripe_current_period_end= current_period_end.toISOString().slice(0, 19).replace('T', ' ');

  console.log(subscriptionData['created']);
  console.log(subscriptionData['plan']['id']);
  user_filter = ` where stripe_id = "${customer_id}" and email = "${email}"`;
  const userRows = await db.query(`SELECT * FROM user_master ${user_filter} `);
  const userData = helper.emptyOrRows(userRows);
  const subName = 'main';
  console.log(userData);
  console.log(userData[0].id);
  console.log("user id exist in user table");
  if(userData[0].id !== null){
    const user_id = userData[0].id;
    console.log("subscription table");
    const subscriptionRows = await db.query(`SELECT * FROM subscriptions where user_id = "${userData[0].id}"`);
    const subscriptionData = helper.emptyOrRows(subscriptionRows);
    if(Object.keys(subscriptionData).length === 0){
      console.log("insert query");
     const result = await db.query(
          `INSERT INTO subscriptions
    (user_id, name, stripe_id, stripe_plan, quantity, ends_at)
    VALUES
    (${user_id},"${subName}","${subId}",
      "${planId}",${quantity},"${stripe_current_period_end}")`
      );
      console.log("insert Query finished");
      let message = "Error in creating Subscription";
      if (result.affectedRows) {
        message = "successfully subscribed!!";
      }
      return { message };

    }else{
      console.log("update Query");
      const subTableid = subscriptionData[0].id;
      console.log(subscriptionData[0].id);
      const result = await db.query(
          `UPDATE subscriptions 
    SET stripe_id="${subId}", stripe_plan="${planId}", ends_at="${stripe_current_period_end}"
    WHERE id=${subTableid}`
      );

      let message = "Error in updating user master";

      if (result.affectedRows) {
        message = "user master updated successfully";
      }

      return { message };
    }
  }


  let message = "Error in updating user master";

  if (result.affectedRows) {
    message = "user master updated successfully";
  }

  return { message };
}

module.exports = {
  payStripe,
  subStripe
};

