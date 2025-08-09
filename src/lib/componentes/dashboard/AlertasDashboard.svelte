<script lang="ts">
	import { AlertTriangle, Clock, CheckCircle, X } from 'lucide-svelte';
	
	export let tareasUrgentes: number = 0;
	export let tareasProximas: any[] = [];
	
	let alertasVisibles = true;
</script>

{#if alertasVisibles && (tareasUrgentes > 0 || tareasProximas.length > 0)}
	<div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
		<div class="flex items-start justify-between">
			<div class="flex items-start space-x-4">
				<div class="flex-shrink-0">
					<AlertTriangle class="w-6 h-6 text-orange-500" />
				</div>
				
				<div class="flex-1">
					<h3 class="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
						⚠️ Atención Requerida
					</h3>
					
					<div class="space-y-3">
						{#if tareasUrgentes > 0}
							<div class="flex items-center space-x-2">
								<div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
								<span class="text-orange-800 dark:text-orange-200">
									<strong>{tareasUrgentes}</strong> {tareasUrgentes === 1 ? 'tarea urgente' : 'tareas urgentes'} sin completar
								</span>
							</div>
						{/if}
						
						{#if tareasProximas.length > 0}
							<div class="flex items-center space-x-2">
								<Clock class="w-4 h-4 text-orange-500" />
								<span class="text-orange-800 dark:text-orange-200">
									<strong>{tareasProximas.length}</strong> {tareasProximas.length === 1 ? 'tarea vence' : 'tareas vencen'} en los próximos 7 días
								</span>
							</div>
						{/if}
					</div>
					
					<div class="mt-4 flex flex-wrap gap-2">
						<button 
							class="inline-flex items-center px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
							on:click={() => window.location.href = '/panel/tareas'}
						>
							<CheckCircle class="w-4 h-4 mr-1" />
							Ver Tareas
						</button>
						<button class="inline-flex items-center px-3 py-1.5 bg-white hover:bg-gray-50 text-orange-600 text-sm rounded-lg border border-orange-300 transition-colors">
							Marcar como Visto
						</button>
					</div>
				</div>
			</div>
			
			<button 
				class="flex-shrink-0 p-1 text-orange-400 hover:text-orange-600 transition-colors"
				on:click={() => alertasVisibles = false}
			>
				<X class="w-5 h-5" />
			</button>
		</div>
	</div>
{/if} 