import { useEffect, useId, useRef, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Lock, Loader2 } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onSuccess }) {
    const dialogRef = useRef(null);
    const id = useId();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const dialog = dialogRef.current;
        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();
        return () => { if (dialog.open) dialog.close(); };
    }, [isOpen]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (loading) return;
        setError('');
        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (new TextEncoder().encode(newPassword).length > 72) {
            setError('A senha excede o limite de 72 bytes. Use uma senha mais curta.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem. Confira a confirmação.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/change-password', { new_password: newPassword });
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Senha alterada com sucesso!');
            onSuccess();
        } catch {
            setError('Não foi possível alterar a senha. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-white';

    return (
        <dialog ref={dialogRef} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={(event) => event.preventDefault()} className="m-auto w-[calc(100%_-_2rem)] max-w-md max-h-[calc(100dvh_-_2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            {isOpen && <>
                <div className="mb-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"><Lock className="h-6 w-6" aria-hidden="true" /></div>
                    <h2 id={`${id}-title`} className="text-xl font-semibold">Defina sua nova senha</h2>
                    <p id={`${id}-description`} className="mt-2 text-sm text-slate-600 dark:text-slate-300">Para sua segurança, altere a senha no primeiro acesso antes de continuar.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
                    <div>
                        <label htmlFor={`${id}-new`} className="mb-1 block text-sm font-medium">Nova senha</label>
                        <input id={`${id}-new`} autoFocus type="password" autoComplete="new-password" required minLength={6} disabled={loading} value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setError(''); }} aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`} aria-invalid={Boolean(error)} className={inputClass} />
                        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use pelo menos 6 caracteres, com limite de 72 bytes.</p>
                    </div>
                    <div>
                        <label htmlFor={`${id}-confirm`} className="mb-1 block text-sm font-medium">Confirmar nova senha</label>
                        <input id={`${id}-confirm`} type="password" autoComplete="new-password" required disabled={loading} value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={inputClass} />
                    </div>
                    {error && <p id={`${id}-error`} role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
                    <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-wait disabled:opacity-60">
                        {loading && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />}
                        {loading ? 'Alterando senha…' : 'Salvar senha e continuar'}
                    </button>
                </form>
            </>}
        </dialog>
    );
}
