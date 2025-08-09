<script lang="ts">
    import { onMount } from 'svelte';
    import { 
        Crown, Check, Star, Zap, Shield, 
        Users, Calendar, CreditCard, Gift, ArrowRight
    } from 'lucide-svelte';
    
    let planSeleccionado = 'basico';
    let periodo = 'mensual';
    
    const planes = [
        {
            id: 'basico',
            nombre: 'Básico',
            precio: { mensual: 49000, anual: 490000 },
            descripcion: 'Perfecto para pequeños negocios',
            icono: Users,
            color: 'blue',
            caracteristicas: [
                'Hasta 3 negocios',
                '100 productos',
                '50 clientes',
                'Reportes básicos',
                'Soporte por email'
            ],
            popular: false
        },
        {
            id: 'profesional',
            nombre: 'Profesional',
            precio: { mensual: 99000, anual: 990000 },
            descripcion: 'Para negocios en crecimiento',
            icono: Star,
            color: 'purple',
            caracteristicas: [
                'Hasta 10 negocios',
                'Productos ilimitados',
                '500 clientes',
                'Reportes avanzados',
                'POS completo',
                'Soporte prioritario',
                'Inventario avanzado'
            ],
            popular: true
        },
        {
            id: 'empresarial',
            nombre: 'Empresarial',
            precio: { mensual: 199000, anual: 1990000 },
            descripcion: 'Para grandes empresas',
            icono: Crown,
            color: 'gold',
            caracteristicas: [
                'Negocios ilimitados',
                'Todo ilimitado',
                'Clientes ilimitados',
                'Análisis con IA',
                'API personalizada',
                'Soporte 24/7',
                'Integración WhatsApp',
                'Múltiples usuarios'
            ],
            popular: false
        }
    ];
    
    function formatearMoneda(valor: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }
    
    function obtenerDescuento(planId: string): number {
        const plan = planes.find(p => p.id === planId);
        if (!plan) return 0;
        
        const mensual = plan.precio.mensual * 12;
        const anual = plan.precio.anual;
        return Math.round(((mensual - anual) / mensual) * 100);
    }
    
    function suscribirse(planId: string) {
        alert(`¡Suscripción iniciada!\nPlan: ${planes.find(p => p.id === planId)?.nombre}\nPeríodo: ${periodo}`);
    }
</script>

<div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Crown class="w-10 h-10 text-yellow-500" />
            Planes y Membresías
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Elige el plan perfecto para hacer crecer tu negocio. Sin compromisos, cancela cuando quieras.
        </p>
    </div>
    
    <!-- Toggle Período -->
    <div class="flex justify-center">
        <div class="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
                on:click={() => periodo = 'mensual'}
                class="px-6 py-2 rounded-lg transition-all {periodo === 'mensual' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'}"
            >
                Mensual
            </button>
            <button
                on:click={() => periodo = 'anual'}
                class="px-6 py-2 rounded-lg transition-all {periodo === 'anual' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'}"
            >
                <span>Anual</span>
                <span class="ml-2 px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                    -17%
                </span>
            </button>
        </div>
    </div>
    
    <!-- Planes -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {#each planes as plan}
            <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl {
                plan.popular 
                    ? 'border-purple-500 scale-105' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }">
                
                <!-- Badge Popular -->
                {#if plan.popular}
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                            🔥 Más Popular
                        </div>
                    </div>
                {/if}
                
                <div class="p-8">
                    <!-- Header del Plan -->
                    <div class="text-center mb-6">
                        <div class="inline-flex p-3 rounded-full bg-{plan.color}-100 dark:bg-{plan.color}-900/30 mb-4">
                            <svelte:component this={plan.icono} class="w-8 h-8 text-{plan.color}-600" />
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {plan.nombre}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400">
                            {plan.descripcion}
                        </p>
                    </div>
                    
                    <!-- Precio -->
                    <div class="text-center mb-6">
                        <div class="flex items-baseline justify-center">
                            <span class="text-4xl font-bold text-gray-900 dark:text-white">
                                {formatearMoneda(plan.precio[periodo])}
                            </span>
                            <span class="text-gray-500 dark:text-gray-400 ml-2">
                                /{periodo === 'mensual' ? 'mes' : 'año'}
                            </span>
                        </div>
                        
                        {#if periodo === 'anual'}
                            <div class="mt-2">
                                <span class="text-sm text-gray-500 line-through">
                                    {formatearMoneda(plan.precio.mensual * 12)}
                                </span>
                                <span class="ml-2 text-sm text-green-600 font-medium">
                                    Ahorras {obtenerDescuento(plan.id)}%
                                </span>
                            </div>
                        {/if}
                    </div>
                    
                    <!-- Características -->
                    <div class="space-y-3 mb-8">
                        {#each plan.caracteristicas as caracteristica}
                            <div class="flex items-center">
                                <Check class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                <span class="text-gray-700 dark:text-gray-300">
                                    {caracteristica}
                                </span>
                            </div>
                        {/each}
                    </div>
                    
                    <!-- Botón de Suscripción -->
                    <button
                        on:click={() => suscribirse(plan.id)}
                        class="w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 {
                            plan.popular
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:scale-105'
                                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100'
                        }"
                    >
                        <span>Comenzar ahora</span>
                        <ArrowRight class="w-4 h-4" />
                    </button>
                </div>
            </div>
        {/each}
    </div>
    
    <!-- Características Adicionales -->
    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                ¿Por qué elegir ContabilidadPro?
            </h2>
            <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Todas las herramientas que necesitas para gestionar tu negocio en una sola plataforma
            </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="text-center">
                <div class="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <Shield class="w-6 h-6 text-blue-600" />
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    Seguridad Total
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Datos encriptados y backups automáticos
                </p>
            </div>
            
            <div class="text-center">
                <div class="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <Zap class="w-6 h-6 text-green-600" />
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    Actualizaciones
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Nuevas funciones cada mes sin costo
                </p>
            </div>
            
            <div class="text-center">
                <div class="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                    <Users class="w-6 h-6 text-purple-600" />
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    Soporte 24/7
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Te ayudamos cuando lo necesites
                </p>
            </div>
            
            <div class="text-center">
                <div class="inline-flex p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                    <Gift class="w-6 h-6 text-orange-600" />
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    Prueba Gratis
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    14 días gratis, sin tarjeta de crédito
                </p>
            </div>
        </div>
    </div>
    
    <!-- FAQ / Preguntas Frecuentes -->
    <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Preguntas Frecuentes
        </h2>
        
        <div class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    ¿Puedo cambiar de plan en cualquier momento?
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    Sí, puedes actualizar o degradar tu plan cuando quieras. Los cambios se aplican inmediatamente.
                </p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    ¿Hay compromiso de permanencia?
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    No, puedes cancelar tu suscripción en cualquier momento sin penalizaciones.
                </p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    ¿Qué métodos de pago aceptan?
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    Aceptamos tarjetas de crédito/débito, PSE, Nequi, y transferencias bancarias.
                </p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
                    ¿Mis datos están seguros?
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    Absolutamente. Usamos encriptación de nivel bancario y hacemos backups diarios de tu información.
                </p>
            </div>
        </div>
    </div>
    
    <!-- CTA Final -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
        <h2 class="text-3xl font-bold mb-4">
            ¿Listo para hacer crecer tu negocio?
        </h2>
        <p class="text-xl mb-6 opacity-90">
            Únete a más de 10,000 empresarios que ya confían en ContabilidadPro
        </p>
        <button class="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Comenzar prueba gratis
        </button>
    </div>
</div> 