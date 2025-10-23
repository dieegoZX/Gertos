"use client";

import { FC } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

interface ChartsTabProps {
  data: Record<string, any>[];
  selectedDimension: string | null;
  selectedMetrics: string[];
  selectedChartTypes: string[];
}

const ChartsTab: FC<ChartsTabProps> = ({ data, selectedDimension, selectedMetrics, selectedChartTypes }) => {
  if (!selectedDimension || selectedMetrics.length === 0 || selectedChartTypes.length === 0) {
    return <div className="text-center text-gray-500 p-8">Selecione uma dimensão e pelo menos uma métrica no Painel de Controle para exibir os gráficos.</div>;
  }

  const labels = [...new Set(data.map(item => item[selectedDimension]))];

  const chartData = {
    labels,
    datasets: selectedMetrics.map((metric, index) => {
      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];
      return {
        label: metric,
        data: labels.map(label =>
          data
            .filter(item => item[selectedDimension] === label)
            .reduce((sum, item) => sum + (Number(item[metric]) || 0), 0)
        ),
        backgroundColor: colors[index % colors.length] + '80', // Add alpha
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        tension: 0.4,
      };
    }),
  };

  const renderChart = (type: string) => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
      case 'line':
        return <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
      case 'pie':
        return <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {selectedChartTypes.map(type => (
        <div key={type} className="stat-card rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 capitalize">{type} Chart</h3>
          <div className="chart-container" style={{height: '350px'}}>
            {renderChart(type)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChartsTab;
