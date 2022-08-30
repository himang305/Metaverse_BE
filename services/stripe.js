require('dotenv').config();
const bodyParser = require('body-parser');
const db = require("./db");
const helper = require("../helper");
const stripe = require('stripe')('sk_test_51HCSmCAQgwEW0kk8kfhc4KIECR2atsiXQtKo2s8A3KLnNkv1ntjh5U0NdhLaT5etxnug17o4xj7mhl9fXKhhyeQT00OnHrNgzz');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;

const nftABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "RentUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "OWNER_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admins",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "_tokenURI",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_mnPrice",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_yrPrice",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "_price",
        "type": "uint256[]"
      }
    ],
    "name": "batchMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newAdmin",
        "type": "address"
      }
    ],
    "name": "changeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "nftDetail",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "mnPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "yrPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "status",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "expires",
        "type": "uint256"
      }
    ],
    "name": "rentNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "renteeDetail",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "expires",
            "type": "uint256"
          }
        ],
        "internalType": "struct Filmrare.UserInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "uri",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_mnPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_yrPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_status",
        "type": "uint256"
      }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const nftAddress = "0x8b730C192543EFc566d735357f625247DBB1F620";

async function subStripe(req) {
  try {
    const { email, payment_method, name,plan } = req;
    //console.log(plan);
    //managing user, return stripe ID , if not return null / create user if not exist.
    const hasStripID = await checkUserHasStripeid(email, name);
    var customer_id = hasStripID;
    if (hasStripID === '') {
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
    console.log(customer_id);
    console.log('checkUserHasStripeSubId');
    // price_1LVsEtAQgwEW0kk8gJtL1McZ   price_1LVsEtAQgwEW0kk871jAlGMe
    var planId = plan;
    const hasStripSubscriptionId = await checkUserHasStripeSubId(email, customer_id, planId);
    //console.log(hasStripSubscriptionId);
    if (Object.keys(hasStripSubscriptionId).length !== 0) {
      console.log('Already Purchased this product.')
      return { 'email': email, 'customer_id': customer_id, 'planId': planId, 'status': "already_exist", 'success': true };
      //return { 'client_secret': "client_secret", 'status': "status", 'invoice': "invoice",'success':true };

      // manage the retun part.
    }
    console.log('subscrption creating process started');
    console.log(customer_id);
    //creating subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer_id,
      items: [{ plan: planId }],
      expand: ['latest_invoice.payment_intent']
    });

    await stripeSubscription(email, customer_id, subscription);

    const status = subscription['latest_invoice']['payment_intent']['status']
    const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']
    const invoice = subscription['latest_invoice']['invoice_pdf']

    if (status === 'succeeded') {
      // The payment didn’t need any additional actions and completed!
      // Handle post-payment fulfillment
      return { 'client_secret': client_secret, 'status': status, 'invoice': invoice, 'success': true, 'user_email': email, 'customer_id': customer_id };
      //res.json(subscription);
    } else { // Invalid status
      return { error: 'Invalid PaymentIntent status' };
    }


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

async function checkUserHasStripeid(email, name) {
  console.log(email);
  user_filter = ` where email = "${email}"`;
  const rows = await db.query(`SELECT stripe_id FROM user_master ${user_filter} `);
  const stripeId = helper.emptyOrRows(rows);
  console.log(stripeId);
  let returnValue = "";
  if (Object.keys(rows).length !== 0) {
    console.log('inside checkUserHasStripeid');
    if (stripeId[0].stripe_id !== null) {
      console.log('inside checkUserHasStripeid2');
      returnValue = stripeId[0].stripe_id;
    }
  } else {
    //create user
    const result = await db.query(
      `INSERT INTO user_master 
    (user_name, user_password, first_name, last_name, email, phone, address    ) 
    VALUES 
    ("${email}","autogenerated","${name}", 
      "autogenerated","${email}","99996123","autogenerated")`
    );
    let message = "Error in creating user";
    if (result.affectedRows) {
      message = "successfully registered!!";
    }

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

  const subId = subscriptionData['id'];
  const planId = subscriptionData['plan']['id'];
  var quantity = 1;
  const subName = 'main';
  var current_period_end = new Date(subscriptionData['current_period_end'] * 1000);
  var stripe_current_period_end = current_period_end.toISOString().slice(0, 19).replace('T', ' ');

  const userData = await getUserDetails(email, customer_id);
  console.log("user id exist in user table");
  if (userData[0].id !== null) {
    const user_id = userData[0].id;
    console.log("subscription table");
    const subscriptionData = await getUserSubscriptionDetails(user_id, planId);
    if (Object.keys(subscriptionData).length === 0) {
      console.log("subscriptions insert query");
      const result = await db.query(
        `INSERT INTO subscriptions
    (user_id, name, stripe_id, stripe_plan, quantity, ends_at)
    VALUES
    (${user_id},"${subName}","${subId}",
      "${planId}",${quantity},"${stripe_current_period_end}")`
      );
      console.log("subscriptions insert Query finished");
      let message = "Error in creating Subscription";
      if (result.affectedRows) {
        message = "successfully subscribed!!";
      }
      return { message };

    } else {
      console.log("subscriptions update Query");
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



async function checkUserHasStripeSubId(email, customer_id, planId) {

  let retrunValue = '';
  const userData = await getUserDetails(email, customer_id);
  if (userData[0].id !== null) {
    const user_id = userData[0].id;
    const subscriptionData = await getUserSubscriptionDetails(user_id, planId);
    console.log(Object.keys(subscriptionData).length);
    if (Object.keys(subscriptionData).length !== 0) {
      retrunValue = subscriptionData;

    }
  }
  return retrunValue;
}

async function getUserDetails(email, customer_id) {

  const userRows = await db.query(`SELECT * FROM user_master where stripe_id = "${customer_id}" and email = "${email}" `);
  const userData = helper.emptyOrRows(userRows);
  return userData;
}
async function getUserSubscriptionDetails(user_id, planId) {

  const subscriptionRows = await db.query(`SELECT * FROM subscriptions where user_id = "${user_id}" and stripe_plan = "${planId}"`);
  const subscriptionData = helper.emptyOrRows(subscriptionRows);
  return subscriptionData;
}

async function transferOwnership(req) {
  try {

    const tokenId = req.nft_id;
    const user = req.user_address;
    const user_id = req.user_id;
    const expires = req.expiry;
    let message = '';
    const transaction_id = await getTransactionStatus(req.user_id, req.stripe_id);

    if (transaction_id > 0) {

      const rpcURL = 'https://rpc-mumbai.maticvigil.com/';                    // RPC url
      const account1 = '0xf922e3223567AeB66e6986cb09068B1B879B6ccc';          // Owner Address
      const privateKey = process.env.PRIVATE_KEY;      // Owner address private key

      const web3 = new Web3(rpcURL);
      const myContract = new web3.eth.Contract(nftABI, nftAddress);
      web3.eth.accounts.wallet.add(privateKey);

      const tx = myContract.methods.rentNFT(tokenId, user, expires);


      const gas = await tx.estimateGas({ from: account1 });
      const gasPrice = await web3.eth.getGasPrice();
      const data = tx.encodeABI();
      const nonce = await web3.eth.getTransactionCount(account1);
      const txData = {
        from: account1,
        to: nftAddress,
        data: data,
        gas,
        gasPrice,
        nonce,
        'chainId': 0x13881
      };

      const receipt = await web3.eth.sendTransaction(txData)
        .on('transactionHash', (hash) => {
          console.log(hash);
        })
        .on('receipt', (receipt) => {
          console.log(receipt.status); // true so DB call
          if (receipt.status === true) {
            message = "Blockchain Success";
          } else {
            message = "Error in blockchain transaction"
          }
        })
        .on('error', console.error);

      if (message === "Blockchain Success") {
        message = await nftTransferDB(transaction_id, tokenId, user_id, user, expires);
      }
    } else {
      message = "Stripe Transaction not found";
    }

    if (message !== "success") {
      await nftTransferFailure(transaction_id);
    }

    return { message };
  } catch (e) {
    return { error: e.message };
  }
}

async function getTransactionStatus(user_id = 0, stripe_id = 0) {

  if (user_id != 0 && stripe_id != 0) {
    user_filter = ` where user_id = ${user_id} and stripe_id = ${stripe_id} and stripe_status = 1 `;
    const rows = await db.query(
      `SELECT * FROM subscriptions ${user_filter} `
    );
    const data = helper.emptyOrRows(rows);

    if (data.length != 0) {
      return data[0].id;
    } else {
      return false;
    }
  }
}

async function nftTransferDB(transaction_id, nft_id, user_id, user, expiry) {
  let result = await db.query(
    `UPDATE nft_details 
    SET rentee_user_id = "${user_id}",rentee_address="${user}", rent_expiry_timestamp=${expiry}
    WHERE nft_id=${nft_id}`
  );

  let message = "DB error";

  if (result.affectedRows) {
    let result2 = await db.query(
      `UPDATE subscriptions 
      SET transfer_flag = 1 
      WHERE id=${transaction_id}`
    );

    message = "success";
  }

  return message;
}

async function nftTransferFailure(transaction_id) {

  const result = await db.query(
    `UPDATE subscriptions 
      SET transfer_flag = 2 
      WHERE id=${transaction_id}`
  );

}

module.exports = {
  payStripe,
  subStripe,
  transferOwnership
};

