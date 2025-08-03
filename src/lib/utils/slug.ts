/**
 * Utilidades para manejo de slugs
 */

/**
 * Convierte un texto en un slug URL-friendly
 * @param texto - El texto a convertir
 * @returns Slug generado
 */
export function generarSlug(texto: string): string {
	return texto
		.toLowerCase() // Convertir a minúsculas
		.trim() // Eliminar espacios al inicio y final
		.replace(/[áàäâã]/g, 'a') // Reemplazar acentos
		.replace(/[éèëê]/g, 'e')
		.replace(/[íìïî]/g, 'i')
		.replace(/[óòöôõ]/g, 'o')
		.replace(/[úùüû]/g, 'u')
		.replace(/[ñ]/g, 'n')
		.replace(/[ç]/g, 'c')
		.replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
		.replace(/[\s_]+/g, '-') // Reemplazar espacios y guiones bajos con guiones
		.replace(/-+/g, '-') // Eliminar guiones dobles
		.replace(/^-|-$/g, ''); // Eliminar guiones al inicio y final
}

/**
 * Valida si un slug es válido
 * @param slug - El slug a validar
 * @returns True si es válido
 */
export function esSlugValido(slug: string): boolean {
	const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return slugPattern.test(slug) && slug.length >= 3 && slug.length <= 100;
}

/**
 * Genera un slug único agregando un sufijo numérico si es necesario
 * @param nombre - Nombre base del proyecto
 * @param slugsExistentes - Array de slugs ya existentes
 * @returns Slug único
 */
export function generarSlugUnico(nombre: string, slugsExistentes: string[] = []): string {
	let slugBase = generarSlug(nombre);
	
	// Si el slug base está vacío, usar un fallback
	if (!slugBase) {
		slugBase = 'proyecto';
	}
	
	let slugFinal = slugBase;
	let contador = 1;
	
	// Mientras el slug exista, agregar un número
	while (slugsExistentes.includes(slugFinal)) {
		slugFinal = `${slugBase}-${contador}`;
		contador++;
	}
	
	return slugFinal;
}

/**
 * Obtiene un slug temporal basado en timestamp (para proyectos sin nombre)
 * @returns Slug temporal único
 */
export function generarSlugTemporal(): string {
	const timestamp = Date.now().toString(36);
	return `proyecto-${timestamp}`;
} 