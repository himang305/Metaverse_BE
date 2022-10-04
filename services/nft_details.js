const db = require("./db");
const helper = require("../helper");
const config = require("../config");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


async function getMultiple(page = 1, id = 0, user = 0, rentee = 0) {
  const offset = helper.getOffset(page, config.listPerPage);
  var where_condition = ' where subscription_flag != 1 ';
  if (id != 0 || user != 0 || rentee != 0) {
    where = [];
    if (id != 0) where.push(` id = ${id} `);
    if (user != 0) where.push(` owner_user_id = ${user} `);
    if (rentee != 0) where.push(` rentee_user_id = ${rentee} `);
    where_condition += "AND " + where.join(' AND ');
  }

  const rows = await db.query(
    `SELECT * FROM nft_details ${where_condition} LIMIT ${offset},${config.listPerPage}`
  );

  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}
async function getMultiplewithaddress(page = 1, id = 0, user = 0, rentee = 0,address = 0) {
  const offset = helper.getOffset(page, config.listPerPage);
  var where_condition = '';
  if (address != 0 ) {
    where = [];
    if (address != 0) where.push(` rentee_address = "${address}" `);

    where_condition = " where " + where.join(' AND ');
  }

  const rows = await db.query(
      `SELECT * FROM nft_details ${where_condition} LIMIT ${offset},${config.listPerPage}`
  );

  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}
async function getUserDetailsbyaddress(address) { console.log('here am'+address);
  var where_condition = '';
  if (address != "" ) {
      const rows = await db.query(
          `SELECT * FROM user_master where address = "${address}" `
      );
      const data = helper.emptyOrRows(rows);


      return {
          data
      };
  }




}

async function create(nft_details) {
  console.log(nft_details.nft_id);
  const result = await db.query(
    `INSERT INTO nft_details 
    (nft_id, month_rent, yearly_rent, nft_price, status, floor_height, floor_area, floor_number, room_number, wall_number) 
    VALUES 
    ("${nft_details.nft_id}", ${nft_details.month_rent}, ${nft_details.yearly_rent}, 
      ${nft_details.nft_price}, ${nft_details.status}, ${nft_details.floor_height},
       ${nft_details.floor_area}, ${nft_details.floor_number},  ${nft_details.room_number},
       ${nft_details.wall_number})`
  );

  let message = "Error in creating nft";

  if (result.affectedRows) {
    message = "NFT created successfully";
  }
  return { message };
}

async function update(id, nft_details) {
  const result = await db.query(
    `UPDATE nft_details 
    SET month_rent="${nft_details.month_rent}", yearly_rent=${nft_details.yearly_rent}, 
    nft_price=${nft_details.nft_price}, 
    status=${nft_details.status}
    WHERE id=${id}`
  );

  let message = "Error in updating nft";

  if (result.affectedRows) {
    message = "NFT updated successfully";
  }

  return { message };
}

async function remove(id) {
  const result = await db.query(
    `DELETE FROM nft_details WHERE id=${id}`
  );

  let message = "Error in deleting nft";

  if (result.affectedRows) {
    message = "NFT deleted successfully";
  }

  return { message };
}




async function getUsers(nft_details) {

  console.log(nft_details);
  if (nft_details.username != "" && nft_details.password != "") {
    user_filter = ` where user_name = "${nft_details.username}"`;
    //user_filter = ` where user_name = "${nft_details.username}" and user_password = "${newPassword}"`;
    const rows = await db.query(
      `SELECT * FROM user_master ${user_filter} `
    );
    const data = helper.emptyOrRows(rows);
    const validPassword = await bcrypt.compare(nft_details.password, data[0].user_password);
    if (validPassword) {
      const token = jwt.sign({ username: nft_details.username }, 'secret', { expiresIn: '1h' });
      return { message: "Valid password", status: 200, token: token }
    } else {
      return { message: "Invalid password", status: 400 }
    }
    /*return {
      data
    };*/
  }
}

async function createUser(nft_details) {
  console.log(nft_details.email);
  if (nft_details.user_name != "" && nft_details.email != "") {
    user_filter = ` where user_name = "${nft_details.user_name}" and email = "${nft_details.email}"`;
    //user_filter = ` where user_name = "${nft_details.username}" and user_password = "${newPassword}"`;
    const rows = await db.query(
      `SELECT *
         FROM user_master ${user_filter} `
    );
    console.log(nft_details.user_name);
    const data = helper.emptyOrRows(rows);
    console.log(data);
    console.log(Object.keys(data).length);
    if (Object.keys(data).length === 0) {
      const salt = await bcrypt.genSalt(10)
      const newPassword = await bcrypt.hash(nft_details.user_password, salt)
      console.log(newPassword);
      const result = await db.query(
        `INSERT INTO user_master 
    (user_name, user_password, first_name, last_name, email, phone, address    ) 
    VALUES 
    ("${nft_details.user_name}","${newPassword}","${nft_details.first_name}", 
      "${nft_details.last_name}","${nft_details.email}",${nft_details.phone},"${nft_details.address}")`
      );
      let message = "Error in creating user";
      if (result.affectedRows) {
        message = "successfully registered!!";
      }
      return { message };
    } else {
      message = "already exists!";
      return { message, flag: "exist" };
    }
  }
}

