document.addEventListener('DOMContentLoaded', () => {
    // Elementos da DOM
    const ctx = document.getElementById('myChart').getContext('2d');
    const fileInput = document.getElementById('csvFileInput');
    const xAxisSelect = document.getElementById('xAxisSelect');
    const yAxisSelect = document.getElementById('yAxisSelect');
    const analysisSection = document.getElementById('analysis-results');
    const spinner = document.getElementById('spinner');
    const messageArea = document.getElementById('message-area');
    const exportBtn = document.getElementById('exportBtn');

    // Variáveis de estado
    let myChart;
    let chartData = [];
    let chartHeaders = [];
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Análise de Dados' }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    // Exibe uma mensagem na área de mensagens
    function showMessage(message, type = 'info') {
        messageArea.textContent = message;
        messageArea.className = `message-area ${type}`;
    }

    // Inicializa o gráfico (sem dados)
    function initializeChart(type = 'bar') {
        if (myChart) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, {
            type: type,
            data: {
                labels: [],
                datasets: [{
                    label: 'Selecione os dados',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: chartOptions
        });
    }

    // Preenche os seletores de coluna
    function populateColumnSelectors(headers) {
        xAxisSelect.innerHTML = '<option value="">Selecione a coluna</option>';
        yAxisSelect.innerHTML = '<option value="">Selecione a coluna</option>';
        headers.forEach(header => {
            xAxisSelect.innerHTML += `<option value="${header}">${header}</option>`;
            yAxisSelect.innerHTML += `<option value="${header}">${header}</option>`;
        });
        xAxisSelect.disabled = false;
        yAxisSelect.disabled = false;
    }

    // Atualiza o gráfico e a análise com base nas colunas selecionadas
    function updateDashboard() {
        const xColumn = xAxisSelect.value;
        const yColumn = yAxisSelect.value;

        if (!xColumn || !yColumn) return;

        const labels = chartData.map(row => row[xColumn]);
        const data = chartData.map(row => parseFloat(row[yColumn]));

        const isNumeric = data.every(d => typeof d === 'number' && !isNaN(d));
        if (!isNumeric) {
            showMessage('A coluna do Eixo Y deve conter apenas números.', 'error');
            myChart.data.labels = [];
            myChart.data.datasets[0].data = [];
            myChart.update();
            analysisSection.style.display = 'none';
            return;
        } else {
            showMessage('');
        }

        myChart.data.labels = labels;
        myChart.data.datasets[0].data = data;
        myChart.data.datasets[0].label = `${yColumn} por ${xColumn}`;
        myChart.update();

        analyzeAndDisplayData(data);
        analysisSection.style.display = 'block';
    }

    function analyzeAndDisplayData(data) {
        const numericData = data.filter(d => !isNaN(d));
        if (numericData.length === 0) return;

        const total = numericData.reduce((acc, value) => acc + value, 0);
        const average = total / numericData.length;
        const max = Math.max(...numericData);
        const min = Math.min(...numericData);

        document.getElementById('totalValue').textContent = total.toFixed(2);
        document.getElementById('averageValue').textContent = average.toFixed(2);
        document.getElementById('maxValue').textContent = max.toFixed(2);
        document.getElementById('minValue').textContent = min.toFixed(2);
    }

    function handleFile(file) {
        spinner.style.display = 'block';
        showMessage('A processar o ficheiro...', 'info');
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                spinner.style.display = 'none';
                chartData = results.data;
                chartHeaders = results.meta.fields;
                populateColumnSelectors(chartHeaders);
                analysisSection.style.display = 'none';
                showMessage('Ficheiro carregado. Por favor, selecione as colunas para os eixos.', 'info');
                initializeChart(); // Reinicia o gráfico para limpar dados antigos
            }
        });
    }

    const dropArea = document.getElementById('drop-area');

    // Lida com o input de ficheiro (tanto por clique como por arrastar)
    fileInput.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            handleFile(event.target.files[0]);
        }
    });

    // Ativa o input de ficheiro ao clicar na drop-area
    dropArea.addEventListener('click', () => fileInput.click());

    // Eventos de arrastar e soltar
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('highlight');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('highlight');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.classList.remove('highlight');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            // Define o ficheiro no input para consistência
            fileInput.files = files;
            handleFile(files[0]);
        }
    });

    xAxisSelect.addEventListener('change', updateDashboard);
    yAxisSelect.addEventListener('change', updateDashboard);

    // Event listener para o botão de exportação
    exportBtn.addEventListener('click', () => {
        if (myChart && myChart.data.labels.length > 0) {
            const image = myChart.toBase64Image();
            const link = document.createElement('a');
            link.href = image;
            link.download = 'analise-grafico.png';
            link.click();
        } else {
            showMessage('Não há gráfico para exportar. Por favor, carregue um ficheiro e selecione os dados.', 'error');
        }
    });

    document.querySelectorAll('.chart-type-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.chart-type-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const newType = button.dataset.type;
            if (myChart.config.type !== newType) {
                 const oldData = myChart.data;
                 initializeChart(newType);
                 myChart.data = oldData;
                 myChart.update();
            }
        });
    });

    initializeChart();
});
