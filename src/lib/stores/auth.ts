import { writable, derived } from 'svelte/store';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '$lib/supabase/cliente';
import { mostrarError, mostrarExito } from './toast';

// Tipos para el perfil de usuario
interface PerfilUsuario {
    id: string;
    usuario_id: string;
    nombre_completo?: string;
    empresa?: string;
    telefono?: string;
    direccion?: string;
    pais: string;
    zona_horaria: string;
    rol: 'admin' | 'usuario';
    plan_suscripcion: 'gratis' | 'premium';
    fecha_suscripcion: string;
    fecha_vencimiento?: string;
    estado_suscripcion: 'activa' | 'suspendida' | 'cancelada';
    limite_proyectos: number;
    limite_negocios: number;
    limite_movimientos_mes: number;
    limite_campanas: number;
    configuracion_notificaciones: any;
    tema: 'light' | 'dark';
    idioma: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
}

// Estados principales
export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);
export const perfilUsuario = writable<PerfilUsuario | null>(null);
export const cargandoAuth = writable<boolean>(true);
export const autenticado = derived([user], ([$user]) => !!$user);

// Función para cargar el perfil del usuario
export const cargarPerfilUsuario = async (userId: string): Promise<PerfilUsuario | null> => {
    try {
        const { data, error } = await supabase
            .from('usuarios_perfiles')
            .select('*')
            .eq('usuario_id', userId)
            .single();

        if (error) {
            // Si no existe el perfil, crearlo automáticamente
            if (error.code === 'PGRST116') {
                console.log('Perfil no encontrado, creando perfil por defecto...');
                return await crearPerfilPorDefecto(userId);
            }
            console.error('Error cargando perfil:', error);
            return null;
        }

        perfilUsuario.set(data);
        return data;
    } catch (error) {
        console.error('Error en cargarPerfilUsuario:', error);
        return null;
    }
};

// Función para crear un perfil por defecto
const crearPerfilPorDefecto = async (userId: string): Promise<PerfilUsuario | null> => {
    try {
        // Obtener información básica del usuario de Auth
        const { data: { user } } = await supabase.auth.getUser();
        
        const perfilPorDefecto = {
            usuario_id: userId,
            nombre_completo: user?.user_metadata?.nombre_completo || user?.email?.split('@')[0] || 'Usuario',
            empresa: '',
            telefono: '',
            direccion: '',
            pais: 'COL',
            zona_horaria: 'America/Bogota',
            rol: 'usuario' as const,
            plan_suscripcion: 'gratis' as const,
            fecha_suscripcion: new Date().toISOString(),
            estado_suscripcion: 'activa' as const,
            limite_proyectos: 3,
            limite_negocios: 1,
            limite_movimientos_mes: 50,
            limite_campanas: 0,
            configuracion_notificaciones: {
                email: true,
                push: false,
                marketing: true,
                recordatorios: true
            },
            tema: 'light' as const,
            idioma: 'es',
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('usuarios_perfiles')
            .insert([perfilPorDefecto])
            .select()
            .single();

        if (error) {
            console.error('Error creando perfil por defecto:', error);
            mostrarError('Error al crear el perfil de usuario');
            return null;
        }

        perfilUsuario.set(data);
        mostrarExito('¡Perfil creado correctamente!');
        return data;
    } catch (error) {
        console.error('Error en crearPerfilPorDefecto:', error);
        mostrarError('Error al crear el perfil de usuario');
        return null;
    }
};

// Función para actualizar el perfil del usuario
export const actualizarPerfilUsuario = async (updates: Partial<PerfilUsuario>): Promise<boolean> => {
    try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
            mostrarError('No hay usuario autenticado');
            return false;
        }

        const { error } = await supabase
            .from('usuarios_perfiles')
            .update(updates)
            .eq('usuario_id', currentUser.id);

        if (error) {
            console.error('Error actualizando perfil:', error);
            mostrarError('Error al actualizar el perfil');
            return false;
        }

        // Recargar el perfil actualizado
        await cargarPerfilUsuario(currentUser.id);
        mostrarExito('Perfil actualizado correctamente');
        return true;
    } catch (error) {
        console.error('Error en actualizarPerfilUsuario:', error);
        mostrarError('Error al actualizar el perfil');
        return false;
    }
};

// Función para inicializar la autenticación
export const inicializarAuth = async () => {
    try {
        cargandoAuth.set(true);

        // Obtener sesión actual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        session.set(currentSession);
        user.set(currentSession?.user ?? null);

        // Si hay usuario, cargar su perfil
        if (currentSession?.user) {
            await cargarPerfilUsuario(currentSession.user.id);
        }

        // Escuchar cambios de autenticación
        supabase.auth.onAuthStateChange(async (event, newSession) => {
            session.set(newSession);
            user.set(newSession?.user ?? null);

            if (event === 'SIGNED_IN' && newSession?.user) {
                // Usuario se logeó, cargar perfil
                await cargarPerfilUsuario(newSession.user.id);
                mostrarExito('¡Bienvenido de vuelta!');
            } else if (event === 'SIGNED_OUT') {
                // Usuario se deslogeó, limpiar stores
                perfilUsuario.set(null);
                mostrarExito('Sesión cerrada correctamente');
            }
        });

    } catch (error) {
        console.error('Error inicializando auth:', error);
        mostrarError('Error al inicializar la autenticación');
    } finally {
        cargandoAuth.set(false);
    }
};

