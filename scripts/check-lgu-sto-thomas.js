const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Load database configuration
const dbConfig = require(path.join(
  __dirname,
  "../src/server/database/config/db.js"
));

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.development.database,
  dbConfig.development.username,
  dbConfig.development.password,
  {
    host: dbConfig.development.host,
    port: dbConfig.development.port || 3306,
    dialect: dbConfig.development.dialect,
    dialectModule: require("mysql2"),
    logging: false,
    dialectOptions: {
      connectTimeout: 60000,
      decimalNumbers: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  }
);

async function checkLGUStoThomas() {
  try {
    console.log("🔍 Checking LGU Sto. Thomas Data\n");
    console.log("=".repeat(80));

    // Get all records for LGU Sto. Thomas
    const query = `
      SELECT 
        id,
        beneficiaryName,
        dateDistributed,
        fingerlings,
        actualHarvestKilos,
        species,
        municipality,
        province
      FROM Distributions
      WHERE beneficiaryName LIKE '%Sto%Thomas%'
      ORDER BY dateDistributed;
    `;

    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log(`\nFound ${results.length} records for LGU Sto. Thomas:\n`);

    let totalFingerlings = 0;
    let totalHarvest = 0;

    results.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}`);
      console.log(`   Beneficiary: ${record.beneficiaryName}`);
      console.log(
        `   Date: ${record.dateDistributed.toISOString().split("T")[0]}`
      );
      console.log(`   Fingerlings: ${record.fingerlings.toLocaleString()}`);
      console.log(`   Harvest: ${record.actualHarvestKilos} kg`);
      console.log(`   Species: ${record.species}`);
      console.log(`   Location: ${record.municipality}, ${record.province}`);
      console.log("");

      totalFingerlings += parseInt(record.fingerlings);
      totalHarvest += parseFloat(record.actualHarvestKilos);
    });

    console.log("=".repeat(80));
    console.log("\nTOTALS:");
    console.log(`Total Fingerlings: ${totalFingerlings.toLocaleString()}`);
    console.log(`Total Harvest: ${totalHarvest.toLocaleString()} kg`);
    console.log(`Expected Fingerlings: 99,400`);
    console.log(`Difference: ${(totalFingerlings - 99400).toLocaleString()}`);

    console.log("\n" + "=".repeat(80));

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error);
    await sequelize.close();
    process.exit(1);
  }
}

checkLGUStoThomas();
