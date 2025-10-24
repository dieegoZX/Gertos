"use client";

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';

// Define types for our data structure
type CsvRow = { [key: string]: string };
type CsvData = {
  headers: string[];
  rows: CsvRow[];
};

export default function Home() {
  const [data, setData] = useState<CsvData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const rows = results.data as CsvRow[];
          setData({ headers, rows });
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setData(null);
        },
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      {/* Hidden file input */}
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <header className="bg-gray-800 shadow-md p-4 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard de Análise de Dados</h1>
          <button
            onClick={handleUploadClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            Carregar CSV
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {data ? (
          <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Analisando: <span className="font-mono text-green-400">{fileName}</span></h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    {data.headers.map((header) => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {data.rows.slice(0, 100).map((row, rowIndex) => ( // Show first 100 rows for performance
                    <tr key={rowIndex} className="hover:bg-gray-700 transition-colors">
                      {data.headers.map((header) => (
                        <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
             {data.rows.length > 100 && (
              <p className="text-center text-gray-400 mt-4">
                Mostrando as primeiras 100 linhas de {data.rows.length}.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg p-8 text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-semibold mb-2">Bem-vindo!</h2>
            <p className="text-gray-400 max-w-md">
              Para começar, clique no botão "Carregar CSV" e selecione o arquivo que deseja analisar.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
