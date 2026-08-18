import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	},
	test: {
		environment: 'node',
		include: ['tests/**/*.test.js']
	}
});
