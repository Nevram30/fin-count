// Static Harvest Data Example for Davao Region Aquaculture
// This represents actual harvest yields from different locations and facilities

const staticHarvestData = [
    {
        location: "Davao City",
        tilapia: 2850, // kg harvested
        bangus: 1650,  // kg harvested
        date: "2024-11-15",
        facilityType: "Fish Cage",
        province: "Davao del Sur",
        city: "Davao City",
        barangay: "Matina Aplaya",
        survivalRate: 85, // 85% survival rate
        avgWeight: 220    // 220g average weight per fish
    },
    {
        location: "Tagum City",
        tilapia: 3200,
        bangus: 1900,
        date: "2024-11-10",
        facilityType: "Pond",
        province: "Davao del Norte",
        city: "Tagum City",
        barangay: "Apokon",
        survivalRate: 92,
        avgWeight: 195
    },
    {
        location: "Panabo City",
        tilapia: 2650,
        bangus: 1450,
        date: "2024-11-08",
        facilityType: "Fish Cage",
        province: "Davao del Norte",
        city: "Panabo City",
        barangay: "Cagangohan",
        survivalRate: 78,
        avgWeight: 210
    },
    {
        location: "Digos City",
        tilapia: 2950,
        bangus: 1750,
        date: "2024-11-12",
        facilityType: "Pond",
        province: "Davao del Sur",
        city: "Digos City",
        barangay: "Aplaya",
        survivalRate: 88,
        avgWeight: 235
    },
    {
        location: "Mati City",
        tilapia: 2100,
        bangus: 1200,
        date: "2024-11-05",
        facilityType: "Fish Cage",
        province: "Davao Oriental",
        city: "Mati City",
        barangay: "Dahican",
        survivalRate: 82,
        avgWeight: 180
    },
    {
        location: "Nabunturan",
        tilapia: 1850,
        bangus: 950,
        date: "2024-11-03",
        facilityType: "Pond",
        province: "Davao de Oro",
        city: "Nabunturan",
        barangay: "Poblacion",
        survivalRate: 75,
        avgWeight: 165
    },
    {
        location: "Malita",
        tilapia: 2250,
        bangus: 1350,
        date: "2024-11-07",
        facilityType: "Fish Cage",
        province: "Davao Occidental",
        city: "Malita",
        barangay: "Poblacion",
        survivalRate: 80,
        avgWeight: 200
    },
    {
        location: "Samal City",
        tilapia: 3100,
        bangus: 1850,
        date: "2024-11-14",
        facilityType: "Pond",
        province: "Davao del Norte",
        city: "Samal City",
        barangay: "Babak",
        survivalRate: 90,
        avgWeight: 225
    },
    {
        location: "Davao City",
        tilapia: 2750,
        bangus: 1550,
        date: "2024-10-28",
        facilityType: "Pond",
        province: "Davao del Sur",
        city: "Davao City",
        barangay: "Toril",
        survivalRate: 87,
        avgWeight: 240
    },
    {
        location: "Compostela",
        tilapia: 1950,
        bangus: 1100,
        date: "2024-10-25",
        facilityType: "Fish Cage",
        province: "Davao de Oro",
        city: "Compostela",
        barangay: "Poblacion",
        survivalRate: 73,
        avgWeight: 175
    },
    {
        location: "Bansalan",
        tilapia: 2400,
        bangus: 1400,
        date: "2024-11-01",
        facilityType: "Pond",
        province: "Davao del Sur",
        city: "Bansalan",
        barangay: "Poblacion",
        survivalRate: 84,
        avgWeight: 205
    },
    {
        location: "Baganga",
        tilapia: 1650,
        bangus: 850,
        date: "2024-10-30",
        facilityType: "Fish Cage",
        province: "Davao Oriental",
        city: "Baganga",
        barangay: "Poblacion",
        survivalRate: 70,
        avgWeight: 155
    }
];

