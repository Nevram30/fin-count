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

// Create Sequelize instance with timeout settings
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

async function testLeaderboardData() {
  try {
    console.log("🔍 Testing Leaderboard Data Aggregation\n");
    console.log("=".repeat(80));

    // Query to get top 10 beneficiaries by total harvest
    const query = `
      SELECT 
        beneficiaryName,
        COUNT(*) as distributionCount,
        SUM(fingerlings) as totalFingerlings,
        SUM(actualHarvestKilos) as totalHarvestKilos,
        GROUP_CONCAT(DISTINCT species) as species,
        GROUP_CONCAT(DISTINCT municipality) as locations
      FROM Distributions
      GROUP BY beneficiaryName
      ORDER BY totalHarvestKilos DESC
      LIMIT 10;
    `;

    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log("\n📊 TOP 10 BENEFICIARIES BY ACTUAL HARVEST:\n");

    results.forEach((row, index) => {
      console.log(`${index + 1}. ${row.beneficiaryName}`);
      console.log(`   Distributions: ${row.distributionCount}`);
      console.log(
        `   Total Fingerlings: ${row.totalFingerlings.toLocaleString()}`
      );
      console.log(
        `   Total Harvest: ${parseFloat(
          row.totalHarvestKilos
        ).toLocaleString()} kg`
      );
      console.log(`   Species: ${row.species}`);
      console.log(`   Locations: ${row.locations}`);
      console.log("");
    });

    console.log("=".repeat(80));

    // Check for duplicate names (case-insensitive)
    const duplicateCheck = `
      SELECT 
        LOWER(beneficiaryName) as lowerName,
        GROUP_CONCAT(beneficiaryName) as variations,
        COUNT(*) as count
      FROM Distributions
      GROUP BY LOWER(beneficiaryName)
      HAVING count > 1
      ORDER BY count DESC
      LIMIT 10;
    `;

    const duplicates = await sequelize.query(duplicateCheck, {
      type: Sequelize.QueryTypes.SELECT,
    });

    if (duplicates.length > 0) {
      console.log(
        "\n⚠️  POTENTIAL DUPLICATE BENEFICIARIES (case variations):\n"
      );
      duplicates.forEach((dup) => {
        console.log(`   "${dup.variations}" appears ${dup.count} times`);
      });
    } else {
      console.log("\n✅ No duplicate beneficiary names found");
    }

    console.log("\n" + "=".repeat(80));

    // Sample individual records for verification
    const sampleQuery = `
      SELECT 
        beneficiaryName,
        fingerlings,
        actualHarvestKilos,
        species,
        municipality,
        dateDistributed
      FROM Distributions
      WHERE beneficiaryName IN (
        SELECT beneficiaryName 
        FROM Distributions 
        GROUP BY beneficiaryName 
        ORDER BY SUM(actualHarvestKilos) DESC 
        LIMIT 3
      )
      ORDER BY beneficiaryName, dateDistributed;
    `;

    const samples = await sequelize.query(sampleQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log("\n📋 SAMPLE RECORDS FROM TOP 3 BENEFICIARIES:\n");

    let currentBeneficiary = "";
    samples.forEach((record) => {
      if (record.beneficiaryName !== currentBeneficiary) {
        currentBeneficiary = record.beneficiaryName;
        console.log(`\n${currentBeneficiary}:`);
      }
      console.log(
        `   ${record.dateDistributed.toISOString().split("T")[0]} | ${
          record.fingerlings
        } fingerlings | ${record.actualHarvestKilos} kg | ${record.species} | ${
          record.municipality
        }`
      );
    });

    console.log("\n" + "=".repeat(80));
    console.log("\n✅ Test completed successfully!\n");

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error);
    await sequelize.close();
    process.exit(1);
  }
}

testLeaderboardData();
