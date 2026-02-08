import { locationData } from "../src/app/components/data/location.data";

const errors: string[] = [];

const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every((v) => typeof v === "string");
};

const uniq = (items: string[]): string[] => Array.from(new Set(items));

const reportDuplicateStrings = (items: string[], label: string) => {
    const uniques = uniq(items);
    if (uniques.length !== items.length) {
        const counts = new Map<string, number>();
        for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
        const dups = Array.from(counts.entries())
            .filter(([, c]) => c > 1)
            .map(([v, c]) => `${v} (x${c})`);
        errors.push(`${label} has duplicates: ${dups.join(", ")}`);
    }
};

if (!Array.isArray(locationData.provinces)) {
    errors.push("provinces must be an array");
} else {
    reportDuplicateStrings(locationData.provinces, "provinces");
}

for (const province of locationData.provinces) {
    const cities = locationData.cities[province];
    if (!isStringArray(cities)) {
        errors.push(`cities[${province}] must be a string[]`);
        continue;
    }
    reportDuplicateStrings(cities, `cities[${province}]`);

    const provinceBarangays = locationData.barangays[province];
    if (!provinceBarangays || typeof provinceBarangays !== "object") {
        errors.push(`barangays[${province}] must be an object`);
        continue;
    }

    for (const city of cities) {
        if (!(city in provinceBarangays)) {
            errors.push(`Missing barangays entry for ${province} → ${city}`);
            continue;
        }

        const barangays = (provinceBarangays as Record<string, unknown>)[city];
        if (!isStringArray(barangays)) {
            errors.push(`barangays[${province}][${city}] must be a string[]`);
            continue;
        }

        reportDuplicateStrings(barangays, `barangays[${province}][${city}]`);
    }
}

if (errors.length > 0) {
    console.error(`Location data validation failed (${errors.length} issue(s)):\n- ${errors.join("\n- ")}`);
    process.exit(1);
}

console.log("Location data validation passed.");
