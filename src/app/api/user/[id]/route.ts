import models from "@/server/database/models";
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/server/helpers/function.helpers";
import StaffProfile from "@/server/database/models/staff.profile";
import AdminProfile from "@/server/database/models/admin.profile";

interface UserWithProfiles {
  id: number;
  email: string;
  userType: string;
  createdAt: Date;
  updatedAt: Date;
  staffProfile?: StaffProfile;
  adminProfile?: AdminProfile;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    // Validate ID
    if (!id || isNaN(id)) {
      return jsonResponse({
        success: false,
        error: "Valid user ID required",
        status: 400,
      });
    }

    // Find user with profiles
    const user = await models.User.findByPk(id, {
      attributes: {
        exclude: ["password"], // Don't return password field
      },
      include: [
        {
          model: models.StaffProfile,
          as: "staffProfile",
          required: false,
        },
        {
          model: models.AdminProfile,
          as: "adminProfile",
          required: false,
        },
      ],
    });

    if (!user) {
      return jsonResponse({
        success: false,
        error: "User not found",
        status: 404,
      });
    }

    // Transform user data
    const userData = user.get({ plain: true }) as UserWithProfiles;
    let displayName = userData.email;

    if (userData.staffProfile) {
      displayName = userData.staffProfile.fullName;
    } else if (userData.adminProfile) {
      displayName = `${userData.adminProfile.firstName} ${userData.adminProfile.lastName}`;
    }

    const transformedUser = {
      ...userData,
      name: displayName,
    };

    return jsonResponse({
      success: true,
      data: transformedUser,
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return jsonResponse({
        success: false,
        error: "Valid user ID required",
        status: 400,
      });
    }

    const user = await models.User.findByPk(id);

    if (!user) {
      return jsonResponse({
        success: false,
        error: "User not found",
        status: 404,
      });
    }

    // Delete user (this should cascade to profiles if you have ON DELETE CASCADE)
    await models.sequelize.transaction(async (transaction) => {
      // Delete associated profiles first if needed
      await models.StaffProfile.destroy({
        where: { userId: id },
        transaction,
      });

      await models.AdminProfile.destroy({
        where: { userId: id },
        transaction,
      });

      // Delete the user
      await user.destroy({ transaction });
    });

    return jsonResponse({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500,
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();

    if (!id || isNaN(id)) {
      return jsonResponse({
        success: false,
        error: "Valid user ID required",
        status: 400,
      });
    }

    const user = await models.User.findByPk(id, {
      include: [
        { model: models.StaffProfile, as: "staffProfile" },
        { model: models.AdminProfile, as: "adminProfile" },
      ],
    });

    if (!user) {
      return jsonResponse({
        success: false,
        error: "User not found",
        status: 404,
      });
    }

    // Update user and profiles in transaction
    const updatedUser = await models.sequelize.transaction(
      async (transaction) => {
        // Update basic user info
        if (body.email || body.userType) {
          await user.update(
            {
              email: body.email || user.email,
              userType: body.userType || user.userType,
            },
            { transaction }
          );
        }

        // Update staff profile if exists
        if (body.staffProfile && user.userType === "staff") {
          const staffProfile = await models.StaffProfile.findOne({
            where: { userId: id },
          });

          if (staffProfile) {
            await staffProfile.update(body.staffProfile, { transaction });
          }
        }

        // Update admin profile if exists
        if (body.adminProfile && user.userType === "admin") {
          const adminProfile = await models.AdminProfile.findOne({
            where: { userId: id },
          });

          if (adminProfile) {
            await adminProfile.update(body.adminProfile, { transaction });
          }
        }

        // Return updated user with profiles
        return await models.User.findByPk(id, {
          attributes: { exclude: ["password"] },
          include: [
            { model: models.StaffProfile, as: "staffProfile" },
            { model: models.AdminProfile, as: "adminProfile" },
          ],
          transaction,
        });
      }
    );

    return jsonResponse({
      success: true,
      data: updatedUser?.get({ plain: true }),
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500,
    });
  }
}
