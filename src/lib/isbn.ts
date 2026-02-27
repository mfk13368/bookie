export interface BookMetadata {
  title: string;
  author?: string;
  thumbnail?: string;
  isbn: string;
}

export async function fetchBookMetadata(isbn: string): Promise<BookMetadata | null> {
  const cleanIsbn = isbn.replace(/[- ]/g, "");
  try {
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`
    );
    const data = await response.json();
    const bookKey = `ISBN:${cleanIsbn}`;
    const bookData = data[bookKey];

    if (!bookData) return null;

    return {
      title: bookData.title,
      author: bookData.authors?.map((a: any) => a.name).join(", "),
      thumbnail: bookData.cover?.medium || bookData.cover?.small,
      isbn: cleanIsbn,
    };
  } catch (error) {
    console.error("Error fetching book metadata:", error);
    return null;
  }
}
