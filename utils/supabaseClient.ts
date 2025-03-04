import { createClient } from '@supabase/supabase-js';
import { BuscarClientesParams, BuscarClientesResponse, Cliente, NotaDebito } from '@/types/cliente';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function buscarClientes(params: BuscarClientesParams | string): Promise<BuscarClientesResponse> {
  try {
    console.log('Iniciando busca de clientes com parâmetros:', params);
    
    let query = supabase
      .from('clientes')
      .select(`
        *,
        notas_debito (
          id,
          valor,
          data_vencimento
        )
      `);

    if (typeof params === 'string') {
      if (params.trim()) {
        const searchTerm = params.trim();
        query = query.or(`nome.ilike.%${searchTerm}%,documento.ilike.%${searchTerm}%`);
      }
    } else {
      if (params.nome?.trim()) {
        const searchTerm = params.nome.trim();
        query = query.or(`nome.ilike.%${searchTerm}%,documento.ilike.%${searchTerm}%`);
      }
      if (params.documento?.trim()) {
        query = query.ilike('documento', `%${params.documento.trim()}%`);
      }
      if (params.endereco?.trim()) {
        const searchTerm = params.endereco.trim();
        query = query.or(
          `endereco->rua.ilike.%${searchTerm}%,` +
          `endereco->bairro.ilike.%${searchTerm}%,` +
          `endereco->cidade.ilike.%${searchTerm}%,` +
          `endereco->estado.ilike.%${searchTerm}%`
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro na consulta Supabase:', error);
      throw error;
    }

    if (!data) {
      console.log('Nenhum cliente encontrado');
      return { data: [], error: null };
    }

    // Calcular totais baseado apenas na data de vencimento
    const clientesComTotais = data.map((cliente: any) => {
      const notasDebito = cliente.notas_debito || [];
      const totalDevido = notasDebito.reduce((acc: number, nota: any) => acc + (nota.valor || 0), 0);
      
      // Calcular totais baseado apenas na data de vencimento
      const hoje = new Date();
      const totalInadimplente = notasDebito
        .filter((nota: any) => {
          const dataVencimento = new Date(nota.data_vencimento);
          return dataVencimento < hoje;
        })
        .reduce((acc: number, nota: any) => acc + (nota.valor || 0), 0);
      
      const totalAdimplente = totalDevido - totalInadimplente;

      // Formatar as notas com o status
      const notasFormatadas = notasDebito.map((nota: any) => {
        const dataVencimento = new Date(nota.data_vencimento);
        const status = dataVencimento < hoje ? 'INADIMPLENTE' : 'ADIMPLENTE';
        
        return {
          id: nota.id,
          valor: nota.valor,
          dataVencimento: nota.data_vencimento,
          status
        };
      });

      return {
        ...cliente,
        totalDevido,
        totalAdimplente,
        totalInadimplente,
        notas: notasFormatadas
      };
    });

    console.log(`Encontrados ${clientesComTotais.length} clientes`);
    return { data: clientesComTotais, error: null };
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return { data: [], error: error as Error };
  }
}

export async function cadastrarCliente(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('clientes')
    .insert([{
      ...cliente,
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

export async function buscarClientePorId(id: number) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        notas_debito (
          id,
          valor,
          data_vencimento
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    // Calcular totais baseado apenas na data de vencimento
    const hoje = new Date();
    const notasDebito = data.notas_debito || [];
    const totalDevido = notasDebito.reduce((acc: number, nota: any) => acc + (nota.valor || 0), 0);
    const totalInadimplente = notasDebito
      .filter((nota: any) => {
        const dataVencimento = new Date(nota.data_vencimento);
        return dataVencimento < hoje;
      })
      .reduce((acc: number, nota: any) => acc + (nota.valor || 0), 0);
    const totalAdimplente = totalDevido - totalInadimplente;

    // Formatar as notas com o status
    const notasFormatadas = notasDebito.map((nota: any) => {
      const dataVencimento = new Date(nota.data_vencimento);
      const status = dataVencimento < hoje ? 'INADIMPLENTE' : 'ADIMPLENTE';
      
      return {
        id: nota.id,
        valor: nota.valor,
        dataVencimento: nota.data_vencimento,
        status
      };
    });

    // Formatar o cliente de acordo com a interface Cliente
    const clienteFormatado = {
      id: data.id,
      nome: data.nome,
      documento: data.documento,
      endereco: {
        rua: data.endereco?.rua || '',
        numero: data.endereco?.numero || '',
        bairro: data.endereco?.bairro || '',
        cidade: data.endereco?.cidade || '',
        estado: data.endereco?.estado || '',
        cep: data.endereco?.cep || ''
      },
      observacoes: data.observacoes || '',
      totalDevido,
      totalAdimplente,
      totalInadimplente,
      notas: notasFormatadas
    };

    return { data: clienteFormatado, error: null };
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return { data: null, error };
  }
}

export async function atualizarCliente(id: number, dados: Partial<Cliente>) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return { data: null, error };
  }
}

export async function excluirCliente(id: number) {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return { error };
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