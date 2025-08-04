<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { fade, fly, scale, blur } from 'svelte/transition';
	import { quintOut, elasticOut, backOut } from 'svelte/easing';
	import { 
		Rocket, 
		BarChart3, 
		Users, 
		Zap, 
		Shield, 
		Smartphone, 
		ChevronRight,
		Check,
		Star,
		TrendingUp,
		Brain,
		Globe,
		CreditCard,
		FileText,
		Bell,
		Layers,
		Target,
		DollarSign,
		Building2,
		FolderKanban,
		Sparkles,
		MousePointer,
		LayoutDashboard
	} from 'lucide-svelte';
	import ModalAuth from '$lib/componentes/auth/ModalAuth.svelte';
	
	// Estados
	let usuarioReconocido = false;
	let modalAuthAbierto = false;
	let modoModal: 'login' | 'registro' = 'login';
	let seccionVisible = 'hero';
	let contadorAnimado = 0;
	let scrollY = 0;
	let innerHeight = 0;
	let heroSection: HTMLElement;
	let particlesContainer: HTMLElement;
	
	// Estados de animación
	let typingText = '';
	let typingIndex = 0;
	let showCursor = true;
	let mouseX = 0;
	let mouseY = 0;
	let isHovering = false;
	
	// Textos para typing animation
	const typingTexts = [
		'Gestiona Proyectos',
		'Controla Finanzas', 
		'Crece tu Negocio',
		'Domina el Mundo'
	];
	let currentTextIndex = 0;
	
	// Partículas flotantes
	let particles: Array<{
		id: number;
		x: number;
		y: number;
		size: number;
		speedX: number;
		speedY: number;
		opacity: number;
		color: string;
	}> = [];
	
	// Crear partículas
	const createParticles = () => {
		particles = [];
		for (let i = 0; i < 50; i++) {
			particles.push({
				id: i,
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				size: Math.random() * 4 + 1,
				speedX: (Math.random() - 0.5) * 0.5,
				speedY: (Math.random() - 0.5) * 0.5,
				opacity: Math.random() * 0.5 + 0.1,
				color: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)]
			});
		}
	};
	
	// Animar partículas
	const animateParticles = () => {
		particles = particles.map(particle => {
			const newX = particle.x + particle.speedX;
			const newY = particle.y + particle.speedY;
			
			return {
				...particle,
				x: newX > window.innerWidth ? 0 : newX < 0 ? window.innerWidth : newX,
				y: newY > window.innerHeight ? 0 : newY < 0 ? window.innerHeight : newY
			};
		});
	};
	
	// Typing animation
	const startTypingAnimation = () => {
		const currentText = typingTexts[currentTextIndex];
		
		if (typingIndex < currentText.length) {
			typingText += currentText[typingIndex];
			typingIndex++;
			setTimeout(startTypingAnimation, 100);
		} else {
			setTimeout(() => {
				// Borrar texto
				const deleteInterval = setInterval(() => {
					if (typingText.length > 0) {
						typingText = typingText.slice(0, -1);
					} else {
						clearInterval(deleteInterval);
						currentTextIndex = (currentTextIndex + 1) % typingTexts.length;
						typingIndex = 0;
						setTimeout(startTypingAnimation, 500);
					}
				}, 50);
			}, 2000);
		}
	};
	
	// Cursor parpadeante
	const toggleCursor = () => {
		showCursor = !showCursor;
		setTimeout(toggleCursor, 500);
	};
	
	// Detección de usuario existente
	onMount(() => {
		if (browser) {
			usuarioReconocido = localStorage.getItem('app_contabilidad_visited') === 'true';
			
			// Iniciar animaciones
			createParticles();
			startTypingAnimation();
			toggleCursor();
			
			// Animar partículas
			const particleInterval = setInterval(animateParticles, 50);
			
			// Animación del contador
			const interval = setInterval(() => {
				if (contadorAnimado < 10000) {
					contadorAnimado += 157;
				} else {
					clearInterval(interval);
				}
			}, 20);
			
			// Mouse tracking
			const handleMouseMove = (e: MouseEvent) => {
				mouseX = e.clientX;
				mouseY = e.clientY;
			};
			
			window.addEventListener('mousemove', handleMouseMove);
			
			// Intersection Observer para animaciones
			const observador = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						seccionVisible = entry.target.id;
						entry.target.classList.add('animate-in');
					}
				});
			}, { threshold: 0.1 });
			
			// Observar secciones
			setTimeout(() => {
				document.querySelectorAll('section[id]').forEach(el => {
					observador.observe(el);
				});
			}, 100);
			
			return () => {
				clearInterval(particleInterval);
				clearInterval(interval);
				window.removeEventListener('mousemove', handleMouseMove);
				observador.disconnect();
			};
		}
	});
	
	// Funciones de UI
	const abrirModal = (modo: 'login' | 'registro') => {
		modoModal = modo;
		modalAuthAbierto = true;
	};
	
	const cerrarModal = () => {
		modalAuthAbierto = false;
	};
	
	// Scroll suave
	const scrollTo = (elemento: string) => {
		document.getElementById(elemento)?.scrollIntoView({ 
			behavior: 'smooth' 
		});
	};
	
	// Efectos de parallax
	$: parallaxY = scrollY * 0.5;
	$: parallaxY2 = scrollY * 0.3;
	$: parallaxY3 = scrollY * 0.7;
