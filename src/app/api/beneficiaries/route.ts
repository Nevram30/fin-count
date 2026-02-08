import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Beneficiary from "@/server/database/models/beneficiary";

function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const offset = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { organizationName: { [Op.like]: `%${search}%` } },
      ];
    }

    const totalBeneficiaries = await Beneficiary.count({
      where: whereClause,
      paranoid: !includeDeleted ? true : false,
    });
    const totalPages = Math.max(Math.ceil(totalBeneficiaries / limit), 1);

    const beneficiaries = await Beneficiary.findAll({
      where: whereClause,
      paranoid: !includeDeleted ? true : false,
      limit,
      offset,
      order: [["updatedAt", "DESC"]],
    });

    return jsonResponse({
      success: true,
      data: {
        beneficiaries,
        pagination: {
          currentPage: page,
          totalPages,
          totalBeneficiaries,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Beneficiaries GET API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const beneficiaryType = body.beneficiaryType as
      | "Individual"
      | "Organization"
      | undefined;

    if (!beneficiaryType || !["Individual", "Organization"].includes(beneficiaryType)) {
      return jsonResponse(
        {
          success: false,
          error: "beneficiaryType must be either 'Individual' or 'Organization'",
        },
        400
      );
    }

    const province = (body.province || "").toString().trim();
    const municipality = (body.municipality || "").toString().trim();
    const barangay = (body.barangay || "").toString().trim();
    const street = (body.street || "").toString().trim();

    if (!province) {
      return jsonResponse({ success: false, error: "province is required" }, 400);
    }
    if (!municipality) {
      return jsonResponse(
        { success: false, error: "municipality is required" },
        400
      );
    }
    if (!street) {
      return jsonResponse({ success: false, error: "street is required" }, 400);
    }

    const contactNumber = (body.contactNumber || "").toString().trim();
    const normalizedContactNumber = contactNumber.replace(/\D/g, "");
    if (!normalizedContactNumber) {
      return jsonResponse(
        { success: false, error: "contactNumber is required" },
        400
      );
    }
    if (!/^\d{11}$/.test(normalizedContactNumber)) {
      return jsonResponse(
        { success: false, error: "contactNumber must be exactly 11 digits" },
        400
      );
    }

    const firstname = (body.firstname || "").toString().trim();
    const lastname = (body.lastname || "").toString().trim();
    const organizationName = (body.organizationName || "").toString().trim();

    if (beneficiaryType === "Individual") {
      if (!firstname) {
        return jsonResponse({ success: false, error: "firstname is required" }, 400);
      }
      if (!lastname) {
        return jsonResponse({ success: false, error: "lastname is required" }, 400);
      }
    } else {
      if (!organizationName) {
        return jsonResponse(
          { success: false, error: "organizationName is required" },
          400
        );
      }
    }

    const dedupeWhereClause: any = {
      beneficiaryType,
      province,
      municipality,
      street,
      barangay: barangay ? barangay : null,
    };

    if (beneficiaryType === "Individual") {
      dedupeWhereClause.firstname = firstname;
      dedupeWhereClause.lastname = lastname;
    } else {
      dedupeWhereClause.organizationName = organizationName;
    }

    const existing = await Beneficiary.findOne({
      where: dedupeWhereClause,
      order: [["updatedAt", "DESC"]],
    });

    if (existing) {
      return jsonResponse(
        {
          success: true,
          data: existing,
          message: "Beneficiary already exists",
        },
        200
      );
    }

    const newBeneficiary = await Beneficiary.create({
      beneficiaryType,
      firstname: beneficiaryType === "Individual" ? firstname : null,
      lastname: beneficiaryType === "Individual" ? lastname : null,
      organizationName: beneficiaryType === "Organization" ? organizationName : null,
      contactNumber: normalizedContactNumber,
      province,
      municipality,
      barangay: barangay ? barangay : null,
      street,
    });

    return jsonResponse(
      {
        success: true,
        data: newBeneficiary,
        message: "Beneficiary created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Beneficiaries POST API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
