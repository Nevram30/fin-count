import { NextRequest, NextResponse } from "next/server";

// External API endpoint
const PREDICTION_API_URL =
  "https://fast-api-prediction-production.up.railway.app/api/v1/predict";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { species, dateFrom, dateTo, province, city } = body;

    // Validate required parameters
    if (!species || !dateFrom || !dateTo || !province || !city) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required parameters. Please provide species, dateFrom, dateTo, province, and city.",
        },
        { status: 400 }
      );
    }

    // Map species names to API format
    const speciesMap: { [key: string]: string } = {
      "Red Tilapia": "tilapia",
      Bangus: "bangus",
      tilapia: "tilapia",
      bangus: "bangus",
    };

    const apiSpecies = speciesMap[species];
    if (!apiSpecies) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid species: ${species}. Must be "Red Tilapia" or "Bangus".`,
        },
        { status: 400 }
      );
    }

    // Prepare request payload for external API
    const payload = {
      species: apiSpecies,
      dateFrom,
      dateTo,
      province,
      city,
    };

    console.log("Calling prediction API with payload:", payload);

    // Call external prediction API
    const response = await fetch(PREDICTION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Prediction API error:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: `Prediction API returned error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Parse response
    const data = await response.json();
    console.log("Prediction API response:", data);

    // Return successful response with the data structure expected by frontend
    return NextResponse.json({
      success: true,
      predictions: data.predictions,
      model_info: data.model_info,
      metadata: data.metadata,
    });
  } catch (error) {
    console.error("Error in predict API route:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch predictions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
