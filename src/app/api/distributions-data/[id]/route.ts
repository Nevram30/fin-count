import { NextRequest, NextResponse } from "next/server";
import Distribution from "@/server/database/models/distribution";
import models from "@/server/database/models";

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/distributions-data/[id] - Get a single distribution by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const distribution = await Distribution.findByPk(id, {
      include: [
        {
          model: models.User,
          as: "user",
          attributes: ["id", "email", "userType"],
        },
      ],
    });

    if (!distribution) {
      return jsonResponse(
        {
          success: false,
          error: "Distribution not found",
        },
        404
      );
    }

    return jsonResponse({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error("Distribution GET by ID API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// PUT /api/distributions-data/[id] - Update a distribution
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Find the distribution
    const distribution = await Distribution.findByPk(id);

    if (!distribution) {
      return jsonResponse(
        {
          success: false,
          error: "Distribution not found",
        },
        404
      );
    }

    // Validate species if provided
    if (body.species && !["Tilapia", "Bangus"].includes(body.species)) {
      return jsonResponse(
        {
          success: false,
          error: "species must be either 'Tilapia' or 'Bangus'",
        },
        400
      );
    }

    // Validate fingerlings if provided
    if (
      body.fingerlings !== undefined &&
      (typeof body.fingerlings !== "number" || body.fingerlings <= 0)
    ) {
      return jsonResponse(
        {
          success: false,
          error: "fingerlings must be a positive number",
        },
        400
      );
    }

    // Update the distribution
    await distribution.update({
      dateDistributed: body.dateDistributed
        ? new Date(body.dateDistributed)
        : distribution.dateDistributed,
      beneficiaryName: body.beneficiaryName ?? distribution.beneficiaryName,
      area: body.area !== undefined ? body.area : distribution.area,
      barangay:
        body.barangay !== undefined ? body.barangay : distribution.barangay,
      municipality: body.municipality ?? distribution.municipality,
      province: body.province ?? distribution.province,
      fingerlings: body.fingerlings ?? distribution.fingerlings,
      species: body.species ?? distribution.species,
      survivalRate: body.survivalRate ?? distribution.survivalRate,
      avgWeight: body.avgWeight ?? distribution.avgWeight,
      harvestKilo: body.harvestKilo ?? distribution.harvestKilo,
    });

    // Fetch updated distribution with user data
    const updatedDistribution = await Distribution.findByPk(id, {
      include: [
        {
          model: models.User,
          as: "user",
          attributes: ["id", "email", "userType"],
        },
      ],
    });

    return jsonResponse({
      success: true,
      data: updatedDistribution,
      message: "Distribution updated successfully",
    });
  } catch (error) {
    console.error("Distribution PUT API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// DELETE /api/distributions-data/[id] - Delete a distribution
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Find the distribution
    const distribution = await Distribution.findByPk(id);

    if (!distribution) {
      return jsonResponse(
        {
          success: false,
          error: "Distribution not found",
        },
        404
      );
    }

    // Delete the distribution
    await distribution.destroy();

    return jsonResponse({
      success: true,
      message: "Distribution deleted successfully",
    });
  } catch (error) {
    console.error("Distribution DELETE API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
