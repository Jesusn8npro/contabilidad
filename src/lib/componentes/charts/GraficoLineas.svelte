<script lang="ts">
    export let datos: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            borderColor?: string;
            backgroundColor?: string;
            fill?: boolean;
        }[];
    };
    export let altura: string = '300px';

    // Función para calcular la escala Y
    const calcularEscala = (datasets: any[]) => {
        const allValues = datasets.flatMap(dataset => dataset.data);
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        const padding = (max - min) * 0.1;
        return {
            min: Math.max(0, min - padding),
            max: max + padding
        };
    };

    // Función para convertir valor a coordenada Y
    const valorAY = (valor: number, min: number, max: number, height: number) => {
        const normalized = (valor - min) / (max - min);
        return height - (normalized * height);
    };

    // Función para formatear números
    const formatearNumero = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    $: escala = calcularEscala(datos.datasets);
    $: width = 600;
    $: height = 300;
    $: padding = { top: 20, right: 50, bottom: 40, left: 60 };
    $: chartWidth = width - padding.left - padding.right;
    $: chartHeight = height - padding.top - padding.bottom;
    $: stepX = chartWidth / (datos.labels.length - 1);
</script>

<div class="w-full" style="height: {altura}">
    <svg viewBox="0 0 {width} {height}" class="w-full h-full">
        <!-- Background -->
        <rect 
            width="100%" 
            height="100%" 
            fill="transparent"
        />
        
        <!-- Grid lines -->
        <g class="grid-lines">
            <!-- Líneas horizontales -->
            {#each Array(6) as _, i}
                {@const y = padding.top + (i * chartHeight / 5)}
                <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="currentColor"
                    stroke-width="0.5"
                    class="text-gray-200 dark:text-gray-700"
                    opacity="0.5"
                />
                <text
                    x={padding.left - 10}
                    y={y + 4}
                    text-anchor="end"
                    class="text-xs fill-gray-500 dark:fill-gray-400"
                >
                    {formatearNumero(escala.max - (i * (escala.max - escala.min) / 5))}
                </text>
            {/each}
            
            <!-- Líneas verticales -->
            {#each datos.labels as label, i}
                {@const x = padding.left + (i * stepX)}
                <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="currentColor"
                    stroke-width="0.5"
                    class="text-gray-200 dark:text-gray-700"
                    opacity="0.3"
                />
                <text
                    x={x}
                    y={height - padding.bottom + 20}
                    text-anchor="middle"
                    class="text-xs fill-gray-500 dark:fill-gray-400"
                >
                    {label}
                </text>
            {/each}
        </g>

        <!-- Dataset lines -->
        {#each datos.datasets as dataset, datasetIndex}
            {@const points = dataset.data.map((value, i) => {
                const x = padding.left + (i * stepX);
                const y = padding.top + valorAY(value, escala.min, escala.max, chartHeight);
                return `${x},${y}`;
            }).join(' ')}
            
            <!-- Area fill (si está habilitado) -->
            {#if dataset.fill && dataset.backgroundColor}
                {@const areaPoints = [
                    `${padding.left},${height - padding.bottom}`,
                    ...dataset.data.map((value, i) => {
                        const x = padding.left + (i * stepX);
                        const y = padding.top + valorAY(value, escala.min, escala.max, chartHeight);
                        return `${x},${y}`;
                    }),
                    `${padding.left + ((dataset.data.length - 1) * stepX)},${height - padding.bottom}`
                ].join(' ')}
                
                <polygon
                    points={areaPoints}
                    fill={dataset.backgroundColor}
                    opacity="0.3"
                />
            {/if}
            
            <!-- Line -->
            <polyline
                points={points}
                fill="none"
                stroke={dataset.borderColor || '#3b82f6'}
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            
            <!-- Data points -->
            {#each dataset.data as value, i}
                {@const x = padding.left + (i * stepX)}
                {@const y = padding.top + valorAY(value, escala.min, escala.max, chartHeight)}
                
                <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill={dataset.borderColor || '#3b82f6'}
                    class="hover:r-6 transition-all cursor-pointer"
                >
                    <title>{dataset.label}: {formatearNumero(value)}</title>
                </circle>
            {/each}
        {/each}

        <!-- Legend -->
        <g class="legend" transform="translate({width - 200}, 20)">
            {#each datos.datasets as dataset, i}
                <g transform="translate(0, {i * 20})">
                    <rect
                        x="0"
                        y="0"
                        width="12"
                        height="12"
                        fill={dataset.borderColor || '#3b82f6'}
                        rx="2"
                    />
                    <text
                        x="18"
                        y="9"
                        class="text-xs fill-gray-700 dark:fill-gray-300"
                    >
                        {dataset.label}
                    </text>
                </g>
            {/each}
        </g>
    </svg>
</div> 