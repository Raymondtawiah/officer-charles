import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initializeTheme } from '@/hooks/use-appearance'

import AppLayout from '@/layouts/app-layout'
import AuthLayout from '@/layouts/auth-layout'
import SettingsLayout from '@/layouts/settings/layout'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

resolve: (name) =>
    resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob('./pages/**/*.tsx')
    ),

    setup({ el, App, props }) {
        const root = createRoot(el)

        root.render(
            <TooltipProvider delayDuration={0}>
                <App {...props} />
                <Toaster />
            </TooltipProvider>
        )
    },

    progress: {
        color: '#4B5563',
    },
})

// theme init
initializeTheme()