import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Batch from "@/server/database/models/batch";
import Distribution from "@/server/database/models/distribution";
import User from "@/server/database/models/user";
import StaffProfile from "@/server/database/models/staff.profile";
import { sequelize } from "@/server/database/models/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const species = searchParams.get("species");

    // Build where clause for batches
    const whereClause: any = {
      isActive: true,
    };

    // Date range filter
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Get all batches with their distributions
    const batches = await Batch.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email"],
          include: [
            {
              model: StaffProfile,
              as: "staffsProfile",
              attributes: ["firstName", "lastName"],
            },
          ],
        },
      ],
    });

    // For each batch, calculate distributed amount
    const undistributedBatches = [];

    for (const batch of batches) {
      // Get total distributed for this batch
      const distributed = await Distribution.sum("fingerlings", {
        where: { batchId: batch.id },
      });

      const totalDistributed = distributed || 0;
      const remaining = batch.totalCount - totalDistributed;

      // Only include if there are remaining fingerlings
      if (remaining > 0) {
        // Apply species filter if needed (assuming batch name contains species info)
        if (species && species !== "All Species") {
          // Check if batch name or description contains the species
          const batchInfo = `${batch.name} ${
            batch.description || ""
          }`.toLowerCase();
          const speciesLower = species.toLowerCase();

          if (!batchInfo.includes(speciesLower)) {
            continue;
          }
        }

        // Calculate status based on creation date
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(batch.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const status = daysSinceCreation > 30 ? "Overdue" : "Pending";

        // Get staff name
        const user = (batch as any).user;
        const staffProfile = user?.staffsProfile?.[0];
        const staffName = staffProfile
          ? `${staffProfile.firstName} ${staffProfile.lastName}`
          : "Unknown Staff";

        undistributedBatches.push({
          id: batch.id,
          batchNumber: batch.id,
          name: batch.name,
          description: batch.description,
          totalCount: batch.totalCount,
          distributed: totalDistributed,
          remaining: remaining,
          dateCreated: batch.createdAt,
          status: status,
          staffName: staffName,
          daysSinceCreation: daysSinceCreation,
        });
      }
    }

    // Sort by date created (newest first)
    undistributedBatches.sort(
      (a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );

    return NextResponse.json({
      success: true,
      data: undistributedBatches,
      summary: {
        totalBatches: undistributedBatches.length,
        totalRemaining: undistributedBatches.reduce(
          (sum, b) => sum + b.remaining,
          0
        ),
        overdueCount: undistributedBatches.filter((b) => b.status === "Overdue")
          .length,
      },
    });
  } catch (error) {
    console.error("Error fetching undistributed batches report:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch undistributed batches report",
      },
      { status: 500 }
    );
  }
}
