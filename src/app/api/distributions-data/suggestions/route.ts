import { NextRequest, NextResponse } from "next/server";
import Distribution from "@/server/database/models/distribution";
import { Op } from "sequelize";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const field = searchParams.get("field");
    const query = searchParams.get("query");

    if (!field || !query) {
      return NextResponse.json(
        { success: false, error: "Field and query parameters are required" },
        { status: 400 }
      );
    }

    let suggestions: string[] = [];

    switch (field) {
      case "firstname":
      case "lastname":
        // Extract first and last names from beneficiaryName
        const nameResults = await Distribution.findAll({
          attributes: ["beneficiaryName"],
          where: {
            beneficiaryName: {
              [Op.like]: `%${query}%`,
            },
          },
          group: ["beneficiaryName"],
          limit: 10,
        });

        const names = nameResults.map((r) => r.beneficiaryName);

        if (field === "firstname") {
          const firstNames = names.map((name) => name.split(" ")[0]);
          const uniqueFirstNames = Array.from(new Set(firstNames));
          suggestions = uniqueFirstNames
            .filter((name) => name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 10);
        } else {
          const lastNames = names.map((name) => {
            const parts = name.split(" ");
            return parts.length > 1 ? parts.slice(1).join(" ") : "";
          });
          const uniqueLastNames = Array.from(new Set(lastNames));
          suggestions = uniqueLastNames
            .filter(
              (name) => name && name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 10);
        }
        break;

      case "species":
        const speciesResults = await Distribution.findAll({
          attributes: ["species"],
          where: {
            species: {
              [Op.like]: `%${query}%`,
            },
          },
          group: ["species"],
        });
        suggestions = speciesResults.map((r) => r.species);
        break;

      case "province":
        const provinceResults = await Distribution.findAll({
          attributes: ["province"],
          where: {
            province: {
              [Op.like]: `%${query}%`,
            },
          },
          group: ["province"],
          limit: 10,
        });
        suggestions = provinceResults.map((r) => r.province);
        break;

      case "city":
        const cityResults = await Distribution.findAll({
          attributes: ["municipality"],
          where: {
            municipality: {
              [Op.like]: `%${query}%`,
            },
          },
          group: ["municipality"],
          limit: 10,
        });
        suggestions = cityResults.map((r) => r.municipality);
        break;

      case "barangay":
        const barangayResults = await Distribution.findAll({
          attributes: ["barangay"],
          where: {
            barangay: {
              [Op.like]: `%${query}%`,
              [Op.ne]: null,
            },
          },
          group: ["barangay"],
          limit: 10,
        });
        suggestions = barangayResults
          .map((r) => r.barangay)
          .filter((b): b is string => b !== null);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid field parameter" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
