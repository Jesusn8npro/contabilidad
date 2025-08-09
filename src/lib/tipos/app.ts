// Tipos principales de la aplicación

// Usuario
export interface Usuario {
	id: string;
	email: string;
	nombre_completo?: string;
	avatar_url?: string;
	created_at: string;
}

// Proyectos
export interface Proyecto {
	id: string;
	usuario_id: string;
	nombre: string;
	slug: string;
	descripcion?: string;
	color: string;
	estado: EstadoProyecto;
	progreso: number;
	fecha_inicio: string;
	fecha_limite?: string | null;
	fecha_creacion: string;
	fecha_actualizacion: string;
}

export type EstadoProyecto = 'activo' | 'pausado' | 'completado' | 'archivado';

// Opciones de estados para formularios
export const ESTADOS_PROYECTO = [
	{ valor: 'activo' as EstadoProyecto, etiqueta: 'Activo' },
	{ valor: 'pausado' as EstadoProyecto, etiqueta: 'Pausado' },
	{ valor: 'completado' as EstadoProyecto, etiqueta: 'Completado' },
	{ valor: 'archivado' as EstadoProyecto, etiqueta: 'Archivado' }
] as const;

export const COLORES_PROYECTO = [
	{ valor: 'blue', nombre: 'Azul', color: '#3b82f6' },
	{ valor: 'green', nombre: 'Verde', color: '#22c55e' },
	{ valor: 'purple', nombre: 'Morado', color: '#a855f7' },
	{ valor: 'red', nombre: 'Rojo', color: '#ef4444' },
	{ valor: 'yellow', nombre: 'Amarillo', color: '#eab308' },
	{ valor: 'pink', nombre: 'Rosa', color: '#ec4899' },
	{ valor: 'indigo', nombre: 'Índigo', color: '#6366f1' },
	{ valor: 'gray', nombre: 'Gris', color: '#6b7280' }
] as const;

// Tareas
export interface Tarea {
	id: string;
	proyecto_id?: string | null; // Opcional: para tareas de proyectos
	negocio_id?: string | null;  // Opcional: para tareas directas de negocios
	usuario_id: string;
	titulo: string;
	descripcion?: string;
	estado: EstadoTarea;
	prioridad: PrioridadTarea;
	fecha_limite?: string;
	fecha_inicio?: string;
	fecha_completado?: string;
	fecha_creacion: string;
	fecha_actualizacion: string;
	asignado_a?: string;
	orden: number;
	columna?: string; // Para Kanban
	tiempo_estimado_horas?: number;
	tiempo_real_horas?: number;
	etiquetas?: string[];
	adjuntos_urls?: string[];
	
	// Campos relacionales para joins
	proyectos?: { nombre: string; slug: string };
	negocios?: { nombre: string };
}

export type EstadoTarea = 'por-hacer' | 'en-progreso' | 'en-revision' | 'completada' | 'pausada';

export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'urgente';

export const ESTADOS_TAREA: Record<EstadoTarea, { label: string; color: string }> = {
	'por-hacer': { label: 'Por Hacer', color: 'estado-por-hacer' },
	'en-progreso': { label: 'En Progreso', color: 'estado-en-progreso' },
	'en-revision': { label: 'En Revisión', color: 'estado-en-revision' },
	'completada': { label: 'Completada', color: 'estado-completada' },
	'pausada': { label: 'Pausada', color: 'estado-pausada' }
};

export const PRIORIDADES_TAREA: Record<PrioridadTarea, { label: string; color: string }> = {
	'baja': { label: 'Baja', color: 'text-gray-500' },
	'media': { label: 'Media', color: 'text-blue-500' },
	'alta': { label: 'Alta', color: 'text-orange-500' },
	'urgente': { label: 'Urgente', color: 'text-red-500' }
};

// Negocios
export interface Negocio {
	id: string;
	usuario_id: string;
	nombre: string;
	tipo_negocio: TipoNegocio;
	descripcion?: string;
	moneda: string;
	slug?: string;
	
	// 📞 INFORMACIÓN DE CONTACTO
	logo_url?: string;
	website?: string;
	telefono?: string;
	whatsapp?: string; // NUEVO CAMPO AGREGADO
	email?: string;
	direccion?: string;
	
	// 📊 CONFIGURACIÓN FISCAL  
	numero_documento?: string;
	regimen_fiscal?: string;
	
	// 📈 METAS FINANCIERAS
	meta_ingresos_mensual?: number;
	meta_gastos_mensual?: number;
	
