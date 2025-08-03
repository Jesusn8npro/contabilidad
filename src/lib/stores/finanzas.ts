import { writable, derived, get } from 'svelte/store';
import { supabase } from '$lib/supabase/cliente';
import type { 
	Negocio, 
	MovimientoFinanciero, 
	Categoria, 
	FormularioNegocio, 
	FormularioMovimiento,
	EstadisticasDashboard,
	FiltrosMovimientos
} from '$lib/tipos/app';
import { user } from './auth';

// Stores principales
export const negocios = writable<Negocio[]>([]);
export const negocioActual = writable<Negocio | null>(null);
export const movimientosFinancieros = writable<MovimientoFinanciero[]>([]);
export const categorias = writable<Categoria[]>([]);

// Estados de carga
export const cargandoNegocios = writable<boolean>(false);
export const cargandoMovimientos = writable<boolean>(false);
export const cargandoCategorias = writable<boolean>(false);
export const errorFinanzas = writable<string | null>(null);

// Filtros
export const filtrosMovimientos = writable<FiltrosMovimientos>({});

// Store derivado para estadísticas financieras
export const estadisticasFinancieras = derived(
	[movimientosFinancieros, filtrosMovimientos],
	([movimientos, filtros]) => {
		let movimientosFiltrados = movimientos;

		// Aplicar filtros
		if (filtros.tipo) {
			movimientosFiltrados = movimientosFiltrados.filter(m => m.tipo_movimiento === filtros.tipo);
		}
		if (filtros.negocio_id) {
			movimientosFiltrados = movimientosFiltrados.filter(m => m.negocio_id === filtros.negocio_id);
		}
		if (filtros.fecha_desde) {
			movimientosFiltrados = movimientosFiltrados.filter(m => m.fecha_movimiento >= filtros.fecha_desde!);
		}
		if (filtros.fecha_hasta) {
			movimientosFiltrados = movimientosFiltrados.filter(m => m.fecha_movimiento <= filtros.fecha_hasta!);
		}

		const totalIngresos = movimientosFiltrados
			.filter(m => m.tipo_movimiento === 'ingreso')
			.reduce((sum, m) => sum + m.monto, 0);

		const totalGastos = movimientosFiltrados
			.filter(m => m.tipo_movimiento === 'gasto')
			.reduce((sum, m) => sum + m.monto, 0);

		const balance = totalIngresos - totalGastos;

		return {
			totalIngresos,
			totalGastos,
			balance,
			totalMovimientos: movimientosFiltrados.length
		};
	}
);

// Store derivado para resumen por negocio
export const resumenPorNegocio = derived(
	[negocios, movimientosFinancieros],
	([listanegocios, movimientos]) => {
		return listanegocios.map(negocio => {
			const movimientosNegocio = movimientos.filter(m => m.negocio_id === negocio.id);
			
			const ingresos = movimientosNegocio
				.filter(m => m.tipo_movimiento === 'ingreso')
				.reduce((sum, m) => sum + m.monto, 0);

			const gastos = movimientosNegocio
				.filter(m => m.tipo_movimiento === 'gasto')
				.reduce((sum, m) => sum + m.monto, 0);

			return {
				...negocio,
				totalIngresos: ingresos,
				totalGastos: gastos,
				balance: ingresos - gastos,
				totalMovimientos: movimientosNegocio.length
			};
		});
	}
);

/**
 * Cargar todos los negocios del usuario
 */
export const cargarNegocios = async () => {
	const usuario = get(user);
	if (!usuario) return;

	cargandoNegocios.set(true);
	errorFinanzas.set(null);

	try {
		const { data, error } = await supabase
			.from('negocios')
			.select('*')
			.eq('usuario_id', usuario.id)
			.order('fecha_creacion', { ascending: false });

		if (error) {
			errorFinanzas.set(error.message);
			return { success: false, error: error.message };
		}

		negocios.set(data || []);
		return { success: true, data };
	} catch (error) {
		const mensaje = 'Error al cargar negocios';
		errorFinanzas.set(mensaje);
		return { success: false, error: mensaje };
	} finally {
		cargandoNegocios.set(false);
	}
};

/**
 * Crear un nuevo negocio
 */
