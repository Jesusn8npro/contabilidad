import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/cliente';
import type { User } from '@supabase/supabase-js';

// Tipo basado en la estructura REAL de tu tabla finanzas_personales
export interface FinanzaPersonal {
    id?: string;
    usuario_id: string;
    categoria_id?: string | null;
    monto: number;
    descripcion: string;
    fecha_gasto: string;
    metodo_pago?: string | null;
    ubicacion?: string | null;
    proveedor?: string | null;
    es_recurrente?: boolean;
    frecuencia_recurrencia?: string | null;
    fecha_proxima_recurrencia?: string | null;
    comprobante_url?: string | null;
    numero_factura?: string | null;
    tipo_gasto_personal?: string | null;
    tipo?: 'ingreso' | 'gasto'; // Nueva columna para diferenciar
    impacta_negocios?: boolean;
    negocio_relacionado_id?: string | null;
    notas?: string | null;
    aprobado?: boolean;
    justificacion_requerida?: boolean;
    fecha_creacion?: string;
}

export interface ResumenFinanzas {
    total_ingresos: number;
    total_gastos: number;
    balance_neto: number;
    total_movimientos: number;
}

// Stores
export const finanzasPersonales = writable<FinanzaPersonal[]>([]);
export const resumenFinanzas = writable<ResumenFinanzas>({
    total_ingresos: 0,
    total_gastos: 0,
    balance_neto: 0,
    total_movimientos: 0
});
export const cargandoFinanzas = writable(false);

// Store functions
export const finanzasPersonalesStore = {
    // Cargar todas las finanzas del usuario
    async cargar(usuario: User | null) {
        if (!usuario) return;

        cargandoFinanzas.set(true);
        try {
            const { data, error } = await supabase
                .from('finanzas_personales')
                .select('*')
                .eq('usuario_id', usuario.id)
                .order('fecha_gasto', { ascending: false });

            if (error) {
                console.error('Error cargando finanzas:', error);
                return;
            }

            finanzasPersonales.set(data || []);
            this.calcularResumen(data || []);
            
        } catch (error) {
            console.error('Error:', error);
        } finally {
            cargandoFinanzas.set(false);
        }
    },

    // Calcular resumen
    calcularResumen(finanzas: FinanzaPersonal[]) {
        const total_ingresos = finanzas.filter(f => f.tipo === 'ingreso').reduce((sum, f) => sum + Number(f.monto), 0);
        const total_gastos = finanzas.filter(f => f.tipo === 'gasto').reduce((sum, f) => sum + Number(f.monto), 0);
        const balance_neto = total_ingresos - total_gastos;
        
        resumenFinanzas.set({
            total_ingresos,
            total_gastos,
            balance_neto,
            total_movimientos: finanzas.length
        });
    },

    // Crear nueva finanza
    async crear(finanza: Omit<FinanzaPersonal, 'id' | 'fecha_creacion'>) {
        cargandoFinanzas.set(true);
        try {
            const { data, error } = await supabase
                .from('finanzas_personales')
                .insert([{
                    ...finanza,
                    fecha_creacion: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creando finanza:', error);
                throw error;
            }

            // Recargar datos
            const { data: { user } } = await supabase.auth.getUser();
            await this.cargar(user);

            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        } finally {
            cargandoFinanzas.set(false);
        }
    },

    // Actualizar finanza
    async actualizar(id: string, cambios: Partial<FinanzaPersonal>) {
        cargandoFinanzas.set(true);
        try {
            const { data, error } = await supabase
                .from('finanzas_personales')
                .update(cambios)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error actualizando finanza:', error);
                throw error;
            }

            // Recargar datos
            const { data: { user } } = await supabase.auth.getUser();
            await this.cargar(user);

            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        } finally {
            cargandoFinanzas.set(false);
        }
    },

    // Eliminar finanza
    async eliminar(id: string) {
        cargandoFinanzas.set(true);
        try {
            const { error } = await supabase
                .from('finanzas_personales')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error eliminando finanza:', error);
                throw error;
            }

            // Recargar datos
            const { data: { user } } = await supabase.auth.getUser();
            await this.cargar(user);

        } catch (error) {
            console.error('Error:', error);
            throw error;
        } finally {
            cargandoFinanzas.set(false);
        }
    },

    // Obtener por tipo
    async obtenerPorTipo(tipo: 'ingreso' | 'gasto', usuario: User | null) {
        if (!usuario) return [];

        try {
            const { data, error } = await supabase
                .from('finanzas_personales')
                .select('*')
                .eq('usuario_id', usuario.id)
                .eq('tipo', tipo)
                .order('fecha_gasto', { ascending: false });

            if (error) {
                console.error('Error obteniendo finanzas por tipo:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    }
};

// Función para formatear moneda
export function formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

// Categorías de finanzas personales
export const tiposFinanzasPersonales = [
    { id: 'hogar', nombre: 'Hogar', icono: '🏠', color: 'blue' },
    { id: 'transporte', nombre: 'Transporte', icono: '🚗', color: 'green' },
    { id: 'alimentacion', nombre: 'Alimentación', icono: '🍽️', color: 'orange' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', icono: '🎬', color: 'purple' },
    { id: 'salud', nombre: 'Salud', icono: '🏥', color: 'red' },
    { id: 'educacion', nombre: 'Educación', icono: '📚', color: 'indigo' },
    { id: 'ropa', nombre: 'Ropa', icono: '👕', color: 'pink' },
    { id: 'servicios', nombre: 'Servicios', icono: '⚡', color: 'yellow' },
    { id: 'salario', nombre: 'Salario', icono: '💼', color: 'green' },
    { id: 'freelance', nombre: 'Freelance', icono: '💻', color: 'blue' },
    { id: 'inversiones', nombre: 'Inversiones', icono: '📈', color: 'purple' },
    { id: 'otros', nombre: 'Otros', icono: '💰', color: 'gray' }
];

// Métodos de pago
export const metodosPago = [
    { id: 'efectivo', nombre: 'Efectivo', icono: '💵' },
    { id: 'tarjeta', nombre: 'Tarjeta', icono: '💳' },
    { id: 'transferencia', nombre: 'Transferencia', icono: '🏦' },
    { id: 'otro', nombre: 'Otro', icono: '💰' }
]; 