import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Distribution from "@/server/database/models/distribution";
import { sequelize } from "@/server/database/models/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const species = searchParams.get("species");

    // Build where clause
    const whereClause: any = {};

    // Date range filter
    if (startDate && endDate) {
      whereClause.dateDistributed = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Species filter
    if (species && species !== "All Species") {
      whereClause.species = species;
    }

    // Query for fingerling count grouped by date and species
    const fingerlingsData = await Distribution.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("dateDistributed")), "date"],
        "species",
        [sequelize.fn("SUM", sequelize.col("fingerlings")), "totalFingerlings"],
        [sequelize.fn("COUNT", sequelize.col("id")), "distributionCount"],
      ],
      where: whereClause,
      group: [
        sequelize.fn("DATE", sequelize.col("dateDistributed")),
        "species",
      ],
      order: [[sequelize.fn("DATE", sequelize.col("dateDistributed")), "DESC"]],
      raw: true,
    });

    // Calculate summary statistics
    const summary = (await Distribution.findOne({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("fingerlings")), "grandTotal"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalDistributions"],
      ],
      where: whereClause,
      raw: true,
    })) as { grandTotal: number; totalDistributions: number } | null;

    return NextResponse.json({
      success: true,
      data: fingerlingsData,
      summary: {
        grandTotal: summary?.grandTotal || 0,
        totalDistributions: summary?.totalDistributions || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching fingerling count report:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch fingerling count report",
      },
      { status: 500 }
    );
  }
}
