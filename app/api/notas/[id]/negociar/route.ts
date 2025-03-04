import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

interface RequestBody {
  valorTotal: number;
  numeroParcelas: number;
  dataVencimentoPrimeiraParcela: string;
  multaAtraso: number;
  jurosAtraso: number;
  observacoes?: string;
}

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: RequestBody = await request.json();

    // Verifica se a nota existe
    const notaOriginal = await prisma.nota.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
      },
    });

    if (!notaOriginal) {
      return NextResponse.json(
        { message: 'Nota não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se a nota está em estado válido para negociação
    if (notaOriginal.status !== 'PENDENTE') {
      return NextResponse.json(
        { message: 'Esta nota não pode ser negociada' },
        { status: 400 }
      );
    }

    // Calcula o valor de cada parcela
    const valorParcela = Math.ceil((body.valorTotal / body.numeroParcelas) * 100) / 100;
    const dataVencimentoPrimeiraParcela = new Date(body.dataVencimentoPrimeiraParcela);

    // Inicia uma transação para garantir a consistência dos dados
    const result = await prisma.$transaction(async (tx) => {
      // Atualiza o status da nota original
      await tx.nota.update({
        where: { id: notaOriginal.id },
        data: {
          status: 'RENEGOCIADO',
        },
      });

      // Cria as novas notas parceladas
      const notasPromises = Array.from({ length: body.numeroParcelas }).map((_, index) => {
        const dataVencimento = new Date(dataVencimentoPrimeiraParcela);
        dataVencimento.setMonth(dataVencimento.getMonth() + index);

        // Ajusta o valor da última parcela para compensar possíveis arredondamentos
        const valor = index === body.numeroParcelas - 1
          ? body.valorTotal - (valorParcela * (body.numeroParcelas - 1))
          : valorParcela;

        return tx.nota.create({
          data: {
            numero: `${notaOriginal.numero}-R${index + 1}`,
            valor,
            dataVencimento,
            status: 'PENDENTE',
            multaAtraso: body.multaAtraso,
            jurosAtraso: body.jurosAtraso,
            cliente: {
              connect: {
                id: notaOriginal.cliente.id,
              },
            },
            notaOriginalId: notaOriginal.id,
            usuario: {
              connect: {
                id: 'user-id', // TODO: Implementar autenticação
              },
            },
          },
        });
      });

      const notasRenegociadas = await Promise.all(notasPromises);

      // Registra o histórico da negociação
      await tx.historicoNota.create({
        data: {
          acao: 'RENEGOCIACAO',
          descricao: `Nota renegociada em ${body.numeroParcelas}x de R$ ${valorParcela.toFixed(2)}. ${
            body.observacoes ? `Observações: ${body.observacoes}` : ''
          }`,
          nota: {
            connect: {
              id: notaOriginal.id,
            },
          },
          usuarioId: 'user-id', // TODO: Implementar autenticação
        },
      });

      return notasRenegociadas;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar negociação:', error);
    return NextResponse.json(
      { message: 'Erro ao registrar negociação' },
      { status: 500 }
    );
  }
} 