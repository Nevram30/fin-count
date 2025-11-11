import { NextRequest, NextResponse } from "next/server";
import { Batch } from "@/app/components/types/data.types";

// Import mock data from parent route (in real app, this would be from database)
// For now, we'll duplicate the mock data here
const mockBatches: Batch[] = [
  {
    id: "BF-20240115-001",
    date: "Monday January 15, 2024",
    species: "Red Tilapia",
    location: "Pond A1, Tagum City, Davao del Norte",
    notes: "Initial stocking session with high-quality fingerlings",
    totalFingerlings: 5000,
  },
  {
    id: "BF-20240220-002",
    date: "Tuesday February 20, 2024",
    species: "Bangus",
    location: "Fish Cage B2, Davao City",
    notes: "Premium milkfish fingerlings from certified supplier",
    totalFingerlings: 3000,
  },
  {
    id: "BF-20240305-003",
    date: "Tuesday March 5, 2024",
    species: "Nile Tilapia",
    location: "Pond C3, Panabo City, Davao del Norte",
    notes: "Fast-growing strain for commercial production",
    totalFingerlings: 7500,
  },
  {
    id: "BF-20240418-004",
    date: "Thursday April 18, 2024",
    species: "Catfish",
    location: "Pond D1, Samal City",
    notes: "Local hito variety, good for pond culture",
    totalFingerlings: 4200,
  },
  {
    id: "BF-20240502-005",
    date: "Thursday May 2, 2024",
    species: "Red Tilapia",
    location: "Fish Cage E5, Digos City, Davao del Sur",
    notes: "Second batch for expansion project",
    totalFingerlings: 6000,
  },
  {
    id: "BF-20240615-006",
    date: "Saturday June 15, 2024",
    species: "Bangus",
    location: "Pond F2, Mati City, Davao Oriental",
    notes: "Coastal pond system trial batch",
    totalFingerlings: 3500,
  },
  {
    id: "BF-20240703-007",
    date: "Wednesday July 3, 2024",
    species: "Carp",
    location: "Pond G1, Tagum City, Davao del Norte",
    notes: "Common carp for polyculture system",
    totalFingerlings: 2800,
  },
  {
    id: "BF-20240820-008",
    date: "Tuesday August 20, 2024",
    species: "Red Tilapia",
    location: "Pond H3, Davao City",
    notes: "High-density stocking trial",
    totalFingerlings: 8000,
  },
  {
    id: "BF-20240912-009",
    date: "Thursday September 12, 2024",
    species: "Mudfish",
    location: "Pond I4, Compostela, Davao de Oro",
    notes: "Native dalag species for local market",
    totalFingerlings: 1500,
  },
  {
    id: "BF-20241025-010",
    date: "Friday October 25, 2024",
    species: "Bangus",
    location: "Fish Cage J6, Davao Gulf",
    notes: "Marine cage culture experiment",
    totalFingerlings: 4500,
  },
  {
    id: "BF-20241108-011",
    date: "Friday November 8, 2024",
    species: "Nile Tilapia",
    location: "Pond K2, Bansalan, Davao del Sur",
    notes: "Cold-tolerant strain for highland areas",
    totalFingerlings: 5500,
  },
  {
    id: "BF-20241220-012",
    date: "Friday December 20, 2024",
    species: "Red Tilapia",
    location: "Pond L1, Malita, Davao Occidental",
    notes: "Year-end stocking for next season",
    totalFingerlings: 6500,
  },
  {
    id: "BF-20250110-013",
    date: "Friday January 10, 2025",
    species: "Catfish",
    location: "Pond M5, Sta. Cruz, Davao del Sur",
    notes: "New year batch with improved genetics",
    totalFingerlings: 3800,
  },
  {
    id: "BF-20250225-014",
    date: "Tuesday February 25, 2025",
    species: "Bangus",
    location: "Fish Cage N3, Maco, Davao de Oro",
    notes: "Premium grade for export market",
    totalFingerlings: 4000,
  },
  {
    id: "BF-20250315-015",
    date: "Saturday March 15, 2025",
    species: "Red Tilapia",
    location: "Pond O7, Hagonoy, Davao del Sur",
    notes: "Community-based aquaculture project",
    totalFingerlings: 7200,
  },
  {
    id: "BF-20250428-016",
    date: "Monday April 28, 2025",
    species: "Carp",
    location: "Pond P4, Monkayo, Davao de Oro",
    notes: "Integrated fish-rice farming system",
    totalFingerlings: 2200,
  },
  {
    id: "BF-20250510-017",
    date: "Saturday May 10, 2025",
    species: "Nile Tilapia",
    location: "Pond Q8, Kapalong, Davao del Norte",
    notes: "Organic aquaculture certification trial",
    totalFingerlings: 5800,
  },
  {
    id: "BF-20250627-018",
    date: "Friday June 27, 2025",
    species: "Red Tilapia",
    location: "Pond R2, New Bataan, Davao de Oro",
    notes: "Latest batch with advanced breeding stock",
    totalFingerlings: 6800,
  },
];

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/batches/[id] - Get specific batch by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return jsonResponse(
        {
          success: false,
          error: "Batch ID is required",
        },
        400
      );
    }

    // Find batch by ID
    const batch = mockBatches.find((b) => b.id === id);

    if (!batch) {
      return jsonResponse(
        {
          success: false,
          error: "Batch not found",
        },
        404
      );
    }

    return jsonResponse({
      success: true,
      data: batch,
    });
  } catch (error) {
    console.error("Batch GET API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// PUT /api/batches/[id] - Update specific batch
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return jsonResponse(
        {
          success: false,
          error: "Batch ID is required",
        },
        400
      );
    }

    // Find batch index
    const batchIndex = mockBatches.findIndex((b) => b.id === id);

    if (batchIndex === -1) {
      return jsonResponse(
        {
          success: false,
          error: "Batch not found",
        },
        404
      );
    }

    // Validate totalFingerlings if provided
    if (
      body.totalFingerlings !== undefined &&
      (typeof body.totalFingerlings !== "number" || body.totalFingerlings <= 0)
    ) {
      return jsonResponse(
        {
          success: false,
          error: "totalFingerlings must be a positive number",
        },
        400
      );
    }

    // Validate remainingFingerlings if provided
    if (
      body.remainingFingerlings !== undefined &&
      (typeof body.remainingFingerlings !== "number" ||
        body.remainingFingerlings < 0)
    ) {
      return jsonResponse(
        {
          success: false,
          error: "remainingFingerlings must be a non-negative number",
        },
        400
      );
    }

    // Update batch with provided fields
    const currentBatch = mockBatches[batchIndex];
    const updatedBatch: Batch = {
      ...currentBatch,
      date: body.date || currentBatch.date,
      species: body.species || currentBatch.species,
      location: body.location || currentBatch.location,
      notes: body.notes !== undefined ? body.notes : currentBatch.notes,
      totalFingerlings:
        body.totalFingerlings !== undefined
          ? body.totalFingerlings
          : currentBatch.totalFingerlings,
    };

    // Update the batch in mock data
    mockBatches[batchIndex] = updatedBatch;

    return jsonResponse({
      success: true,
      data: updatedBatch,
      message: "Batch updated successfully",
    });
  } catch (error) {
    console.error("Batch PUT API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// DELETE /api/batches/[id] - Delete specific batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return jsonResponse(
        {
          success: false,
          error: "Batch ID is required",
        },
        400
      );
    }

    // Find batch index
    const batchIndex = mockBatches.findIndex((b) => b.id === id);

    if (batchIndex === -1) {
      return jsonResponse(
        {
          success: false,
          error: "Batch not found",
        },
        404
      );
    }

    // Check if batch has remaining fingerlings (business logic validation)
    const batch = mockBatches[batchIndex];
    // Remove batch from mock data
    const deletedBatch = mockBatches.splice(batchIndex, 1)[0];

    return jsonResponse({
      success: true,
      data: deletedBatch,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Batch DELETE API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
