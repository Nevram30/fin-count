import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Distribution from "@/server/database/models/distribution";
import { sequelize } from "@/server/database/models/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const barangay = searchParams.get("barangay");

    // Build where clause
    const whereClause: any = {};

    // Date range filter
    if (startDate && endDate) {
      whereClause.dateDistributed = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Location filters
    if (province && province !== "All Provinces") {
      whereClause.province = province;
    }

    if (city && city !== "All Cities") {
      whereClause.municipality = city;
    }

    if (barangay && barangay !== "All Barangays") {
      whereClause.barangay = barangay;
    }

    // Query for beneficiaries grouped by location
    const beneficiariesData: any[] = await Distribution.findAll({
      attributes: [
        "province",
        "municipality",
        "barangay",
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("beneficiaryName"))
          ),
          "beneficiaryCount",
        ],
        [sequelize.fn("SUM", sequelize.col("fingerlings")), "totalFingerlings"],
        [sequelize.fn("COUNT", sequelize.col("id")), "distributionCount"],
      ],
      where: whereClause,
      group: ["province", "municipality", "barangay"],
      order: [
        ["province", "ASC"],
        ["municipality", "ASC"],
        ["barangay", "ASC"],
      ],
      raw: true,
    });

    // Get unique beneficiaries per location with their names
    const beneficiariesWithNames = [];

    for (const location of beneficiariesData) {
      // Get unique beneficiary names for this location
      const locationWhere: any = {
        province: location.province,
        municipality: location.municipality,
      };

      if (location.barangay) {
        locationWhere.barangay = location.barangay;
      }

      // Apply date filter if exists
      if (startDate && endDate) {
        locationWhere.dateDistributed = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const beneficiaries = await Distribution.findAll({
        attributes: [
          "beneficiaryName",
          [sequelize.fn("SUM", sequelize.col("fingerlings")), "fingerlings"],
        ],
        where: locationWhere,
        group: ["beneficiaryName"],
        raw: true,
      });

      beneficiariesWithNames.push({
        province: location.province,
        municipality: location.municipality,
        barangay: location.barangay || "N/A",
        beneficiaryCount: location.beneficiaryCount,
        totalFingerlings: location.totalFingerlings,
        distributionCount: location.distributionCount,
        beneficiaries: beneficiaries,
      });
    }

    // Calculate summary statistics
    const summary = {
      totalLocations: beneficiariesWithNames.length,
      totalBeneficiaries: beneficiariesWithNames.reduce(
        (sum, loc) => sum + parseInt(loc.beneficiaryCount as any),
        0
      ),
      totalFingerlings: beneficiariesWithNames.reduce(
        (sum, loc) => sum + parseInt(loc.totalFingerlings as any),
        0
      ),
      totalDistributions: beneficiariesWithNames.reduce(
        (sum, loc) => sum + parseInt(loc.distributionCount as any),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: beneficiariesWithNames,
      summary: summary,
    });
  } catch (error) {
    console.error("Error fetching beneficiaries report:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch beneficiaries report",
      },
      { status: 500 }
    );
  }
}
