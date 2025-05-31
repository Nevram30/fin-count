// src/app/api/user/route.ts
import * as bcrypt from "bcrypt";
import { Role, UserCreationAttributes } from "@/server/database/models/user";

import models from "@/server/database/models";
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/server/helpers/function.helpers";
import { Op } from "sequelize";

interface StaffProfile {
  fullName: string;
  username: string;
  phoneNumber: string;
  profilePhoto?: string;
}

interface AdminProfile {
  firstName: string;
  lastName: string;
}

interface ExtendedUserCreationAttributes extends UserCreationAttributes {
  staffProfile?: StaffProfile;
  adminProfile?: AdminProfile;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request as JSON
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password || !body.userType) {
      return jsonResponse({
        success: false,
        error: "Missing required fields",
        status: 400,
      });
    }

    // Check for existing email
    const isEmailExist = await models.User.findOne({
      attributes: ["email"],
      where: { email: body.email },
    });

    if (isEmailExist) {
      return jsonResponse({
        success: false,
        error: "Email already exists",
        status: 400,
      });
    }

    // Check if admin email
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    const isAdmin = adminEmails.some(
      (adminEmail: string) => adminEmail === body.email
    );

    // Create user data
    const userData: ExtendedUserCreationAttributes = {
      email: body.email,
      password: await bcrypt.hash(body.password, 10),
      userType: isAdmin ? Role.admin : (body.userType as Role),
    };

    // Add profile data based on user type
    if (body.userType === "staff") {
      userData.staffProfile = {
        fullName: body.fullName,
        username: body.username,
        phoneNumber: body.phoneNumber,
        profilePhoto: body.profilePhoto,
      };
    } else if (body.userType === "admin") {
      userData.adminProfile = {
        firstName: body.firstName,
        lastName: body.lastName,
      };
    }

    // Begin transaction and create records
    const result = await models.sequelize.transaction(async (transaction) => {
      // Create the user first
      const user = await models.User.create(
        {
          email: userData.email,
          password: userData.password,
          userType: userData.userType,
        },
        { transaction }
      );

      // Now create the appropriate profile based on user type
      if (body.userType === "student" && userData.staffProfile) {
        await models.StaffProfile.create(
          {
            userId: user.id,
            ...userData.staffProfile,
          },
          { transaction }
        );
      } else if (body.userType === "admin" && userData.adminProfile) {
        await models.AdminProfile.create(
          {
            userId: user.id,
            ...userData.adminProfile,
          },
          { transaction }
        );
      }

      return user;
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = result.toJSON();

    return jsonResponse({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional query parameters for filtering/pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userType = searchParams.get("userType");
    const search = searchParams.get("search");

    // Build where clause for filtering
    const whereClause: any = {};

    if (userType) {
      whereClause.userType = userType;
    }

    if (search) {
      whereClause[Op.or] = [{ email: { [Op.iLike]: `%${search}%` } }];
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // First, get users without associations
    const { count, rows: users } = await models.User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["password"],
      },
    });

    // Get user IDs for profile queries
    const userIds = users.map((user) => user.id);

    // Fetch staff profiles separately
    const staffProfiles =
      userIds.length > 0
        ? await models.StaffProfile.findAll({
            where: {
              userId: {
                [Op.in]: userIds,
              },
            },
            attributes: [
              "userId",
              "fullName",
              "username",
              "phoneNumber",
              "profilePhoto",
            ],
          })
        : [];

    // Fetch admin profiles separately
    const adminProfiles =
      userIds.length > 0
        ? await models.AdminProfile.findAll({
            where: {
              userId: {
                [Op.in]: userIds,
              },
            },
            attributes: ["userId", "firstName", "lastName"],
          })
        : [];

    // Create lookup maps for profiles
    const staffProfileMap = new Map();
    staffProfiles.forEach((profile) => {
      const data = profile.get({ plain: true });
      staffProfileMap.set(data.userId, data);
    });

    const adminProfileMap = new Map();
    adminProfiles.forEach((profile) => {
      const data = profile.get({ plain: true });
      adminProfileMap.set(data.userId, data);
    });

    // Transform users data with profile information
    const transformedUsers = users.map((user) => {
      const userData = user.get({ plain: true });
      const staffProfile = staffProfileMap.get(userData.id);
      const adminProfile = adminProfileMap.get(userData.id);

      // Determine display name based on user type and profile
      let displayName = userData.email; // fallback

      if (staffProfile) {
        displayName = staffProfile.fullName;
      } else if (adminProfile) {
        displayName = `${adminProfile.firstName} ${adminProfile.lastName}`;
      }

      return {
        id: userData.id,
        email: userData.email,
        userType: userData.userType,
        name: displayName,
        username: staffProfile?.username || null,
        phoneNumber: staffProfile?.phoneNumber || null,
        profilePhoto: staffProfile?.profilePhoto || null,
        firstName: adminProfile?.firstName || null,
        lastName: adminProfile?.lastName || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        status: "active", // Default status
      };
    });

    // Return paginated response
    return jsonResponse({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Users API Error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500,
    });
  }
}
