"use client";

import { useState, useMemo } from "react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import InteractiveTable from "./InteractiveTable";
import ControlPanel from "./ControlPanel";
import OverviewTab from "./OverviewTab";
import StatisticsTab from "./StatisticsTab";
import ChartsTab from "./ChartsTab";

interface DashboardProps {
  data: Record<string, any>[];
}

type Tab = "overview" | "charts" | "table" | "statistics";

export default function Dashboard({ data }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const headers = useMemo(() => (data && data.length > 0 ? Object.keys(data[0]) : []), [data]);
  const numericHeaders = useMemo(() =>
    headers.filter(header =>
      data.every(row => row[header] !== "" && !isNaN(Number(row[header])))
    ), [data, headers]
  );

  const [selectedDimension, setSelectedDimension] = useState<string | null>(headers[0] || null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(numericHeaders.slice(0, 1));
  const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>(['bar', 'line']);
  const [filterTerm, setFilterTerm] = useState<string>("");

  const filteredData = useMemo(() => {
    if (!filterTerm) return data;
    return data.filter(row =>
      headers.some(header =>
        String(row[header]).toLowerCase().includes(filterTerm.toLowerCase())
      )
    );
  }, [data, filterTerm, headers]);

  // --- EXPORT FUNCTIONS ---
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Dados", 14, 16);
    (doc as any).autoTable({
      head: [headers],
      body: filteredData.map(row => headers.map(header => String(row[header]))),
      startY: 20,
    });
    doc.save('dados.pdf');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
    XLSX.writeFile(workbook, "dados.xlsx");
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "dados.json";
    link.click();
  };
  // --- END EXPORT FUNCTIONS ---

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No data available to display.</p>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab data={filteredData} selectedDimension={selectedDimension} />;
      case "charts":
        return <ChartsTab data={filteredData} selectedDimension={selectedDimension} selectedMetrics={selectedMetrics} selectedChartTypes={selectedChartTypes} />;
      case "table":
        return <InteractiveTable data={filteredData} />;
      case "statistics":
        return <StatisticsTab data={filteredData} numericHeaders={numericHeaders} />;
      default:
        return null;
    }
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
      { id: 'overview', label: 'Visão Geral', icon: 'fas fa-chart-pie' },
      { id: 'charts', label: 'Gráficos', icon: 'fas fa-chart-bar' },
      { id: 'table', label: 'Tabela de Dados', icon: 'fas fa-table' },
      { id: 'statistics', label: 'Estatísticas', icon: 'fas fa-calculator' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in">
      <ControlPanel
        headers={headers}
        numericHeaders={numericHeaders}
        onDimensionChange={setSelectedDimension}
        onMetricsChange={setSelectedMetrics}
        onChartTypesChange={setSelectedChartTypes}
        onFilterChange={setFilterTerm}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onExportJSON={handleExportJSON}
      />

      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div id="tabContent">
        {renderTabContent()}
      </div>
    </div>
  );
}
