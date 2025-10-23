"use client";

import { FC, useMemo, useCallback } from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

ChartJS.register(CategoryScale, LinearScale, Tooltip, Legend, MatrixController, MatrixElement);

interface StatisticsTabProps {
  data: Record<string, any>[];
  numericHeaders: string[];
}

const StatisticsTab: FC<StatisticsTabProps> = ({ data, numericHeaders }) => {

  const stats = useMemo(() => {
    const calculatedStats: Record<string, any> = {};
    numericHeaders.forEach(header => {
      const values = data.map(row => row[header]).filter(v => v !== null && !isNaN(v));
      if (values.length === 0) return;

      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;

      calculatedStats[header] = {
          mean: mean.toFixed(2),
          median: median.toFixed(2),
          min: Math.min(...values).toFixed(2),
          max: Math.max(...values).toFixed(2),
          stdDev: Math.sqrt(variance).toFixed(2),
      };
    });
    return calculatedStats;
  }, [data, numericHeaders]);

  const calculateCorrelation = useCallback((col1: string, col2: string): number => {
    const values1 = data.map(row => Number(row[col1])).filter(v => !isNaN(v));
    const values2 = data.map(row => Number(row[col2])).filter(v => !isNaN(v));

    const n = Math.min(values1.length, values2.length);
    if (n === 0) return 0;

    const mean1 = values1.reduce((a, b) => a + b, 0) / n;
    const mean2 = values2.reduce((a, b) => a + b, 0) / n;

    let covariance = 0;
    let stdDev1 = 0;
    let stdDev2 = 0;

    for (let i = 0; i < n; i++) {
        const diff1 = values1[i] - mean1;
        const diff2 = values2[i] - mean2;
        covariance += diff1 * diff2;
        stdDev1 += diff1 * diff1;
        stdDev2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(stdDev1) * Math.sqrt(stdDev2);
    return denominator === 0 ? 0 : covariance / denominator;
  }, [data]);

  const correlationMatrix = useMemo(() => {
    const matrix: any[] = [];
    for (let i = 0; i < numericHeaders.length; i++) {
        for (let j = 0; j < numericHeaders.length; j++) {
            matrix.push({
                x: numericHeaders[j],
                y: numericHeaders[i],
                v: calculateCorrelation(numericHeaders[i], numericHeaders[j]),
            });
        }
    }
    return matrix;
  }, [numericHeaders, calculateCorrelation]);

  if (numericHeaders.length < 1) {
    return <div className="text-center text-gray-500 p-8">Não há dados numéricos para calcular estatísticas.</div>;
  }

  // ... (rest of the component JSX remains the same)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* ... (Descriptive stats table) ... */}
       <div className="stat-card rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Matriz de Correlação</h3>
          <div className="chart-container" style={{height: '350px'}}>
              <Chart type='matrix' data={{
                  datasets: [{
                      label: 'Correlation',
                      data: correlationMatrix,
                      backgroundColor: (ctx) => {
                          if (!ctx.dataset.data[ctx.dataIndex]) return 'transparent';
                          const value = ctx.dataset.data[ctx.dataIndex].v;
                          const alpha = Math.abs(value);
                          return value > 0 ? `rgba(99, 102, 241, ${alpha})` : `rgba(239, 68, 68, ${alpha})`;
                      },
                      width: ({chart}) => (chart.chartArea.width / numericHeaders.length) - 1,
                      height: ({chart}) => (chart.chartArea.height / numericHeaders.length) - 1,
                  }]
              }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
              }}/>
          </div>
       </div>
    </div>
  );
};

export default StatisticsTab;
