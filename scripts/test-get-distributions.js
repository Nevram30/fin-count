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

async function testGetDistributions() {
  try {
    console.log("🔍 Testing GET Distribution Data\n");
    console.log("=".repeat(80));

    // Simulate what the GET endpoint does - fetch all distributions
    const query = `
      SELECT 
        id,
        beneficiaryName,
        municipality,
        province,
        species,
        fingerlings,
        actualHarvestKilos,
        forecastedHarvestKilos,
        dateDistributed,
        actualHarvestDate,
        remarks
      FROM Distributions
      ORDER BY dateDistributed DESC
      LIMIT 20;
    `;

    const results = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log(`\n📊 FIRST 20 DISTRIBUTION RECORDS:\n`);

    results.forEach((record, index) => {
      console.log(`${index + 1}. ${record.beneficiaryName}`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Location: ${record.municipality}, ${record.province}`);
      console.log(`   Species: ${record.species}`);
      console.log(`   Fingerlings: ${record.fingerlings.toLocaleString()}`);
      console.log(
        `   Forecasted Harvest: ${
          record.forecastedHarvestKilos
            ? record.forecastedHarvestKilos.toFixed(2)
            : "N/A"
        } kg`
      );
      console.log(
        `   Actual Harvest: ${
          record.actualHarvestKilos
            ? record.actualHarvestKilos.toLocaleString()
            : "N/A"
        } kg`
      );
      console.log(
        `   Date Distributed: ${
          record.dateDistributed.toISOString().split("T")[0]
        }`
      );
      console.log(
        `   Harvest Date: ${
          record.actualHarvestDate
            ? record.actualHarvestDate.toISOString().split("T")[0]
            : "N/A"
        }`
      );
      console.log(`   Remarks: ${record.remarks || "N/A"}`);
      console.log("");
    });

    console.log("=".repeat(80));

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalRecords,
        COUNT(DISTINCT beneficiaryName) as uniqueBeneficiaries,
        SUM(fingerlings) as totalFingerlings,
        SUM(actualHarvestKilos) as totalActualHarvest,
        SUM(forecastedHarvestKilos) as totalForecastedHarvest,
        COUNT(CASE WHEN actualHarvestKilos IS NOT NULL THEN 1 END) as recordsWithHarvest,
        COUNT(CASE WHEN actualHarvestKilos IS NULL THEN 1 END) as recordsWithoutHarvest
      FROM Distributions;
    `;

    const summary = await sequelize.query(summaryQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const stats = summary[0];

    console.log("\n📈 OVERALL STATISTICS:\n");
    console.log(`Total Records: ${stats.totalRecords}`);
    console.log(`Unique Beneficiaries: ${stats.uniqueBeneficiaries}`);
    console.log(
      `Total Fingerlings Distributed: ${parseInt(
        stats.totalFingerlings
      ).toLocaleString()}`
    );
    console.log(
      `Total Forecasted Harvest: ${parseFloat(
        stats.totalForecastedHarvest
      ).toLocaleString()} kg`
    );
    console.log(
      `Total Actual Harvest: ${
        stats.totalActualHarvest
          ? parseFloat(stats.totalActualHarvest).toLocaleString()
          : "0"
      } kg`
    );
    console.log(`Records with Harvest Data: ${stats.recordsWithHarvest}`);
    console.log(`Records without Harvest Data: ${stats.recordsWithoutHarvest}`);

    console.log("\n" + "=".repeat(80));

    // Check for LGU Sto. Thomas specifically
    const lguQuery = `
      SELECT 
        beneficiaryName,
        COUNT(*) as count,
        SUM(fingerlings) as totalFingerlings,
        SUM(actualHarvestKilos) as totalHarvest
      FROM Distributions
      WHERE beneficiaryName LIKE '%LGU%Sto%Thomas%'
      GROUP BY beneficiaryName;
    `;

    const lguResults = await sequelize.query(lguQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log("\n🏛️ LGU STO. THOMAS SUMMARY:\n");

    let totalLGUFingerlings = 0;
    let totalLGUHarvest = 0;

    lguResults.forEach((record) => {
      console.log(`"${record.beneficiaryName}"`);
      console.log(`   Records: ${record.count}`);
      console.log(
        `   Fingerlings: ${parseInt(record.totalFingerlings).toLocaleString()}`
      );
      console.log(
        `   Harvest: ${parseFloat(record.totalHarvest).toLocaleString()} kg`
      );
      console.log("");

      totalLGUFingerlings += parseInt(record.totalFingerlings);
      totalLGUHarvest += parseFloat(record.totalHarvest);
    });

    console.log("COMBINED TOTAL (if they are the same entity):");
    console.log(
      `   Total Fingerlings: ${totalLGUFingerlings.toLocaleString()}`
    );
    console.log(`   Total Harvest: ${totalLGUHarvest.toLocaleString()} kg`);

    console.log("\n" + "=".repeat(80));
    console.log("\n✅ Test completed successfully!\n");

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error);
    await sequelize.close();
    process.exit(1);
  }
}

testGetDistributions();
