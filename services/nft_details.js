const db = require("./db");
const helper = require("../helper");
const config = require("../config");

      //  /filmrare 
      //  /filmrare?page=2 

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * FROM nft_details LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
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

module.exports = {
  getMultiple,
  create,
  update,
  remove,
};
