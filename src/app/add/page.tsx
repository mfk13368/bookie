"use client";

import { useState, useRef } from "react";
import Scanner from "@/components/Scanner";
import BookForm from "@/components/BookForm";
import { BookMetadata } from "@/lib/isbn";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

export default function AddBookPage() {
  const [step, setStep] = useState<"scan" | "form">("scan");
  const [scannedData, setScannedData] = useState<BookMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const router = useRouter();
  const isProcessing = useRef(false);

  const handleScanSuccess = async (isbn: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const response = await fetch(`/api/isbn/${isbn}`);

      const text = await response.text();
      if (!text) {
          throw new Error("Empty response from server");
      }

      let data;
      try {
          data = JSON.parse(text);
      } catch (e) {
          console.error("JSON parse error:", text);
          throw new Error("Invalid response format");
      }

      if (response.ok) {
        setScannedData(data);
      } else {
        setScannedData({ isbn, title: "" });
      }
      setStep("form");
    } catch (err: any) {
      console.error("Scan error:", err);
      setError(`Fehler: ${err.message || "Daten konnten nicht geladen werden."}`);
      setScannedData({ isbn, title: "" });
      setStep("form");
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (response.ok) {
        if (resData.info) {
            setInfo(resData.info);
            // Increased timeout and added manual button for better control
        } else {
            router.push("/inventory");
        }
      } else {
          setError(`Fehler beim Speichern: ${resData.error || "Unbekannter Fehler"}`);
      }
    } catch (err) {
      setError("Verbindung zum Server fehlgeschlagen.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Neues Buch hinzufügen</h1>

      {loading && (
        <div className="flex flex-col items-center justify-center my-12 space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
          <p className="text-gray-500">Buchdaten werden abgerufen...</p>
        </div>
      )}

      {info && (
        <div className="mb-6 p-6 bg-white border-2 border-blue-500 shadow-xl rounded-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-300">
            <CheckCircle className="h-12 w-12 text-blue-500" />
            <div className="space-y-2">
                <p className="font-bold text-xl text-gray-900">Bereits bekannt!</p>
                <p className="text-gray-600">{info}</p>
            </div>
            <button
                onClick={() => router.push("/inventory")}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
                Zum Inventar
            </button>
        </div>
      )}

      {!loading && !info && step === "scan" && (
        <div className="space-y-4">
          <p className="text-center text-gray-600">Scanne den Barcode (ISBN) auf der Rückseite des Buches.</p>
          <Scanner onScanSuccess={handleScanSuccess} />
          <button
            onClick={() => setStep("form")}
            className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Manuell eingeben
          </button>
        </div>
      )}

      {!loading && !info && step === "form" && (
        <BookForm
          initialData={scannedData || {}}
          onSubmit={handleSubmit}
          onCancel={() => setStep("scan")}
        />
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          <p className="font-bold">Hinweis</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
