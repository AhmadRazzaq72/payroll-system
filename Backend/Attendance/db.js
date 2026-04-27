const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);
let db;
const dbName = 'Attendance';
async function connectDB() {
  await client.connect();
  db = client.db(dbName);
}
function getDB() {
  return db;
}

module.exports = { connectDB, getDB};
