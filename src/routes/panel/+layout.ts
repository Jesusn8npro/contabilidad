// +layout.ts
export function load({ url }: { url: URL }) {
	return {
		key: url.pathname
	};
} 