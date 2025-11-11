import { NextRequest, NextResponse } from "next/server";
import Session from "@/server/database/models/session";
import Batch from "@/server/database/models/batch";

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/sessions/[id] - Get specific session by ID
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
          error: "Session ID is required",
        },
        400
      );
    }

    // Find session by ID with batch details
    const session = await Session.findByPk(id, {
      include: [
        {
          model: Batch,
          as: "batch",
          attributes: ["id", "name", "userId", "isActive"],
        },
      ],
    });

    if (!session) {
      return jsonResponse(
        {
          success: false,
          error: "Session not found",
        },
        404
      );
    }

    return jsonResponse({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Session GET API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// PUT /api/sessions/[id] - Update specific session
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
          error: "Session ID is required",
        },
        400
      );
    }

    // Find session
    const session = await Session.findByPk(id);

    if (!session) {
      return jsonResponse(
        {
          success: false,
          error: "Session not found",
        },
        404
      );
    }

    // If batchId is being updated, verify the new batch exists
    if (body.batchId && body.batchId !== session.batchId) {
      const batch = await Batch.findByPk(body.batchId);
      if (!batch) {
        return jsonResponse(
          {
            success: false,
            error: "Batch not found",
          },
          404
        );
      }
    }

    // Validate counts if provided
    if (body.counts && typeof body.counts !== "object") {
      return jsonResponse(
        {
          success: false,
          error: "counts must be an object",
        },
        400
      );
    }

    // Update session with provided fields
    const updateData: any = {};

    if (body.batchId !== undefined) updateData.batchId = body.batchId;
    if (body.species !== undefined) updateData.species = body.species;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.counts !== undefined) updateData.counts = body.counts;
    if (body.timestamp !== undefined)
      updateData.timestamp = new Date(body.timestamp);
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    await session.update(updateData);

    // Fetch updated session with batch details
    const updatedSession = await Session.findByPk(id, {
      include: [
        {
          model: Batch,
          as: "batch",
          attributes: ["id", "name", "userId", "isActive"],
        },
      ],
    });

    return jsonResponse({
      success: true,
      data: updatedSession,
      message: "Session updated successfully",
    });
  } catch (error) {
    console.error("Session PUT API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// DELETE /api/sessions/[id] - Delete specific session
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
          error: "Session ID is required",
        },
        400
      );
    }

    // Find session
    const session = await Session.findByPk(id, {
      include: [
        {
          model: Batch,
          as: "batch",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!session) {
      return jsonResponse(
        {
          success: false,
          error: "Session not found",
        },
        404
      );
    }

    // Store session data before deletion
    const deletedSessionData = session.toJSON();

    // Delete the session
    await session.destroy();

    return jsonResponse({
      success: true,
      data: deletedSessionData,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Session DELETE API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
