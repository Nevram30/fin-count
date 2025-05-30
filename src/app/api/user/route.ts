// src/app/api/user/route.ts
import * as bcrypt from "bcrypt";
import { Role, UserCreationAttributes } from "@/server/database/models/user";

import models from "@/server/database/models";
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/server/helpers/function.helpers";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    // Validate ID
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Valid user ID required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await models.User.findByPk(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return clean response
    return NextResponse.json({
      status: "success",
      data: user.get({ plain: true }),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
