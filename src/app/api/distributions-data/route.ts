import { NextRequest, NextResponse } from "next/server";
import Distribution from "@/server/database/models/distribution";
import models from "@/server/database/models";
import { Op } from "sequelize";

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/distributions-data - Fetch distribution data from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const species = searchParams.get("species");
    const municipality = searchParams.get("municipality");
    const province = searchParams.get("province");
    const barangay = searchParams.get("barangay");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const whereClause: any = {};

    // Filter by species
    if (species) {
      whereClause.species = species;
    }

    // Filter by municipality
    if (municipality) {
      whereClause.municipality = {
        [Op.like]: `%${municipality}%`,
      };
    }

    // Filter by province
    if (province) {
      whereClause.province = {
        [Op.like]: `%${province}%`,
      };
    }

    // Filter by barangay
    if (barangay) {
      whereClause.barangay = {
        [Op.like]: `%${barangay}%`,
      };
    }

    // Search by beneficiary name or location
    if (search) {
      whereClause[Op.or] = [
        {
          beneficiaryName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          municipality: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          province: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          barangay: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.dateDistributed = {};
      if (startDate) {
        whereClause.dateDistributed[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.dateDistributed[Op.lte] = new Date(endDate);
      }
    }

    // Get total count for pagination
    const totalDistributions = await Distribution.count({
      where: whereClause,
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalDistributions / limit);
    const offset = (page - 1) * limit;

    // Fetch distributions with pagination
    const distributions = await Distribution.findAll({
      where: whereClause,
      include: [
        {
          model: models.User,
          as: "user",
          attributes: ["id", "email", "userType"],
        },
      ],
      order: [["dateDistributed", "DESC"]],
      limit,
      offset,
    });

    return jsonResponse({
      success: true,
      data: {
        distributions,
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
    console.error("Distributions Data GET API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// POST /api/distributions-data - Create new distribution record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "dateDistributed",
      "beneficiaryName",
      "municipality",
      "province",
      "fingerlings",
      "species",
      "userId",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return jsonResponse(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          400
        );
      }
    }

    // Validate species
    if (!["Tilapia", "Bangus"].includes(body.species)) {
      return jsonResponse(
        {
          success: false,
          error: "species must be either 'Tilapia' or 'Bangus'",
        },
        400
      );
    }

    // Validate fingerlings is a positive number
    if (typeof body.fingerlings !== "number" || body.fingerlings <= 0) {
      return jsonResponse(
        {
          success: false,
          error: "fingerlings must be a positive number",
        },
        400
      );
    }

    // Create new distribution
    const newDistribution = await Distribution.create({
      dateDistributed: new Date(body.dateDistributed),
      beneficiaryName: body.beneficiaryName,
      area: body.area || null,
      barangay: body.barangay || null,
      municipality: body.municipality,
      province: body.province,
      fingerlings: body.fingerlings,
      species: body.species,
      userId: body.userId,
      batchId: body.batchId || null,
      forecastedHarvestKilos: body.forecastedHarvestKilos || null,
      actualHarvestKilos: body.actualHarvestKilos || null,
      actualHarvestDate: body.actualHarvestDate
        ? new Date(body.actualHarvestDate)
        : null,
      remarks: body.remarks || null,
      customRemarks: body.customRemarks || null,
    });

    // Fetch the created distribution with user data
    const distributionWithUser = await Distribution.findByPk(
      newDistribution.id,
      {
        include: [
          {
            model: models.User,
            as: "user",
            attributes: ["id", "email", "userType"],
          },
        ],
      }
    );

    return jsonResponse(
      {
        success: true,
        data: distributionWithUser,
        message: "Distribution record created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Distributions Data POST API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// DELETE /api/distributions-data - Bulk delete distributions
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    // Validate ids array
    if (!Array.isArray(ids) || ids.length === 0) {
      return jsonResponse(
        {
          success: false,
          error: "ids must be a non-empty array",
        },
        400
      );
    }

    // Delete distributions
    const deletedCount = await Distribution.destroy({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

    return jsonResponse({
      success: true,
      message: `Successfully deleted ${deletedCount} distribution(s)`,
      deletedCount,
    });
  } catch (error) {
    console.error("Distributions Data DELETE API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
