"use client";

import { FC } from "react";

interface ControlPanelProps {
  headers: string[];
  numericHeaders: string[];
  onDimensionChange: (value: string) => void;
  onMetricsChange: (values: string[]) => void;
  onChartTypesChange: (values: string[]) => void;
  onFilterChange: (value: string) => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportJSON: () => void;
}

const ControlPanel: FC<ControlPanelProps> = ({
  headers,
  numericHeaders,
  onDimensionChange,
  onMetricsChange,
  onChartTypesChange,
  onFilterChange,
  onExportPDF,
  onExportExcel,
  onExportJSON
}) => {
  const chartTypes = [
      { id: 'bar', name: 'Barras', icon: 'fa-chart-bar' },
      { id: 'line', name: 'Linha', icon: 'fa-chart-line' },
      { id: 'pie', name: 'Pizza', icon: 'fa-chart-pie' },
      { id: 'doughnut', name: 'Rosca', icon: 'fa-circle-notch' },
  ];

  const handleGenericChange = (selector: string, callback: (values: string[]) => void) => {
    const selected = Array.from(document.querySelectorAll<HTMLInputElement>(selector))
      .filter(el => el.checked)
      .map(el => el.value);
    callback(selected);
  };

  return (
    <div className="stat-card rounded-2xl shadow-xl p-6 mb-8">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <i className="fas fa-sliders-h mr-2 text-indigo-500"></i>
        Painel de Controle
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dimension Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Dimensão (Eixo X)</label>
          <select
            onChange={(e) => onDimensionChange(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Selecione...</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        {/* Metrics Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Métricas (Colunas Numéricas)</label>
          <div
            onChange={() => handleGenericChange('.metric-checkbox', onMetricsChange)}
            className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-2 border rounded-lg bg-gray-50"
          >
            {numericHeaders.map(h => (
              <label key={h} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value={h} className="metric-checkbox rounded text-indigo-600" />
                <span>{h}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Chart Types */}
        <div>
          <label className="block text-sm font-medium mb-2">Tipos de Gráfico</label>
          <div
            onChange={() => handleGenericChange('.chart-type-checkbox', onChartTypesChange)}
            className="grid grid-cols-2 gap-2 p-2 border rounded-lg bg-gray-50"
          >
             {chartTypes.map(type => (
                <label key={type.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-200">
                    <input type="checkbox" value={type.id} className="chart-type-checkbox rounded text-indigo-600" defaultChecked/>
                    <i className={`fas ${type.icon}`}></i>
                    <span>{type.name}</span>
                </label>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Controls & Actions */}
      <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Filtro Global</label>
          <div className="flex space-x-2">
            <input
              type="text"
              onChange={(e) => onFilterChange(e.target.value)}
              placeholder="Filtrar todos os dados..."
              className="flex-1 p-2 border rounded-lg bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ações</label>
          <div className="flex flex-wrap gap-3">
            <button onClick={onExportPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
              <i className="fas fa-file-pdf mr-2"></i>Exportar PDF
            </button>
            <button onClick={onExportExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
              <i className="fas fa-file-excel mr-2"></i>Exportar Excel
            </button>
            <button onClick={onExportJSON} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
              <i className="fas fa-file-code mr-2"></i>Exportar JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
