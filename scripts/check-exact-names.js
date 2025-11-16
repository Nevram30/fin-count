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

async function checkExactNames() {
  try {
    console.log("🔍 Checking Exact Beneficiary Names\n");
    console.log("=".repeat(80));

    // Get all unique beneficiary names with Sto Thomas
    const query = `
      SELECT 
        beneficiaryName,
        COUNT(*) as count,
        SUM(fingerlings) as totalFingerlings,
        SUM(actualHarvestKilos) as totalHarvest
      FROM Distributions
      WHERE beneficiaryName LIKE '%Sto%Thomas%'
      GROUP BY beneficiaryName
      ORDER BY totalFingerlings DESC;
    `;

    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log(`\nFound ${results.length} unique beneficiary names:\n`);

    results.forEach((record, index) => {
      console.log(`${index + 1}. "${record.beneficiaryName}"`);
      console.log(`   Records: ${record.count}`);
      console.log(
        `   Total Fingerlings: ${parseInt(
          record.totalFingerlings
        ).toLocaleString()}`
      );
      console.log(
        `   Total Harvest: ${parseFloat(
          record.totalHarvest
        ).toLocaleString()} kg`
      );
      console.log("");
    });

    console.log("=".repeat(80));

    // Now check if there are name variations that should be the same
    const variationsQuery = `
      SELECT 
        beneficiaryName,
        dateDistributed,
        fingerlings,
        actualHarvestKilos,
        municipality
      FROM Distributions
      WHERE beneficiaryName LIKE '%LGU%Sto%Thomas%'
      ORDER BY beneficiaryName, dateDistributed;
    `;

    const variations = await sequelize.query(variationsQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log(
      `\n\nLGU Sto. Thomas Variations (${variations.length} records):\n`
    );

    let currentName = "";
    variations.forEach((record) => {
      if (record.beneficiaryName !== currentName) {
        currentName = record.beneficiaryName;
        console.log(`\n"${currentName}":`);
      }
      console.log(
        `   ${
          record.dateDistributed.toISOString().split("T")[0]
        } | ${record.fingerlings.toLocaleString()} fingerlings | ${
          record.actualHarvestKilos
        } kg | ${record.municipality}`
      );
    });

    console.log("\n" + "=".repeat(80));

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error);
    await sequelize.close();
    process.exit(1);
  }
}

checkExactNames();
