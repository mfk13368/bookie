"use client";

import Link from "next/link";
import { PlusCircle, Library, Info, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState({ totalBooks: 0, lentOut: 0 });

  useEffect(() => {
    async function fetchStats() {
      const response = await fetch("/api/books");
      const books = await response.json();
      const lentOut = books.filter((b: any) => b.lendings && b.lendings.length > 0).length;
      setStats({ totalBooks: books.length, lentOut });
    }
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto p-4 pb-24">
      <header className="mb-8 mt-4 text-center relative">
        <h1 className="text-4xl font-bold text-gray-900">Bibliothekar</h1>
        <p className="text-gray-600">Dein heimisches Buchinventar</p>
        <Link 
            href="/about" 
            className="absolute -top-1 -right-1 p-3 text-gray-400 hover:text-blue-600 transition-colors"
            title="Über die App"
        >
            <Info className="h-7 w-7" />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.totalBooks}</p>
          <p className="text-sm text-gray-500">Bücher gesamt</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-bold text-orange-600">{stats.lentOut}</p>
          <p className="text-sm text-gray-500">Aktuell verliehen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/add" className="flex items-center gap-4 bg-blue-600 text-white p-6 rounded-2xl shadow-md hover:bg-blue-700 transition-colors">
          <PlusCircle className="h-8 w-8" />
          <div className="text-left">
            <h2 className="text-xl font-bold">Buch scannen</h2>
            <p className="text-blue-100 text-sm">ISBN erfassen und hinzufügen</p>
          </div>
        </Link>

        <Link href="/inventory" className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors border-l-4 border-l-blue-500">
          <Library className="h-8 w-8 text-blue-600" />
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900">Bücherliste</h2>
            <p className="text-gray-500 text-sm">Bestand durchsuchen und verwalten</p>
          </div>
        </Link>
        
        <Link href="/about" className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 hover:bg-white transition-colors">
          <Info className="h-6 w-6 text-gray-400" />
          <div className="text-left">
            <h2 className="text-md font-bold text-gray-700">Über Bibliothekar</h2>
            <p className="text-gray-400 text-xs">Infos zum Projekt</p>
          </div>
        </Link>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center md:hidden z-40">
        <Link href="/" className="flex flex-col items-center gap-1 text-blue-600">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-[10px]">Dashboard</span>
        </Link>
        <Link href="/inventory" className="flex flex-col items-center gap-1 text-gray-400">
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
