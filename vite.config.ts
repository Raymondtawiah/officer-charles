import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function reactRoot(): Plugin {
    return {
        name: 'react-root',
        configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
                if (request.url !== '/') {
                    next();
                    return;
                }

                const html = readFileSync(resolve(__dirname, 'index.html'), 'utf-8');
                const transformedHtml = await server.transformIndexHtml('/', html);

                response.statusCode = 200;
                response.setHeader('Content-Type', 'text/html');
                response.end(transformedHtml);
            });
        },
    };
}

export default defineConfig({
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
        },
    },
    plugins: [
        reactRoot(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
});
