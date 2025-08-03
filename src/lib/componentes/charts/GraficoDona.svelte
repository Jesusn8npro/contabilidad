<script lang="ts">
    export let datos: {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor?: string[];
        }[];
    };
    export let altura: string = '300px';

    // Configuraciones del gráfico
    const radius = 120;
    const innerRadius = 60;
    const centerX = 150;
    const centerY = 150;

    // Función para crear el path del arco
    const crearArcPath = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
        const startAngleRad = (startAngle - 90) * Math.PI / 180;
        const endAngleRad = (endAngle - 90) * Math.PI / 180;
        
        const x1 = centerX + outerRadius * Math.cos(startAngleRad);
        const y1 = centerY + outerRadius * Math.sin(startAngleRad);
        const x2 = centerX + outerRadius * Math.cos(endAngleRad);
        const y2 = centerY + outerRadius * Math.sin(endAngleRad);
        
        const x3 = centerX + innerRadius * Math.cos(endAngleRad);
        const y3 = centerY + innerRadius * Math.sin(endAngleRad);
        const x4 = centerX + innerRadius * Math.cos(startAngleRad);
        const y4 = centerY + innerRadius * Math.sin(startAngleRad);
        
        const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
        
        return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
    };

    // Función para formatear porcentajes
    const formatearPorcentaje = (valor: number, total: number) => {
        return ((valor / total) * 100).toFixed(1) + '%';
    };

    // Calcular datos del gráfico
    $: dataset = datos.datasets[0];
    $: total = dataset.data.reduce((sum, value) => sum + value, 0);
    $: segmentos = dataset.data.map((value, index) => {
        const porcentaje = (value / total) * 100;
        return {
            valor: value,
            porcentaje,
            etiqueta: datos.labels[index],
            color: dataset.backgroundColor?.[index] || `hsl(${index * 360 / dataset.data.length}, 70%, 50%)`
        };
    });

    // Calcular ángulos acumulativos
    $: angulosAcumulativos = segmentos.reduce((acc, segmento, index) => {
        const anguloInicio = index === 0 ? 0 : acc[index - 1].anguloFin;
        const anguloFin = anguloInicio + (segmento.porcentaje * 360 / 100);
        acc.push({ anguloInicio, anguloFin });
        return acc;
    }, [] as { anguloInicio: number; anguloFin: number }[]);
</script>

<div class="w-full" style="height: {altura}">
    <div class="flex items-center justify-center h-full">
        <div class="flex items-center space-x-8">
            <!-- Gráfico de dona -->
            <div class="relative">
                <svg width="300" height="300" viewBox="0 0 300 300">
                    <!-- Segmentos de la dona -->
                    {#each segmentos as segmento, index}
                        {@const angulos = angulosAcumulativos[index]}
                        {@const path = crearArcPath(angulos.anguloInicio, angulos.anguloFin, radius, innerRadius)}
                        
                        <path
                            d={path}
                            fill={segmento.color}
                            class="hover:opacity-80 transition-opacity cursor-pointer"
                            stroke="white"
                            stroke-width="2"
                        >
                            <title>{segmento.etiqueta}: {segmento.porcentaje}%</title>
                        </path>
                    {/each}
                    
                    <!-- Texto central -->
                    <text
                        x={centerX}
                        y={centerY - 10}
                        text-anchor="middle"
                        class="text-2xl font-bold fill-gray-700 dark:fill-gray-300"
                    >
                        {segmentos.length}
                    </text>
                    <text
                        x={centerX}
                        y={centerY + 10}
                        text-anchor="middle"
                        class="text-sm fill-gray-500 dark:fill-gray-400"
                    >
                        Categorías
                    </text>
                </svg>
            </div>

            <!-- Leyenda -->
            <div class="space-y-3">
                {#each segmentos as segmento, index}
                    <div class="flex items-center space-x-3">
                        <div 
                            class="w-4 h-4 rounded-full"
                            style="background-color: {segmento.color}"
                        ></div>
                        <div class="flex-1">
                            <div class="text-sm font-medium text-gray-900 dark:text-white">
                                {segmento.etiqueta}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                                {formatearPorcentaje(segmento.valor, total)} ({segmento.valor})
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div> 