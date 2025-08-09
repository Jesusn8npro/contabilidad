<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    
    export let titulo: string = 'Distribución';
    export let datos: Array<{
        label: string;
        value: number;
        color: string;
    }> = [];
    
    let canvasElement: HTMLCanvasElement;
    let chart: Chart | null = null;
    
    function crearGrafico() {
        if (!canvasElement || !datos.length) return;
        
        // Destruir gráfico anterior si existe
        if (chart) {
            chart.destroy();
        }
        
        Chart.register(...registerables);
        
        chart = new Chart(canvasElement, {
            type: 'doughnut',
            data: {
                labels: datos.map(d => d.label),
                datasets: [{
                    data: datos.map(d => d.value),
                    backgroundColor: datos.map(d => d.color),
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 11
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[i] as number;
                                        const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        
                                        return {
                                            text: `${label} (${percentage}%)`,
                                            fillStyle: datos[i].color,
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        titleColor: '#F9FAFB',
                        bodyColor: '#F9FAFB',
                        borderColor: '#374151',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${percentage}%`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutCubic'
                }
            }
        });
    }
    
    onMount(() => {
        crearGrafico();
    });
    
    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });
    
    // Recrear gráfico cuando cambien los datos
    $: if (datos && canvasElement) {
        crearGrafico();
    }
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {titulo}
    </h3>
    
    <div class="relative h-64">
        <canvas bind:this={canvasElement} class="w-full h-full"></canvas>
    </div>
</div> 