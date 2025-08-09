<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    
    export let periodoSeleccionado: string = '30';
    
    let canvasElement: HTMLCanvasElement;
    let chart: Chart | null = null;
    
    // Datos simulados por período
    const datosVentas = {
        '7': {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            ingresos: [450000, 680000, 520000, 890000, 1200000, 950000, 600000],
            gastos: [180000, 220000, 195000, 300000, 280000, 250000, 150000]
        },
        '30': {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            ingresos: [2500000, 3200000, 2800000, 3800000],
            gastos: [1200000, 1500000, 1300000, 1800000]
        },
        '90': {
            labels: ['Ene', 'Feb', 'Mar'],
            ingresos: [8500000, 9200000, 11200000],
            gastos: [4200000, 4800000, 5500000]
        },
        '365': {
            labels: ['T1', 'T2', 'T3', 'T4'],
            ingresos: [25000000, 28000000, 32000000, 38000000],
            gastos: [12000000, 14000000, 16000000, 19000000]
        }
    };
    
    function crearGrafico() {
        if (!canvasElement) return;
        
        // Destruir gráfico anterior si existe
        if (chart) {
            chart.destroy();
        }
        
        Chart.register(...registerables);
        
        const datos = datosVentas[periodoSeleccionado as keyof typeof datosVentas];
        
        chart = new Chart(canvasElement, {
            type: 'line',
            data: {
                labels: datos.labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: datos.ingresos,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#10B981',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Gastos',
                        data: datos.gastos,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#EF4444',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: 500
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
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const value = new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0
                                }).format(context.parsed.y);
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#6B7280'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(156, 163, 175, 0.2)'
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#6B7280',
                            callback: function(value) {
                                return new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0,
                                    notation: 'compact'
                                }).format(value as number);
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
    
    // Recrear gráfico cuando cambie el período
    $: if (periodoSeleccionado && canvasElement) {
        crearGrafico();
    }
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            📈 Flujo de Ingresos vs Gastos
        </h3>
        <div class="flex items-center space-x-2">
            <div class="flex items-center">
                <div class="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">Ingresos</span>
            </div>
            <div class="flex items-center">
                <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">Gastos</span>
            </div>
        </div>
    </div>
    
    <div class="relative h-80">
        <canvas bind:this={canvasElement} class="w-full h-full"></canvas>
    </div>
</div> 