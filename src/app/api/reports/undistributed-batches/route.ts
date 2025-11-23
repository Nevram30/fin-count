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
          session.created_at || session.createdAt || session.timestamp
        ).getTime();
        const inRange = sessionDate >= start && sessionDate <= end;
        return inRange;
      });
    }

    console.log(`Processing ${sessions.length} sessions after date filter`);

    // Apply species filter if specified
    if (species && species !== "All Species") {
      sessions = sessions.filter((session: any) => {
        const sessionSpecies = (session.species || "").toLowerCase();
        const speciesLower = species.toLowerCase();
        return sessionSpecies.includes(speciesLower);
      });
    }

    // Transform sessions to match the display format
    const transformedSessions = sessions.map((session: any) => {
      // Calculate total count from counts object
      let totalCount = 0;
      if (session.counts && typeof session.counts === "object") {
        totalCount = Object.values(session.counts).reduce(
          (sum: number, val: any) => {
            return sum + (typeof val === "number" ? val : 0);
          },
          0
        );
      }

      return {
        id: session.id,
        batch_id: session.batch_id || session.batchId,
        user_id: session.user_id || session.userId,
        species: session.species || "Unknown",
        location: session.location || "Unknown",
        notes: session.notes || "",
        counts: totalCount,
        timestamp: session.timestamp || session.created_at || session.createdAt,
      };
    });

    // Sort by timestamp (newest first)
    transformedSessions.sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      data: transformedSessions,
      summary: {
        totalSessions: transformedSessions.length,
        totalCount: transformedSessions.reduce(
          (sum: number, s: any) => sum + s.counts,
          0
        ),
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
