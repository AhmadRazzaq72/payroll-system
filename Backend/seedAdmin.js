const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './auth.env' });

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Attendance";
const dbName = 'Attendance';

async function seedAdmin() {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      username: 'admin',
      user_id: 'ADMIN001',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'hr',
      gender: 'Male',
      joigningDate: new Date().toISOString(),
      designation: 'HR',
      mobile: '1234567890',
      address: 'Admin Street',
      salary: '0',
      employmentType: 'Full-time',
      attendanceType: 'Remote',
      emergencyContact: '0987654321',
      emergencyContactname: 'Admin Contact',
      bankAccount: '1234567890',
      IFSC: 'ADMIN123',
    };

    const result = await db.collection('users').insertOne(adminUser);
    console.log('✅ Admin user created successfully:', result.insertedId);
    console.log('\n--- Login Credentials ---');
    console.log('Username: admin');
    console.log('User ID: ADMIN001');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seedAdmin();
