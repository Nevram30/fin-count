const fetch = require("node-fetch");

async function checkHarvestData() {
  try {
    const response = await fetch(
      "http://localhost:3001/api/distributions-data?limit=1000"
    );
    const result = await response.json();

    if (result.success && result.data.distributions) {
      const distributions = result.data.distributions;

      // Filter distributions with actualHarvestKilos > 0
      const withHarvest = distributions.filter(
        (d) => parseFloat(d.actualHarvestKilos) > 0
      );

      console.log("Total distributions:", distributions.length);
      console.log("Distributions with harvest data:", withHarvest.length);

      // Group by species
      const bySpecies = withHarvest.reduce((acc, d) => {
        acc[d.species] = (acc[d.species] || 0) + 1;
        return acc;
      }, {});

      console.log("\nBy species:");
      console.log(JSON.stringify(bySpecies, null, 2));

      // Check Tilapia harvest records
      const tilapiaHarvest = withHarvest.filter((d) => d.species === "Tilapia");
      console.log("\nTilapia harvest records:", tilapiaHarvest.length);

      if (tilapiaHarvest.length > 0) {
        console.log("\nSample Tilapia harvest records:");
        tilapiaHarvest.slice(0, 3).forEach((record) => {
          console.log(
            `- ${record.beneficiaryName}: ${record.actualHarvestKilos} kg (${record.province})`
          );
        });
      } else {
        console.log("\n⚠️ NO TILAPIA HARVEST DATA FOUND!");
      }

      // Check Bangus harvest records
      const bangusHarvest = withHarvest.filter((d) => d.species === "Bangus");
      console.log("\nBangus harvest records:", bangusHarvest.length);

      if (bangusHarvest.length > 0) {
        console.log("\nSample Bangus harvest records:");
        bangusHarvest.slice(0, 3).forEach((record) => {
          console.log(
            `- ${record.beneficiaryName}: ${record.actualHarvestKilos} kg (${record.province})`
          );
        });
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkHarvestData();
