import { writable, derived } from 'svelte/store';
import type { Cliente, EstadisticasCliente } from '$lib/tipos/clientes-inventario';
import { supabase } from '$lib/supabase/cliente';
import { mostrarError, mostrarExito } from './toast';

// Estados principales
export const clientes = writable<Cliente[]>([]);
export const clienteActual = writable<Cliente | null>(null);
export const cargandoClientes = writable<boolean>(false);

// Estados derivados
export const estadisticasClientes = derived([clientes], ([$clientes]) => {
    const estadisticas: EstadisticasCliente = {
        total_clientes: $clientes.length,
        clientes_activos: $clientes.filter(c => c.estado === 'activo').length,
        total_facturado: $clientes.reduce((sum, c) => sum + c.total_facturado, 0),
        saldo_pendiente: $clientes.reduce((sum, c) => sum + c.saldo_pendiente, 0),
        promedio_credito: $clientes.length > 0 
            ? $clientes.reduce((sum, c) => sum + c.puntuacion_credito, 0) / $clientes.length 
            : 0,
        nuevos_este_mes: $clientes.filter(c => {
            const fechaCreacion = new Date(c.fecha_creacion);
            const inicioMes = new Date();
            inicioMes.setDate(1);
            return fechaCreacion >= inicioMes;
        }).length
    };
    
    return estadisticas;
});

// Clientes por categoría
export const clientesPorCategoria = derived([clientes], ([$clientes]) => {
    const porCategoria = $clientes.reduce((acc, cliente) => {
        const categoria = cliente.categoria_cliente;
        if (!acc[categoria]) {
            acc[categoria] = [];
        }
        acc[categoria].push(cliente);
        return acc;
    }, {} as Record<string, Cliente[]>);
    
    return porCategoria;
});

// Clientes con saldo pendiente
export const clientesConSaldoPendiente = derived([clientes], ([$clientes]) => {
    return $clientes.filter(c => c.saldo_pendiente > 0);
});

// ==================== FUNCIONES CRUD ====================

// Cargar clientes
export const cargarClientes = async (negocioId?: string): Promise<void> => {
    try {
        cargandoClientes.set(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return;
        }

        let query = supabase
            .from('clientes')
            .select('*')
            .eq('usuario_id', user.id);

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        const { data, error } = await query.order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error cargando clientes:', error);
            mostrarError('Error al cargar los clientes');
            return;
        }

        clientes.set(data || []);
    } catch (error) {
        console.error('Error en cargarClientes:', error);
        mostrarError('Error al cargar los clientes');
    } finally {
        cargandoClientes.set(false);
    }
};

// Crear cliente
export const crearCliente = async (clienteData: Partial<Cliente>): Promise<Cliente | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            mostrarError('No hay usuario autenticado');
            return null;
        }

        const nuevoCliente = {
            ...clienteData,
            usuario_id: user.id,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('clientes')
            .insert([nuevoCliente])
            .select()
            .single();

        if (error) {
            console.error('Error creando cliente:', error);
            mostrarError('Error al crear el cliente: ' + error.message);
            return null;
        }

        // Actualizar store local
        clientes.update(lista => [data, ...lista]);
        mostrarExito('Cliente creado exitosamente');
        return data;
    } catch (error) {
        console.error('Error en crearCliente:', error);
        mostrarError('Error al crear el cliente');
        return null;
    }
};

// Actualizar cliente
export const actualizarCliente = async (id: string, updates: Partial<Cliente>): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('clientes')
            .update({
                ...updates,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error actualizando cliente:', error);
            mostrarError('Error al actualizar el cliente');
            return false;
        }

        // Actualizar store local
        clientes.update(lista => lista.map(c => c.id === id ? { ...c, ...updates } : c));
        
        // Si es el cliente actual, actualizarlo también
        clienteActual.update(actual => actual?.id === id ? { ...actual, ...updates } : actual);
        
        mostrarExito('Cliente actualizado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en actualizarCliente:', error);
        mostrarError('Error al actualizar el cliente');
        return false;
    }
};

