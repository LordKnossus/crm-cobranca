import { NextResponse } from 'next/server';
import { buscarClientePorId, atualizarCliente, excluirCliente } from '@/utils/supabaseClient';
import { createClient } from '@/utils/supabase/server';

interface Nota {
  status: string;
}

interface NotaDebito {
  valor: number;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await buscarClientePorId(parseInt(params.id));
    
    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Cliente não encontrado');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao buscar cliente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Verifica se o cliente tem débitos
    const { data: notasDebito, error: notasError } = await supabase
      .from('notas_debito')
      .select('valor')
      .eq('cliente_id', params.id);

    if (notasError) {
      throw new Error('Erro ao verificar débitos do cliente');
    }

    const totalDevido = (notasDebito as NotaDebito[] || []).reduce(
      (total: number, nota: NotaDebito) => total + nota.valor,
      0
    );

    if (totalDevido > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir um cliente com débitos pendentes.' },
        { status: 400 }
      );
    }

    // Exclui o cliente
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw new Error('Erro ao excluir cliente');
    }

    return NextResponse.json({ message: 'Cliente excluído com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir cliente' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const cliente = await atualizarCliente(parseInt(params.id), {
      nome: body.nome,
      observacoes: body.observacoes,
      endereco: body.endereco,
    });

    return NextResponse.json(cliente);
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
} 