	// ⚙️ ESTADO
	activo?: boolean;
	fecha_creacion: string;
	fecha_actualizacion?: string;
}

export type TipoNegocio = 'servicio' | 'producto' | 'mixto' | 'inversion' | 'freelance' | 'consultoria' | 'ecommerce' | 'otro';

export const TIPOS_NEGOCIO: Record<TipoNegocio, string> = {
	'servicio': 'Servicios',
	'producto': 'Productos',
	'mixto': 'Mixto (Servicios y Productos)',
	'inversion': 'Inversiones',
	'freelance': 'Freelance',
	'consultoria': 'Consultoría',
	'ecommerce': 'E-commerce',
	'otro': 'Otro'
};

// Movimientos financieros
export interface MovimientoFinanciero {
	id: string;
	negocio_id: string;
	categoria_id?: string;
	tipo_movimiento: 'ingreso' | 'gasto';
	monto: number;
	descripcion: string;
	fecha_movimiento: string;
	fecha_creacion: string;
	metodo_pago?: MetodoPago;
	comprobante_url?: string;
	notas?: string;
}

export type TipoMovimiento = 'ingreso' | 'gasto';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' | 'otro';

export const METODOS_PAGO: Record<MetodoPago, string> = {
	'efectivo': 'Efectivo',
	'tarjeta': 'Tarjeta',
	'transferencia': 'Transferencia',
	'cheque': 'Cheque',
	'otro': 'Otro'
};

// Categorías
export interface Categoria {
	id: string;
	usuario_id: string;
	nombre: string;
	tipo_categoria: 'ingreso' | 'gasto';
	color: string;
	icono?: string;
	fecha_creacion: string;
}

// Tipos para formularios
export interface FormularioProyecto {
	nombre: string;
	descripcion?: string;
	color: string;
	estado: EstadoProyecto;
	fecha_inicio: string;
	fecha_limite?: string;
}

export interface FormularioTarea {
	titulo: string;
	descripcion?: string;
	prioridad: PrioridadTarea;
	fecha_limite?: string;
	asignado_a?: string;
}

export interface FormularioNegocio {
	nombre: string;
	tipo_negocio: TipoNegocio;
	descripcion?: string;
	moneda: string;
}

export interface FormularioMovimiento {
	tipo_movimiento: TipoMovimiento;
	monto: number;
	descripcion: string;
	categoria_id?: string;
	fecha_movimiento: string;
	metodo_pago?: MetodoPago;
}

// Tipos para estadísticas del dashboard
export interface EstadisticasDashboard {
	total_ingresos_mes: number;
	total_gastos_mes: number;
	total_proyectos_activos: number;
	total_tareas_pendientes: number;
	balance_mes: number;
}

export interface DatosGrafico {
	labels: string[];
	datasets: Array<{
		label: string;
		data: number[];
		backgroundColor?: string | string[];
		borderColor?: string;
	}>;
}

// Gastos Personales
export interface GastoPersonal {
	id: string;
	usuario_id: string;
	monto: number;
	descripcion: string;
	fecha_gasto: string;
	categoria_id?: string | null;
	metodo_pago: string;
	ubicacion?: string | null;
	proveedor?: string | null;
	tipo_gasto_personal: string;
	es_recurrente: boolean;
	frecuencia_recurrencia?: string | null;
	fecha_proxima_recurrencia?: string | null;
	comprobante_url?: string | null;
	numero_factura?: string | null;
	notas?: string | null;
	impacta_negocios: boolean;
	negocio_relacionado_id?: string | null;
	aprobado: boolean;
	justificacion_requerida: boolean;
	fecha_creacion: string;
}

// Notificaciones
export interface Notificacion {
	id: string;
	usuario_id: string;
	titulo: string;
	mensaje: string;
	tipo: TipoNotificacion;
	leida: boolean;
	fecha_creacion: string;
	accion_url?: string;
}

export type TipoNotificacion = 'info' | 'exito' | 'advertencia' | 'error';

// Estados de carga
export interface EstadoCarga {
	cargando: boolean;
	error: string | null;
}

// Filtros
export interface FiltrosTareas {
	estado?: EstadoTarea;
	prioridad?: PrioridadTarea;
	asignado_a?: string;
	fecha_desde?: string;
	fecha_hasta?: string;
}

export interface FiltrosMovimientos {
	tipo?: TipoMovimiento;
	categoria_id?: string;
	fecha_desde?: string;
	fecha_hasta?: string;
	negocio_id?: string;
} 