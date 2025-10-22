import BarChart from '@/components/BarChart';

export default function Home() {
  const chartData = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [
      {
        label: 'Vendas Mensais',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-black dark:text-zinc-50">
          Dashboard de Análise
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-zinc-900">
          <BarChart data={chartData} />
        </div>
      </div>
    </main>
  );
}
