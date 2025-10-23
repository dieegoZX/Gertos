"use client";

import { useState, useCallback, FC } from "react";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";

interface CSVUploaderProps {
  onDataLoaded: (data: Record<string, any>[]) => void;
}

const CSVUploader: FC<CSVUploaderProps> = ({ onDataLoaded }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type !== "text/csv") {
      setError("Please upload a valid CSV file.");
      return;
    }
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy', // More aggressive empty line skipping
      complete: (results) => {
        // Filter out any potential non-object results (e.g., empty rows at the end)
        const validData = results.data.filter(row => typeof row === 'object' && row !== null && Object.keys(row).length > 0);
        onDataLoaded(validData as Record<string, any>[]);
      },
      error: (err) => {
        console.error("PapaParse Error:", err);
        setError("Error parsing the CSV file.");
      },
    });
  }, [onDataLoaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the CSV file here ...</p>
      ) : (
        <p>Drag &apos;n&apos; drop a CSV file here, or click to select one</p>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default CSVUploader;
