import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import models from "@/server/database/models";

const { Session, Batch } = models;

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/sessions - Fetch all sessions with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const batchId = searchParams.get("batchId");
    const species = searchParams.get("species");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const whereClause: any = {};

    if (batchId) {
      whereClause.batchId = batchId;
    }

    if (species) {
      whereClause.species = {
        [Op.like]: `%${species}%`,
      };
    }

    if (location) {
      whereClause.location = {
        [Op.like]: `%${location}%`,
      };
    }

    // Search across multiple fields
    if (search) {
      whereClause[Op.or] = [
        { species: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    // Fetch sessions with pagination
    const { count, rows: sessions } = await Session.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Batch,
          as: "batch",
          attributes: ["id", "name", "userId"],
        },
      ],
      order: [["timestamp", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    const totalPages = Math.ceil(count / limit);

    return jsonResponse({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalSessions: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Sessions GET API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// POST /api/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.id ||
      !body.batchId ||
      !body.species ||
      !body.location ||
      !body.timestamp ||
      !body.imageUrl
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            "Missing required fields: id, batchId, species, location, timestamp, imageUrl",
        },
        400
      );
    }

    // Verify batch exists
    console.log("Looking for batch with ID:", body.batchId);
    const batch = await Batch.findByPk(body.batchId);
    console.log("Batch found:", batch ? "Yes" : "No");

    if (!batch) {
      // Log all available batches for debugging
      const allBatches = await Batch.findAll({ attributes: ["id", "name"] });
      console.log(
        "Available batches:",
        allBatches.map((b) => b.id)
      );

      return jsonResponse(
        {
          success: false,
          error: "Batch not found",
          availableBatches: allBatches.map((b) => b.id),
        },
        404
      );
    }

    // Validate counts is an object
    if (body.counts && typeof body.counts !== "object") {
      return jsonResponse(
        {
          success: false,
          error: "counts must be an object",
        },
        400
      );
    }

    // Create new session
    const newSession = await Session.create({
      id: body.id,
      batchId: body.batchId,
      species: body.species,
      location: body.location,
      notes: body.notes || "",
      counts: body.counts || {},
      timestamp: new Date(body.timestamp),
      imageUrl: body.imageUrl,
    });

    // Fetch the created session with batch details
    const sessionWithBatch = await Session.findByPk(newSession.id, {
      include: [
        {
          model: Batch,
          as: "batch",
          attributes: ["id", "name", "userId"],
        },
      ],
    });

    return jsonResponse(
      {
        success: true,
        data: sessionWithBatch,
        message: "Session created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Sessions POST API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
