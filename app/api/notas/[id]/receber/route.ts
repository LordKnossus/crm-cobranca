import { NextResponse } from 'next/server';
import { PrismaClient, Pagamento } from '@prisma/client';

interface NotaComPagamentos {
  id: string;
  valor: number;
  status: string;
  pagamentos: {
    valor: number;
  }[];
}

interface RequestBody {
  valor: number;
  tipoPagamento: 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO';
  comprovante?: string;
  horarioPix?: string;
}

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: RequestBody = await request.json();

    // Verifica se a nota existe
    const nota = await prisma.nota.findUnique({
      where: { id: params.id },
      include: {
        pagamentos: true,
      },
    }) as NotaComPagamentos | null;

    if (!nota) {
      return NextResponse.json(
        { message: 'Nota não encontrada' },
        { status: 404 }
      );
    }

    // Verifica se a nota já está paga
    if (nota.status === 'PAGO') {
      return NextResponse.json(
        { message: 'Esta nota já está paga' },
        { status: 400 }
      );
    }

    // Verifica se o valor do pagamento é válido
    if (body.valor <= 0) {
      return NextResponse.json(
        { message: 'O valor do pagamento deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Calcula o valor total já pago
    const totalPago = nota.pagamentos.reduce((sum: number, pagamento) => sum + pagamento.valor, 0);

    // Cria o pagamento
    const pagamento = await prisma.pagamento.create({
      data: {
        valor: body.valor,
        tipoPagamento: body.tipoPagamento,
        comprovante: body.comprovante,
        horarioPix: body.horarioPix ? new Date(body.horarioPix) : null,
        nota: {
          connect: {
            id: nota.id,
          },
        },
      },
    });

    // Atualiza o status da nota se o valor total foi pago
    const novoTotalPago = totalPago + body.valor;
    if (novoTotalPago >= nota.valor) {
      await prisma.nota.update({
        where: { id: nota.id },
        data: {
          status: 'PAGO',
        },
      });
    }

    // Registra o histórico
    await prisma.historicoNota.create({
      data: {
        acao: 'RECEBIMENTO',
        descricao: `Recebimento de R$ ${body.valor.toFixed(2)} via ${body.tipoPagamento}${
          body.horarioPix ? ` (PIX realizado em ${new Date(body.horarioPix).toLocaleString('pt-BR')})` : ''
        }${
          body.comprovante ? ` - Comprovante: ${body.comprovante}` : ''
        }`,
        nota: {
          connect: {
            id: nota.id,
          },
        },
        usuarioId: 'user-id', // TODO: Implementar autenticação
      },
    });

    return NextResponse.json(pagamento, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    return NextResponse.json(
      { message: 'Erro ao registrar pagamento' },
      { status: 500 }
    );
  }
} 