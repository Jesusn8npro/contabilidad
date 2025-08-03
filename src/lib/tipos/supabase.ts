// Este archivo será reemplazado por los tipos generados de Supabase
// Ejecuta: npm run supabase:types

export interface Database {
  public: {
    Tables: {
      proyectos: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          color: string;
          descripcion: string | null;
          estado: string;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          color: string;
          descripcion?: string | null;
          estado?: string;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          color?: string;
          descripcion?: string | null;
          estado?: string;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
      };
      tareas: {
        Row: {
          id: string;
          proyecto_id: string;
          titulo: string;
          descripcion: string | null;
          estado: string;
          prioridad: string;
          fecha_limite: string | null;
          fecha_creacion: string;
          asignado_a: string | null;
          orden: number;
        };
        Insert: {
          id?: string;
          proyecto_id: string;
          titulo: string;
          descripcion?: string | null;
          estado?: string;
          prioridad?: string;
          fecha_limite?: string | null;
          fecha_creacion?: string;
          asignado_a?: string | null;
          orden?: number;
        };
        Update: {
          id?: string;
          proyecto_id?: string;
          titulo?: string;
          descripcion?: string | null;
          estado?: string;
          prioridad?: string;
          fecha_limite?: string | null;
          fecha_creacion?: string;
          asignado_a?: string | null;
          orden?: number;
        };
      };
      negocios: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          tipo_negocio: string;
          descripcion: string | null;
          moneda: string;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          tipo_negocio: string;
          descripcion?: string | null;
          moneda?: string;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          tipo_negocio?: string;
          descripcion?: string | null;
          moneda?: string;
          fecha_creacion?: string;
        };
      };
      movimientos_financieros: {
        Row: {
          id: string;
          negocio_id: string;
          tipo_movimiento: string;
          categoria_id: string | null;
          monto: number;
          descripcion: string;
          fecha_movimiento: string;
          metodo_pago: string | null;
          comprobante_url: string | null;
        };
        Insert: {
          id?: string;
          negocio_id: string;
          tipo_movimiento: string;
          categoria_id?: string | null;
          monto: number;
          descripcion: string;
          fecha_movimiento?: string;
          metodo_pago?: string | null;
          comprobante_url?: string | null;
        };
        Update: {
          id?: string;
          negocio_id?: string;
          tipo_movimiento?: string;
          categoria_id?: string | null;
          monto?: number;
          descripcion?: string;
          fecha_movimiento?: string;
          metodo_pago?: string | null;
          comprobante_url?: string | null;
        };
      };
      categorias: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string;
          tipo: string;
          color: string;
          icono: string | null;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nombre: string;
          tipo: string;
          color: string;
          icono?: string | null;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nombre?: string;
          tipo?: string;
          color?: string;
          icono?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
} 