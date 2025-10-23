document.addEventListener('DOMContentLoaded', () => {
    // Elementos da DOM
    const ctx = document.getElementById('myChart').getContext('2d');
    const fileInput = document.getElementById('csvFileInput');
    const xAxisSelect = document.getElementById('xAxisSelect');
    const yAxisSelect = document.getElementById('yAxisSelect');
    const analysisSection = document.getElementById('analysis-results');
    const analysisStats = document.getElementById('analysis-stats');
    const spinner = document.getElementById('spinner');
    const messageArea = document.getElementById('message-area');
    const exportBtn = document.getElementById('exportBtn');
    const dropArea = document.getElementById('drop-area');
    const shareLinkBtn = document.getElementById('shareLinkBtn');
    const shareLinkInput = document.getElementById('shareLinkInput');
    const newAnalysisBtn = document.getElementById('newAnalysisBtn');
    const mainControls = document.getElementById('main-controls');
    const newAnalysisContainer = document.getElementById('new-analysis-container');

    // Registar o plugin de datalabels globalmente
    Chart.register(ChartDataLabels);

    // Variáveis de estado
    let myChart;
    let chartData = [];
    let chartHeaders = [];
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Análise de Dados' },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        const value = context.parsed.y;
                        if (value !== null) {
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = (value / total * 100).toFixed(2) + '%';
                            label += `${value.toFixed(2)} (${percentage})`;
                        }
                        return label;
                    }
                }
            },
            datalabels: {
                formatter: (value, context) => {
                    if (context.chart.config.type === 'pie') {
                        const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                        const percentage = (value / total * 100).toFixed(2) + '%';
                        return percentage;
                    }
                    return null; // Não exibe etiquetas para outros tipos de gráfico
                },
                color: '#fff',
                font: {
                    weight: 'bold'
                }
            }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };
    const colors = [
        'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'
    ];

    // ... (restante do código será refatorado) ...

    function loadStateFromUrl() {
        if (!window.location.hash) {
            initializeChart();
            return;
        }

        try {
            const encoded = window.location.hash.substring(1);
            const compressed = atob(encoded);
            const json = pako.inflate(compressed, { to: 'string' });
            const state = JSON.parse(json);

            chartData = state.data;
            chartHeaders = state.headers;

            populateColumnSelectors(chartHeaders);
            xAxisSelect.value = state.x;
            state.y.forEach(yCol => {
                const option = Array.from(yAxisSelect.options).find(opt => opt.value === yCol);
                if (option) option.selected = true;
            });

            initializeChart(state.type);
            updateDashboard();

            mainControls.style.display = 'none';
            newAnalysisContainer.style.display = 'block';

        } catch (error) {
            console.error("Falha ao carregar o estado a partir do URL:", error);
            showMessage("Não foi possível carregar a análise partilhada. O link pode estar corrompido.", "error");
            initializeChart();
        }
    }

    // Exibe uma mensagem na área de mensagens
    function showMessage(message, type = 'info') {
        messageArea.textContent = message;
        messageArea.className = `message-area ${type}`;
    }

    // Inicializa o gráfico (sem dados)
    function initializeChart(type = 'bar') {
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: type,
            data: { labels: [], datasets: [] },
            options: chartOptions
        });
    }

    // Preenche os seletores de coluna
    function populateColumnSelectors(headers) {
        xAxisSelect.innerHTML = '<option value="">Selecione a coluna</option>';
        yAxisSelect.innerHTML = ''; // Limpa para permitir multi-seleção
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
        const yColumns = Array.from(yAxisSelect.selectedOptions).map(opt => opt.value);

        if (!xColumn || yColumns.length === 0) return;

        const labels = chartData.map(row => row[xColumn]);
        const datasets = yColumns.map((yCol, index) => {
            const data = chartData.map(row => parseFloat(row[yCol]));
            const isNumeric = data.every(d => typeof d === 'number' && !isNaN(d));
            if (!isNumeric) {
                showMessage(`A coluna "${yCol}" deve conter apenas números.`, 'error');
                return null;
            }
            return {
                label: yCol,
                data: data,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.6', '1'),
                borderWidth: 1
            };
        }).filter(Boolean); // Filtra datasets nulos (não numéricos)

        if (datasets.length < yColumns.length) { // Se houve erro de validação
            analysisSection.style.display = 'none';
            return;
        } else {
            showMessage('');
        }

        myChart.data.labels = labels;
        myChart.data.datasets = datasets;
        myChart.update();

        analyzeAndDisplayData(yColumns);
        analysisSection.style.display = 'block';
    }

    // Analisa e exibe as estatísticas para múltiplas colunas
    function analyzeAndDisplayData(yColumns) {
        analysisStats.innerHTML = ''; // Limpa a análise anterior
        yColumns.forEach(yCol => {
            const data = chartData.map(row => parseFloat(row[yCol])).filter(d => !isNaN(d));
            if (data.length === 0) return;

            const total = data.reduce((acc, value) => acc + value, 0);
            const average = total / data.length;
            const max = Math.max(...data);
            const min = Math.min(...data);

            const statsHTML = `
                <div class="stat-group">
                    <h4>${yCol}</h4>
                    <div class="stat"><strong>Total:</strong> <span>${total.toFixed(2)}</span></div>
                    <div class="stat"><strong>Média:</strong> <span>${average.toFixed(2)}</span></div>
                    <div class="stat"><strong>Valor Máximo:</strong> <span>${max.toFixed(2)}</span></div>
                    <div class="stat"><strong>Valor Mínimo:</strong> <span>${min.toFixed(2)}</span></div>
                </div>
            `;
            analysisStats.innerHTML += statsHTML;
        });
    }

    function generateShareLink() {
        if (chartData.length === 0) {
            showMessage('Carregue dados antes de gerar um link de partilha.', 'error');
            return;
        }

        const state = {
            data: chartData,
            headers: chartHeaders,
            x: xAxisSelect.value,
            y: Array.from(yAxisSelect.selectedOptions).map(opt => opt.value),
            type: myChart.config.type
        };

        const json = JSON.stringify(state);
        const compressed = pako.deflate(json, { to: 'string' });
        const encoded = btoa(compressed);

        const url = `${window.location.origin}${window.location.pathname}#${encoded}`;

        shareLinkInput.value = url;
        shareLinkInput.select();
        showMessage('Link copiado para a área de transferência!', 'info');
        // Tenta copiar para a área de transferência
        try {
            navigator.clipboard.writeText(url);
        } catch (err) {
            console.error('Falha ao copiar o link: ', err);
            showMessage('Link gerado. Copie-o manualmente.', 'info');
        }
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

    fileInput.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            handleFile(event.target.files[0]);
        }
    });

    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('highlight');
    });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('highlight'));
    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.classList.remove('highlight');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFile(files[0]);
        }
    });

    xAxisSelect.addEventListener('change', updateDashboard);
    yAxisSelect.addEventListener('change', updateDashboard);

    shareLinkBtn.addEventListener('click', generateShareLink);

    exportBtn.addEventListener('click', () => {
        if (myChart && myChart.data.labels.length > 0) {
            const image = myChart.toBase64Image();
            const link = document.createElement('a');
            link.href = image;
            link.download = 'analise-grafico.png';
            link.click();
        } else {
            showMessage('Não há gráfico para exportar.', 'error');
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

    newAnalysisBtn.addEventListener('click', () => {
        // Recarrega a página sem o hash para começar de novo
        window.location.href = window.location.pathname;
    });

    // Tenta carregar o estado a partir do URL no início
    loadStateFromUrl();
});
