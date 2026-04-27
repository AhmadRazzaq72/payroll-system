const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './auth.env' });

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Attendance";
const dbName = 'Attendance';

async function fixNullPasswords() {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const defaultPassword = await bcrypt.hash('123456', 10);
    
    const result = await db.collection('users').updateMany(
      { password: null },
      { $set: { password: defaultPassword } }
    );
    
    console.log(`✅ Successfully updated ${result.modifiedCount} user(s) with null passwords to "123456".`);
  } catch (err) {
    console.error('Error updating users:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

fixNullPasswords();
