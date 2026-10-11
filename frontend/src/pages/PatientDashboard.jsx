import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, User, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800';

export default function PatientDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(false);
        api.get('/appointments', { params: { page, limit: 6 }, signal: controller.signal })
            .then(({ data }) => {
                if (!Array.isArray(data.items) || !data.pagination) throw new Error('Resposta de consultas inválida');
                setAppointments(data.items);
                setPagination(data.pagination);
            })
            .catch(() => { if (!controller.signal.aborted) setError(true); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [page, attempt]);

    return (
        <div className="space-y-8">
            <header>
                <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">Portal do paciente</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Meu portal</h1>
                <p className="mt-2 break-words text-slate-600 dark:text-slate-400">Olá{user?.nome ? `, ${user.nome}` : ''}. Consulte seus atendimentos e informações de cadastro.</p>
            </header>

            <div className="grid items-start gap-6 lg:grid-cols-3">
                <section aria-labelledby="patient-details" className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3"><User aria-hidden="true" className="h-5 w-5 text-sky-700 dark:text-sky-400" /><h2 id="patient-details" className="text-lg font-semibold text-slate-900 dark:text-white">Meus dados</h2></div>
                    <dl className="mt-5 space-y-4 text-sm">
                        {[['CPF', user?.cpf], ['E-mail', user?.email], ['Telefone', user?.telefone]].map(([label, value]) => (
                            <div key={label}><dt className="text-slate-500 dark:text-slate-400">{label}</dt><dd className="mt-1 break-words font-medium text-slate-900 dark:text-slate-100">{value || 'Não informado'}</dd></div>
                        ))}
                    </dl>
                    <Link to="/profile" className="mt-6 inline-flex min-h-11 items-center font-semibold text-sky-800 underline underline-offset-4 dark:text-sky-300">Acessar meu perfil</Link>
                </section>

                <section aria-labelledby="patient-appointments" aria-busy={loading} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                    <div className="flex items-center gap-3"><Calendar aria-hidden="true" className="h-5 w-5 text-teal-700 dark:text-teal-400" /><h2 id="patient-appointments" className="text-lg font-semibold text-slate-900 dark:text-white">Meus atendimentos</h2></div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">Agendamentos e registros anteriores, das datas mais recentes para as mais antigas.</p>
                    {loading ? (
                        <p role="status" className="py-12 text-sm text-slate-600 dark:text-slate-400">Carregando seus atendimentos…</p>
                    ) : error ? (
                        <div role="alert" className="mt-6 rounded-lg bg-amber-50 p-4 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
                            <div className="flex items-center gap-2 font-medium"><AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />Não foi possível carregar seus atendimentos.</div>
                            <button className={`${buttonClass} mt-4`} onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button>
                        </div>
                    ) : appointments.length ? (
                        <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
                            {appointments.map(appointment => {
                                const date = new Date(appointment.data_hora);
                                const validDate = !Number.isNaN(date.getTime());
                                const future = validDate && date >= new Date();
                                return (
                                    <li key={appointment.id} className="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{validDate ? <time dateTime={appointment.data_hora}>{dateTime.format(date)}</time> : 'Data não disponível'}</p>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{appointment.tipo === 'plano' ? 'Plano de saúde' : appointment.tipo === 'particular' ? 'Particular' : 'Tipo não informado'}</p>
                                        </div>
                                        {validDate && <span className={`w-fit shrink-0 rounded-md px-2 py-1 text-xs font-medium ${future ? 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{future ? 'Data futura' : 'Data passada'}</span>}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="py-10 text-sm text-slate-600 dark:text-slate-400"><p className="font-semibold text-slate-900 dark:text-slate-100">{pagination?.total ? 'Nenhum atendimento nesta página.' : 'Nenhum atendimento registrado.'}</p><p className="mt-2">Em caso de dúvidas sobre agendamentos, entre em contato com a clínica.</p></div>
                    )}
                    {!loading && !error && pagination?.total > 0 && (
                        <nav aria-label="Páginas de atendimentos" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                            <p role="status" className="text-sm text-slate-600 dark:text-slate-400">Página {pagination.page} de {pagination.pages} · {pagination.total} registro{pagination.total === 1 ? '' : 's'}</p>
                            <div className="flex gap-2"><button className={buttonClass} disabled={!pagination.has_prev} onClick={() => setPage(value => value - 1)}><ChevronLeft aria-hidden="true" className="h-4 w-4" />Anterior</button><button className={buttonClass} disabled={!pagination.has_next} onClick={() => setPage(value => value + 1)}>Próxima<ChevronRight aria-hidden="true" className="h-4 w-4" /></button></div>
                        </nav>
                    )}
                </section>
            </div>
        </div>
    );
}
