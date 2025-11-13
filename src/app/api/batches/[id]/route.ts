import { NextRequest, NextResponse } from "next/server";
import models from "@/server/database/models";

const { Batch } = models;

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
    const batch = await Batch.findByPk(id);

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

    // Find batch
    const batch = await Batch.findByPk(id);

    if (!batch) {
      return jsonResponse(
        {
          success: false,
          error: "Batch not found",
        },
        404
      );
    }

    // Validate totalCount if provided
    if (
      body.totalCount !== undefined &&
      (typeof body.totalCount !== "number" || body.totalCount < 0)
    ) {
      return jsonResponse(
        {
          success: false,
          error: "totalCount must be a non-negative number",
        },
        400
      );
    }

    // Update batch with provided fields
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.totalCount !== undefined) updateData.totalCount = body.totalCount;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await batch.update(updateData);

    // Fetch updated batch
    const updatedBatch = await Batch.findByPk(id);

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

    // Find batch
    const batch = await Batch.findByPk(id);

    if (!batch) {
      return jsonResponse(
        {
          success: false,
          error: "Batch not found",
        },
        404
      );
    }

    // Store batch data before deletion
    const deletedBatchData = batch.toJSON();

    // Delete the batch (will cascade delete sessions)
    await batch.destroy();

    return jsonResponse({
      success: true,
      data: deletedBatchData,
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
