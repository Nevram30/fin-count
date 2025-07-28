import { NextRequest, NextResponse } from "next/server";
import { Batch } from "@/app/components/types/data.types";

// Mock data for batches based on mobile app session form
const mockBatches: Batch[] = [
  {
    id: "BF-20240115-001",
    date: "Monday January 15, 2024",
    species: "Red Tilapia",
    location: "Pond A1, Tagum City, Davao del Norte",
    notes: "Initial stocking session with high-quality fingerlings",
    totalFingerlings: 5000,
    remainingFingerlings: 3500,
  },
  {
    id: "BF-20240220-002",
    date: "Tuesday February 20, 2024",
    species: "Bangus",
    location: "Fish Cage B2, Davao City",
    notes: "Premium milkfish fingerlings from certified supplier",
    totalFingerlings: 3000,
    remainingFingerlings: 2800,
  },
  {
    id: "BF-20240305-003",
    date: "Tuesday March 5, 2024",
    species: "Nile Tilapia",
    location: "Pond C3, Panabo City, Davao del Norte",
    notes: "Fast-growing strain for commercial production",
    totalFingerlings: 7500,
    remainingFingerlings: 6200,
  },
  {
    id: "BF-20240418-004",
    date: "Thursday April 18, 2024",
    species: "Catfish",
    location: "Pond D1, Samal City",
    notes: "Local hito variety, good for pond culture",
    totalFingerlings: 4200,
    remainingFingerlings: 3800,
  },
  {
    id: "BF-20240502-005",
    date: "Thursday May 2, 2024",
    species: "Red Tilapia",
    location: "Fish Cage E5, Digos City, Davao del Sur",
    notes: "Second batch for expansion project",
    totalFingerlings: 6000,
    remainingFingerlings: 4500,
  },
  {
    id: "BF-20240615-006",
    date: "Saturday June 15, 2024",
    species: "Bangus",
    location: "Pond F2, Mati City, Davao Oriental",
    notes: "Coastal pond system trial batch",
    totalFingerlings: 3500,
    remainingFingerlings: 3200,
  },
  {
    id: "BF-20240703-007",
    date: "Wednesday July 3, 2024",
    species: "Carp",
    location: "Pond G1, Tagum City, Davao del Norte",
    notes: "Common carp for polyculture system",
    totalFingerlings: 2800,
    remainingFingerlings: 2500,
  },
  {
    id: "BF-20240820-008",
    date: "Tuesday August 20, 2024",
    species: "Red Tilapia",
    location: "Pond H3, Davao City",
    notes: "High-density stocking trial",
    totalFingerlings: 8000,
    remainingFingerlings: 6800,
  },
  {
    id: "BF-20240912-009",
    date: "Thursday September 12, 2024",
    species: "Mudfish",
    location: "Pond I4, Compostela, Davao de Oro",
    notes: "Native dalag species for local market",
    totalFingerlings: 1500,
    remainingFingerlings: 1200,
  },
  {
    id: "BF-20241025-010",
    date: "Friday October 25, 2024",
    species: "Bangus",
    location: "Fish Cage J6, Davao Gulf",
    notes: "Marine cage culture experiment",
    totalFingerlings: 4500,
    remainingFingerlings: 4100,
  },
  {
    id: "BF-20241108-011",
    date: "Friday November 8, 2024",
    species: "Nile Tilapia",
    location: "Pond K2, Bansalan, Davao del Sur",
    notes: "Cold-tolerant strain for highland areas",
    totalFingerlings: 5500,
    remainingFingerlings: 4900,
  },
  {
    id: "BF-20241220-012",
    date: "Friday December 20, 2024",
    species: "Red Tilapia",
    location: "Pond L1, Malita, Davao Occidental",
    notes: "Year-end stocking for next season",
    totalFingerlings: 6500,
    remainingFingerlings: 6500,
  },
  {
    id: "BF-20250110-013",
    date: "Friday January 10, 2025",
    species: "Catfish",
    location: "Pond M5, Sta. Cruz, Davao del Sur",
    notes: "New year batch with improved genetics",
    totalFingerlings: 3800,
    remainingFingerlings: 3600,
  },
  {
    id: "BF-20250225-014",
    date: "Tuesday February 25, 2025",
    species: "Bangus",
    location: "Fish Cage N3, Maco, Davao de Oro",
    notes: "Premium grade for export market",
    totalFingerlings: 4000,
    remainingFingerlings: 3850,
  },
  {
    id: "BF-20250315-015",
    date: "Saturday March 15, 2025",
    species: "Red Tilapia",
    location: "Pond O7, Hagonoy, Davao del Sur",
    notes: "Community-based aquaculture project",
    totalFingerlings: 7200,
    remainingFingerlings: 7000,
  },
  {
    id: "BF-20250428-016",
    date: "Monday April 28, 2025",
    species: "Carp",
    location: "Pond P4, Monkayo, Davao de Oro",
    notes: "Integrated fish-rice farming system",
    totalFingerlings: 2200,
    remainingFingerlings: 2100,
  },
  {
    id: "BF-20250510-017",
    date: "Saturday May 10, 2025",
    species: "Nile Tilapia",
    location: "Pond Q8, Kapalong, Davao del Norte",
    notes: "Organic aquaculture certification trial",
    totalFingerlings: 5800,
    remainingFingerlings: 5600,
  },
  {
    id: "BF-20250627-018",
    date: "Friday June 27, 2025",
    species: "Red Tilapia",
    location: "Pond R2, New Bataan, Davao de Oro",
    notes: "Latest batch with advanced breeding stock",
    totalFingerlings: 6800,
    remainingFingerlings: 6800,
  },
];

