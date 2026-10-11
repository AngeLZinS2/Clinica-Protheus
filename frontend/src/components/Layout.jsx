import { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Menu, Stethoscope } from 'lucide-react';

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-dvh min-h-0 overflow-hidden bg-slate-50 text-slate-900 dark:bg-gray-950 dark:text-gray-100">
            <a href="#main-content" className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-sky-800 px-4 py-3 font-semibold text-white focus:translate-y-0">Ir para o conteúdo</a>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 md:hidden">
                    <button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menu de navegação" aria-expanded={isSidebarOpen} aria-controls="mobile-navigation" className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 dark:text-gray-300 dark:hover:bg-gray-800">
                        <Menu className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <Stethoscope className="h-5 w-5 text-sky-800 dark:text-sky-400" aria-hidden="true" />
                    <span className="text-base font-semibold tracking-tight">Clínica Protheus</span>
                </header>
                <main id="main-content" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto outline-none">
                    <div className="flex min-h-full flex-col">
                        <div className="flex-1 p-4 md:p-8">{children}</div>
                        <Footer className="mx-4 md:mx-8" />
                    </div>
                </main>
            </div>
        </div>
    );
}
