const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './auth.env' });

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Attendance";
const dbName = 'Attendance';


async function createPayrollCollectionsWithSchema() {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);

    // SalaryInfo schema
    const salaryInfoSchema = {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["employee_id", "employee_name", "base_salary", "joining_date", "updated_by"],
          properties: {
            employee_id: { bsonType: "string" },
            employee_name: { bsonType: "string" },
            base_salary: { bsonType: ["int", "double", "string"] },
            hra: { bsonType: ["int", "double", "string"], description: "House Rent Allowance" },
            bonus: { bsonType: ["int", "double", "string"], description: "Bonus" },
            tax_percent: { bsonType: ["int", "double", "string"] },
            pf_percent: { bsonType: ["int", "double", "string"] },
            joining_date: { bsonType: "string" },
            paid_leaves_allowed: { bsonType: ["int", "double", "string"] },
            last_update: { bsonType: ["date", "string"] },
            updated_by: { bsonType: "string" }
          }
        }
      }
    };

    // Payrolls schema
    const payrollsSchema = {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["employee_id", "employee_name", "month", "basic_salary", "attendance_summary", "deductions", "salary_breakdown", "status", "generated_on"],
          properties: {
            employee_id: { bsonType: "string" },
            employee_name: { bsonType: "string" },
            month: { bsonType: "string" },
            basic_salary: { bsonType: ["int", "double", "string"] },
            attendance_summary: { bsonType: "object" },
            deductions: { bsonType: "object" },
            salary_breakdown: { bsonType: "object" },
            status: { bsonType: "string" },
            generated_on: { bsonType: "string" }
          }
        }
      }
    };

    // Create SalaryInfo collection with schema
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('SalaryInfo')) {
      await db.createCollection('SalaryInfo', salaryInfoSchema);
      console.log('✅ Created collection: SalaryInfo (with schema)');
    } else {
      console.log('ℹ️  Collection SalaryInfo already exists');
    }

    if (!collectionNames.includes('Payrolls')) {
      await db.createCollection('Payrolls', payrollsSchema);
      console.log('✅ Created collection: Payrolls (with schema)');
    } else {
      console.log('ℹ️  Collection Payrolls already exists');
    }

  } catch (err) {
    console.error('Error creating collections:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

createPayrollCollectionsWithSchema();
