import { NextRequest, NextResponse } from "next/server";

// Distribution interface (should be moved to shared types)
interface Distribution {
  id: string;
  beneficiaryType: "Individual" | "Organization";
  beneficiary: string;
  phoneNumber: string;
  species: string;
  batchId: string;
  fingerlingsCount: number;
  location: string;
  facilityType: string;
  date: string;
  forecast: string;
  harvestDate: string;
  // Updated harvest tracking fields
  expectedHarvestDate?: string;
  forecastedHarvestDate?: string;
  actualHarvestDate?: string;
  forecastedHarvestKilos?: number;
  actualHarvestKilos?: number;
  remarks?:
    | "Harvested"
    | "Not Harvested"
    | "Damaged"
    | "Ongoing"
    | "Disaster"
    | "Other"
    | "";
  customRemarks?: string;
}

// Mock data for distributions - starts empty but will be populated
let mockDistributions: Distribution[] = [
  // Sample data for demonstration
  {
    id: "DIST-1734307200000",
    beneficiaryType: "Individual",
    beneficiary: "Juan Dela Cruz",
    phoneNumber: "09123456789",
    species: "Red Tilapia",
    batchId: "BF-20240115-001",
    fingerlingsCount: 1500,
    location: "Purok 1, Apokon, Tagum City, Davao del Norte",
    facilityType: "Pond",
    date: "2024-01-20",
    forecast: "2024-04-20",
    harvestDate: "2024-07-20",
    forecastedHarvestDate: "2024-06-20",
    forecastedHarvestKilos: 750,
    actualHarvestKilos: 820,
    remarks: "Harvested",
    customRemarks: "",
  },
  {
    id: "DIST-1734307260000",
    beneficiaryType: "Organization",
    beneficiary: "Tagum Aquaculture Cooperative",
    phoneNumber: "09987654321",
    species: "Bangus",
    batchId: "BF-20240220-002",
    fingerlingsCount: 200,
    location: "Sitio Riverside, Bincungan, Tagum City, Davao del Norte",
    facilityType: "Fish Cage",
    date: "2024-02-25",
    forecast: "2024-05-25",
    harvestDate: "2024-08-25",
    forecastedHarvestDate: "2024-07-25",
    forecastedHarvestKilos: 100,
    remarks: "",
    customRemarks: "",
  },
];

