import Sortable from 'sortablejs';
import { tick } from 'svelte';

export interface SortableOptions {
    animation?: number;
    ghostClass?: string;
    chosenClass?: string;
    dragClass?: string;
    disabled?: boolean;
    handle?: string;
    group?: string | { name: string; pull?: boolean; put?: boolean };
    sort?: boolean;
    delay?: number;
    delayOnTouchStart?: boolean;
    touchStartThreshold?: number;
    onStart?: (evt: any) => void;
    onEnd?: (evt: any) => void;
    onReorder?: (oldIndex: number, newIndex: number) => void;
}

export const useSortable = (
    getElement: () => HTMLElement | null,
    options: SortableOptions = {}
) => {
    let sortableInstance: Sortable | null = null;

    const init = async () => {
        await tick(); // Esperar a que el DOM se actualice
        
        const element = getElement();
        if (!element) return;

        // Destruir instancia anterior si existe
        if (sortableInstance) {
            sortableInstance.destroy();
        }

        // Crear nueva instancia con opciones personalizadas
        sortableInstance = Sortable.create(element, {
            animation: 200,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            disabled: false,
            ...options,
            onEnd: (evt: any) => {
                const { oldIndex, newIndex } = evt;
                
                console.log('🎯 SortableJS onEnd:', { oldIndex, newIndex });
                
                if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
                    // Llamar callback personalizado
                    options.onReorder?.(oldIndex, newIndex);
                }
                
                // Llamar callback original si existe
                options.onEnd?.(evt);
            }
        });

        console.log('✅ SortableJS inicializado correctamente');
    };

    const destroy = () => {
        if (sortableInstance) {
            sortableInstance.destroy();
            sortableInstance = null;
            console.log('🗑️ SortableJS destruido');
        }
    };

    return {
        init,
        destroy,
        getInstance: () => sortableInstance
    };
};

// Función helper para reordenar arrays
export function reorderArray<T>(array: T[], oldIndex: number, newIndex: number): T[] {
    const result = [...array];
    const [removed] = result.splice(oldIndex, 1);
    result.splice(newIndex, 0, removed);
    return result;
} 