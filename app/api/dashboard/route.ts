import { NextResponse } from 'next/server';
import { PrismaClient, Nota, Cliente } from '@prisma/client';

interface NotaComCliente extends Nota {
  cliente: Cliente;
  pagamentos: {
    valor: number;
  }[];
}

interface DadosAgregados {
  quantidade: number;
  valor: number;
}

interface DadosCliente {
  nome: string;
  quantidade: number;
  valor: number;
}

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Busca todas as notas com seus pagamentos
    const notas = await prisma.nota.findMany({
      include: {
        cliente: true,
        pagamentos: true,
      },
    }) as NotaComCliente[];

    // Calcula totais
    const totalNotas = notas.length;
    const totalValor = notas.reduce((sum: number, nota: NotaComCliente) => sum + nota.valor, 0);

    // Agrupa notas por status
    const notasPorStatus = Object.entries(
      notas.reduce((acc: { [key: string]: DadosAgregados }, nota: NotaComCliente) => {
        if (!acc[nota.status]) {
          acc[nota.status] = { quantidade: 0, valor: 0 };
        }
        acc[nota.status].quantidade += 1;
        acc[nota.status].valor += nota.valor;
        return acc;
      }, {})
    ).map(([status, dados]) => ({
      status,
      quantidade: dados.quantidade,
      valor: dados.valor,
    }));

    // Agrupa notas por mês
    const notasPorMes = Object.entries(
      notas.reduce((acc: { [key: string]: DadosAgregados }, nota: NotaComCliente) => {
        const mes = new Date(nota.dataVencimento).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        if (!acc[mes]) {
          acc[mes] = { quantidade: 0, valor: 0 };
        }
        acc[mes].quantidade += 1;
        acc[mes].valor += nota.valor;
        return acc;
      }, {})
    )
      .map(([mes, dados]) => ({
        mes,
        quantidade: dados.quantidade,
        valor: dados.valor,
      }))
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split(' de ');
        const [mesB, anoB] = b.mes.split(' de ');
        const dataA = new Date(Date.parse(`${mesA} 1, ${anoA}`));
        const dataB = new Date(Date.parse(`${mesB} 1, ${anoB}`));
        return dataA.getTime() - dataB.getTime();
      });

    // Agrupa notas por cliente
    const clientesComMaisNotas = Object.entries(
      notas.reduce((acc: { [key: string]: DadosCliente }, nota: NotaComCliente) => {
        const clienteId = nota.cliente.id;
        if (!acc[clienteId]) {
          acc[clienteId] = {
            nome: nota.cliente.nome,
            quantidade: 0,
            valor: 0,
          };
        }
        acc[clienteId].quantidade += 1;
        acc[clienteId].valor += nota.valor;
        return acc;
      }, {})
    )
      .map(([_, dados]) => dados)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);

    return NextResponse.json({
      totalNotas,
      totalValor,
      notasPorStatus,
      notasPorMes,
      clientesComMaisNotas,
    });
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    return NextResponse.json(
      { message: 'Erro ao carregar dados do dashboard' },
      { status: 500 }
    );
  }
} 