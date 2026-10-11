import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Loader2, User, Lock } from 'lucide-react';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const profile = useForm({ defaultValues: { nome: '', email: '' } });
    const password = useForm({ defaultValues: { current_password: '', new_password: '' } });
    const { reset } = profile;
    useEffect(() => { reset({ nome: user?.nome || '', email: user?.email || '' }); }, [user?.nome, user?.email, reset]);

    const saveProfile = async (data) => {
        profile.clearErrors('root');
        try {
            const payload = { nome: data.nome.trim(), email: data.email.trim() };
            const resource = user.role === 'patient' ? 'patients' : 'users';
            const response = await api.put(`/${resource}/${user.id}`, payload);
            // Preserve identity and permissions; only editable fields update the session.
            updateUser({ nome: response.data?.nome ?? payload.nome, email: response.data?.email ?? payload.email });
            toast.success('Dados pessoais atualizados');
        } catch (error) {
            profile.setError('root', { message: error.response?.data?.error || 'Não foi possível salvar seus dados. Tente novamente.' });
        }
    };
    const savePassword = async (data) => {
        password.clearErrors('root');
        try {
            await api.post('/auth/change-password', data);
            password.reset();
            toast.success('Senha alterada com sucesso');
        } catch (error) {
            password.setError('root', { message: error.response?.data?.error || 'Não foi possível alterar a senha. Tente novamente.' });
        }
    };
    const sections = [
        { key: 'profile', form: profile, submit: saveProfile, title: 'Dados pessoais', icon: User, action: 'Salvar dados pessoais', busy: 'Salvando dados…', fields: [
            { name: 'nome', label: 'Nome', type: 'text', autoComplete: 'name', rules: { required: 'Informe seu nome', validate: value => !!value.trim() || 'Informe seu nome' } },
            { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email', rules: { required: 'Informe seu e-mail' } },
        ] },
        { key: 'password', form: password, submit: savePassword, title: 'Alterar senha', icon: Lock, action: 'Alterar senha', busy: 'Alterando senha…', description: 'Informe sua senha atual e escolha uma nova senha com pelo menos 6 caracteres.', fields: [
            { name: 'current_password', label: 'Senha atual', type: 'password', autoComplete: 'current-password', rules: { required: 'Informe sua senha atual' } },
            { name: 'new_password', label: 'Nova senha', type: 'password', autoComplete: 'new-password', rules: { required: 'Informe a nova senha', minLength: { value: 6, message: 'Use pelo menos 6 caracteres' }, validate: value => new TextEncoder().encode(value).length <= 72 || 'Use uma senha de até 72 bytes'  } },
        ] },
    ];
    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <header className="mb-8">
                <p className="mb-2 text-sm font-semibold text-primary-700 dark:text-primary-300">Minha conta</p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Meu perfil</h1>
                <p className="mt-2 text-slate-600 dark:text-gray-300">Mantenha seus dados pessoais e sua senha atualizados.</p>
            </header>
            <div className="space-y-6">
                {sections.map(({ key, form, submit, title, icon: Icon, action, busy, description, fields }) => (
                    <form key={key} onSubmit={form.handleSubmit(submit)} className="glass-panel rounded-2xl p-5 sm:p-7" aria-labelledby={`${key}-title`} aria-busy={form.formState.isSubmitting}>
                        <h2 id={`${key}-title`} className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white"><Icon aria-hidden="true" className="h-5 w-5 text-primary-700 dark:text-primary-300" />{title}</h2>
                        {description && <p id={`${key}-help`} className="mt-2 text-sm text-slate-600 dark:text-gray-300">{description}</p>}
                        <fieldset disabled={form.formState.isSubmitting} className="mt-6 grid gap-5 sm:grid-cols-2">
                            {fields.map(field => {
                                const id = `${key}-${field.name}`;
                                const error = form.formState.errors[field.name];
                                const describedBy = [description ? `${key}-help` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
                                return <div key={field.name}>
                                    <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-gray-200">{field.label}</label>
                                    <input id={id} type={field.type} autoComplete={field.autoComplete} className="glass-input mt-2 block w-full rounded-lg px-3 py-2.5 text-sm" aria-invalid={!!error} aria-describedby={describedBy} {...form.register(field.name, field.rules)} />
                                    {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-700 dark:text-red-300">{error.message}</p>}
                                </div>;
                            })}
                        </fieldset>
                        {form.formState.errors.root && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">{form.formState.errors.root.message}</p>}
                        <div className="mt-6 flex justify-end"><button type="submit" className="btn-primary inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />}{form.formState.isSubmitting ? busy : action}</button></div>
                    </form>
                ))}
            </div>
        </div>
    );
}