// Eliminar cliente
export const eliminarCliente = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando cliente:', error);
            mostrarError('Error al eliminar el cliente');
            return false;
        }

        // Actualizar store local
        clientes.update(lista => lista.filter(c => c.id !== id));
        
        // Si es el cliente actual, limpiarlo
        clienteActual.update(actual => actual?.id === id ? null : actual);
        
        mostrarExito('Cliente eliminado exitosamente');
        return true;
    } catch (error) {
        console.error('Error en eliminarCliente:', error);
        mostrarError('Error al eliminar el cliente');
        return false;
    }
};

// Cargar cliente específico
export const cargarCliente = async (id: string): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error cargando cliente:', error);
            mostrarError('Error al cargar el cliente');
            return;
        }

        clienteActual.set(data);
    } catch (error) {
        console.error('Error en cargarCliente:', error);
        mostrarError('Error al cargar el cliente');
    }
};

// Buscar clientes
export const buscarClientes = async (termino: string, negocioId?: string): Promise<Cliente[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
            .from('clientes')
            .select('*')
            .eq('usuario_id', user.id);

        if (negocioId) {
            query = query.eq('negocio_id', negocioId);
        }

        query = query.or(`nombre.ilike.%${termino}%,email.ilike.%${termino}%,numero_documento.ilike.%${termino}%`);

        const { data, error } = await query.order('nombre', { ascending: true });

        if (error) {
            console.error('Error buscando clientes:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error en buscarClientes:', error);
        return [];
    }
};

// Actualizar puntuación de crédito
export const actualizarPuntuacionCredito = async (clienteId: string): Promise<void> => {
    try {
        // Obtener datos del cliente
        const { data: cliente, error: errorCliente } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', clienteId)
            .single();

        if (errorCliente || !cliente) {
            console.error('Error obteniendo cliente:', errorCliente);
            return;
        }

        // Calcular nueva puntuación (simplificado)
        let nuevaPuntuacion = 100;
        
        // Reducir por saldo pendiente alto
        if (cliente.saldo_pendiente > 0 && cliente.limite_credito > 0) {
            const porcentajeUso = (cliente.saldo_pendiente / cliente.limite_credito) * 100;
            if (porcentajeUso > 80) nuevaPuntuacion -= 30;
            else if (porcentajeUso > 60) nuevaPuntuacion -= 20;
            else if (porcentajeUso > 40) nuevaPuntuacion -= 10;
        }

        // Actualizar en la base de datos
        await actualizarCliente(clienteId, { puntuacion_credito: Math.max(0, nuevaPuntuacion) });
    } catch (error) {
        console.error('Error actualizando puntuación de crédito:', error);
    }
};

// Obtener clientes por estado
export const obtenerClientesPorEstado = (estado: string): Cliente[] => {
    let clientesActuales: Cliente[] = [];
    clientes.subscribe(c => clientesActuales = c)();
    return clientesActuales.filter(c => c.estado === estado);
};

// Exportar clientes
export const exportarClientesCSV = async (negocioId?: string): Promise<string | null> => {
    try {
        await cargarClientes(negocioId);
        
        let clientesParaExportar: Cliente[] = [];
        clientes.subscribe(c => clientesParaExportar = c)();
        
        if (clientesParaExportar.length === 0) {
            mostrarError('No hay clientes para exportar');
            return null;
        }

        // Crear CSV
        const headers = [
            'Nombre',
            'Tipo Documento',
            'Número Documento',
            'Email',
            'Teléfono',
            'Tipo Cliente',
            'Categoría',
            'Estado',
            'Total Facturado',
            'Saldo Pendiente',
            'Puntuación Crédito',
            'Fecha Creación'
        ];

        const rows = clientesParaExportar.map(cliente => [
            cliente.nombre,
            cliente.tipo_documento,
            cliente.numero_documento,
            cliente.email || '',
            cliente.telefono || '',
            cliente.tipo_cliente,
            cliente.categoria_cliente,
            cliente.estado,
            cliente.total_facturado.toString(),
            cliente.saldo_pendiente.toString(),
            cliente.puntuacion_credito.toString(),
            new Date(cliente.fecha_creacion).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        mostrarExito('Clientes exportados exitosamente');
        return csvContent;
    } catch (error) {
        console.error('Error exportando clientes:', error);
        mostrarError('Error al exportar los clientes');
        return null;
    }
}; 