// Helper function to generate batch ID
function generateBatchId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const sequence = String(mockBatches.length + 1).padStart(3, "0");
  return `BF-${year}${month}${day}-${sequence}`;
}

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/batches - Fetch all batches with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const species = searchParams.get("species");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredBatches = [...mockBatches];

    // Filter by species
    if (species) {
      filteredBatches = filteredBatches.filter((batch) =>
        batch.species.toLowerCase().includes(species.toLowerCase())
      );
    }

    // Filter by location
    if (location) {
      filteredBatches = filteredBatches.filter((batch) =>
        batch.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Search by ID, species, or location
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBatches = filteredBatches.filter(
        (batch) =>
          batch.id.toLowerCase().includes(searchLower) ||
          batch.species.toLowerCase().includes(searchLower) ||
          batch.location.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filteredBatches.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Pagination
    const totalBatches = filteredBatches.length;
    const totalPages = Math.ceil(totalBatches / limit);
    const offset = (page - 1) * limit;
    const paginatedBatches = filteredBatches.slice(offset, offset + limit);

    return jsonResponse({
      success: true,
      data: {
        batches: paginatedBatches,
        pagination: {
          currentPage: page,
          totalPages,
          totalBatches,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Batches GET API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// POST /api/batches - Create new batch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.date ||
      !body.species ||
      !body.location ||
      !body.totalFingerlings
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Missing required fields: date, species, location, totalFingerlings",
        },
        400
      );
    }

    // Validate totalFingerlings is a positive number
    if (
      typeof body.totalFingerlings !== "number" ||
      body.totalFingerlings <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          error: "totalFingerlings must be a positive number",
        },
        400
      );
    }

    // Create new batch
    const newBatch: Batch = {
      id: body.id || generateBatchId(),
      date: body.date,
      species: body.species,
      location: body.location,
      notes: body.notes || "",
      totalFingerlings: body.totalFingerlings,
      remainingFingerlings: body.remainingFingerlings || body.totalFingerlings,
    };

    // Add to mock data (in real app, this would save to database)
    mockBatches.push(newBatch);

    return jsonResponse(
      {
        success: true,
        data: newBatch,
        message: "Batch created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Batches POST API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
