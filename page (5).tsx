import { NextResponse } from "next/server";
import { fetchBookMetadata } from "@/lib/isbn";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ isbn: string }> }
) {
  try {
    const { isbn } = await params;
    console.log(`API: Fetching metadata for ISBN: ${isbn}`);
    
    if (!isbn) {
        return NextResponse.json({ error: "ISBN is required" }, { status: 400 });
    }

    const metadata = await fetchBookMetadata(isbn);
    
    if (!metadata) {
      console.log(`API: No metadata found for ISBN: ${isbn}`);
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    
    console.log(`API: Found metadata for: ${metadata.title}`);
    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("API ISBN error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
