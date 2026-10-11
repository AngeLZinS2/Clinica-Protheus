import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Users, Calendar, Stethoscope, UserCog, LogOut, UserCircle, X, FileText } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout, isPreview } = useAuth();
    const location = useLocation();
    const dialogRef = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 768px)');
        const closeOnDesktop = () => {
            if (desktop.matches) closeRef.current();
        };
        desktop.addEventListener('change', closeOnDesktop);
        return () => desktop.removeEventListener('change', closeOnDesktop);
    }, []);

    useEffect(() => {
        closeRef.current();
    }, [location.pathname]);

    const navigation = [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }];
    if (user?.role !== 'patient') {
        navigation.push(
            { name: 'Pacientes', href: '/patients', icon: Users },
            { name: 'Atendimentos', href: '/appointments', icon: Calendar },
            { name: 'Procedimentos', href: '/procedures', icon: Stethoscope }
        );
    } else {
        navigation.push({ name: 'Minhas Consultas', href: '/appointments', icon: Calendar });
    }
    if (user?.tipo === 'admin') {
        navigation.push({ name: 'Usuários', href: '/users', icon: UserCog });
        navigation.push({ name: 'Auditoria', href: '/audit', icon: FileText });
    }
    navigation.push({ name: 'Meu Perfil', href: '/profile', icon: UserCircle });

    const content = (mobile = false) => (
        <>
            <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-6 dark:border-gray-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-800 text-white"><Stethoscope className="h-6 w-6" aria-hidden="true" /></div>
                <div className="min-w-0 flex-1"><span className="block text-lg font-bold tracking-tight text-sky-900 dark:text-sky-100">Protheus</span><span className="block text-xs text-slate-500 dark:text-gray-400">Gestão clínica</span></div>
                {mobile && <button type="button" onClick={onClose} aria-label="Fechar menu de navegação" className="rounded-lg p-2.5 text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-700 dark:text-gray-300 dark:hover:bg-gray-800"><X className="h-5 w-5" aria-hidden="true" /></button>}
            </div>
            <nav aria-label="Navegação principal" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
                {isPreview && <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-xs font-medium leading-relaxed text-teal-900 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200">Modo demonstração · alterações são temporárias</div>}
                {navigation.map((item) => {
                    const active = location.pathname === item.href;
                    return <Link key={item.href} to={item.href} onClick={mobile ? onClose : undefined} aria-current={active ? 'page' : undefined} className={clsx('flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors duration-[160ms] ease-[cubic-bezier(.2,0,0,1)] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700', active ? 'border-sky-100 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-sky-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white')}><item.icon className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{item.name}</span>{active && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700 dark:bg-teal-400" aria-hidden="true" />}</Link>;
                })}
            </nav>
            <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-950">
                <UserCircle className="h-8 w-8 shrink-0 text-slate-400" aria-hidden="true" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800 dark:text-gray-200" title={user?.nome}>{user?.nome}</p><p className="truncate text-xs text-slate-500 dark:text-gray-400" title={user?.email}>{user?.email}</p></div>
                <button type="button" onClick={logout} aria-label="Sair da conta" title="Sair da conta" className="shrink-0 rounded-lg p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-700 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-300"><LogOut className="h-5 w-5" aria-hidden="true" /></button>
            </div>
        </>
    );

    return <>
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex">{content()}</aside>
        <dialog ref={dialogRef} id="mobile-navigation" aria-label="Menu de navegação" onClose={onClose} onKeyDown={(event) => {
            if (event.key !== 'Tab') return;
            const controls = event.currentTarget.querySelectorAll('a[href], button:not(:disabled)');
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-72 max-w-[90vw] border-0 bg-transparent p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 dark:text-gray-100 md:hidden">
            <div className="flex h-full flex-col bg-white dark:bg-gray-900">{content(true)}</div>
        </dialog>
    </>;
}
