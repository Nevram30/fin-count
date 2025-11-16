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

async function testAPILeaderboard() {
  try {
    console.log("🔍 Testing API Leaderboard Logic\n");
    console.log("=".repeat(80));

    // Simulate what the frontend does - fetch all distributions
    const query = `
      SELECT 
        id,
        beneficiaryName,
        fingerlings,
        actualHarvestKilos,
        species,
        municipality,
        province,
        barangay,
        dateDistributed
      FROM Distributions
      ORDER BY dateDistributed DESC
      LIMIT 1000;
    `;

    const distributions = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log(`\nFetched ${distributions.length} distributions\n`);

    // Group by beneficiary name to aggregate their total harvest (same logic as frontend)
    const beneficiaryMap = new Map();

    distributions.forEach((dist) => {
      const name = dist.beneficiaryName || "Unknown";
      const harvestKg = parseFloat(dist.actualHarvestKilos) || 0;
      const fingerlings = parseInt(dist.fingerlings) || 0;

      if (!beneficiaryMap.has(name)) {
        beneficiaryMap.set(name, {
          totalHarvest: 0,
          totalFingerlings: 0,
          species: dist.species || "Tilapia",
          location: dist.municipality || "Unknown",
          province: dist.province || "Unknown",
          barangay: dist.barangay || "Unknown",
          latestDate: dist.dateDistributed || new Date().toISOString(),
          recordIds: [],
        });
      }

      const entry = beneficiaryMap.get(name);
      entry.totalHarvest += harvestKg;
      entry.totalFingerlings += fingerlings;
      entry.recordIds.push(dist.id);

      // Keep the latest date
      if (new Date(dist.dateDistributed) > new Date(entry.latestDate)) {
        entry.latestDate = dist.dateDistributed;
        entry.location = dist.municipality || entry.location;
        entry.province = dist.province || entry.province;
        entry.barangay = dist.barangay || entry.barangay;
      }
    });

    // Transform to array and sort by total harvest
    const beneficiaryData = Array.from(beneficiaryMap.entries())
      .map(([name, data]) => ({
        name: name,
        location: data.location,
        species: data.species?.toLowerCase() || "tilapia",
        fingerlingsReceived: data.totalFingerlings,
        actualHarvestKilos: Math.round(data.totalHarvest * 100) / 100,
        distributionDate: new Date(data.latestDate).toISOString().split("T")[0],
        province: data.province,
        recordCount: data.recordIds.length,
      }))
      .sort((a, b) => b.actualHarvestKilos - a.actualHarvestKilos)
      .slice(0, 10);

    console.log("📊 TOP 10 BENEFICIARIES (AS DISPLAYED IN LEADERBOARD):\n");

    beneficiaryData.forEach((beneficiary, index) => {
      console.log(`${index + 1}. ${beneficiary.name}`);
      console.log(
        `   Location: ${beneficiary.location}, ${beneficiary.province}`
      );
      console.log(`   Species: ${beneficiary.species}`);
      console.log(
        `   Fingerlings Received: ${beneficiary.fingerlingsReceived.toLocaleString()}`
      );
      console.log(
        `   Actual Harvest: ${beneficiary.actualHarvestKilos.toLocaleString()} kg`
      );
      console.log(`   Distribution Records: ${beneficiary.recordCount}`);
      console.log(`   Latest Distribution: ${beneficiary.distributionDate}`);
      console.log("");
    });

    console.log("=".repeat(80));

    // Compare with database aggregation
    const dbQuery = `
      SELECT 
        beneficiaryName,
        COUNT(*) as recordCount,
        SUM(fingerlings) as totalFingerlings,
        SUM(actualHarvestKilos) as totalHarvest
      FROM Distributions
      GROUP BY beneficiaryName
      ORDER BY totalHarvest DESC
      LIMIT 10;
    `;

    const dbResults = await sequelize.query(dbQuery, {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log("\n📊 TOP 10 FROM DATABASE (FOR COMPARISON):\n");

    dbResults.forEach((record, index) => {
      console.log(`${index + 1}. ${record.beneficiaryName}`);
      console.log(`   Records: ${record.recordCount}`);
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

    // Check for discrepancies
    console.log("\n🔍 CHECKING FOR DISCREPANCIES:\n");

    let hasDiscrepancy = false;
    for (
      let i = 0;
      i < Math.min(beneficiaryData.length, dbResults.length);
      i++
    ) {
      const frontend = beneficiaryData[i];
      const db = dbResults[i];

      if (frontend.name !== db.beneficiaryName) {
        console.log(`⚠️  Rank ${i + 1}: Name mismatch`);
        console.log(`   Frontend: ${frontend.name}`);
        console.log(`   Database: ${db.beneficiaryName}`);
        hasDiscrepancy = true;
      }

      if (frontend.fingerlingsReceived !== parseInt(db.totalFingerlings)) {
        console.log(`⚠️  ${frontend.name}: Fingerlings mismatch`);
        console.log(`   Frontend: ${frontend.fingerlingsReceived}`);
        console.log(`   Database: ${parseInt(db.totalFingerlings)}`);
        hasDiscrepancy = true;
      }

      if (
        Math.abs(frontend.actualHarvestKilos - parseFloat(db.totalHarvest)) >
        0.01
      ) {
        console.log(`⚠️  ${frontend.name}: Harvest mismatch`);
        console.log(`   Frontend: ${frontend.actualHarvestKilos}`);
        console.log(`   Database: ${parseFloat(db.totalHarvest)}`);
        hasDiscrepancy = true;
      }
    }

    if (!hasDiscrepancy) {
      console.log(
        "✅ No discrepancies found! Frontend logic matches database."
      );
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n✅ Test completed successfully!\n");

    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error);
    await sequelize.close();
    process.exit(1);
  }
}

testAPILeaderboard();
