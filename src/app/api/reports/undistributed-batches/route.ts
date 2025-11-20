import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const species = searchParams.get("species");

    // Fetch sessions from external API
    const response = await fetch(
      "https://fincount-api-production.up.railway.app/api/sessions"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch sessions from external API");
    }

    const result = await response.json();

    if (!result.success || !result.data || !result.data.sessions) {
      throw new Error("Invalid response format from external API");
    }

    let sessions = result.data.sessions;

    console.log(`Total sessions from API: ${sessions.length}`);
    if (sessions.length > 0) {
      console.log("Sample session:", JSON.stringify(sessions[0], null, 2));
    }

    // Apply date range filter
    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      console.log(`Date filter: ${startDate} to ${endDate}`);

      sessions = sessions.filter((session: any) => {
        const sessionDate = new Date(
          session.created_at || session.createdAt
        ).getTime();
        const inRange = sessionDate >= start && sessionDate <= end;
        if (!inRange && sessions.indexOf(session) < 3) {
          console.log(
            `Session ${session.id} date ${
              session.created_at || session.createdAt
            } is outside range`
          );
        }
        return inRange;
      });
    }

    console.log(`Processing ${sessions.length} sessions after date filter`);

    // Group sessions by batch_id and calculate totals
    const batchMap = new Map();

    for (const session of sessions) {
      const batchId = session.batch_id || session.batchId;

      if (!batchId) {
        console.log("Session without batch_id:", session.id);
        continue;
      }

      if (!batchMap.has(batchId)) {
        // Get staff name from batch user
        const batch = session.batch;
        const user = batch?.user;
        const staffProfile = user?.staffsProfile?.[0];
        const staffName = staffProfile
          ? `${staffProfile.firstName} ${staffProfile.lastName}`
          : "Unknown Staff";

        batchMap.set(batchId, {
          id: session.id,
          batchNumber: batchId,
          name: session.species || "Unknown Species",
          location: session.location || "Unknown Location",
          totalCount: 0,
          sessionCount: 0,
          dateCreated: session.created_at || session.createdAt,
          staffName: staffName,
          sessions: [],
        });
      }

      const batchData = batchMap.get(batchId);

      // Calculate total count from counts object
      let sessionTotal = 0;
      if (session.counts && typeof session.counts === "object") {
        sessionTotal = Object.values(session.counts).reduce(
          (sum: number, val: any) => {
            return sum + (typeof val === "number" ? val : 0);
          },
          0
        );
      }

      batchData.totalCount += sessionTotal;
      batchData.sessionCount += 1;
      batchData.sessions.push({
        id: session.id,
        location: session.location,
        notes: session.notes,
        count: sessionTotal,
        timestamp: session.timestamp,
        imageUrl: session.image_url || session.imageUrl,
      });
    }

    // Convert map to array and calculate status
    let undistributedBatches = Array.from(batchMap.values()).map((batch) => {
      // Calculate status based on creation date
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(batch.dateCreated).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const status = daysSinceCreation > 30 ? "Overdue" : "Pending";

      return {
        ...batch,
        remaining: batch.totalCount, // All are undistributed in sessions
        distributed: 0,
        status: status,
        daysSinceCreation: daysSinceCreation,
      };
    });

    // Apply species filter if specified
    if (species && species !== "All Species") {
      undistributedBatches = undistributedBatches.filter((batch) => {
        const batchName = batch.name.toLowerCase();
        const speciesLower = species.toLowerCase();
        return batchName.includes(speciesLower);
      });
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