export const crearNegocio = async (datosNegocio: FormularioNegocio) => {
	const usuario = get(user);
	if (!usuario) return { success: false, error: 'Usuario no autenticado' };

	errorFinanzas.set(null);

	try {
		const nuevoNegocio = {
			usuario_id: usuario.id,
			nombre: datosNegocio.nombre,
			tipo_negocio: datosNegocio.tipo_negocio,
			descripcion: datosNegocio.descripcion,
			moneda: datosNegocio.moneda
		};

		const { data, error } = await supabase
			.from('negocios')
			.insert([nuevoNegocio])
			.select()
			.single();

		if (error) {
			errorFinanzas.set(error.message);
			return { success: false, error: error.message };
		}

		// Actualizar store local
		negocios.update(lista => [data, ...lista]);
		
		return { success: true, data };
	} catch (error) {
		const mensaje = 'Error al crear negocio';
		errorFinanzas.set(mensaje);
		return { success: false, error: mensaje };
	}
};

/**
 * Cargar movimientos financieros
 */
export const cargarMovimientos = async (negocioId?: string) => {
	const usuario = get(user);
	if (!usuario) return;

	cargandoMovimientos.set(true);
	errorFinanzas.set(null);

	try {
		let query = supabase
			.from('movimientos_financieros')
			.select(`
				*,
				negocio:negocios(nombre),
				categoria:categorias(nombre, color)
			`);

		// Si se especifica un negocio, filtrar por él
		if (negocioId) {
			query = query.eq('negocio_id', negocioId);
		} else {
			// Si no, obtener todos los movimientos de los negocios del usuario
			const { data: negociosUsuario } = await supabase
				.from('negocios')
				.select('id')
				.eq('usuario_id', usuario.id);

			if (negociosUsuario && negociosUsuario.length > 0) {
				const idsNegocios = negociosUsuario.map(n => n.id);
				query = query.in('negocio_id', idsNegocios);
			}
		}

		const { data, error } = await query.order('fecha_movimiento', { ascending: false });

		if (error) {
			errorFinanzas.set(error.message);
			return { success: false, error: error.message };
		}

		movimientosFinancieros.set(data || []);
		return { success: true, data };
	} catch (error) {
		const mensaje = 'Error al cargar movimientos';
		errorFinanzas.set(mensaje);
		return { success: false, error: mensaje };
	} finally {
		cargandoMovimientos.set(false);
	}
};

/**
 * Crear un nuevo movimiento financiero
 */
export const crearMovimiento = async (datosMovimiento: FormularioMovimiento) => {
	errorFinanzas.set(null);

	try {
		const nuevoMovimiento = {
			negocio_id: datosMovimiento.negocio_id || get(negocioActual)?.id,
			tipo_movimiento: datosMovimiento.tipo_movimiento,
			categoria_id: datosMovimiento.categoria_id,
			monto: datosMovimiento.monto,
			descripcion: datosMovimiento.descripcion,
			fecha_movimiento: datosMovimiento.fecha_movimiento,
			metodo_pago: datosMovimiento.metodo_pago
		};

		const { data, error } = await supabase
			.from('movimientos_financieros')
			.insert([nuevoMovimiento])
			.select(`
				*,
				negocio:negocios(nombre),
				categoria:categorias(nombre, color)
			`)
			.single();

		if (error) {
			errorFinanzas.set(error.message);
			return { success: false, error: error.message };
		}

		// Actualizar store local
		movimientosFinancieros.update(lista => [data, ...lista]);
		
		return { success: true, data };
	} catch (error) {
		const mensaje = 'Error al crear movimiento';
		errorFinanzas.set(mensaje);
		return { success: false, error: mensaje };
	}
};

/**
 * Cargar categorías del usuario
 */
export const cargarCategorias = async () => {
	const usuario = get(user);
	if (!usuario) return;

	cargandoCategorias.set(true);
	errorFinanzas.set(null);

	try {
		const { data, error } = await supabase
			.from('categorias')
			.select('*')
			.eq('usuario_id', usuario.id)
			.order('tipo', { ascending: true })
			.order('nombre', { ascending: true });

		if (error) {
			errorFinanzas.set(error.message);
			return { success: false, error: error.message };
		}

		categorias.set(data || []);
		return { success: true, data };
	} catch (error) {
		const mensaje = 'Error al cargar categorías';
		errorFinanzas.set(mensaje);
		return { success: false, error: mensaje };
	} finally {
		cargandoCategorias.set(false);
	}
};

/**
 * Obtener estadísticas del dashboard
 */
