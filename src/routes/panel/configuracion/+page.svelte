<script lang="ts">
    import { onMount } from 'svelte';
    import { perfilUsuario, user, actualizarPerfilUsuario, cambiarContrasena } from '$lib/stores/auth';
    import { mostrarError, mostrarExito } from '$lib/stores/toast';
    import Boton from '$lib/componentes/ui/Boton.svelte';
    import Input from '$lib/componentes/ui/Input.svelte';
    import TarjetaEstadistica from '$lib/componentes/ui/TarjetaEstadistica.svelte';
    import { 
        User, 
        Mail, 
        Phone, 
        MapPin, 
        Globe, 
        Clock, 
        CreditCard, 
        Shield, 
        Bell, 
        Moon, 
        Sun,
        Key,
        Crown,
        Zap,
        Users,
        Briefcase,
        TrendingUp,
        AlertTriangle,
        CheckCircle,
        Settings,
        Eye,
        EyeOff,
        Palette
    } from 'lucide-svelte';
    import PersonalizadorTemas from '$lib/componentes/ui/PersonalizadorTemas.svelte';
    import { alternarModoOscuro } from '$lib/stores/temas';

    // Estados del formulario
    let formularioPerfil = {
        nombre_completo: '',
        empresa: '',
        telefono: '',
        direccion: '',
        pais: 'COL'
    };

    let formularioContrasena = {
        actual: '',
        nueva: '',
        confirmar: ''
    };

    let configuracionNotificaciones = {
        email: true,
        push: false,
        marketing: true,
        recordatorios: true,
        reportes_semanales: true
    };

    // Estados de configuración
    let tema: 'light' | 'dark' | undefined = 'light';
    let idioma = 'es';

    // Estados de carga
    let guardandoPerfil = false;
    let cambiandoContrasena = false;
    let mostrarContrasenas = false;
    let mostrarPersonalizadorTemas = false;

    // Información del plan
    let limitesActuales = {
        proyectos: { usado: 0, limite: 0 },
        negocios: { usado: 0, limite: 0 },
        movimientos_mes: { usado: 0, limite: 0 },
        campanas: { usado: 0, limite: 0 }
    };

    // Países disponibles
    const paises = [
        { codigo: 'COL', nombre: 'Colombia' },
        { codigo: 'USA', nombre: 'Estados Unidos' },
        { codigo: 'MEX', nombre: 'México' },
        { codigo: 'ARG', nombre: 'Argentina' },
        { codigo: 'PER', nombre: 'Perú' },
        { codigo: 'CHL', nombre: 'Chile' },
        { codigo: 'BRA', nombre: 'Brasil' },
        { codigo: 'ESP', nombre: 'España' },
        { codigo: 'FRA', nombre: 'Francia' },
        { codigo: 'DEU', nombre: 'Alemania' }
    ];

    // Cargar datos del perfil
    const cargarDatosPerfil = () => {
        if ($perfilUsuario) {
            formularioPerfil = {
                nombre_completo: $perfilUsuario.nombre_completo || '',
                empresa: $perfilUsuario.empresa || '',
                telefono: $perfilUsuario.telefono || '',
                direccion: $perfilUsuario.direccion || '',
                pais: $perfilUsuario.pais || 'COL'
            };

            // Cargar configuraciones
            if ($perfilUsuario.configuracion_notificaciones) {
                configuracionNotificaciones = {
                    ...configuracionNotificaciones,
                    ...$perfilUsuario.configuracion_notificaciones
                };
            }

            tema = $perfilUsuario.tema || 'light';
            idioma = $perfilUsuario.idioma || 'es';

            // Cargar límites del plan
            limitesActuales = {
                proyectos: { usado: 0, limite: $perfilUsuario.limite_proyectos || 3 },
                negocios: { usado: 0, limite: $perfilUsuario.limite_negocios || 1 },
                movimientos_mes: { usado: 0, limite: $perfilUsuario.limite_movimientos_mes || 50 },
                campanas: { usado: 0, limite: $perfilUsuario.limite_campanas || 2 }
            };
        }
    };

    // Guardar perfil
    const guardarPerfil = async () => {
        try {
            guardandoPerfil = true;

            const success = await actualizarPerfilUsuario({
                ...formularioPerfil,
                configuracion_notificaciones: configuracionNotificaciones,
                tema,
                idioma
            });

            if (success) {
                mostrarExito('Perfil actualizado correctamente');
            }
        } catch (error) {
            console.error('Error guardando perfil:', error);
            mostrarError('Error al guardar el perfil');
        } finally {
            guardandoPerfil = false;
        }
    };

    // Cambiar contraseña
    const cambiarContrasenaPerfil = async () => {
        try {
            if (formularioContrasena.nueva !== formularioContrasena.confirmar) {
                mostrarError('Las contraseñas nuevas no coinciden');
                return;
            }

            if (formularioContrasena.nueva.length < 6) {
                mostrarError('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            cambiandoContrasena = true;

            const success = await cambiarContrasena(formularioContrasena.nueva);

            if (success) {
                formularioContrasena = { actual: '', nueva: '', confirmar: '' };
                mostrarExito('Contraseña cambiada correctamente');
            }
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            mostrarError('Error al cambiar la contraseña');
        } finally {
            cambiandoContrasena = false;
        }
    };

    // Aplicar tema
    const aplicarTema = (nuevoTema: string) => {
        tema = nuevoTema as 'light' | 'dark';
        
        if (tema === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        localStorage.setItem('tema', nuevoTema);
    };

    // Calcular porcentajes de uso reactivamente
    $: porcentajeProyectos = calcularPorcentajeUso(limitesActuales.proyectos.usado, limitesActuales.proyectos.limite);
    $: porcentajeNegocios = calcularPorcentajeUso(limitesActuales.negocios.usado, limitesActuales.negocios.limite);
    $: porcentajeMovimientos = calcularPorcentajeUso(limitesActuales.movimientos_mes.usado, limitesActuales.movimientos_mes.limite);
    $: porcentajeCampanas = calcularPorcentajeUso(limitesActuales.campanas.usado, limitesActuales.campanas.limite);

    // Función para calcular porcentaje de uso
    const calcularPorcentajeUso = (usado: number, limite: number): number => {
        return limite > 0 ? Math.round((usado / limite) * 100) : 0;
    };

    // Obtener color de la barra de progreso
    const obtenerColorBarra = (porcentaje: number): string => {
        if (porcentaje < 50) return 'bg-green-500';
        if (porcentaje < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Formatear fecha de suscripción
    const formatearFecha = (fecha: string): string => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    onMount(() => {
        cargarDatosPerfil();
        
        // Cargar tema desde localStorage
        const temaGuardado = localStorage.getItem('tema');
        if (temaGuardado) {
            aplicarTema(temaGuardado);
        }
    });

    // Reactividad para actualizar cuando cambie el perfil
    $: if ($perfilUsuario) {
        cargarDatosPerfil();
    }
</script>

<svelte:head>
    <title>Configuración - Contabilidad Pro</title>
</svelte:head>

<div class="space-y-8">
    <!-- Header de configuración -->
    <div class="bg-gradient-to-r from-gray-600 to-gray-800 rounded-2xl p-8 text-white">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold mb-2">
                    Configuración ⚙️
                </h1>
                <p class="text-gray-200 text-lg">
                    Gestiona tu perfil, suscripción y preferencias del sistema
                </p>
            </div>
            <div class="hidden md:block">
                <div class="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                    <Settings size={48} />
                </div>
            </div>
        </div>
    </div>

    <!-- Información del plan y límites -->
    {#if $perfilUsuario}
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center space-x-3">
                    {#if $perfilUsuario.plan_suscripcion === 'premium'}
                        <Crown size={24} class="text-yellow-500" />
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Plan Premium</h2>
                    {:else}
                        <Zap size={24} class="text-blue-500" />
                        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Plan Gratuito</h2>
                    {/if}
                </div>
                
                {#if $perfilUsuario.plan_suscripcion === 'gratis'}
                    <Boton variante="primary">
                        <Crown size={16} class="mr-2" />
                        Actualizar a Premium
                    </Boton>
                {/if}
            </div>

            <!-- Límites del plan -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Proyectos -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Proyectos</span>
                        <span class="text-xs text-gray-500">
                            {limitesActuales.proyectos.usado}/{limitesActuales.proyectos.limite}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            class="h-2 rounded-full transition-all duration-300 {obtenerColorBarra(porcentajeProyectos)}"
                            style="width: {porcentajeProyectos}%"
                        ></div>
                    </div>
                </div>

                <!-- Negocios -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Negocios</span>
                        <span class="text-xs text-gray-500">
                            {limitesActuales.negocios.usado}/{limitesActuales.negocios.limite}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            class="h-2 rounded-full transition-all duration-300 {obtenerColorBarra(porcentajeNegocios)}"
                            style="width: {porcentajeNegocios}%"
                        ></div>
                    </div>
                </div>

                <!-- Movimientos del mes -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Movimientos/mes</span>
                        <span class="text-xs text-gray-500">
                            {limitesActuales.movimientos_mes.usado}/{limitesActuales.movimientos_mes.limite}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            class="h-2 rounded-full transition-all duration-300 {obtenerColorBarra(porcentajeMovimientos)}"
                            style="width: {porcentajeMovimientos}%"
                        ></div>
                    </div>
                </div>

                <!-- Campañas -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Campañas</span>
                        <span class="text-xs text-gray-500">
                            {limitesActuales.campanas.usado}/{limitesActuales.campanas.limite}
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            class="h-2 rounded-full transition-all duration-300 {obtenerColorBarra(porcentajeCampanas)}"
                            style="width: {porcentajeCampanas}%"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- Información de suscripción -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600 dark:text-gray-400">Fecha de suscripción:</span>
                        <div class="font-medium text-gray-900 dark:text-white">
                            {formatearFecha($perfilUsuario.fecha_suscripcion)}
                        </div>
                    </div>
                    <div>
                        <span class="text-gray-600 dark:text-gray-400">Estado:</span>
                        <div class="font-medium">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                {$perfilUsuario.estado_suscripcion === 'activa' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }">
                                {$perfilUsuario.estado_suscripcion === 'activa' ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                    </div>
                    {#if $perfilUsuario.fecha_vencimiento}
                        <div>
                            <span class="text-gray-600 dark:text-gray-400">Vencimiento:</span>
                            <div class="font-medium text-gray-900 dark:text-white">
                                {formatearFecha($perfilUsuario.fecha_vencimiento)}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    <!-- Configuraciones en pestañas -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="flex space-x-8 px-6">
                <button class="py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600 dark:text-blue-400">
                    <User size={16} class="inline mr-2" />
                    Perfil
                </button>
                <button class="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <Key size={16} class="inline mr-2" />
                    Seguridad
                </button>
                <button class="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <Bell size={16} class="inline mr-2" />
                    Notificaciones
                </button>
                <button class="py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <Settings size={16} class="inline mr-2" />
                    Preferencias
                </button>
            </nav>
        </div>

        <!-- Contenido de las pestañas -->
        <div class="p-6">
            <!-- Pestaña de Perfil -->
            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Información Personal
                    </h3>
                    
                    <form on:submit|preventDefault={guardarPerfil} class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Nombre completo -->
                            <div>
                                <Input
                                    etiqueta="Nombre Completo"
                                    tipo="text"
                                    bind:valor={formularioPerfil.nombre_completo}
                                    placeholder="Tu nombre completo"
                                />
                            </div>

                            <!-- Email (solo lectura) -->
                            <div>
                                <Input
                                    etiqueta="Email"
                                    tipo="email"
                                    valor={$user?.email || ''}
                                    disabled
                                />
                            </div>

                            <!-- Empresa -->
                            <div>
                                <Input
                                    etiqueta="Empresa"
                                    tipo="text"
                                    bind:valor={formularioPerfil.empresa}
                                    placeholder="Nombre de tu empresa"
                                />
                            </div>

                            <!-- Teléfono -->
                            <div>
                                <Input
                                    etiqueta="Teléfono"
                                    tipo="text"
                                    bind:valor={formularioPerfil.telefono}
                                    placeholder="+57 300 123 4567"
                                />
                            </div>

                            <!-- País -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    País
                                </label>
                                <select 
                                    bind:value={formularioPerfil.pais}
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    {#each paises as pais}
                                        <option value={pais.codigo}>{pais.nombre}</option>
                                    {/each}
                                </select>
                            </div>

                            <!-- Dirección -->
                            <div class="md:col-span-2">
                                <Input
                                    etiqueta="Dirección"
                                    tipo="text"
                                    bind:valor={formularioPerfil.direccion}
                                    placeholder="Tu dirección completa"
                                />
                            </div>
                        </div>

                        <!-- Botón de guardar -->
                        <div class="flex justify-end">
                            <Boton 
                                variante="primary" 
                                type="submit"
                                disabled={guardandoPerfil}
                            >
                                {guardandoPerfil ? 'Guardando...' : 'Guardar Cambios'}
                            </Boton>
                        </div>
                    </form>
                </div>

                <!-- Cambiar contraseña -->
                <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Cambiar Contraseña
                    </h3>
                    
                    <form on:submit|preventDefault={cambiarContrasenaPerfil} class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <!-- Contraseña actual -->
                            <div class="relative">
                                <Input
                                    etiqueta="Contraseña Actual"
                                    tipo={mostrarContrasenas ? "text" : "password"}
                                    bind:valor={formularioContrasena.actual}
                                    placeholder="Tu contraseña actual"
                                />
                            </div>

                            <!-- Nueva contraseña -->
                            <div class="relative">
                                <Input
                                    etiqueta="Nueva Contraseña"
                                    tipo={mostrarContrasenas ? "text" : "password"}
                                    bind:valor={formularioContrasena.nueva}
                                    placeholder="Nueva contraseña"
                                />
                            </div>

                            <!-- Confirmar contraseña -->
                            <div class="relative">
                                <Input
                                    etiqueta="Confirmar Contraseña"
                                    tipo={mostrarContrasenas ? "text" : "password"}
                                    bind:valor={formularioContrasena.confirmar}
                                    placeholder="Confirma la nueva contraseña"
                                />
                            </div>
                        </div>

                        <!-- Mostrar/ocultar contraseñas -->
                        <div class="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="mostrar_contrasenas"
                                bind:checked={mostrarContrasenas}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label for="mostrar_contrasenas" class="text-sm text-gray-700 dark:text-gray-300">
                                Mostrar contraseñas
                            </label>
                        </div>

                        <!-- Botón de cambiar contraseña -->
                        <div class="flex justify-end">
                            <Boton 
                                variante="secondary" 
                                type="submit"
                                disabled={cambiandoContrasena}
                            >
                                {cambiandoContrasena ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </Boton>
                        </div>
                    </form>
                </div>

                <!-- Configuración de notificaciones -->
                <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Notificaciones
                    </h3>
                    
                    <div class="space-y-4">
                        <!-- Email -->
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    Notificaciones por Email
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                    Recibe notificaciones importantes por correo
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                bind:checked={configuracionNotificaciones.email}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>

                        <!-- Push -->
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    Notificaciones Push
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                    Notificaciones en tiempo real en el navegador
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                bind:checked={configuracionNotificaciones.push}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>

                        <!-- Marketing -->
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    Emails de Marketing
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                    Recibe consejos y novedades sobre el producto
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                bind:checked={configuracionNotificaciones.marketing}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>

                        <!-- Recordatorios -->
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    Recordatorios
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                    Recordatorios de tareas y fechas importantes
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                bind:checked={configuracionNotificaciones.recordatorios}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>

                        <!-- Reportes semanales -->
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-white">
                                    Reportes Semanales
                                </div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">
                                    Resumen semanal de tu actividad financiera
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                bind:checked={configuracionNotificaciones.reportes_semanales}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                        </div>
                    </div>
                </div>

                <!-- Preferencias del sistema -->
                <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Preferencias del Sistema
                    </h3>
                    
                    <div class="space-y-6">
                        <!-- Tema -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Personalización de Temas
                            </label>
                            
                            <!-- Botones de tema básico -->
                            <div class="flex space-x-4 mb-4">
                                <button
                                    type="button"
                                    on:click={() => aplicarTema('light')}
                                    class={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                        tema === 'light'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Sun size={16} />
                                    <span>Claro</span>
                                </button>
                                <button
                                    type="button"
                                    on:click={alternarModoOscuro}
                                    class={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                        tema === 'dark'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Moon size={16} />
                                    <span>Oscuro</span>
                                </button>
                            </div>
                            
                            <!-- Botón para abrir personalizador avanzado -->
                            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    on:click={() => mostrarPersonalizadorTemas = true}
                                    class="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <Palette size={18} />
                                    <span class="font-medium">Personalizar Temas Avanzados</span>
                                    <span class="bg-white/20 px-2 py-1 rounded-full text-xs">✨ Premium</span>
                                </button>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                    Accede a 7+ temas personalizables y crea los tuyos propios
                                </p>
                            </div>
                        </div>

                        <!-- Idioma -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Idioma
                            </label>
                            <select 
                                bind:value={idioma}
                                class="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            >
                                <option value="es">Español</option>
                                <option value="en">English</option>
                                <option value="pt">Português</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Botón final de guardar todas las configuraciones -->
                <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex justify-end">
                        <Boton 
                            variante="primary" 
                            on:click={guardarPerfil}
                            disabled={guardandoPerfil}
                        >
                            {guardandoPerfil ? 'Guardando...' : 'Guardar Todas las Configuraciones'}
                        </Boton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Personalizador de Temas -->
<PersonalizadorTemas bind:abierto={mostrarPersonalizadorTemas} /> 