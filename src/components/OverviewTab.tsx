"use client";

import { FC, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OverviewTabProps {
  data: Record<string, any>[];
  selectedDimension: string | null;
}

const OverviewTab: FC<OverviewTabProps> = ({ data, selectedDimension }) => {
  const aggregatedData = useMemo(() => {
    if (!selectedDimension || !data) return {};

    const counts: Record<string, number> = {};
    data.forEach(row => {
      const value = row[selectedDimension];
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }, [data, selectedDimension]);

  const chartData = {
    labels: Object.keys(aggregatedData),
    datasets: [{
      data: Object.values(aggregatedData),
      backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'],
      hoverOffset: 4,
    }],
  };

  const sortedTopValues = useMemo(() =>
    Object.entries(aggregatedData).sort(([,a],[,b]) => b-a).slice(0, 5),
    [aggregatedData]
  );

  if (!selectedDimension) {
    return <div className="text-center text-gray-500 p-8">Selecione uma dimensão no Painel de Controle para ver a visão geral.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="stat-card rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Distribuição por {selectedDimension}</h3>
        <div className="chart-container" style={{height: '350px'}}>
          <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
      <div className="stat-card rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Top 5 Valores em {selectedDimension}</h3>
        <div id="topValues" className="space-y-4">
          {sortedTopValues.map(([value, count]) => {
            const percentage = ((count / data.length) * 100).toFixed(1);
            return (
              <div key={value}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">{value}</span>
                  <span className="text-sm text-gray-500">{count.toLocaleString()} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
