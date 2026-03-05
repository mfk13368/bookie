"use client";

import { useState, useEffect } from "react";
import { BookMetadata } from "@/lib/isbn";
import { Search, Loader2 } from "lucide-react";

interface BookFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function BookForm({ initialData, onSubmit, onCancel, isEdit = false }: BookFormProps) {
  const [formData, setFormData] = useState({
    id: initialData?.id || undefined,
    title: initialData?.title || "",
    author: initialData?.author || "",
    isbn: initialData?.isbn || "",
    location: initialData?.location || "",
    quantity: initialData?.quantity || 1,
    thumbnail: initialData?.thumbnail || "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [existingLocations, setExistingLocations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLocations() {
        try {
            const response = await fetch("/api/locations");
            if (response.ok) {
                const data = await response.json();
                setExistingLocations(data);
            }
        } catch (err) {
            console.error("Failed to fetch locations", err);
        }
    }
    fetchLocations();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleIsbnLookup = async () => {
    if (!formData.isbn) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(`/api/isbn/${formData.isbn}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          title: data.title || formData.title,
          author: data.author || formData.author,
          thumbnail: data.thumbnail || formData.thumbnail,
        });
      } else {
        setSearchError("Buch nicht gefunden.");
      }
    } catch (err) {
      setSearchError("Fehler bei der Suche.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {isEdit ? "Buch bearbeiten" : "Buch hinzufügen"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">ISBN</label>
        <div className="mt-1 flex gap-2">
            <input
              type="text"
              className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="z.B. 978..."
            />
            <button
                type="button"
                onClick={handleIsbnLookup}
                disabled={isSearching || !formData.isbn}
                className="bg-gray-100 p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[40px]"
                title="Suchen"
            >
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </button>
        </div>
        {searchError && <p className="text-xs text-red-500 mt-1">{searchError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Titel</label>
        <input
          type="text"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Autor</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ort (Vorschläge verfügbar)</label>
        <input
          type="text"
          list="locations-list"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="z.B. Wohnzimmer, Regal 1"
        />
        <datalist id="locations-list">
            {existingLocations.map((loc) => (
                <option key={loc} value={loc} />
            ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Anzahl</label>
        <input
          type="number"
          min="1"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {isEdit ? "Aktualisieren" : "Speichern"}
        </button>
      </div>
    </form>
  );
}
