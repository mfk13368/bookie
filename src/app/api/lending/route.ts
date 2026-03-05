import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { bookId, borrower } = await request.json();
  const lending = await prisma.lending.create({
    data: {
      bookId,
      borrower,
    },
  });
  return NextResponse.json(lending);
}

export async function PATCH(request: Request) {
  const { lendingId } = await request.json();
  const lending = await prisma.lending.update({
    where: { id: lendingId },
    data: { returnedAt: new Date() },
  });
  return NextResponse.json(lending);
}