// Summary Statistics from the Static Data:
const summaryStats = {
    totalHarvestData: {
        totalTilapia: staticHarvestData.reduce((sum, item) => sum + item.tilapia, 0), // 29,700 kg
        totalBangus: staticHarvestData.reduce((sum, item) => sum + item.bangus, 0),   // 17,050 kg
        totalCombined: staticHarvestData.reduce((sum, item) => sum + item.tilapia + item.bangus, 0), // 46,750 kg
    },

    averageMetrics: {
        avgSurvivalRate: Math.round(staticHarvestData.reduce((sum, item) => sum + item.survivalRate, 0) / staticHarvestData.length), // 82%
        avgFishWeight: Math.round(staticHarvestData.reduce((sum, item) => sum + item.avgWeight, 0) / staticHarvestData.length), // 201g
    },

    facilityComparison: {
        fishCageAverage: Math.round(
            staticHarvestData
                .filter(item => item.facilityType === 'Fish Cage')
                .reduce((sum, item) => sum + item.tilapia + item.bangus, 0) /
            staticHarvestData.filter(item => item.facilityType === 'Fish Cage').length
        ), // 3,700 kg average per fish cage

        pondAverage: Math.round(
            staticHarvestData
                .filter(item => item.facilityType === 'Pond')
                .reduce((sum, item) => sum + item.tilapia + item.bangus, 0) /
            staticHarvestData.filter(item => item.facilityType === 'Pond').length
        ) // 4,117 kg average per pond
    },

    topPerformers: {
        highestYield: staticHarvestData.reduce((max, item) =>
            (item.tilapia + item.bangus) > (max.tilapia + max.bangus) ? item : max
        ), // Tagum City - 5,100 kg total

        highestSurvivalRate: staticHarvestData.reduce((max, item) =>
            item.survivalRate > max.survivalRate ? item : max
        ), // Tagum City - 92% survival rate

        bestAverageWeight: staticHarvestData.reduce((max, item) =>
            item.avgWeight > max.avgWeight ? item : max
        ) // Davao City (Toril) - 240g average weight
    },

    provinceBreakdown: {
        "Davao del Norte": {
            locations: ["Tagum City", "Panabo City", "Samal City"],
            totalHarvest: staticHarvestData
                .filter(item => item.province === "Davao del Norte")
                .reduce((sum, item) => sum + item.tilapia + item.bangus, 0) // 12,950 kg
        },
        "Davao del Sur": {
            locations: ["Davao City", "Digos City", "Bansalan"],
            totalHarvest: staticHarvestData
                .filter(item => item.province === "Davao del Sur")
                .reduce((sum, item) => sum + item.tilapia + item.bangus, 0) // 18,100 kg
        },
        "Davao de Oro": {
            locations: ["Nabunturan", "Compostela"],
            totalHarvest: staticHarvestData
                .filter(item => item.province === "Davao de Oro")
                .reduce((sum, item) => sum + item.tilapia + item.bangus, 0) // 5,850 kg
        },
        "Davao Oriental": {
            locations: ["Mati City", "Baganga"],
            totalHarvest: staticHarvestData
                .filter(item => item.province === "Davao Oriental")
                .reduce((sum, item) => sum + item.tilapia + item.bangus, 0) // 5,800 kg
        },
        "Davao Occidental": {
            locations: ["Malita"],
            totalHarvest: staticHarvestData
                .filter(item => item.province === "Davao Occidental")
                .reduce((sum, item) => sum + item.tilapia + item.bangus, 0) // 3,600 kg
        }
    }
};

// Key Insights from the Data:
const keyInsights = {
    performance: {
        bestProvince: "Davao del Sur", // 18,100 kg total harvest
        bestFacilityType: "Pond", // 4,117 kg average vs 3,700 kg for fish cages
        topLocation: "Tagum City", // 5,100 kg harvest with 92% survival rate
    },

    efficiency: {
        highestSurvivalRate: "92% in Tagum City",
        bestWeight: "240g average in Davao City (Toril)",
        mostConsistent: "Pond facilities show more consistent yields"
    },

    recommendations: {
        expansion: "Consider expanding pond operations in Davao del Sur",
        improvement: "Focus on improving survival rates in Davao Oriental",
        research: "Study Tagum City's practices for replication"
    }
};

// Export for use in the application
export { staticHarvestData, summaryStats, keyInsights };