"use client";

import { useState } from "react";
import CSVUploader from "@/components/CSVUploader";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [data, setData] = useState<Record<string, any>[] | null>(null);

  const handleDataLoaded = (loadedData: Record<string, any>[]) => {
    if (loadedData && loadedData.length > 0) {
      setData(loadedData);
    } else {
      alert("O arquivo CSV enviado está vazio ou é inválido.");
      setData(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-gray-50">
      <div className="w-full text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Data Analysis Dashboard</h1>
        <p className="text-gray-600">
          Faça o upload de um arquivo CSV para começar e visualizar seus dados instantaneamente.
        </p>
      </div>

      <div className="w-full">
        {/* Always render the uploader, but hide it if data is loaded */}
        <div className={data ? 'hidden' : 'max-w-lg mx-auto'}>
            <CSVUploader onDataLoaded={handleDataLoaded} />
        </div>

        {/* Always render the Dashboard component, and let it handle the data state */}
        {data && <Dashboard data={data} />}
      </div>
    </main>
  );
}
