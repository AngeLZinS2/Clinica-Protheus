import { lazy, Suspense, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, MonitorPlay, ShieldCheck, Stethoscope } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import Footer from '../components/Footer';

const DNAExperience = lazy(() => import('../components/3D/DNAExperience'));

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const submitting = useRef(false);
    const { login, user, updateUser, enterPreview } = useAuth();
    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        setLoading(true);
        setError('');
        try {
            const success = await login(email.trim(), password, { silent: true });
            if (success) {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser?.first_access) setShowChangePassword(true);
                else navigate('/');
            } else {
                setError('Não foi possível entrar. Confira seu e-mail e sua senha e tente novamente.');
            }
        } catch {
            setError('Não foi possível entrar agora. Tente novamente em instantes.');
        } finally {
            submitting.current = false;
            setLoading(false);
        }
    };

    const handlePasswordChanged = () => {
        setShowChangePassword(false);
        updateUser({ first_access: false });
        navigate('/');
    };

    const handlePreview = () => {
        enterPreview();
        navigate('/');
    };

    const inputClass = 'block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-700/20 disabled:cursor-wait disabled:bg-slate-50';

    return (
        <main className="min-h-screen bg-slate-50 font-sans text-slate-900 lg:grid lg:grid-cols-2">
            <ChangePasswordModal isOpen={showChangePassword || !!user?.first_access} onSuccess={handlePasswordChanged} />
            <section aria-label="Clínica Protheus" className="relative flex flex-col justify-between overflow-hidden bg-sky-900 px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_50%,rgba(45,212,191,0.16),transparent_36%)]" />
                    <Suspense fallback={null}><DNAExperience reducedMotion={reduceMotion} /></Suspense>
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-900 via-sky-900/88 to-sky-900/10" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-sky-900 to-transparent" />
                </div>
                <div className="relative z-10 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10"><Stethoscope size={24} aria-hidden="true" /></span>
                    <div><p className="text-xl font-semibold tracking-tight">Clínica Protheus</p><p className="text-sm text-sky-200">Gestão clínica</p></div>
                </div>
                <div className="relative z-10 max-w-lg py-10 lg:py-20">
                    <div className="mb-6 h-1 w-12 rounded-full bg-teal-300" aria-hidden="true" />
                    <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Mais organização.<br />Mais tempo para cuidar.</h1>
                    <p className="mt-5 max-w-sm text-base leading-relaxed text-sky-100">Um espaço para conectar a rotina da equipe ao cuidado com cada paciente.</p>
                </div>
                <p className="relative z-10 hidden items-center gap-2 text-sm text-sky-200 lg:flex"><ShieldCheck size={18} aria-hidden="true" />Acesso para equipe e pacientes</p>
            </section>
            <section aria-labelledby="login-title" className="flex min-h-[640px] flex-col px-5 sm:px-10 lg:min-h-screen">
                <div className="flex flex-1 items-center justify-center py-10 lg:py-16">
                <motion.div initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }} className="w-full max-w-md">
                    <h2 id="login-title" className="text-3xl font-semibold tracking-tight">Bem-vindo de volta</h2>
                    <p className="mt-3 text-base leading-relaxed text-slate-600">Entre com sua conta para acessar a clínica.</p>
                    <form className="mt-8 space-y-5" onSubmit={handleSubmit} aria-busy={loading}>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium">E-mail</label>
                            <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={loading} value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} className={inputClass} placeholder="seu@email.com" aria-describedby={error ? 'login-error' : undefined} />
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium">Senha</label>
                            <div className="relative">
                                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required disabled={loading} value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} className={`${inputClass} pr-14`} aria-describedby={error ? 'login-error' : undefined} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 hover:text-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-700">{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button>
                            </div>
                        </div>
                        {error && <p id="login-error" role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">{error}</p>}
                        <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-sky-800 px-5 py-3 text-base font-semibold text-white transition-colors duration-[160ms] hover:bg-sky-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none"><span>{loading ? 'Entrando…' : 'Entrar'}</span>{!loading && <ArrowRight size={19} aria-hidden="true" />}</button>
                        <button type="button" onClick={handlePreview} disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-sky-200 bg-sky-50 px-5 py-3 text-base font-semibold text-sky-900 transition-colors duration-[160ms] hover:border-sky-300 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 disabled:opacity-70 motion-reduce:transition-none"><MonitorPlay size={19} aria-hidden="true" /><span>Preview com dados de demonstração</span></button>
                    {loading && <p role="status" className="sr-only">Entrando na clínica…</p>}</form>
                    <div className="mt-8 border-t border-slate-200 pt-6 text-sm leading-relaxed text-slate-500">Precisa de acesso ou esqueceu sua senha?<br /><span className="text-slate-700">Entre em contato com a administração da clínica.</span></div>
                </motion.div>
                </div>
                <Footer className="w-full" />
            </section>
        </main>
    );
}
