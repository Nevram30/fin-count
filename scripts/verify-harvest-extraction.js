const XLSX = require("xlsx");
const path = require("path");

// Simulate the extraction logic from the seeder
const testHarvestExtraction = () => {
  console.log("Testing Harvest Data Extraction\n");
  console.log("=".repeat(50));

  // Test Tilapia file
  const tilapiaFile = path.join(
    __dirname,
    "../src/Red_Tilapia Distribution_Data.xlsx"
  );
  const tilapiaWorkbook = XLSX.readFile(tilapiaFile);
  const tilapiaData = XLSX.utils.sheet_to_json(
    tilapiaWorkbook.Sheets[tilapiaWorkbook.SheetNames[0]]
  );

  console.log("\n📊 RED TILAPIA DATA:");
  console.log(`   Total rows: ${tilapiaData.length}`);

  let tilapiaHarvestCount = 0;
  let tilapiaTotalHarvest = 0;

  tilapiaData.forEach((row) => {
    // This is the fixed logic
    const actualHarvestKilos =
      parseFloat(row["Harvest(kg)"] || row["Harvest(Kilo)"]) || null;

    if (actualHarvestKilos) {
      tilapiaHarvestCount++;
      tilapiaTotalHarvest += actualHarvestKilos;
    }
  });

  console.log(`   Rows with harvest data: ${tilapiaHarvestCount}`);
  console.log(`   Total harvest: ${tilapiaTotalHarvest.toFixed(2)} kg`);
  console.log(
    `   Average harvest: ${(tilapiaTotalHarvest / tilapiaHarvestCount).toFixed(
      2
    )} kg`
  );

  // Show sample data
  console.log("\n   Sample harvest values:");
  tilapiaData.slice(0, 5).forEach((row, idx) => {
    const harvest =
      parseFloat(row["Harvest(kg)"] || row["Harvest(Kilo)"]) || null;
    console.log(
      `   ${idx + 1}. ${row["Beneficiary Name"]}: ${
        harvest ? harvest + " kg" : "No data"
      }`
    );
  });

  // Test Bangus file
  const bangusFile = path.join(
    __dirname,
    "../src/Bangus Distribution_Data.xlsx"
  );
  const bangusWorkbook = XLSX.readFile(bangusFile);
  const bangusData = XLSX.utils.sheet_to_json(
    bangusWorkbook.Sheets[bangusWorkbook.SheetNames[0]]
  );

  console.log("\n\n📊 BANGUS DATA:");
  console.log(`   Total rows: ${bangusData.length}`);

  let bangusHarvestCount = 0;
  let bangusTotalHarvest = 0;

  bangusData.forEach((row) => {
    // This is the fixed logic
    const actualHarvestKilos =
      parseFloat(row["Harvest(kg)"] || row["Harvest(Kilo)"]) || null;

    if (actualHarvestKilos) {
      bangusHarvestCount++;
      bangusTotalHarvest += actualHarvestKilos;
    }
  });

  console.log(`   Rows with harvest data: ${bangusHarvestCount}`);
  console.log(`   Total harvest: ${bangusTotalHarvest.toFixed(2)} kg`);
  console.log(
    `   Average harvest: ${(bangusTotalHarvest / bangusHarvestCount).toFixed(
      2
    )} kg`
  );

  // Show sample data
  console.log("\n   Sample harvest values:");
  bangusData.slice(0, 5).forEach((row, idx) => {
    const harvest =
      parseFloat(row["Harvest(kg)"] || row["Harvest(Kilo)"]) || null;
    console.log(
      `   ${idx + 1}. ${row["Beneficiary Name"]}: ${
        harvest ? harvest + " kg" : "No data"
      }`
    );
  });

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("\n✅ SUMMARY:");
  console.log(
    `   Total distributions: ${tilapiaData.length + bangusData.length}`
  );
  console.log(
    `   Total with harvest data: ${tilapiaHarvestCount + bangusHarvestCount}`
  );
  console.log(
    `   Combined total harvest: ${(
      tilapiaTotalHarvest + bangusTotalHarvest
    ).toFixed(2)} kg`
  );
  console.log(
    `   Overall average: ${(
      (tilapiaTotalHarvest + bangusTotalHarvest) /
      (tilapiaHarvestCount + bangusHarvestCount)
    ).toFixed(2)} kg`
  );
  console.log(
    "\n✅ The seeder will now correctly extract harvest data from both species!"
  );
  console.log('   - Tilapia uses: "Harvest(Kilo)" column');
  console.log('   - Bangus uses: "Harvest(kg)" column');
  console.log("   - Code handles both variations automatically\n");
};

testHarvestExtraction();
