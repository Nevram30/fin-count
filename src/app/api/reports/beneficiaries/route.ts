import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import models from "@/server/database/models";

const { Distribution, StaffProfile, sequelize } = models;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const barangay = searchParams.get("barangay");
    const species = searchParams.get("species");

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

    // Species filter
    if (species && species !== "All Species") {
      whereClause.species = {
        [Op.like]: `%${species}%`,
      };
    }

    // Determine grouping based on filters
    const groupByFields: string[] = [];
    const selectFields: any[] = [
      "beneficiaryName",
      "species",
      "dateDistributed",
    ];

    // Add location fields based on what's filtered
    if (!province || province === "All Provinces") {
      groupByFields.push("province");
      selectFields.push("province");
    } else {
      selectFields.push("province");
      groupByFields.push("province");
    }

    if (!city || city === "All Cities") {
      groupByFields.push("municipality");
      selectFields.push("municipality");
    } else if (province && province !== "All Provinces") {
      selectFields.push("municipality");
      groupByFields.push("municipality");
    }

    if (!barangay || barangay === "All Barangays") {
      groupByFields.push("barangay");
      selectFields.push("barangay");
    } else if (city && city !== "All Cities") {
      selectFields.push("barangay");
      groupByFields.push("barangay");
    }

    // Add beneficiary-specific grouping
    groupByFields.push(
      "beneficiaryName",
      "species",
      "dateDistributed",
      "userId"
    );

    // Query for detailed beneficiary records
    const beneficiariesData: any[] = await Distribution.findAll({
      attributes: [
        ...selectFields,
        "userId",
        [sequelize.fn("SUM", sequelize.col("fingerlings")), "totalFingerlings"],
      ],
      where: whereClause,
      group: groupByFields,
      order: [
        ["province", "ASC"],
        ["municipality", "ASC"],
        ["barangay", "ASC"],
        ["beneficiaryName", "ASC"],
      ],
      raw: true,
    });

    // Get unique user IDs to fetch contact numbers - Commented out for now
    /* const userIds = Array.from(
      new Set(beneficiariesData.map((record: any) => record.userId))
    );

    // Fetch phone numbers from StaffProfile for all users
    const staffProfiles = await StaffProfile.findAll({
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
      attributes: ["userId", "phoneNumber"],
      raw: true,
    });

    // Create a map of userId to phoneNumber
    const userContactMap = new Map(
      staffProfiles.map((profile: any) => [profile.userId, profile.phoneNumber])
    ); */

    // Format the data without contact numbers (commented out)
    const formattedData = beneficiariesData.map((record: any) => {
      return {
        province: record.province,
        municipality: record.municipality,
        barangay: record.barangay || "N/A",
        beneficiaryName: record.beneficiaryName,
        species: record.species,
        // contactNumber: userContactMap.get(record.userId) || "N/A", // Commented out
        totalFingerlings: parseInt(record.totalFingerlings) || 0,
        dateDistributed: record.dateDistributed,
      };
    });

    // Calculate summary statistics
    const summary = {
      totalBeneficiaries: formattedData.length,
      totalFingerlings: formattedData.reduce(
        (sum, record) => sum + record.totalFingerlings,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
      summary: summary,
      filters: {
        hasProvince: !province || province === "All Provinces",
        hasCity: !city || city === "All Cities",
        hasBarangay: !barangay || barangay === "All Barangays",
      },
    });
  } catch (error: any) {
    console.error("Error fetching beneficiaries report:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch beneficiaries report",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
