import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Stethoscope, Wallet, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';

const metrics = [
    { key: 'total_patients', name: 'Pacientes cadastrados', icon: Users },
    { key: 'appointments_today', name: 'Atendimentos hoje', icon: Calendar },
    { key: 'total_procedures', name: 'Procedimentos cadastrados', icon: Stethoscope },
    { key: 'monthly_revenue', name: 'Valor dos atendimentos no mês', icon: Wallet, currency: true },
];
const shortcuts = [
    { name: 'Atendimentos', description: 'Consulte a agenda e gerencie os atendimentos.', to: '/appointments', icon: Calendar },
    { name: 'Pacientes', description: 'Encontre cadastros e informações dos pacientes.', to: '/patients', icon: Users },
    { name: 'Procedimentos', description: 'Consulte o catálogo de procedimentos da clínica.', to: '/procedures', icon: Stethoscope },
];
const number = new Intl.NumberFormat('pt-BR');
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(false);
        api.get('/dashboard/stats', { signal: controller.signal })
            .then(({ data }) => {
                if (!metrics.every(({ key }) => typeof data[key] === 'number' && Number.isFinite(data[key]))) {
                    throw new Error('Resposta de indicadores inválida');
                }
                setStats(data);
            })
            .catch(() => { if (!controller.signal.aborted) setError(true); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [attempt]);

    return (
        <div className="space-y-8">
            <header>
                <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">Gestão da clínica</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Visão geral</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Acompanhe os indicadores e acesse as rotinas de atendimento.</p>
            </header>

            <section aria-label="Indicadores da clínica" aria-busy={loading}>
                {error ? (
                    <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                        <div className="flex items-center gap-2 font-semibold"><AlertCircle aria-hidden="true" className="h-5 w-5" />Não foi possível carregar os indicadores.</div>
                        <p className="mt-2 text-sm">Tente novamente. Os atalhos abaixo continuam disponíveis.</p>
                        <button onClick={() => setAttempt(value => value + 1)} className="mt-4 min-h-11 rounded-lg border border-amber-500 px-4 py-2 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900">Tentar novamente</button>
                    </div>
                ) : (
                    <>
                        {loading && <p role="status" className="sr-only">Carregando indicadores.</p>}
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {metrics.map(({ key, name, icon: Icon, currency: isCurrency }) => (
                                <div key={key} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                    <Icon aria-hidden="true" className="mb-5 h-5 w-5 text-sky-700 dark:text-sky-400" />
                                    <dt className="text-sm text-slate-600 dark:text-slate-400">{name}</dt>
                                    <dd className="mt-2 break-words text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                                        {loading ? <span aria-hidden="true" className="block h-8 w-28 rounded bg-slate-100 dark:bg-slate-800" /> : (isCurrency ? currency : number).format(stats[key])}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Valores conforme os registros da clínica. O valor mensal soma os atendimentos registrados, sem indicar confirmação de pagamento.</p>
                    </>
                )}
            </section>

            <section aria-labelledby="quick-access">
                <h2 id="quick-access" className="text-lg font-semibold text-slate-900 dark:text-white">Rotinas da clínica</h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {shortcuts.map(({ name, description, to, icon: Icon }) => (
                        <Link key={to} to={to} className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-400">
                            <div className="flex items-center gap-3 text-sky-800 dark:text-sky-300"><Icon aria-hidden="true" className="h-5 w-5" /><h3 className="font-semibold">{name}</h3><ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" /></div>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
