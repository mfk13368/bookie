import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const author = searchParams.get("author");
    const location = searchParams.get("location");

    const books = await prisma.book.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { author: { contains: search } },
                  { isbn: { contains: search } },
                  { location: { contains: search } },
                ],
              }
            : {},
          author ? { author: { contains: author } } : {},
          location ? { location: { contains: location } } : {},
        ],
      },
      include: {
        lendings: {
          where: { returnedAt: null },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(books);
  } catch (error: any) {
    console.error("API Books GET error:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Bücher" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("API: Creating book:", data.title);

    if (!data.title) {
        return NextResponse.json({ error: "Titel ist erforderlich" }, { status: 400 });
    }

    // Check if book with this ISBN already exists (if ISBN provided)
    if (data.isbn) {
        const existingBook = await prisma.book.findUnique({
            where: { isbn: data.isbn }
        });
        if (existingBook) {
            // Increment quantity instead of error
            const updatedBook = await prisma.book.update({
                where: { id: existingBook.id },
                data: {
                    quantity: { increment: 1 }
                }
            });
            return NextResponse.json({
                ...updatedBook,
                info: `Buch bereits vorhanden (${existingBook.location || 'kein Ort'}). Anzahl wurde auf ${updatedBook.quantity} erhöht.`
            });
        }
    }

    const book = await prisma.book.create({
      data: {
        isbn: data.isbn || null,
        title: data.title,
        author: data.author || null,
        location: data.location || null,
        quantity: data.quantity || 1,
        thumbnail: data.thumbnail || null,
      },
    });

    console.log("API: Book created successfully:", book.id);
    return NextResponse.json(book);
  } catch (error: any) {
    console.error("API Books POST error:", error);
    return NextResponse.json({
        error: error.message || "Interner Serverfehler beim Speichern"
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        if (!id) {
            return NextResponse.json({ error: "Buch-ID ist erforderlich" }, { status: 400 });
        }

        const book = await prisma.book.update({
            where: { id },
            data: {
                isbn: updateData.isbn,
                title: updateData.title,
                author: updateData.author,
                location: updateData.location,
                quantity: updateData.quantity,
                thumbnail: updateData.thumbnail,
            }
        });

        return NextResponse.json(book);
    } catch (error: any) {
        console.error("API Books PATCH error:", error);
        return NextResponse.json({
            error: error.message || "Fehler beim Aktualisieren des Buches"
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Buch-ID ist erforderlich" }, { status: 400 });
        }

        await prisma.book.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Books DELETE error:", error);
        return NextResponse.json({ error: "Fehler beim Löschen des Buches" }, { status: 500 });
    }
}
