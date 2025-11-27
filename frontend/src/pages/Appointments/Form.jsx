import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function AppointmentForm({ appointment, onSuccess, onCancel }) {
    const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            patient_id: '',
            data_hora: '',
            tipo: 'particular',
            numero_carteira: '',
            procedures: []
        }
    });

    const [patients, setPatients] = useState([]);
    const [procedures, setProcedures] = useState([]);
    const tipo = watch('tipo');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, proceduresRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/procedures')
                ]);
                setPatients(patientsRes.data.items || []);
                setProcedures(proceduresRes.data.items || []);
            } catch (error) {
                toast.error('Erro ao carregar dados');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (appointment) {
            setValue('patient_id', appointment.patient_id);
            setValue('data_hora', appointment.data_hora.slice(0, 16)); // Format for datetime-local
            setValue('tipo', appointment.tipo);
            setValue('numero_carteira', appointment.numero_carteira);

            // Map procedures to IDs
            if (appointment.procedures) {
                setValue('procedures', appointment.procedures.map(p => p.id));
            }
        }
    }, [appointment, setValue]);

    const onSubmit = async (data) => {
        try {
            // Ensure procedures is an array of strings
            if (!Array.isArray(data.procedures)) {
                data.procedures = [data.procedures];
            }

            if (appointment) {
                await api.put(`/appointments/${appointment.id}`, data);
                toast.success('Atendimento atualizado com sucesso');
            } else {
                await api.post('/appointments', data);
                toast.success('Atendimento criado com sucesso');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar atendimento. Verifique os dados.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paciente</label>
                <select
                    {...register('patient_id', { required: 'Paciente é obrigatório' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                >
                    <option value="">Selecione um paciente</option>
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} - {p.cpf}</option>
                    ))}
                </select>
                {errors.patient_id && <span className="text-red-500 text-xs">{errors.patient_id.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data e Hora</label>
                <input
                    type="datetime-local"
                    {...register('data_hora', { required: 'Data e hora são obrigatórias' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                {errors.data_hora && <span className="text-red-500 text-xs">{errors.data_hora.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                <select
                    {...register('tipo', { required: 'Tipo é obrigatório' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                >
                    <option value="particular">Particular</option>
                    <option value="plano">Plano de Saúde</option>
                </select>
            </div>

            {tipo === 'plano' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número da Carteira</label>
                    <input
                        type="text"
                        {...register('numero_carteira', { required: 'Número da carteira é obrigatório para planos' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    {errors.numero_carteira && <span className="text-red-500 text-xs">{errors.numero_carteira.message}</span>}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Procedimentos</label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md dark:border-gray-600 dark:bg-gray-700">
                    {procedures.map(proc => (
                        <div key={proc.id} className="flex items-center">
                            <input
                                type="checkbox"
                                value={proc.id}
                                {...register('procedures', { required: 'Selecione pelo menos um procedimento' })}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                {proc.nome} - Part: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.valor_particular)} | Plano: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.valor_plano)}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.procedures && <span className="text-red-500 text-xs">{errors.procedures.message}</span>}
            </div>

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
        </form >
    );
}
