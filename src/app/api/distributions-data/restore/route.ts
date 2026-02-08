import { NextRequest, NextResponse } from "next/server";
import { restoreDistributions } from "@/server/services/distribution.service";

function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, actor } = body;

    const result = await restoreDistributions({ ids, actor });
    if (!result.success) {
      return jsonResponse(result, 400);
    }

    return jsonResponse({
      success: true,
      message: `Successfully restored ${result.affectedCount} distribution(s)`,
      restoredCount: result.affectedCount,
      requestedCount: result.requestedCount,
      restoredIds: result.affectedIds,
      notFoundIds: result.notFoundIds,
      unauthorizedIds: result.unauthorizedIds,
      alreadyActiveIds: result.skippedIds,
    });
  } catch (error) {
    console.error("Distributions Data RESTORE API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

