const DEMO_TOKEN = 'clinica-protheus-preview';

const isoAt = (dayOffset, hour, minute = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
};

const initialStore = () => ({
    patients: [
        { id: 101, nome: 'Mariana Costa', cpf: '123.456.789-01', email: 'mariana.costa@exemplo.com', telefone: '(75) 99124-6801', data_nascimento: '1992-04-18', endereco: { rua: 'Rua das Acácias', numero: '120', bairro: 'Centro', cidade: 'Feira de Santana', estado: 'BA', cep: '44001-120' } },
        { id: 102, nome: 'Rafael Almeida', cpf: '234.567.890-12', email: 'rafael.almeida@exemplo.com', telefone: '(75) 99841-2230', data_nascimento: '1985-09-07', endereco: { rua: 'Av. Getúlio Vargas', numero: '450', bairro: 'Centro', cidade: 'Feira de Santana', estado: 'BA', cep: '44001-496' } },
        { id: 103, nome: 'Camila Oliveira', cpf: '345.678.901-23', email: 'camila.oliveira@exemplo.com', telefone: '(75) 98876-1045', data_nascimento: '2001-01-26', endereco: { rua: 'Rua Castro Alves', numero: '88', bairro: 'Kalilândia', cidade: 'Feira de Santana', estado: 'BA', cep: '44001-752' } },
        { id: 104, nome: 'João Santos', cpf: '456.789.012-34', email: 'joao.santos@exemplo.com', telefone: '(75) 99203-7741', data_nascimento: '1978-11-12', endereco: { rua: 'Rua São Domingos', numero: '310', bairro: 'Santa Mônica', cidade: 'Feira de Santana', estado: 'BA', cep: '44077-090' } },
        { id: 105, nome: 'Beatriz Lima', cpf: '567.890.123-45', email: 'beatriz.lima@exemplo.com', telefone: '(75) 98765-4310', data_nascimento: '1996-06-03', endereco: { rua: 'Av. Maria Quitéria', numero: '1020', bairro: 'Queimadinha', cidade: 'Feira de Santana', estado: 'BA', cep: '44050-000' } },
    ],
    procedures: [
        { id: 201, nome: 'Consulta clínica', valor_particular: 220, valor_plano: 145 },
        { id: 202, nome: 'Eletrocardiograma', valor_particular: 180, valor_plano: 120 },
        { id: 203, nome: 'Avaliação cardiológica', valor_particular: 320, valor_plano: 210 },
        { id: 204, nome: 'Retorno médico', valor_particular: 120, valor_plano: 80 },
    ],
    users: [
        { id: 900, nome: 'Visitante do Portfólio', email: 'preview@clinicaprotheus.com', tipo: 'admin', role: 'admin', ativo: true },
        { id: 901, nome: 'Dra. Laura Menezes', email: 'laura.menezes@exemplo.com', tipo: 'doctor', role: 'doctor', ativo: true },
        { id: 902, nome: 'Paulo Ribeiro', email: 'paulo.ribeiro@exemplo.com', tipo: 'receptionist', role: 'receptionist', ativo: true },
    ],
    appointments: [],
    audit: [],
});

let store = initialStore();
store.appointments = [
    { id: 301, patient_id: 101, patient: store.patients[0], data_hora: isoAt(0, 9), tipo: 'particular', procedures: [store.procedures[0]] },
    { id: 302, patient_id: 102, patient: store.patients[1], data_hora: isoAt(0, 11, 30), tipo: 'plano', procedures: [store.procedures[2]] },
    { id: 303, patient_id: 103, patient: store.patients[2], data_hora: isoAt(1, 14), tipo: 'particular', procedures: [store.procedures[1], store.procedures[0]] },
    { id: 304, patient_id: 104, patient: store.patients[3], data_hora: isoAt(2, 8, 30), tipo: 'plano', procedures: [store.procedures[3]] },
    { id: 305, patient_id: 105, patient: store.patients[4], data_hora: isoAt(-3, 16), tipo: 'particular', procedures: [store.procedures[2]] },
];
store.audit = [
    { id: 401, user_nome: 'Dra. Laura Menezes', action: 'CREATE', table_name: 'appointments', details: 'Agendou consulta para Mariana Costa', ip_address: '192.168.1.24', created_at: isoAt(0, 8, 42) },
    { id: 402, user_nome: 'Paulo Ribeiro', action: 'UPDATE', table_name: 'patients', details: 'Atualizou o telefone de Rafael Almeida', ip_address: '192.168.1.18', created_at: isoAt(-1, 15, 18) },
    { id: 403, user_nome: 'Visitante do Portfólio', action: 'LOGIN', table_name: 'users', details: 'Acessou o modo de demonstração', ip_address: 'demo', created_at: isoAt(0, 8) },
];

export const demoUser = store.users[0];
export const isDemoMode = () => localStorage.getItem('token') === DEMO_TOKEN;
export const startDemo = () => {
    store = { ...store };
    localStorage.setItem('token', DEMO_TOKEN);
    localStorage.setItem('user', JSON.stringify({ ...demoUser, first_access: false }));
    return { ...demoUser, first_access: false };
};

const parseBody = (data) => {
    if (!data) return {};
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch { return {}; }
    }
    return data;
};

const response = (config, data, status = 200) => Promise.resolve({ data, status, statusText: 'OK', headers: {}, config });
const collectionResponse = (items) => ({ items, total: items.length, page: 1, pages: 1 });

export const demoAdapter = async (config) => {
    await new Promise(resolve => setTimeout(resolve, 180));
    const path = (config.url || '').split('?')[0];
    const method = (config.method || 'get').toLowerCase();
    const body = parseBody(config.data);

    if (method === 'get' && path === '/dashboard/stats') {
        return response(config, { total_patients: 128, appointments_today: 12, total_procedures: 9, monthly_revenue: 28640 });
    }
    if (method === 'get' && path === '/audit') return response(config, collectionResponse(store.audit));

    const match = path.match(/^\/(patients|procedures|appointments|users)(?:\/(\d+))?/);
    if (!match) return response(config, { message: 'Ação simulada com sucesso.' });

    const [, resource, rawId] = match;
    const id = Number(rawId);
    if (method === 'get') return response(config, collectionResponse(store[resource]));
    if (path.endsWith('/reset-password')) return response(config, { message: 'Senha simulada redefinida.' });

    if (method === 'delete') {
        store[resource] = store[resource].filter(item => item.id !== id);
        return response(config, { message: 'Registro removido na demonstração.' });
    }

    if (method === 'post') {
        const created = { ...body, id: Date.now() };
        if (resource === 'appointments') {
            created.patient_id = Number(body.patient_id);
            created.patient = store.patients.find(patient => patient.id === created.patient_id);
            created.procedures = (body.procedures || []).map(Number).map(procedureId => store.procedures.find(procedure => procedure.id === procedureId)).filter(Boolean);
        }
        store[resource] = [created, ...store[resource]];
        return response(config, created, 201);
    }

    if (method === 'put' || method === 'patch') {
        const current = store[resource].find(item => item.id === id) || {};
        const updated = { ...current, ...body, id };
        store[resource] = store[resource].map(item => item.id === id ? updated : item);
        if (resource === 'users' && id === demoUser.id) localStorage.setItem('user', JSON.stringify({ ...updated, first_access: false }));
        return response(config, updated);
    }

    return response(config, { message: 'Ação simulada com sucesso.' });
};
