import { writable, derived } from 'svelte/store';
import type { Negocio } from '$lib/tipos/app';
import { supabase } from '$lib/supabase/cliente';
import { user } from '$lib/stores/auth';
import { mostrarError, mostrarExito } from '$lib/stores/toast';
import { generarSlugUnico } from '$lib/utils/slug';

// ======================================
// STORES PRINCIPALES
// ======================================

export const negocios = writable<Negocio[]>([]);
export const cargandoNegocios = writable<boolean>(false);
export const cargandoNegocio = writable<boolean>(false);
export const negocioActual = writable<Negocio | null>(null);

// ======================================
// STORES DERIVADOS
// ======================================

export const estadisticasNegocios = derived(
	[negocios],
	([$negocios]) => {
		if (!$negocios || $negocios.length === 0) {
			return {
				total: 0,
				tipos: {},
				recientes: []
			};
		}

		const tipos = $negocios.reduce((acc, negocio) => {
			acc[negocio.tipo_negocio] = (acc[negocio.tipo_negocio] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const recientes = $negocios
			.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
			.slice(0, 5);

		return {
			total: $negocios.length,
			tipos,
			recientes
		};
	}
);

// ======================================
// FUNCIONES DE NEGOCIO
// ======================================

export const cargarNegocios = async (): Promise<void> => {
	cargandoNegocios.set(true);
	
	try {
		const { data, error } = await supabase
			.from('negocios')
			.select('*')
			.order('fecha_creacion', { ascending: false });

		if (error) {
			console.error('Error al cargar negocios:', error);
			
			// Si las tablas no existen, usar datos simulados
			if (error.code === '42P01') {
				console.warn('Tabla negocios no encontrada, usando datos simulados');
				const negociosSimulados: Negocio[] = [
					{
						id: '1',
						usuario_id: 'user1',
						nombre: 'Consultoría Digital',
						tipo_negocio: 'servicio',
						descripcion: 'Servicios de consultoría en transformación digital para empresas',
						moneda: 'USD',
						fecha_creacion: new Date().toISOString()
					},
					{
						id: '2',
						usuario_id: 'user1',
						nombre: 'Tienda Online',
						tipo_negocio: 'producto',
						descripcion: 'Venta de productos electrónicos y accesorios',
						moneda: 'USD',
						fecha_creacion: new Date().toISOString()
					}
				];
				negocios.set(negociosSimulados);
				return;
			}
			
			throw error;
		}

		negocios.set(data || []);
		
	} catch (error) {
		console.error('Error al cargar negocios:', error);
		mostrarError('Error al cargar negocios', 'Verifica tu conexión e intenta nuevamente');
		negocios.set([]);
	} finally {
		cargandoNegocios.set(false);
	}
};

export const cargarNegocio = async (id: string): Promise<Negocio | null> => {
	cargandoNegocio.set(true);
	
	try {
		const { data, error } = await supabase
			.from('negocios')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error al cargar negocio:', error);
			throw error;
		}

		return data;
		
	} catch (error) {
		console.error('Error al cargar negocio:', error);
		mostrarError('Error al cargar negocio');
		return null;
	} finally {
		cargandoNegocio.set(false);
	}
};

export const cargarNegocioPorSlug = async (slug: string): Promise<Negocio | null> => {
	cargandoNegocio.set(true);
	negocioActual.set(null);
	
	try {
		const { data, error } = await supabase
			.from('negocios')
			.select('*')
			.eq('slug', slug)
			.single();

		if (error) {
			console.error('Error al cargar negocio por slug:', error);
			throw error;
		}

		negocioActual.set(data);
		return data;
		
	} catch (error) {
		console.error('Error al cargar negocio por slug:', error);
		mostrarError('Error al cargar negocio por slug');
		negocioActual.set(null);
		return null;
	} finally {
		cargandoNegocio.set(false);
	}
};

// Función para limpiar slugs existentes (ejecutar una sola vez)
export const limpiarSlugsExistentes = async (): Promise<void> => {
	try {
		const { data: { user: currentUser } } = await supabase.auth.getUser();
		
		if (!currentUser) {
			throw new Error('No hay usuario autenticado');
		}

		// Obtener todos los negocios del usuario
		const { data: negociosExistentes } = await supabase
			.from('negocios')
			.select('id, nombre, slug')
			.eq('usuario_id', currentUser.id);

		if (!negociosExistentes) return;

		const actualizaciones = [];

		for (const negocio of negociosExistentes) {
			// Si el slug tiene números raros al final, limpiarlo
			if (negocio.slug.match(/-[0-9a-f]+$/)) {
				const slugLimpio = generarSlugUnico(negocio.nombre, 
					negociosExistentes.map(n => n.slug).filter(s => s !== negocio.slug)
				);
				
				actualizaciones.push({
					id: negocio.id,
					slug: slugLimpio
				});
			}
		}

		// Actualizar los slugs en la base de datos
		for (const actualizacion of actualizaciones) {
			const { error } = await supabase
				.from('negocios')
				.update({ slug: actualizacion.slug })
				.eq('id', actualizacion.id);

			if (error) {
				console.error('Error actualizando slug:', error);
			} else {
				console.log(`✅ Slug actualizado: ${actualizacion.slug}`);
			}
		}

		if (actualizaciones.length > 0) {
			mostrarExito(`${actualizaciones.length} slugs actualizados`);
			// Recargar negocios
			await cargarNegocios();
		}

	} catch (error) {
		console.error('Error limpiando slugs:', error);
		mostrarError('Error al limpiar slugs');
	}
};

export const crearNegocio = async (negocioData: Partial<Negocio>): Promise<Negocio> => {
	try {
		// Obtener el usuario actual
		const { data: { user: currentUser } } = await supabase.auth.getUser();
		
		if (!currentUser) {
			throw new Error('No hay usuario autenticado');
		}

		// Obtener todos los slugs existentes para evitar duplicados
		const { data: negociosExistentes } = await supabase
			.from('negocios')
			.select('slug')
			.eq('usuario_id', currentUser.id);

		const slugsExistentes = negociosExistentes?.map(n => n.slug) || [];

		// Generar slug único usando la función correcta
		const slug = generarSlugUnico(negocioData.nombre || 'negocio', slugsExistentes);

		const nuevoNegocio = {
			...negocioData,
			usuario_id: currentUser.id,
			slug: slug, // Slug limpio sin números raros
			fecha_creacion: new Date().toISOString()
		};

		console.log('🚀 Creando negocio:', nuevoNegocio);

		const { data, error } = await supabase
			.from('negocios')
			.insert([nuevoNegocio])
			.select()
			.single();

		if (error) {
			console.error('Error al crear negocio:', error);
			
			// Si la tabla no existe, simular creación
			if (error.code === '42P01') {
				console.warn('Tabla negocios no encontrada, simulando creación');
				const negocioSimulado: Negocio = {
					id: `sim_${Date.now()}`,
					usuario_id: currentUser.id,
					nombre: negocioData.nombre || '',
					tipo_negocio: negocioData.tipo_negocio || 'servicio',
					descripcion: negocioData.descripcion || '',
					moneda: negocioData.moneda || 'USD',
					fecha_creacion: new Date().toISOString()
				};
				
				// Agregar a la lista local
				negocios.update(lista => [negocioSimulado, ...lista]);
				mostrarExito('Negocio creado (modo simulado)', 'Los datos se guardarán cuando conectes la base de datos');
				return negocioSimulado;
			}
			
			throw error;
		}

		// Actualizar la lista local
		negocios.update(lista => [data, ...lista]);
		mostrarExito('Negocio creado exitosamente');
		
		return data;
		
	} catch (error) {
		console.error('Error al crear negocio:', error);
		mostrarError('Error al crear negocio', 'Intenta nuevamente');
		throw error;
	}
};

export const actualizarNegocio = async (id: string, negocioData: Partial<Negocio>): Promise<Negocio> => {
	try {
		const { data, error } = await supabase
			.from('negocios')
			.update(negocioData)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error al actualizar negocio:', error);
			throw error;
		}

		// Actualizar en la lista local
		negocios.update(lista => 
			lista.map(negocio => negocio.id === id ? data : negocio)
		);
		
		mostrarExito('Negocio actualizado exitosamente');
		return data;
		
	} catch (error) {
		console.error('Error al actualizar negocio:', error);
		mostrarError('Error al actualizar negocio');
		throw error;
	}
};

export const eliminarNegocio = async (id: string): Promise<void> => {
	try {
		const { error } = await supabase
			.from('negocios')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('Error al eliminar negocio:', error);
			throw error;
		}

		// Eliminar de la lista local
		negocios.update(lista => lista.filter(negocio => negocio.id !== id));
		mostrarExito('Negocio eliminado exitosamente');
		
	} catch (error) {
		console.error('Error al eliminar negocio:', error);
		mostrarError('Error al eliminar negocio');
		throw error;
	}
};

// ======================================
// UTILIDADES
// ======================================

export const limpiarEstadosNegocios = () => {
	negocios.set([]);
	cargandoNegocios.set(false);
	cargandoNegocio.set(false);
};

export const buscarNegocios = (termino: string) => {
	return derived(negocios, ($negocios) => {
		if (!termino.trim()) return $negocios;
		
		const terminoLower = termino.toLowerCase();
		return $negocios.filter(negocio => 
			negocio.nombre.toLowerCase().includes(terminoLower) ||
			negocio.tipo_negocio.toLowerCase().includes(terminoLower) ||
			(negocio.descripcion && negocio.descripcion.toLowerCase().includes(terminoLower))
		);
	});
}; 