// Helper function to generate distribution ID
function generateDistributionId(): string {
  return `DIST-${Date.now()}`;
}

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/distributions - Fetch all distributions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const beneficiaryType = searchParams.get("beneficiaryType");
    const species = searchParams.get("species");
    const batchId = searchParams.get("batchId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredDistributions = [...mockDistributions];

    // Filter by beneficiary type
    if (beneficiaryType) {
      filteredDistributions = filteredDistributions.filter(
        (dist) =>
          dist.beneficiaryType.toLowerCase() === beneficiaryType.toLowerCase()
      );
    }

    // Filter by species
    if (species) {
      filteredDistributions = filteredDistributions.filter((dist) =>
        dist.species.toLowerCase().includes(species.toLowerCase())
      );
    }

    // Filter by batch ID
    if (batchId) {
      filteredDistributions = filteredDistributions.filter((dist) =>
        dist.batchId.toLowerCase().includes(batchId.toLowerCase())
      );
    }

    // Search by beneficiary name, batch ID, or species
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDistributions = filteredDistributions.filter(
        (dist) =>
          dist.beneficiary.toLowerCase().includes(searchLower) ||
          dist.batchId.toLowerCase().includes(searchLower) ||
          dist.species.toLowerCase().includes(searchLower) ||
          dist.phoneNumber.includes(search)
      );
    }

    // Sort by date (newest first)
    filteredDistributions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Pagination
    const totalDistributions = filteredDistributions.length;
    const totalPages = Math.ceil(totalDistributions / limit);
    const offset = (page - 1) * limit;
    const paginatedDistributions = filteredDistributions.slice(
      offset,
      offset + limit
    );

    return jsonResponse({
      success: true,
      data: {
        distributions: paginatedDistributions,
        pagination: {
          currentPage: page,
          totalPages,
          totalDistributions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Distributions GET API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// POST /api/distributions - Create new distribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "beneficiaryType",
      "beneficiary",
      "phoneNumber",
      "species",
      "batchId",
      "fingerlingsCount",
      "location",
      "facilityType",
      "date",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return jsonResponse(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          400
        );
      }
    }

    // Validate beneficiaryType
    if (!["Individual", "Organization"].includes(body.beneficiaryType)) {
      return jsonResponse(
        {
          success: false,
          error:
            "beneficiaryType must be either 'Individual' or 'Organization'",
        },
        400
      );
    }

    // Validate fingerlingsCount is a positive number
    if (
      typeof body.fingerlingsCount !== "number" ||
      body.fingerlingsCount <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          error: "fingerlingsCount must be a positive number",
        },
        400
      );
    }

    // Calculate forecast and harvest dates if not provided
    const distributionDate = new Date(body.date);
    const forecastDate = new Date(distributionDate);
    forecastDate.setMonth(distributionDate.getMonth() + 3); // 3 months for forecast

    const harvestDate = new Date(distributionDate);
    harvestDate.setMonth(distributionDate.getMonth() + 6); // 6 months for harvest

    const forecastedHarvestDate = new Date(distributionDate);
    forecastedHarvestDate.setMonth(distributionDate.getMonth() + 5); // 5 months for forecasted harvest

    // Calculate forecasted harvest based on species-specific growth parameters
    // Red Tilapia: 0.3 kg after 4 months, 78% survival rate
    // Bangus: 0.39 kg after 3 months, 93.5% survival rate
    const isTilapia = body.species.toLowerCase().includes("tilapia");
    const expectedWeightAfterGrowth = isTilapia ? 0.3 : 0.39;
    const survivalRate = isTilapia ? 0.78 : 0.935;
    const forecastedHarvestKilos = Math.round(
      body.fingerlingsCount * survivalRate * expectedWeightAfterGrowth
    );

    // Create new distribution
    const newDistribution: Distribution = {
      id: body.id || generateDistributionId(),
      beneficiaryType: body.beneficiaryType,
      beneficiary: body.beneficiary,
      phoneNumber: body.phoneNumber,
      species: body.species,
      batchId: body.batchId,
      fingerlingsCount: body.fingerlingsCount,
      location: body.location,
      facilityType: body.facilityType,
      date: body.date,
      forecast: body.forecast || forecastDate.toISOString().split("T")[0],
      harvestDate: body.harvestDate || harvestDate.toISOString().split("T")[0],
      forecastedHarvestDate:
        body.forecastedHarvestDate ||
        forecastedHarvestDate.toISOString().split("T")[0],
      forecastedHarvestKilos:
        body.forecastedHarvestKilos || forecastedHarvestKilos,
      actualHarvestDate: body.actualHarvestDate || "",
      actualHarvestKilos: body.actualHarvestKilos || 0,
      remarks: body.remarks || "",
      customRemarks: body.customRemarks || "",
    };

    // Add to mock data (in real app, this would save to database)
    mockDistributions.push(newDistribution);

    return jsonResponse(
      {
        success: true,
        data: newDistribution,
        message: "Distribution created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Distributions POST API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// PUT /api/distributions - Update existing distribution (for harvest tracking)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return jsonResponse(
        {
          success: false,
          error: "Distribution ID is required for updates",
        },
        400
      );
    }

    // Find the distribution to update
    const distributionIndex = mockDistributions.findIndex(
      (dist) => dist.id === body.id
    );

    if (distributionIndex === -1) {
      return jsonResponse(
        {
          success: false,
          error: "Distribution not found",
        },
        404
      );
    }

    // Update the distribution with provided fields
    const updatedDistribution = {
      ...mockDistributions[distributionIndex],
      ...body,
      // Ensure ID doesn't change
      id: mockDistributions[distributionIndex].id,
    };

    mockDistributions[distributionIndex] = updatedDistribution;

    return jsonResponse({
      success: true,
      data: updatedDistribution,
      message: "Distribution updated successfully",
    });
  } catch (error) {
    console.error("Distributions PUT API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