export const obtenerEstadisticasDashboard = async (): Promise<EstadisticasDashboard | null> => {
	const usuario = get(user);
	if (!usuario) return null;

	try {
		// Obtener estadísticas usando la función SQL
		const { data, error } = await supabase
			.rpc('obtener_estadisticas_dashboard', { usuario_uuid: usuario.id });

		if (error) {
			console.error('Error al obtener estadísticas:', error);
			return null;
		}

		return data as EstadisticasDashboard;
	} catch (error) {
		console.error('Error al obtener estadísticas:', error);
		return null;
	}
};

/**
 * Obtener datos para gráficos financieros
 */
export const obtenerDatosGraficos = async (tipoGrafico: 'ingresos-gastos' | 'por-categoria' | 'tendencia') => {
	const usuario = get(user);
	if (!usuario) return null;

	try {
		switch (tipoGrafico) {
			case 'ingresos-gastos':
				return await obtenerGraficoIngresosGastos();
			case 'por-categoria':
				return await obtenerGraficoPorCategoria();
			case 'tendencia':
				return await obtenerGraficoTendencia();
			default:
				return null;
		}
	} catch (error) {
		console.error('Error al obtener datos de gráfico:', error);
		return null;
	}
};

/**
 * Obtener datos para gráfico de ingresos vs gastos
 */
const obtenerGraficoIngresosGastos = async () => {
	const movimientos = get(movimientosFinancieros);
	
	const totalIngresos = movimientos
		.filter(m => m.tipo_movimiento === 'ingreso')
		.reduce((sum, m) => sum + m.monto, 0);

	const totalGastos = movimientos
		.filter(m => m.tipo_movimiento === 'gasto')
		.reduce((sum, m) => sum + m.monto, 0);

	return {
		labels: ['Ingresos', 'Gastos'],
		datasets: [{
			label: 'Monto',
			data: [totalIngresos, totalGastos],
			backgroundColor: ['#22c55e', '#ef4444'],
			borderColor: ['#16a34a', '#dc2626'],
			borderWidth: 2
		}]
	};
};

/**
 * Obtener datos para gráfico por categoría
 */
const obtenerGraficoPorCategoria = async () => {
	const movimientos = get(movimientosFinancieros);
	const listaCategories = get(categorias);
	
	const datosPorCategoria = listaCategories.map(categoria => {
		const totalCategoria = movimientos
			.filter(m => m.categoria_id === categoria.id)
			.reduce((sum, m) => sum + m.monto, 0);
		
		return {
			categoria: categoria.nombre,
			total: totalCategoria,
			color: categoria.color
		};
	}).filter(item => item.total > 0);

	return {
		labels: datosPorCategoria.map(item => item.categoria),
		datasets: [{
			label: 'Monto por Categoría',
			data: datosPorCategoria.map(item => item.total),
			backgroundColor: datosPorCategoria.map(item => item.color),
			borderWidth: 1
		}]
	};
};

/**
 * Obtener datos para gráfico de tendencia mensual
 */
const obtenerGraficoTendencia = async () => {
	const movimientos = get(movimientosFinancieros);
	
	// Agrupar por mes
	const datosPorMes: Record<string, { ingresos: number; gastos: number }> = {};
	
	movimientos.forEach(movimiento => {
		const mes = movimiento.fecha_movimiento.substring(0, 7); // YYYY-MM
		
		if (!datosPorMes[mes]) {
			datosPorMes[mes] = { ingresos: 0, gastos: 0 };
		}
		
		if (movimiento.tipo_movimiento === 'ingreso') {
			datosPorMes[mes].ingresos += movimiento.monto;
		} else {
			datosPorMes[mes].gastos += movimiento.monto;
		}
	});

	const meses = Object.keys(datosPorMes).sort();
	
	return {
		labels: meses.map(mes => {
			const [año, numMes] = mes.split('-');
			const fecha = new Date(parseInt(año), parseInt(numMes) - 1);
			return fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
		}),
		datasets: [
			{
				label: 'Ingresos',
				data: meses.map(mes => datosPorMes[mes].ingresos),
				borderColor: '#22c55e',
				backgroundColor: 'rgba(34, 197, 94, 0.1)',
				borderWidth: 2,
				fill: true
			},
			{
				label: 'Gastos',
				data: meses.map(mes => datosPorMes[mes].gastos),
				borderColor: '#ef4444',
				backgroundColor: 'rgba(239, 68, 68, 0.1)',
				borderWidth: 2,
				fill: true
			}
		]
	};
}; 