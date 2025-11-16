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

async function testSpeciesLeaderboard() {
  try {
    console.log("🐟 Testing Species-Specific Leaderboard Data\n");
    console.log("=".repeat(80));

    // Test TILAPIA species
    console.log("\n🐟 TOP 10 TILAPIA BENEFICIARIES:\n");
    const tilapiaQuery = `
      SELECT 
        beneficiaryName,
        COUNT(*) as distributionCount,
        SUM(fingerlings) as totalFingerlings,
        SUM(actualHarvestKilos) as totalHarvestKilos,
        GROUP_CONCAT(DISTINCT municipality) as locations
      FROM Distributions
      WHERE species = 'Tilapia'
      GROUP BY beneficiaryName
      ORDER BY totalHarvestKilos DESC
      LIMIT 10;
    `;

    const tilapiaResults = await sequelize.query(tilapiaQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    tilapiaResults.forEach((row, index) => {
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
      console.log(`   Locations: ${row.locations}`);
      console.log("");
    });

    console.log("=".repeat(80));

    // Test BANGUS species
    console.log("\n🐟 TOP 10 BANGUS BENEFICIARIES:\n");
    const bangusQuery = `
      SELECT 
        beneficiaryName,
        COUNT(*) as distributionCount,
        SUM(fingerlings) as totalFingerlings,
        SUM(actualHarvestKilos) as totalHarvestKilos,
        GROUP_CONCAT(DISTINCT municipality) as locations
      FROM Distributions
      WHERE species = 'Bangus'
      GROUP BY beneficiaryName
      ORDER BY totalHarvestKilos DESC
      LIMIT 10;
    `;

    const bangusResults = await sequelize.query(bangusQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    bangusResults.forEach((row, index) => {
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
      console.log(`   Locations: ${row.locations}`);
      console.log("");
    });

    console.log("=".repeat(80));

    // Summary statistics
    const summaryQuery = `
      SELECT 
        species,
        COUNT(*) as totalDistributions,
        COUNT(DISTINCT beneficiaryName) as uniqueBeneficiaries,
        SUM(fingerlings) as totalFingerlings,
        SUM(actualHarvestKilos) as totalHarvest,
        AVG(actualHarvestKilos) as avgHarvestPerDistribution,
        MIN(actualHarvestKilos) as minHarvest,
        MAX(actualHarvestKilos) as maxHarvest
      FROM Distributions
      GROUP BY species;
    `;

    const summary = await sequelize.query(summaryQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log("\n📊 SPECIES SUMMARY STATISTICS:\n");
    summary.forEach((row) => {
      console.log(`${row.species}:`);
      console.log(`   Total Distributions: ${row.totalDistributions}`);
      console.log(`   Unique Beneficiaries: ${row.uniqueBeneficiaries}`);
      console.log(
        `   Total Fingerlings: ${parseInt(
          row.totalFingerlings
        ).toLocaleString()}`
      );
      console.log(
        `   Total Harvest: ${parseFloat(row.totalHarvest).toLocaleString()} kg`
      );
      console.log(
        `   Avg Harvest/Distribution: ${parseFloat(
          row.avgHarvestPerDistribution
        ).toFixed(2)} kg`
      );
      console.log(
        `   Min Harvest: ${parseFloat(row.minHarvest).toLocaleString()} kg`
      );
      console.log(
        `   Max Harvest: ${parseFloat(row.maxHarvest).toLocaleString()} kg`
      );
      console.log("");
    });

    console.log("=".repeat(80));
    console.log("\n✅ Species test completed successfully!\n");

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error);
    await sequelize.close();
    process.exit(1);
  }
}

testSpeciesLeaderboard();