</script>

<svelte:head>
	<title>App Contabilidad - La Mejor Plataforma de Gestión del Mundo</title>
	<meta name="description" content="Gestiona proyectos, negocios y finanzas en una sola plataforma. Con IA, drag & drop, reportes automáticos y mucho más. ¡Prueba gratis!" />
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight />

<!-- Partículas flotantes -->
{#if browser}
	<div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
		{#each particles as particle (particle.id)}
			<div
				class="absolute rounded-full blur-sm animate-pulse"
				style="
					left: {particle.x}px;
					top: {particle.y}px;
					width: {particle.size}px;
					height: {particle.size}px;
					background-color: {particle.color};
					opacity: {particle.opacity};
					transform: translate3d(0, 0, 0);
				"
			></div>
		{/each}
	</div>
{/if}

<!-- Hero Section -->
<section id="hero" class="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden" bind:this={heroSection}>
	<!-- Animated Background con Parallax -->
	<div class="absolute inset-0" style="transform: translateY({parallaxY}px)">
		<div class="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
		<div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
	</div>
	
	<!-- Gradiente animado overlay -->
	<div class="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-indigo-900/80 animate-gradient"></div>
	
	<!-- Content -->
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
		<!-- Header con efectos -->
		<nav class="flex items-center justify-between mb-16" transition:fade={{ delay: 100 }}>
			<div class="flex items-center space-x-3 group">
				<div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
					<Rocket class="w-6 h-6 text-white group-hover:animate-bounce" />
				</div>
				<span class="text-white text-xl font-bold group-hover:text-blue-300 transition-colors">App Contabilidad</span>
			</div>
			
			<div class="flex items-center space-x-4">
				<button
					on:click={() => abrirModal('login')}
					class="px-6 py-2 text-white/80 hover:text-white font-medium transition-all duration-300 hover:scale-105 hover:bg-white/10 rounded-lg backdrop-blur-sm"
				>
					Iniciar Sesión
				</button>
				<button
					on:click={() => abrirModal('registro')}
					class="group px-8 py-3 bg-white text-purple-900 font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 overflow-hidden relative"
					on:mouseenter={() => isHovering = true}
					on:mouseleave={() => isHovering = false}
				>
					<span class="relative z-10">Prueba Gratis</span>
					<div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				</button>
			</div>
		</nav>
		
		<!-- Hero Content con animaciones épicas -->
		<div class="text-center max-w-5xl mx-auto">
			<div class="mb-8" transition:fly={{ y: 50, delay: 200, easing: elasticOut }}>
				{#if usuarioReconocido}
					<span class="inline-block px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-medium mb-6 animate-pulse backdrop-blur-sm border border-green-400/30">
						¡Hola de nuevo! 👋 Continúa donde lo dejaste
					</span>
				{:else}
					<span class="inline-block px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6 animate-bounce backdrop-blur-sm border border-blue-400/30">
						🎉 ¡Únete gratis por tiempo limitado!
					</span>
				{/if}
			</div>
			
			<h1 
				class="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight"
				transition:fly={{ y: 50, delay: 300, easing: backOut }}
			>
				La <span class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">Mejor Plataforma</span><br>
				del Mundo para
				<div class="relative inline-block mt-4">
					<span class="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
						{typingText}
					</span>
					<span class="text-yellow-400 animate-pulse {showCursor ? 'opacity-100' : 'opacity-0'}">|</span>
				</div>
			</h1>
			
			<p 
				class="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed"
				transition:fly={{ y: 50, delay: 400 }}
			>
				Con <strong class="text-blue-300">IA</strong>, <strong class="text-purple-300">drag & drop</strong>, 
				<strong class="text-pink-300">reportes automáticos</strong> y mucho más.
			</p>
			
			<!-- CTA Buttons con efectos magnéticos -->
			<div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16" transition:fly={{ y: 50, delay: 500 }}>
				<button
					on:click={() => abrirModal(usuarioReconocido ? 'login' : 'registro')}
					class="group relative px-12 py-5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 overflow-hidden magnetic-button"
				>
					<div class="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					<Sparkles class="w-6 h-6 relative z-10 group-hover:animate-spin" />
					<span class="relative z-10">{usuarioReconocido ? 'Continuar' : 'Empezar Gratis'}</span>
					<ChevronRight class="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
				</button>
				
				<button
					on:click={() => scrollTo('features')}
					class="group px-12 py-5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg glass-morphism"
				>
					<MousePointer class="w-5 h-5 inline mr-2 group-hover:animate-bounce" />
					Ver Características
				</button>
			</div>
			
			<!-- Stats con animaciones de números -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-6" transition:fly={{ y: 50, delay: 600 }}>
				<div class="text-center group hover:scale-110 transition-transform duration-300">
					<div class="text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-custom">{Math.floor(contadorAnimado / 100).toLocaleString()}+</div>
					<div class="text-blue-200 text-sm group-hover:text-blue-100 transition-colors">Proyectos Gestionados</div>
				</div>
				<div class="text-center group hover:scale-110 transition-transform duration-300">
					<div class="text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-custom">{Math.floor(contadorAnimado / 200).toLocaleString()}+</div>
					<div class="text-blue-200 text-sm group-hover:text-blue-100 transition-colors">Negocios Prósperos</div>
				</div>
				<div class="text-center group hover:scale-110 transition-transform duration-300">
					<div class="text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-custom">99.9%</div>
					<div class="text-blue-200 text-sm group-hover:text-blue-100 transition-colors">Disponibilidad</div>
				</div>
				<div class="text-center group hover:scale-110 transition-transform duration-300">
					<div class="text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-custom">24/7</div>
					<div class="text-blue-200 text-sm group-hover:text-blue-100 transition-colors">Soporte Premium</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Elementos decorativos flotantes -->
	<div class="absolute top-20 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-float opacity-60"></div>
	<div class="absolute top-40 right-1/4 w-6 h-6 bg-purple-400 rounded-full animate-float-delayed opacity-40"></div>
	<div class="absolute bottom-40 left-1/3 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-50"></div>
	<div class="absolute bottom-60 right-1/3 w-5 h-5 bg-indigo-400 rounded-full animate-float-delayed opacity-30"></div>
</section>

<!-- Features Section -->
<section id="features" class="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
	<!-- Parallax Background -->
	<div class="absolute inset-0" style="transform: translateY({parallaxY2}px)">
		<div class="absolute top-10 right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
		<div class="absolute bottom-10 left-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-float"></div>
	</div>
	
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header con typing effect -->
		<div class="text-center mb-20">
			<h2 class="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 text-glow animate-slide-up">
				¿Por qué somos la 
				<span class="text-gradient">Mejor Plataforma</span> 
				del Mundo?
			</h2>
			<p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-zoom-in">
				Diseñada para <strong class="text-blue-600">emprendedores</strong>, 
				<strong class="text-purple-600">freelancers</strong> y 
				<strong class="text-pink-600">pequeñas empresas</strong> que quieren dominar el mundo.
			</p>
		</div>
		
		<!-- Grid de características con hover épico -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			<!-- Feature 1 -->
			<div class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 hover-lift interactive glass-morphism waves">
				<div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
				<div class="relative z-10">
					<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-bounce-in">
						<LayoutDashboard class="w-8 h-8 text-white group-hover:animate-wiggle" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">Gestión Integral</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
						Centraliza proyectos, negocios y finanzas personales en un solo lugar. 
						<span class="font-semibold text-blue-600">¡Olvídate de múltiples herramientas!</span>
					</p>
				</div>
			</div>
			
			<!-- Feature 2 -->
			<div class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 hover-lift interactive glass-morphism waves">
				<div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
				<div class="relative z-10">
					<div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-bounce-in">
						<Building2 class="w-8 h-8 text-white group-hover:animate-wiggle" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 transition-colors">Multi-Negocios</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
						Administra ilimitados negocios y proyectos, cada uno con sus propias finanzas y tareas.
						<span class="font-semibold text-purple-600">¡Sin límites!</span>
					</p>
				</div>
			</div>
			
			<!-- Feature 3 -->
			<div class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 hover-lift interactive glass-morphism waves">
				<div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
				<div class="relative z-10">
					<div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-bounce-in">
						<DollarSign class="w-8 h-8 text-white group-hover:animate-wiggle" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-green-600 transition-colors">Finanzas Inteligentes</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
						Registra ingresos y gastos, genera reportes automáticos y visualiza tu flujo de caja.
						<span class="font-semibold text-green-600">¡En tiempo real!</span>
					</p>
				</div>
			</div>
			
			<!-- Feature 4 -->
			<div class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 hover-lift interactive glass-morphism waves">
				<div class="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
				<div class="relative z-10">
					<div class="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-bounce-in">
						<BarChart3 class="w-8 h-8 text-white group-hover:animate-wiggle" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-red-600 transition-colors">Reportes Detallados</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
						Obtén una visión clara de tu salud financiera con gráficos interactivos.
						<span class="font-semibold text-red-600">¡Métricas clave!</span>
					</p>
				</div>
			</div>
			
			<!-- Feature 5 -->
			<div class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 hover-lift interactive glass-morphism waves">
				<div class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
				<div class="relative z-10">
					<div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-bounce-in">
						<Zap class="w-8 h-8 text-white group-hover:animate-wiggle" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-yellow-600 transition-colors">Productividad Extrema</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
						Organiza tus tareas con Kanban drag & drop, asigna prioridades.
						<span class="font-semibold text-yellow-600">¡Nunca pierdas un plazo!</span>
					</p>
				</div>
			</div>
			
			<!-- Feature 6 -->
			<div class="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 hover-lift interactive glass-morphism waves">
				<div class="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
				<div class="relative z-10">
					<div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 animate-bounce-in">
						<Smartphone class="w-8 h-8 text-white group-hover:animate-wiggle" />
					</div>
					<h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-teal-600 transition-colors">100% Responsiva</h3>
					<p class="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
						Accede a tu información desde cualquier dispositivo.
						<span class="font-semibold text-teal-600">¡En cualquier momento y lugar!</span>
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Future Features Section -->
<section id="future" class="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 relative overflow-hidden">
	<!-- Elementos decorativos flotantes -->
	<div class="absolute inset-0" style="transform: translateY({parallaxY3}px)">
		<div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-float"></div>
		<div class="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-red-400/20 rounded-full blur-2xl animate-float-delayed"></div>
		<div class="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse-slow"></div>
	</div>
	
	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<!-- Header épico -->
		<div class="mb-20">
			<h2 class="text-5xl md:text-6xl font-extrabold mb-6 animate-slide-up">
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
					Lo que viene:
				</span>
				<br>
				<span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x">
					Innovación Continua
				</span>
			</h2>
			<p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-zoom-in">
				Estamos construyendo el futuro de la gestión financiera para ti.
				<strong class="text-purple-600">¡Prepárate para lo épico!</strong>
			</p>
		</div>
		
		<!-- Grid de futuras características -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
			<!-- Future 1 -->
			<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/30 hover-lift hover-glow transition-all duration-500">
				<div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-heartbeat">
					<Brain class="w-8 h-8 text-white" />
				</div>
				<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors">IA para Predicciones</h3>
				<p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
					Pronósticos financieros inteligentes y recomendaciones personalizadas.
				</p>
			</div>
			
			<!-- Future 2 -->
			<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/30 hover-lift hover-glow transition-all duration-500">
				<div class="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-heartbeat">
					<Users class="w-8 h-8 text-white" />
				</div>
				<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-pink-600 transition-colors">Colaboración en Equipo</h3>
				<p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
					Workspaces compartidos para trabajar con tu equipo en proyectos y negocios.
				</p>
			</div>
			
			<!-- Future 3 -->
			<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/30 hover-lift hover-glow transition-all duration-500">
				<div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-heartbeat">
					<FileText class="w-8 h-8 text-white" />
				</div>
				<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-orange-600 transition-colors">Facturación Automática</h3>
				<p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
					Genera facturas profesionales y automatiza tus procesos de cobro.
				</p>
			</div>
			
			<!-- Future 4 -->
			<div class="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/30 hover-lift hover-glow transition-all duration-500">
				<div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-heartbeat">
					<CreditCard class="w-8 h-8 text-white" />
				</div>
				<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-cyan-600 transition-colors">Pagos Integrados</h3>
				<p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
					Conecta con pasarelas de pago como Stripe o PayPal para transacciones directas.
				</p>
			</div>
		</div>
		
		<!-- CTA Button épico -->
		<div class="mt-16">
			<button
				on:click={() => abrirModal('registro')}
				class="group relative px-16 py-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-purple-500/25 transform hover:scale-110 transition-all duration-500 flex items-center space-x-4 mx-auto overflow-hidden"
			>
				<div class="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
				<Sparkles class="w-8 h-8 relative z-10 group-hover:animate-spin" />
				<span class="relative z-10">¡Únete a la Revolución!</span>
				<ChevronRight class="w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />
			</button>
		</div>
	</div>
</section>

<!-- Call to Action Final -->
<section class="py-24 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
	<!-- Background animado -->
	<div class="absolute inset-0">
		<div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/90 via-purple-900/90 to-indigo-900/90 animate-gradient"></div>
		<div class="absolute top-20 left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
		<div class="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
		<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
	</div>
	
	<div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h2 class="text-4xl md:text-6xl font-extrabold mb-8 animate-slide-up">
			¡Empieza a Transformar tu
			<span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-gradient-x">
				Gestión Hoy!
			</span>
		</h2>
		
		<p class="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto animate-zoom-in">
			Únete a miles de emprendedores que ya están optimizando sus finanzas y proyectos 
			con <strong class="text-yellow-300">la plataforma más épica del mundo.</strong>
		</p>
		
		<!-- Botones finales épicos -->
		<div class="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8">
			<button
				on:click={() => abrirModal('registro')}
				class="group relative px-16 py-6 bg-white text-purple-900 font-bold text-xl rounded-full shadow-2xl hover:shadow-white/25 transform hover:scale-110 hover:rotate-2 transition-all duration-500 flex items-center space-x-4 overflow-hidden magnetic-button"
			>
				<div class="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				<Check class="w-6 h-6 relative z-10 group-hover:animate-bounce" />
				<span class="relative z-10 group-hover:text-white transition-colors">Comienza tu Prueba Gratis</span>
				<Sparkles class="w-6 h-6 relative z-10 group-hover:animate-spin group-hover:text-white transition-colors" />
			</button>
			
			<button
				on:click={() => scrollTo('features')}
				class="group px-12 py-4 bg-transparent border-2 border-white/30 text-white font-semibold text-lg rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105 glass-morphism"
			>
				<Target class="w-5 h-5 inline mr-2 group-hover:animate-wiggle" />
				Ver Todas las Características
			</button>
		</div>
		
		<!-- Stats finales -->
		<div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
			<div class="text-center group hover:scale-110 transition-transform duration-300">
				<div class="text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-custom">⚡</div>
				<div class="text-blue-200 text-sm group-hover:text-white transition-colors">Súper Rápido</div>
			</div>
			<div class="text-center group hover:scale-110 transition-transform duration-300">
				<div class="text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-custom">🚀</div>
				<div class="text-blue-200 text-sm group-hover:text-white transition-colors">Fácil de Usar</div>
			</div>
			<div class="text-center group hover:scale-110 transition-transform duration-300">
				<div class="text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-custom">🔐</div>
				<div class="text-blue-200 text-sm group-hover:text-white transition-colors">100% Seguro</div>
			</div>
			<div class="text-center group hover:scale-110 transition-transform duration-300">
				<div class="text-3xl md:text-4xl font-bold text-white mb-2 animate-pulse-custom">💎</div>
				<div class="text-blue-200 text-sm group-hover:text-white transition-colors">Premium Quality</div>
			</div>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="bg-gray-900 text-white py-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<div class="flex items-center justify-center space-x-3 mb-6">
				<div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
					<Rocket class="w-6 h-6 text-white" />
				</div>
				<span class="text-2xl font-bold">App Contabilidad</span>
			</div>
			<p class="text-gray-400 mb-8">La plataforma más poderosa para gestionar tu negocio</p>
			<p class="text-gray-500 text-sm">© 2024 App Contabilidad. Hecho con ❤️ para emprendedores ambiciosos.</p>
		</div>
	</div>
</footer>

<!-- Modal Auth -->
<ModalAuth 
	bind:abierto={modalAuthAbierto} 
	modoInicial={modoModal} 
	on:cerrar={cerrarModal} 
/>

<style>
	/* 🚀 ANIMACIONES SÚPER ÉPICAS */
	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		33% { transform: translateY(-20px) rotate(2deg); }
		66% { transform: translateY(-10px) rotate(-1deg); }
	}
	
	@keyframes float-delayed {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		33% { transform: translateY(-15px) rotate(-2deg); }
		66% { transform: translateY(-25px) rotate(1deg); }
	}
	
	@keyframes pulse-slow {
		0%, 100% { opacity: 0.3; transform: scale(1); }
		50% { opacity: 0.8; transform: scale(1.05); }
	}
	
	@keyframes pulse-custom {
		0%, 100% { transform: scale(1); color: white; }
		50% { transform: scale(1.1); color: #60a5fa; }
	}
	
	@keyframes gradient {
		0%, 100% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
	}
	
	@keyframes gradient-x {
		0%, 100% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
	}
	
	@keyframes glow {
		0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
		50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(236, 72, 153, 0.3); }
	}
	
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px); }
		75% { transform: translateX(5px); }
	}
	
	@keyframes bounce-in {
		0% { transform: scale(0.3) rotate(-45deg); opacity: 0; }
		50% { transform: scale(1.1) rotate(-10deg); opacity: 0.8; }
		100% { transform: scale(1) rotate(0deg); opacity: 1; }
	}
	
	@keyframes slide-up {
		0% { transform: translateY(100px); opacity: 0; }
		100% { transform: translateY(0); opacity: 1; }
	}
	
	@keyframes zoom-in {
		0% { transform: scale(0.8); opacity: 0; }
		100% { transform: scale(1); opacity: 1; }
	}
	
	@keyframes wiggle {
		0%, 100% { transform: rotate(0deg); }
		25% { transform: rotate(1deg); }
		75% { transform: rotate(-1deg); }
	}
	
	@keyframes heartbeat {
		0%, 100% { transform: scale(1); }
		14% { transform: scale(1.1); }
		28% { transform: scale(1); }
		42% { transform: scale(1.1); }
		70% { transform: scale(1); }
	}
	
	/* 🎯 CLASES DE ANIMACIÓN */
	.animate-float {
		animation: float 6s ease-in-out infinite;
	}
	
	.animate-float-delayed {
		animation: float-delayed 8s ease-in-out infinite;
		animation-delay: -2s;
	}
	
	.animate-pulse-slow {
		animation: pulse-slow 4s ease-in-out infinite;
	}
	
	.animate-pulse-custom {
		animation: pulse-custom 2s ease-in-out infinite;
	}
	
	.animate-gradient {
		background-size: 400% 400%;
		animation: gradient 15s ease infinite;
	}
	
	.animate-gradient-x {
		background-size: 400% 400%;
		animation: gradient-x 3s ease infinite;
	}
	
	.animate-glow {
		animation: glow 2s ease-in-out infinite;
	}
	
	.animate-shake {
		animation: shake 0.5s ease-in-out;
	}
	
	.animate-bounce-in {
		animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}
	
	.animate-slide-up {
		animation: slide-up 0.8s ease-out;
	}
	
	.animate-zoom-in {
		animation: zoom-in 0.6s ease-out;
	}
	
	.animate-wiggle {
		animation: wiggle 1s ease-in-out;
	}
	
	.animate-heartbeat {
		animation: heartbeat 1.5s ease-in-out infinite;
	}
	
	/* 🌟 EFECTOS GLASS MORPHISM */
	.glass-morphism {
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}
	
	.glass-morphism:hover {
		backdrop-filter: blur(15px);
		background: rgba(255, 255, 255, 0.15);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	}
	
	/* 🎪 EFECTOS MAGNÉTICOS */
	.magnetic-button {
		transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
		cursor: pointer;
	}
	
	.magnetic-button:hover {
		transform: scale(1.05) translateY(-5px);
		box-shadow: 0 20px 40px rgba(139, 92, 246, 0.4);
	}
	
	/* 🌈 GRADIENTES ÉPICOS */
	.gradient-epic {
		background: linear-gradient(
			45deg,
			#ff6b6b,
			#4ecdc4,
			#45b7d1,
			#96ceb4,
			#ffeaa7,
			#dda0dd,
			#98d8c8
		);
		background-size: 400% 400%;
		animation: gradient 10s ease infinite;
	}
	
	/* 🔥 EFECTOS DE HOVER ÉPICOS */
	.hover-lift {
		transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}
	
	.hover-lift:hover {
		transform: translateY(-10px) scale(1.02);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
	}
	
	.hover-glow:hover {
		box-shadow: 
			0 0 20px rgba(59, 130, 246, 0.4),
			0 0 40px rgba(139, 92, 246, 0.3),
			0 0 60px rgba(236, 72, 153, 0.2);
	}
	
	/* ⚡ EFECTOS DE LOADING */
	.loading-spinner {
		animation: spin 2s linear infinite;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* 🎯 SCROLL REVEAL ANIMATIONS */
	.animate-in {
		animation: slide-up 0.8s ease-out;
	}
	
	/* 💫 PARTÍCULAS ANIMADAS */
	.particle {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
		opacity: 0.7;
		animation: float 6s ease-in-out infinite;
	}
	
	.particle:nth-child(odd) {
		animation-delay: -2s;
		animation-duration: 8s;
	}
	
	.particle:nth-child(even) {
		animation-delay: -4s;
		animation-duration: 10s;
	}
	
	/* 🌊 WAVES EFFECT */
	.waves {
		position: relative;
		overflow: hidden;
	}
	
	.waves::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 200%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.1),
			transparent
		);
		animation: wave 3s linear infinite;
	}
	
	@keyframes wave {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}
	
	/* 🎨 TEXT EFFECTS */
	.text-glow {
		text-shadow: 
			0 0 10px rgba(59, 130, 246, 0.5),
			0 0 20px rgba(139, 92, 246, 0.3),
			0 0 30px rgba(236, 72, 153, 0.2);
	}
	
	.text-gradient {
		background: linear-gradient(
			45deg,
			#3b82f6,
			#8b5cf6,
			#ec4899,
			#f59e0b
		);
		background-size: 400% 400%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: gradient 3s ease infinite;
	}
	
	/* 🎪 INTERACTIVE ELEMENTS */
	.interactive:hover {
		transform: scale(1.05) rotate(2deg);
		transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}
	
	/* 🔮 MAGIC CURSOR EFFECT */
	.magic-cursor {
		cursor: none;
	}
	
	.cursor-dot {
		position: fixed;
		width: 8px;
		height: 8px;
		background: linear-gradient(45deg, #3b82f6, #8b5cf6);
		border-radius: 50%;
		pointer-events: none;
		z-index: 9999;
		transition: transform 0.1s ease;
	}
	
	.cursor-outline {
		position: fixed;
		width: 40px;
		height: 40px;
		border: 2px solid rgba(59, 130, 246, 0.5);
		border-radius: 50%;
		pointer-events: none;
		z-index: 9998;
		transition: all 0.3s ease;
	}
	
	/* 🎭 SCROLLBAR STYLING */
	::-webkit-scrollbar {
		width: 8px;
	}
	
	::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}
	
	::-webkit-scrollbar-thumb {
		background: linear-gradient(45deg, #3b82f6, #8b5cf6);
		border-radius: 10px;
	}
	
	::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(45deg, #2563eb, #7c3aed);
	}
	
	/* 🌟 RESPONSIVE ANIMATIONS */
	@media (max-width: 768px) {
		.animate-float,
		.animate-float-delayed {
			animation-duration: 4s;
		}
		
		.magnetic-button:hover {
			transform: scale(1.02) translateY(-2px);
		}
		
		.hover-lift:hover {
			transform: translateY(-5px) scale(1.01);
		}
	}
	
	/* 🎨 DARK MODE IMPROVEMENTS */
	@media (prefers-color-scheme: dark) {
		.glass-morphism {
			background: rgba(0, 0, 0, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.1);
		}
		
		.text-glow {
			text-shadow: 
				0 0 10px rgba(96, 165, 250, 0.8),
				0 0 20px rgba(167, 139, 250, 0.6),
				0 0 30px rgba(244, 114, 182, 0.4);
		}
	}
	
	/* 🚀 PERFORMANCE OPTIMIZATIONS */
	.will-change-transform {
		will-change: transform;
	}
	
	.will-change-opacity {
		will-change: opacity;
	}
	
	.gpu-accelerated {
		transform: translateZ(0);
		backface-visibility: hidden;
		perspective: 1000px;
	}
	
	/* 🎪 SCROLL BEHAVIOR */
	html {
		scroll-behavior: smooth;
	}
	
	/* 🌈 SELECTION STYLING */
	::selection {
		background: linear-gradient(45deg, #3b82f6, #8b5cf6);
		color: white;
	}
	
	::-moz-selection {
		background: linear-gradient(45deg, #3b82f6, #8b5cf6);
		color: white;
	}
</style> 