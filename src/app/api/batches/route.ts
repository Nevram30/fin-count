import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import models from "@/server/database/models";

const { Batch } = models;

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Helper function to generate batch ID
function generateBatchId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const timestamp = Date.now().toString().slice(-3);
  return `BF-${year}${month}${day}-${timestamp}`;
}

// GET /api/batches - Fetch all batches with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const species = searchParams.get("species");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const whereClause: any = {};

    if (species) {
      whereClause.name = {
        [Op.like]: `%${species}%`,
      };
    }

    if (location) {
      whereClause.description = {
        [Op.like]: `%${location}%`,
      };
    }

    if (isActive !== null && isActive !== undefined) {
      whereClause.isActive = isActive === "true";
    }

    // Search across multiple fields
    if (search) {
      whereClause[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Fetch batches with pagination
    const { count, rows: batches } = await Batch.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    const totalPages = Math.ceil(count / limit);

    return jsonResponse({
      success: true,
      data: {
        batches,
        pagination: {
          currentPage: page,
          totalPages,
          totalBatches: count,
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
    if (!body.name || !body.userId) {
      return jsonResponse(
        {
          success: false,
          error: "Missing required fields: name, userId",
        },
        400
      );
    }

    // Validate totalCount is a non-negative number if provided
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

    // Create new batch
    const newBatch = await Batch.create({
      id: body.id || generateBatchId(),
      name: body.name,
      description: body.description || null,
      userId: body.userId,
      totalCount: body.totalCount || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

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
