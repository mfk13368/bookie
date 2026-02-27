"use client";

import { useState, useEffect } from "react";
import { Search, Book as BookIcon, MapPin, User, HandMetal, PlusCircle, LayoutDashboard, Library, Home, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import BookForm from "@/components/BookForm";

export default function InventoryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLendModal, setShowLendModal] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [borrower, setBorrower] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const response = await fetch(`/api/books?${params.toString()}`);
    const data = await response.json();
    setBooks(data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleLend = async (bookId: string) => {
    if (!borrower) return;
    await fetch("/api/lending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, borrower }),
    });
    setBorrower("");
    setShowLendModal(null);
    fetchBooks();
  };

  const handleReturn = async (lendingId: string) => {
    await fetch("/api/lending", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lendingId }),
    });
    fetchBooks();
  };

  const handleUpdateBook = async (formData: any) => {
    const response = await fetch("/api/books", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      setEditingBook(null);
      fetchBooks();
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Bist du sicher, dass du dieses Buch löschen möchtest?")) return;
    
    const response = await fetch(`/api/books?id=${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchBooks();
    }
  };

  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mein Bücherbestand</h1>
        <div className="hidden md:flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Home className="h-5 w-5" /> Startseite
            </Link>
            <Link href="/add" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <PlusCircle className="h-5 w-5" /> Buch scannen
            </Link>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Titel, Autor..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Lädt...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          Keine Bücher gefunden.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex gap-4">
                <div className="w-20 h-28 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative border border-gray-50">
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookIcon className="text-gray-300 h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 truncate flex-1" title={book.title}>{book.title}</h3>
                    <div className="flex gap-1 ml-2">
                        <button 
                            onClick={() => setEditingBook(book)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Bearbeiten"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Löschen"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                    <User className="h-3 w-3" /> {book.author || "Unbekannter Autor"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {book.location || "Kein Ort angegeben"}
                  </p>
                  <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                    Anzahl: {book.quantity}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                {book.lendings && book.lendings.length > 0 ? (
                  <div className="flex-1">
                    <p className="text-xs text-orange-600 font-medium">
                      Verliehen an: {book.lendings[0].borrower}
                    </p>
                    <button
                      onClick={() => handleReturn(book.lendings[0].id)}
                      className="text-xs text-blue-600 underline"
                    >
                      Als zurückgegeben markieren
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLendModal(book.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                  >
                    <HandMetal className="h-4 w-4" /> Verleihen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showLendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Buch verleihen</h3>
            <input
              type="text"
              placeholder="Name des Ausleihers"
              className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLendModal(null)}
                className="px-4 py-2 text-gray-600"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleLend(showLendModal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {editingBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-md my-8">
            <BookForm 
                initialData={editingBook}
                isEdit={true}
                onSubmit={handleUpdateBook}
                onCancel={() => setEditingBook(null)}
            />
          </div>
        </div>
      )}

      {/* Navigation for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center md:hidden z-40">
        <Link href="/" className="flex flex-col items-center gap-1 text-gray-400">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[10px]">Dashboard</span>
        </Link>
        <Link href="/inventory" className="flex flex-col items-center gap-1 text-blue-600">
          <Library className="h-6 w-6" />
          <span className="text-[10px]">Bestand</span>
        </Link>
        <Link href="/add" className="flex flex-col items-center gap-1 text-gray-400">
          <PlusCircle className="h-6 w-6" />
          <span className="text-[10px]">Neu</span>
        </Link>
      </nav>
    </div>
  );
}
