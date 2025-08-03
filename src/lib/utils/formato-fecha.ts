import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow, parseISO, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatear fecha a texto legible en español
 */
export const formatearFecha = (fecha: string | Date, formato = 'dd/MM/yyyy'): string => {
	try {
		const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
		return format(fechaObj, formato, { locale: es });
	} catch (error) {
		return 'Fecha inválida';
	}
};

/**
 * Formatear fecha a texto corto (ej: "3 ene")
 */
export const formatearFechaCorta = (fecha: string | Date): string => {
	return formatearFecha(fecha, 'd MMM');
};

/**
 * Formatear fecha completa (ej: "3 de enero de 2024")
 */
export const formatearFechaCompleta = (fecha: string | Date): string => {
	return formatearFecha(fecha, "d 'de' MMMM 'de' yyyy");
};

/**
 * Formatear fecha y hora (ej: "3 ene, 14:30")
 */
export const formatearFechaHora = (fecha: string | Date): string => {
	return formatearFecha(fecha, 'd MMM, HH:mm');
};

/**
 * Formatear fecha relativa (ej: "hace 2 días", "en 3 horas")
 */
export const formatearFechaRelativa = (fecha: string | Date): string => {
	try {
		const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
		
		if (isToday(fechaObj)) {
			return 'Hoy';
		}
		
		if (isYesterday(fechaObj)) {
			return 'Ayer';
		}
		
		if (isTomorrow(fechaObj)) {
			return 'Mañana';
		}
		
		return formatDistanceToNow(fechaObj, { 
			addSuffix: true, 
			locale: es 
		});
	} catch (error) {
		return 'Fecha inválida';
	}
};

/**
 * Obtener fecha en formato ISO para inputs de tipo date
 */
export const fechaParaInput = (fecha?: string | Date): string => {
	try {
		const fechaObj = fecha ? (typeof fecha === 'string' ? parseISO(fecha) : fecha) : new Date();
		return format(fechaObj, 'yyyy-MM-dd');
	} catch (error) {
		return format(new Date(), 'yyyy-MM-dd');
	}
};

/**
 * Obtener inicio del día
 */
export const inicioDelDia = (fecha: string | Date): Date => {
	const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
	return startOfDay(fechaObj);
};

/**
 * Obtener fin del día
 */
export const finDelDia = (fecha: string | Date): Date => {
	const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
	return endOfDay(fechaObj);
};

/**
 * Verificar si una fecha está vencida
 */
export const estaVencida = (fecha: string | Date): boolean => {
	try {
		const fechaObj = typeof fecha === 'string' ? parseISO(fecha) : fecha;
		return fechaObj < new Date();
	} catch (error) {
		return false;
	}
};

/**
 * Obtener número de días entre dos fechas
 */
export const diasEntre = (fechaInicio: string | Date, fechaFin: string | Date): number => {
	try {
		const inicio = typeof fechaInicio === 'string' ? parseISO(fechaInicio) : fechaInicio;
		const fin = typeof fechaFin === 'string' ? parseISO(fechaFin) : fechaFin;
		
		const diffTime = Math.abs(fin.getTime() - inicio.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		
		return diffDays;
	} catch (error) {
		return 0;
	}
};

/**
 * Obtener rango de fechas para filtros
 */
export const rangoDeFechas = (periodo: 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año'): { inicio: string; fin: string } => {
	const hoy = new Date();
	let inicio: Date;
	let fin: Date = endOfDay(hoy);

	switch (periodo) {
		case 'hoy':
			inicio = startOfDay(hoy);
			break;
		case 'semana':
			inicio = startOfDay(new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000));
			break;
		case 'mes':
			inicio = startOfDay(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
			break;
		case 'trimestre':
			const trimestreActual = Math.floor(hoy.getMonth() / 3);
			inicio = startOfDay(new Date(hoy.getFullYear(), trimestreActual * 3, 1));
			break;
		case 'año':
			inicio = startOfDay(new Date(hoy.getFullYear(), 0, 1));
			break;
		default:
			inicio = startOfDay(hoy);
	}

	return {
		inicio: format(inicio, 'yyyy-MM-dd'),
		fin: format(fin, 'yyyy-MM-dd')
	};
}; 