const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

async function testDistributions() {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connection established");

    // Count total distributions
    const [totalResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM Distributions"
    );
    console.log(`\n📊 Total Distributions: ${totalResult[0].count}`);

    // Count by species
    const [speciesResult] = await sequelize.query(
      "SELECT species, COUNT(*) as count FROM Distributions GROUP BY species"
    );
    console.log("\n📈 By Species:");
    speciesResult.forEach((row) => {
      console.log(`   ${row.species}: ${row.count}`);
    });

    // Sample 5 distributions
    const [sampleResult] = await sequelize.query(
      "SELECT id, dateDistributed, beneficiaryName, municipality, province, species, fingerlings, forecastedHarvestKilos FROM Distributions LIMIT 5"
    );
    console.log("\n📋 Sample Distributions:");
    sampleResult.forEach((row) => {
      console.log(
        `   ID: ${row.id}, Date: ${row.dateDistributed}, Species: ${row.species}, Beneficiary: ${row.beneficiaryName}, Location: ${row.municipality}, ${row.province}`
      );
    });

    // Test the query that the API uses
    const [apiTestResult] = await sequelize.query(
      `SELECT COUNT(*) as count FROM Distributions 
       WHERE species = 'Tilapia' 
       AND dateDistributed >= '2023-01-01' 
       AND dateDistributed <= '2023-12-31'`
    );
    console.log(
      `\n🔍 API Query Test (Tilapia, 2023): ${apiTestResult[0].count} records`
    );

    await sequelize.close();
    console.log("\n✓ Test completed successfully");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testDistributions();
