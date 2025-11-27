import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function PatientForm({ patient, onSuccess, onCancel }) {
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            nome: '',
            cpf: '',
            email: '',
            telefone: '',
            data_nascimento: '',
            endereco: {
                cep: '',
                rua: '',
                numero: '',
                bairro: '',
                cidade: '',
                estado: ''
            },
            responsible: {
                nome: '',
                cpf: '',
                email: '',
                telefone: '',
                data_nascimento: ''
            }
        }
    });

    const dataNascimento = watch('data_nascimento');

    const isMinor = () => {
        if (!dataNascimento) return false;
        const birthDate = new Date(dataNascimento);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age < 18;
    };

    useEffect(() => {
        if (patient) {
            // Flatten or structure data as needed
            setValue('nome', patient.nome);
            setValue('cpf', patient.cpf);
            setValue('email', patient.email);
            setValue('telefone', patient.telefone);
            setValue('data_nascimento', patient.data_nascimento);

            if (patient.endereco) {
                setValue('endereco.cep', patient.endereco.cep);
                setValue('endereco.rua', patient.endereco.rua);
                setValue('endereco.numero', patient.endereco.numero);
                setValue('endereco.bairro', patient.endereco.bairro);
                setValue('endereco.cidade', patient.endereco.cidade);
                setValue('endereco.estado', patient.endereco.estado);
            }

            if (patient.responsible) {
                setValue('responsible.nome', patient.responsible.nome);
                setValue('responsible.cpf', patient.responsible.cpf);
                setValue('responsible.email', patient.responsible.email);
                setValue('responsible.telefone', patient.responsible.telefone);
                setValue('responsible.data_nascimento', patient.responsible.data_nascimento);
            }
        }
    }, [patient, setValue]);

    const onSubmit = async (data) => {
        try {
            // If not minor, remove responsible data to avoid sending empty fields if backend validates them
            if (!isMinor()) {
                delete data.responsible;
            }

            if (patient) {
                await api.put(`/patients/${patient.id}`, data);
                toast.success('Paciente atualizado com sucesso');
            } else {
                await api.post('/patients', data);
                toast.success('Paciente criado com sucesso');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar paciente. Verifique os dados.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                    <input
                        type="text"
                        {...register('nome', { required: 'Nome é obrigatório' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.nome && <span className="text-red-500 text-xs">{errors.nome.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
                    <input
                        type="text"
                        {...register('cpf', { required: 'CPF é obrigatório' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.cpf && <span className="text-red-500 text-xs">{errors.cpf.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                        type="email"
                        {...register('email', { required: 'Email é obrigatório' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
                    <input
                        type="text"
                        {...register('telefone', { required: 'Telefone é obrigatório' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.telefone && <span className="text-red-500 text-xs">{errors.telefone.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
                    <input
                        type="date"
                        {...register('data_nascimento', { required: 'Data de nascimento é obrigatória' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.data_nascimento && <span className="text-red-500 text-xs">{errors.data_nascimento.message}</span>}
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Endereço</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
                        <input
                            type="text"
                            {...register('endereco.cep')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rua</label>
                        <input
                            type="text"
                            {...register('endereco.rua')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
                        <input
                            type="text"
                            {...register('endereco.numero')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bairro</label>
                        <input
                            type="text"
                            {...register('endereco.bairro')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
                        <input
                            type="text"
                            {...register('endereco.cidade')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                        <input
                            type="text"
                            {...register('endereco.estado')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            {isMinor() && (
                <div className="border-t pt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Responsável (Obrigatório para menores)</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Responsável</label>
                            <input
                                type="text"
                                {...register('responsible.nome', { required: isMinor() ? 'Nome do responsável é obrigatório' : false })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            {errors.responsible?.nome && <span className="text-red-500 text-xs">{errors.responsible.nome.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF do Responsável</label>
                            <input
                                type="text"
                                {...register('responsible.cpf', { required: isMinor() ? 'CPF do responsável é obrigatório' : false })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            {errors.responsible?.cpf && <span className="text-red-500 text-xs">{errors.responsible.cpf.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email do Responsável</label>
                            <input
                                type="email"
                                {...register('responsible.email', { required: isMinor() ? 'Email do responsável é obrigatório' : false })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            {errors.responsible?.email && <span className="text-red-500 text-xs">{errors.responsible.email.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefone do Responsável</label>
                            <input
                                type="text"
                                {...register('responsible.telefone', { required: isMinor() ? 'Telefone do responsável é obrigatório' : false })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            {errors.responsible?.telefone && <span className="text-red-500 text-xs">{errors.responsible.telefone.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento do Responsável</label>
                            <input
                                type="date"
                                {...register('responsible.data_nascimento', { required: isMinor() ? 'Data de nascimento do responsável é obrigatória' : false })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            {errors.responsible?.data_nascimento && <span className="text-red-500 text-xs">{errors.responsible.data_nascimento.message}</span>}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </button>
            </div>
        </form>
    );
}
