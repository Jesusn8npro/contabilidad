import { z } from 'zod';

// Esquemas de validación

export const esquemaEmail = z
	.string()
	.min(1, 'El email es requerido')
	.email('Formato de email inválido');

export const esquemaPassword = z
	.string()
	.min(6, 'La contraseña debe tener al menos 6 caracteres')
	.max(100, 'La contraseña no puede exceder 100 caracteres');

export const esquemaTextoRequerido = z
	.string()
	.min(1, 'Este campo es requerido')
	.trim();

export const esquemaTextoOpcional = z
	.string()
	.optional()
	.transform(val => val?.trim() || undefined);

export const esquemaNumeroPositivo = z
	.number()
	.positive('Debe ser un número positivo')
	.finite('Debe ser un número válido');

export const esquemaFecha = z
	.string()
	.min(1, 'La fecha es requerida')
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');

// Esquema para proyectos
export const esquemaProyecto = z.object({
	nombre: esquemaTextoRequerido
		.min(2, 'El nombre debe tener al menos 2 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),
	descripcion: esquemaTextoOpcional,
	color: esquemaTextoRequerido
});

// Esquema para tareas
export const esquemaTarea = z.object({
	titulo: esquemaTextoRequerido
		.min(2, 'El título debe tener al menos 2 caracteres')
		.max(200, 'El título no puede exceder 200 caracteres'),
	descripcion: esquemaTextoOpcional,
	prioridad: z.enum(['baja', 'media', 'alta', 'urgente'], {
		errorMap: () => ({ message: 'Selecciona una prioridad válida' })
	}),
	fecha_limite: z.string().optional()
});

// Esquema para negocios
export const esquemaNegocio = z.object({
	nombre: esquemaTextoRequerido
		.min(2, 'El nombre debe tener al menos 2 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),
	tipo_negocio: z.enum(['servicio', 'producto', 'mixto', 'inversion', 'freelance', 'otro'], {
		errorMap: () => ({ message: 'Selecciona un tipo de negocio válido' })
	}),
	descripcion: esquemaTextoOpcional,
	moneda: esquemaTextoRequerido
		.length(3, 'El código de moneda debe tener 3 caracteres')
		.toUpperCase()
});

// Esquema para movimientos financieros
export const esquemaMovimiento = z.object({
	tipo_movimiento: z.enum(['ingreso', 'gasto'], {
		errorMap: () => ({ message: 'Selecciona un tipo de movimiento válido' })
	}),
	monto: esquemaNumeroPositivo,
	descripcion: esquemaTextoRequerido
		.min(2, 'La descripción debe tener al menos 2 caracteres')
		.max(500, 'La descripción no puede exceder 500 caracteres'),
	fecha_movimiento: esquemaFecha,
	categoria_id: z.string().uuid('ID de categoría inválido').optional(),
	metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque', 'digital', 'otro']).optional()
});

// Esquema para login
export const esquemaLogin = z.object({
	email: esquemaEmail,
	password: esquemaPassword
});

// Esquema para registro
export const esquemaRegistro = z.object({
	email: esquemaEmail,
	password: esquemaPassword,
	confirmarPassword: esquemaPassword,
	nombreCompleto: esquemaTextoOpcional
}).refine((data) => data.password === data.confirmarPassword, {
	message: 'Las contraseñas no coinciden',
	path: ['confirmarPassword']
});

// Funciones de validación

/**
 * Validar email
 */
export const validarEmail = (email: string): { valido: boolean; error?: string } => {
	try {
		esquemaEmail.parse(email);
		return { valido: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { valido: false, error: error.errors[0].message };
		}
		return { valido: false, error: 'Error de validación' };
	}
};

/**
 * Validar contraseña
 */
export const validarPassword = (password: string): { valido: boolean; error?: string } => {
	try {
		esquemaPassword.parse(password);
		return { valido: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return { valido: false, error: error.errors[0].message };
		}
		return { valido: false, error: 'Error de validación' };
	}
};

/**
 * Validar formulario completo
 */
export const validarFormulario = <T>(
	esquema: z.ZodSchema<T>, 
	datos: unknown
): { valido: boolean; datos?: T; errores?: Record<string, string> } => {
	try {
		const datosValidados = esquema.parse(datos);
		return { valido: true, datos: datosValidados };
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errores: Record<string, string> = {};
			error.errors.forEach((err) => {
				const campo = err.path.join('.');
				errores[campo] = err.message;
			});
			return { valido: false, errores };
		}
		return { valido: false, errores: { general: 'Error de validación' } };
	}
};

/**
 * Validar URL
 */
export const validarURL = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

/**
 * Validar que un string no esté vacío después de trim
 */
export const esTextoValido = (texto: string): boolean => {
	return texto.trim().length > 0;
};

/**
 * Validar que un número esté en un rango
 */
export const estaEnRango = (numero: number, min: number, max: number): boolean => {
	return numero >= min && numero <= max;
};

/**
 * Validar formato de fecha
 */
export const esFechaValida = (fecha: string): boolean => {
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	if (!regex.test(fecha)) return false;
	
	const fechaObj = new Date(fecha);
	return fechaObj instanceof Date && !isNaN(fechaObj.getTime());
};

/**
 * Validar que una fecha no sea pasada
 */
export const noEsFechaPasada = (fecha: string): boolean => {
	if (!esFechaValida(fecha)) return false;
	
	const fechaObj = new Date(fecha);
	const hoy = new Date();
	hoy.setHours(0, 0, 0, 0);
	
	return fechaObj >= hoy;
};

/**
 * Limpiar y validar número de teléfono (formato simple)
 */
export const validarTelefono = (telefono: string): { valido: boolean; telefonoLimpio?: string } => {
	const telefonoLimpio = telefono.replace(/\D/g, '');
	
	if (telefonoLimpio.length >= 7 && telefonoLimpio.length <= 15) {
		return { valido: true, telefonoLimpio };
	}
	
	return { valido: false };
};

/**
 * Validar código de moneda ISO
 */
export const esCodigoMonedaValido = (codigo: string): boolean => {
	const codigosValidos = [
		'USD', 'EUR', 'GBP', 'JPY', 'ARS', 'CLP', 'COP', 
		'MXN', 'PEN', 'BRL', 'CAD', 'AUD', 'CHF', 'CNY'
	];
	
	return codigosValidos.includes(codigo.toUpperCase());
}; 