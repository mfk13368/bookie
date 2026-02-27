import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.book.findMany({
      select: {
        location: true,
      },
      distinct: ["location"],
      where: {
        location: {
          not: null,
        },
      },
    });

    const locationList = locations
      .map((l) => l.location)
      .filter((l): l is string => l !== null && l !== "")
      .sort();

    return NextResponse.json(locationList);
  } catch (error) {
    console.error("API Locations GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Orte" }, { status: 500 });
  }
}
