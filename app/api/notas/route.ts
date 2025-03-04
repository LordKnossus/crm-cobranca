import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verifica se já existe uma nota com o mesmo número
    const notaExistente = await prisma.nota.findUnique({
      where: {
        numero: body.numero,
      },
    });

    if (notaExistente) {
      return NextResponse.json(
        { message: 'Já existe uma nota com este número' },
        { status: 400 }
      );
    }

    // Cria a nota
    const novaNota = await prisma.nota.create({
      data: {
        numero: body.numero,
        valor: body.valor,
        dataVencimento: body.dataVencimento,
        itensVendidos: body.itensVendidos,
        multaAtraso: body.multaAtraso,
        jurosAtraso: body.jurosAtraso,
        status: 'PENDENTE',
        cliente: {
          connect: {
            id: body.clienteId,
          },
        },
        usuario: {
          connect: {
            id: 'user-id', // TODO: Implementar autenticação
          },
        },
      },
      include: {
        cliente: true,
      },
    });

    // Cria o histórico da nota
    await prisma.historicoNota.create({
      data: {
        acao: 'CRIACAO',
        descricao: 'Nota criada',
        nota: {
          connect: {
            id: novaNota.id,
          },
        },
        usuarioId: 'user-id', // TODO: Implementar autenticação
      },
    });

    return NextResponse.json(novaNota, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar nota:', error);
    return NextResponse.json(
      { message: 'Erro ao cadastrar nota' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const numero = searchParams.get('numero');
    const clienteId = searchParams.get('clienteId');
    const status = searchParams.get('status');
    const dataInicio = searchParams.get('dataInicio');
    const dataFim = searchParams.get('dataFim');
    const valorMinimo = searchParams.get('valorMinimo');
    const valorMaximo = searchParams.get('valorMaximo');

    const where: any = {};

    if (numero) {
      where.numero = numero;
    }

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.dataVencimento = {};
      if (dataInicio) {
        where.dataVencimento.gte = new Date(dataInicio);
      }
      if (dataFim) {
        where.dataVencimento.lte = new Date(dataFim);
      }
    }

    if (valorMinimo || valorMaximo) {
      where.valor = {};
      if (valorMinimo) {
        where.valor.gte = parseFloat(valorMinimo);
      }
      if (valorMaximo) {
        where.valor.lte = parseFloat(valorMaximo);
      }
    }

    const notas = await prisma.nota.findMany({
      where,
      include: {
        cliente: true,
        pagamentos: true,
      },
      orderBy: {
        dataVencimento: 'asc',
      },
    });

    return NextResponse.json(notas);
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar notas' },
      { status: 500 }
    );
  }
} 