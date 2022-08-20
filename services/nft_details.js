const db = require("./db");
const helper = require("../helper");
const config = require("../config");

async function getMultiple(page = 1,id = 0) {
  const offset = helper.getOffset(page, config.listPerPage);
  var id_filter = '';
  if(id != 0){
    id_filter = ` where id = ${id} `;
  }
  const rows = await db.query(
    `SELECT * FROM nft_details ${id_filter} LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getUsers(nft_details) {
  if(nft_details.user_name != "" && nft_details.user_password != ""){
    user_filter = ` where user_name = "${nft_details.user_name}" and user_password = "${nft_details.user_password}"`;
  
  const rows = await db.query(
    `SELECT * FROM user_master ${user_filter} `
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

async function createUser(nft_details) {
  console.log(nft_details.nft_id);
  const result = await db.query(
    `INSERT INTO user_master 
    (user_name, user_password, first_name, last_name, email, phone, address	) 
    VALUES 
    ("${nft_details.user_name}","${nft_details.user_password}","${nft_details.first_name}", 
      "${nft_details.last_name}","${nft_details.email}",${nft_details.phone},"${nft_details.address}")`
  );
  let message = "Error in creating user";
  if (result.affectedRows) {
    message = "User created successfully";
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

module.exports = {
  getMultiple,
  getUsers,
  create,
  createUser,
  updateUser,
  update,
  remove,
};
