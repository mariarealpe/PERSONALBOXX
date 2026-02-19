import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Asegurar fondo negro en todo el documento
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.background = '#000000';
        document.documentElement.style.background = '#000000';

        root.render(<App {...props} />);
    },
    progress: {
        color: '#FF1493', // Cambié el color a rosa neón
    },
});