async function updateUser(id, nft_details) {
  const result = await db.query(
    `UPDATE user_master 
    SET user_name="${nft_details.user_name}", user_password="${nft_details.user_password}", 
    first_name="${nft_details.first_name}", 
    last_name="${nft_details.last_name}",
    email="${nft_details.email}", 
    phone="${nft_details.phone}",
    address="${nft_details.address}"
    WHERE id=${id}`
  );

  let message = "Error in updating nft";

  if (result.affectedRows) {
    message = "User updated successfully";
  }

  return { message };
}


// asset_history
// id	nft_id	time_stamp	nft_json	

async function getHistory(id = 0) {

  const rows = await db.query(
    `SELECT * FROM asset_history where nft_id = ${id} order by id desc`
  );

  const data = helper.emptyOrRows(rows);

  return {
    data
  };
}

async function createHistory(nft_details) {
  console.log(nft_details.nft_id);
  const result = await db.query(
    `INSERT INTO asset_history 
    (nft_id, nft_json, remarks) 
    VALUES 
    ("${nft_details.nft_id}", "${nft_details.nft_json}", "${nft_details.remarks}")`
  );

  let message = "Error in creating history";

  if (result.affectedRows) {
    message = "Hisotry created successfully";
  }
  return { message };
}





async function isAuth(req, res) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    //return { message: 'not authenticated',status:401 };
    res.status(401).json({ message: 'not authenticated' });
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'secret');
  } catch (err) {
    res.status(500).json({ message: err.message || 'could not decode the token' });
  };
  if (!decodedToken) {
    res.status(401).json({ message: 'unauthorized' });
  } else {
    return { message: 'here is your resource', status: 200 }
  };
};

async function updateWallet(id, nft_details) {
  const result = await db.query(
    `UPDATE user_master 
    SET
    address="${nft_details.address}"
    WHERE id=${id}`
  );
  let message = "Error in updating nft";
  if (result.affectedRows) {
    message = "NFT updated successfully";
  }
  return { message };
}

async function walletsubupdate(id, nft_details) {
  const result = await db.query(
    `UPDATE subscriptions 
    SET
      wallet_address="${nft_details.address}",
      transfer_flag = 1
    WHERE user_id=${id} and stripe_id="${nft_details.sub_id}"`
  );
  let message = "Error in updating nft";
  if (result.affectedRows) {
    message = "NFT updated successfully";
  }
  return { message };
}
async function getnftbycheckbox(business_type = 0) {

    const rows = await db.query(
        `SELECT * FROM nft_details where subscription_flag != 1 AND business_type LIKE "%${business_type}%" `
    );

    let data = helper.emptyOrRows(rows);

    console.log(data.length);
    if(data.length == 0 ){
        data = ""
    }
    return {
        data
    };
}

async function getnftbysearchbox(search_name) {

  console.log(search_name.length);
  const rows = await db.query(
      `SELECT * FROM nft_details where subscription_flag != 1 AND (titile LIKE "%${search_name}%" OR title_description LIKE "%${search_name}%" OR detailed_description LIKE "%${search_name}%" OR address LIKE "%${search_name}%" OR floor_area LIKE "%${search_name}%" OR month_rent LIKE "%${search_name}%" OR yearly_rent LIKE "%${search_name}%") `
  );

  let data = helper.emptyOrRows(rows);

  console.log(data.length);
  if(data.length == 0 ){
    data = ""
  }
  return {
    data
  };
}

async function getDetails(public_url = null) {

  const rows = await db.query(
    `SELECT * FROM nft_details WHERE public_url LIKE "%${public_url}%"  LIMIT 1`
  );

  const data = helper.emptyOrRows(rows);

  return {
    data
  };
}
// to call this in filmrare_routes or stripe page,var auth = await nft_details.isAuth(req,res);
module.exports = {
  getMultiple,
  getUsers,
  create,
  createUser,
  updateUser,
  update,
  getHistory,
  createHistory,
  getDetails,
  remove, isAuth, updateWallet, walletsubupdate,getUserDetailsbyaddress,getMultiplewithaddress,getnftbycheckbox,getnftbysearchbox
};
