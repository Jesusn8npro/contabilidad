/**
 * Formatear número como moneda
 */
export const formatearMoneda = (
	monto: number, 
	moneda: string = 'USD', 
	locale: string = 'es-ES'
): string => {
	try {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: moneda,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(monto);
	} catch (error) {
		// Fallback manual si hay error con la moneda
		const simbolo = obtenerSimboloMoneda(moneda);
		return `${simbolo}${formatearNumero(monto)}`;
	}
};

/**
 * Formatear número sin símbolo de moneda
 */
export const formatearNumero = (numero: number, decimales: number = 2): string => {
	try {
		return new Intl.NumberFormat('es-ES', {
			minimumFractionDigits: decimales,
			maximumFractionDigits: decimales
		}).format(numero);
	} catch (error) {
		return numero.toFixed(decimales);
	}
};

/**
 * Formatear porcentaje
 */
export const formatearPorcentaje = (numero: number, decimales: number = 1): string => {
	try {
		return new Intl.NumberFormat('es-ES', {
			style: 'percent',
			minimumFractionDigits: decimales,
			maximumFractionDigits: decimales
		}).format(numero / 100);
	} catch (error) {
		return `${numero.toFixed(decimales)}%`;
	}
};

/**
 * Formatear número compacto (ej: 1.2K, 1.5M)
 */
export const formatearNumeroCompacto = (numero: number): string => {
	try {
		return new Intl.NumberFormat('es-ES', {
			notation: 'compact',
			compactDisplay: 'short'
		}).format(numero);
	} catch (error) {
		// Fallback manual
		if (numero >= 1000000) {
			return `${(numero / 1000000).toFixed(1)}M`;
		} else if (numero >= 1000) {
			return `${(numero / 1000).toFixed(1)}K`;
		}
		return numero.toString();
	}
};

/**
 * Obtener símbolo de moneda
 */
export const obtenerSimboloMoneda = (codigoMoneda: string): string => {
	const simbolos: Record<string, string> = {
		'USD': '$',
		'EUR': '€',
		'GBP': '£',
		'JPY': '¥',
		'ARS': '$',
		'CLP': '$',
		'COP': '$',
		'MXN': '$',
		'PEN': 'S/',
		'BRL': 'R$',
		'CAD': 'C$',
		'AUD': 'A$'
	};

	return simbolos[codigoMoneda.toUpperCase()] || codigoMoneda;
};

/**
 * Convertir string a número para inputs
 */
export const parseraNumero = (valor: string): number => {
	// Remover caracteres no numéricos excepto punto y coma
	const numeroLimpio = valor.replace(/[^0-9.,-]/g, '');
	
	// Reemplazar coma por punto para parsing
	const numeroConPunto = numeroLimpio.replace(',', '.');
	
	const numero = parseFloat(numeroConPunto);
	return isNaN(numero) ? 0 : numero;
};

/**
 * Formatear número para input (mostrar con comas para miles)
 */
export const formatearParaInput = (numero: number): string => {
	if (numero === 0) return '';
	
	try {
		return new Intl.NumberFormat('es-ES', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(numero);
	} catch (error) {
		return numero.toString();
	}
};

/**
 * Obtener color para montos (verde para positivo, rojo para negativo)
 */
export const colorPorMonto = (monto: number): string => {
	if (monto > 0) return 'text-success-600';
	if (monto < 0) return 'text-danger-600';
	return 'text-gray-600';
};

/**
 * Formatear diferencia de montos con signo
 */
export const formatearDiferencia = (
	monto: number, 
	moneda: string = 'USD',
	mostrarSigno: boolean = true
): string => {
	const montoFormateado = formatearMoneda(Math.abs(monto), moneda);
	
	if (!mostrarSigno) return montoFormateado;
	
	if (monto > 0) return `+${montoFormateado}`;
	if (monto < 0) return `-${montoFormateado}`;
	return montoFormateado;
};

/**
 * Calcular porcentaje de cambio entre dos valores
 */
export const calcularPorcentajeCambio = (valorAnterior: number, valorActual: number): number => {
	if (valorAnterior === 0) return valorActual > 0 ? 100 : 0;
	return ((valorActual - valorAnterior) / Math.abs(valorAnterior)) * 100;
};

/**
 * Formatear balance con colores
 */
export const formatearBalance = (balance: number, moneda: string = 'USD'): {
	texto: string;
	color: string;
	icono: string;
} => {
	const texto = formatearMoneda(balance, moneda);
	
	if (balance > 0) {
		return {
			texto,
			color: 'text-success-600',
			icono: 'trending-up'
		};
	} else if (balance < 0) {
		return {
			texto,
			color: 'text-danger-600',
			icono: 'trending-down'
		};
	} else {
		return {
			texto,
			color: 'text-gray-600',
			icono: 'minus'
		};
	}
}; 