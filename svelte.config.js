import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-node es más confiable para deployment en servicios cloud
		adapter: adapter({
			out: 'build'
		}),
		
		// Alias para imports
		alias: {
			$lib: './src/lib'
		}
	}
};

export default config; 