// Función para iniciar sesión
export const iniciarSesion = async (email: string, password: string): Promise<boolean> => {
    try {
        cargandoAuth.set(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Error en login:', error);
            mostrarError(error.message || 'Error al iniciar sesión');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error en iniciarSesion:', error);
        mostrarError('Error al iniciar sesión');
        return false;
    } finally {
        cargandoAuth.set(false);
    }
};

// Función para registrarse
export const registrarse = async (email: string, password: string, nombreCompleto?: string): Promise<boolean> => {
    try {
        cargandoAuth.set(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nombre_completo: nombreCompleto
                }
            }
        });

        if (error) {
            console.error('Error en registro:', error);
            mostrarError(error.message || 'Error al registrarse');
            return false;
        }

        if (data.user && !data.session) {
            mostrarExito('Revisa tu email para confirmar tu cuenta');
        } else if (data.session) {
            mostrarExito('¡Cuenta creada exitosamente!');
        }

        return true;
    } catch (error) {
        console.error('Error en registrarse:', error);
        mostrarError('Error al registrarse');
        return false;
    } finally {
        cargandoAuth.set(false);
    }
};

// Función para cerrar sesión
export const manejarCerrarSesion = async (): Promise<void> => {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Error cerrando sesión:', error);
            mostrarError('Error al cerrar sesión');
            return;
        }

        // Los stores se limpiarán automáticamente por el listener
    } catch (error) {
        console.error('Error en cerrarSesion:', error);
        mostrarError('Error al cerrar sesión');
    }
};

// Función para cambiar contraseña
export const cambiarContrasena = async (nuevaContrasena: string): Promise<boolean> => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: nuevaContrasena
        });

        if (error) {
            console.error('Error cambiando contraseña:', error);
            mostrarError('Error al cambiar la contraseña');
            return false;
        }

        mostrarExito('Contraseña cambiada correctamente');
        return true;
    } catch (error) {
        console.error('Error en cambiarContrasena:', error);
        mostrarError('Error al cambiar la contraseña');
        return false;
    }
};

// Función para resetear contraseña
export const resetearContrasena = async (email: string): Promise<boolean> => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            console.error('Error reseteando contraseña:', error);
            mostrarError('Error al enviar email de reseteo');
            return false;
        }

        mostrarExito('Email de reseteo enviado');
        return true;
    } catch (error) {
        console.error('Error en resetearContrasena:', error);
        mostrarError('Error al resetear contraseña');
        return false;
    }
};

// Función para verificar límites del plan
export const verificarLimites = async (tipo: 'proyectos' | 'negocios' | 'movimientos' | 'campanas'): Promise<boolean> => {
    try {
        const perfilActual = get(perfilUsuario);
        if (!perfilActual) return false;

        let contador = 0;
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return false;

        switch (tipo) {
            case 'proyectos':
                const { count: proyectosCount } = await supabase
                    .from('proyectos')
                    .select('*', { count: 'exact', head: true })
                    .eq('usuario_id', currentUser.id);
                contador = proyectosCount || 0;
                return contador < perfilActual.limite_proyectos;

            case 'negocios':
                const { count: negociosCount } = await supabase
                    .from('negocios')
                    .select('*', { count: 'exact', head: true })
                    .eq('usuario_id', currentUser.id);
                contador = negociosCount || 0;
                return contador < perfilActual.limite_negocios;

            case 'movimientos':
                const inicioMes = new Date();
                inicioMes.setDate(1);
                const { count: movimientosCount } = await supabase
                    .from('movimientos_financieros')
                    .select('*', { count: 'exact', head: true })
                    .gte('fecha_movimiento', inicioMes.toISOString().split('T')[0]);
                contador = movimientosCount || 0;
                return contador < perfilActual.limite_movimientos_mes;

            case 'campanas':
                const { count: campanasCount } = await supabase
                    .from('campanas_marketing')
                    .select('*', { count: 'exact', head: true })
                    .eq('usuario_id', currentUser.id);
                contador = campanasCount || 0;
                return contador < perfilActual.limite_campanas;

            default:
                return false;
        }
    } catch (error) {
        console.error('Error verificando límites:', error);
        return false;
    }
};

// Función helper para obtener el perfil (para usar en componentes)
export const get = (store: any) => {
    let value: any;
    store.subscribe((val: any) => value = val)();
    return value;
};

// Exportar tipos
export type { PerfilUsuario }; 