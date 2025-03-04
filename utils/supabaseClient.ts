import { createClient } from '@supabase/supabase-js';
import { BuscarClientesParams, BuscarClientesResponse, Cliente, NotaDebito, Endereco } from '@/types/cliente';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface NotaDebitoDB {
  id: string;
  valor: number;
  data_vencimento: string;
  status: 'ADIMPLENTE' | 'INADIMPLENTE';
}

interface ClienteDB {
  id: string;
  nome: string;
  documento: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento?: string;
  };
  observacoes: string;
  created_at: string;
  updated_at: string;
  notas_debito: NotaDebitoDB[];
}

export async function buscarClientes(termoBusca: string): Promise<Cliente[]> {
  let query = supabase
    .from('clientes')
    .select(`
      id,
      nome,
      documento,
      endereco,
      observacoes,
      created_at,
      updated_at,
      notas_debito (
        id,
        valor,
        data_vencimento
      )
    `);

  if (termoBusca) {
    query = query.or(`nome.ilike.%${termoBusca}%,documento.ilike.%${termoBusca}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }

  if (!data) {
    return [];
  }

  return (data as ClienteDB[]).map(cliente => {
    const notas = cliente.notas_debito || [];
    const hoje = new Date();
    
    const totalDevido = notas.reduce((acc: number, nota: NotaDebitoDB) => acc + (nota.valor || 0), 0);
    
    const totalInadimplente = notas.reduce((acc: number, nota: NotaDebitoDB) => {
      const dataVencimento = new Date(nota.data_vencimento);
      return dataVencimento < hoje ? acc + (nota.valor || 0) : acc;
    }, 0);
    
    const totalAdimplente = totalDevido - totalInadimplente;
    const statusCarteira = totalInadimplente > 0 ? 'inadimplente' : 'adimplente';

    return {
      id: cliente.id,
      nome: cliente.nome,
      documento: cliente.documento,
      endereco: cliente.endereco,
      observacoes: cliente.observacoes || '',
      totalDevido,
      totalAdimplente,
      totalInadimplente,
      statusCarteira,
      notas: notas.map((nota: NotaDebitoDB) => {
        const dataVencimento = new Date(nota.data_vencimento);
        const status = dataVencimento < hoje ? 'atrasado' : 'pendente';
        return {
          id: nota.id,
          valor: nota.valor,
          dataVencimento: nota.data_vencimento,
          status
        };
      })
    };
  });
}

interface ClienteForm {
  nome: string;
  documento: string;
  endereco: Endereco;
  observacoes?: string;
}

export async function cadastrarCliente(cliente: ClienteForm) {
  // Verificar se já existe um cliente com o mesmo documento
  const { data: clienteExistente, error: erroBusca } = await supabase
    .from('clientes')
    .select('id')
    .eq('documento', cliente.documento)
    .single();

  if (erroBusca && erroBusca.code !== 'PGRST116') { // PGRST116 é o código para "nenhum resultado encontrado"
    throw new Error('Erro ao verificar documento duplicado');
  }

  if (clienteExistente) {
    throw new Error('Já existe um cliente cadastrado com este CPF/CNPJ');
  }

  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('clientes')
    .insert([{
      nome: cliente.nome,
      documento: cliente.documento,
      endereco: cliente.endereco,
      observacoes: cliente.observacoes || '',
      created_at: now,
      updated_at: now
    }])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
}

export async function atualizarCliente(id: string, cliente: Partial<Cliente>) {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('clientes')
    .update({
      nome: cliente.nome,
      documento: cliente.documento,
      endereco: cliente.endereco,
      observacoes: cliente.observacoes,
      updated_at: now
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }

  return data[0];
}

export async function excluirCliente(id: string) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function inserirNotaDebito(nota: Omit<NotaDebito, 'id' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('notas_debito')
    .insert([{
      ...nota,
      created_at: now,
      updated_at: now
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function buscarClientePorId(id: string): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      id,
      nome,
      documento,
      endereco,
      observacoes,
      created_at,
      updated_at,
      notas_debito (
        id,
        valor,
        data_vencimento
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar cliente:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Cliente não encontrado');
  }

  const clienteDB = data as ClienteDB;
  const notas = clienteDB.notas_debito || [];
  const hoje = new Date();
  
  const totalDevido = notas.reduce((acc: number, nota: NotaDebitoDB) => acc + (nota.valor || 0), 0);
  
  const totalInadimplente = notas.reduce((acc: number, nota: NotaDebitoDB) => {
    const dataVencimento = new Date(nota.data_vencimento);
    return dataVencimento < hoje ? acc + (nota.valor || 0) : acc;
  }, 0);
  
  const totalAdimplente = totalDevido - totalInadimplente;
  const statusCarteira = totalInadimplente > 0 ? 'inadimplente' : 'adimplente';

  return {
    id: clienteDB.id,
    nome: clienteDB.nome,
    documento: clienteDB.documento,
    endereco: clienteDB.endereco,
    observacoes: clienteDB.observacoes || '',
    totalDevido,
    totalAdimplente,
    totalInadimplente,
    statusCarteira,
    notas: notas.map((nota: NotaDebitoDB) => {
      const dataVencimento = new Date(nota.data_vencimento);
      const status = dataVencimento < hoje ? 'atrasado' : 'pendente';
      return {
        id: nota.id,
        valor: nota.valor,
        dataVencimento: nota.data_vencimento,
        status
      };
    })
  };
} 