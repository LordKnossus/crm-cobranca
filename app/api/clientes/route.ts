import { NextResponse } from 'next/server';
import { validateDocument } from '@/utils/documentValidation';
import { cadastrarCliente, buscarClientes, Cliente } from '@/utils/supabaseClient';
import { NextRequest } from 'next/server';

interface CadastrarClienteBody {
  nome: string;
  documento: string;
  observacoes?: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CadastrarClienteBody;

    // Valida o documento (CPF/CNPJ)
    if (!validateDocument(body.documento)) {
      return NextResponse.json(
        { message: 'CPF/CNPJ inválido' },
        { status: 400 }
      );
    }

    const cliente = await cadastrarCliente({
      nome: body.nome,
      documento: body.documento,
      observacoes: body.observacoes,
      endereco: body.endereco,
    });

    return NextResponse.json(cliente);
  } catch (error: any) {
    console.error('Erro ao cadastrar cliente:', error);
    return NextResponse.json(
      { message: error.message || 'Erro ao cadastrar cliente' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const nome = searchParams.get('nome') || undefined;
    const documento = searchParams.get('documento') || undefined;
    const endereco = searchParams.get('endereco') || undefined;

    console.log('Parâmetros de busca:', { nome, documento, endereco });

    const clientes = await buscarClientes({
      nome,
      documento,
      endereco
    });

    console.log('Clientes encontrados:', clientes.length);
    return NextResponse.json(clientes);
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { message: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 