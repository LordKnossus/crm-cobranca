'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Grid, Col, BarChart, DonutChart, Metric, Flex, ProgressBar } from '@tremor/react';

interface DashboardData {
  totalNotas: number;
  totalValor: number;
  notasPorStatus: {
    status: string;
    quantidade: number;
    valor: number;
  }[];
  notasPorMes: {
    mes: string;
    quantidade: number;
    valor: number;
  }[];
  clientesComMaisNotas: {
    nome: string;
    quantidade: number;
    valor: number;
  }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center p-4">Carregando...</div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center p-4 text-red-600">{error}</div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center p-4">Nenhum dado disponível</div>
        </Card>
      </div>
    );
  }

  const statusColors: { [key: string]: string } = {
    PENDENTE: 'yellow',
    PAGO: 'green',
    RENEGOCIADO: 'blue',
    PERDIDO: 'red',
  };

  return (
    <div className="p-6">
      <Title>Dashboard</Title>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
        <Card>
          <Text>Total de Notas</Text>
          <Metric>{data.totalNotas}</Metric>
        </Card>
        <Card>
          <Text>Valor Total</Text>
          <Metric>R$ {data.totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Metric>
        </Card>
        <Card>
          <Text>Média por Nota</Text>
          <Metric>
            R$ {(data.totalValor / data.totalNotas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Metric>
        </Card>
      </Grid>

      <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
        <Card>
          <Title>Notas por Status</Title>
          <DonutChart
            className="mt-6"
            data={data.notasPorStatus}
            category="valor"
            index="status"
            valueFormatter={(number) =>
              `R$ ${number.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            }
            colors={Object.values(statusColors)}
          />
        </Card>
        <Card>
          <Title>Notas por Mês</Title>
          <BarChart
            className="mt-6"
            data={data.notasPorMes}
            index="mes"
            categories={["valor"]}
            colors={["blue"]}
            valueFormatter={(number) =>
              `R$ ${number.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            }
          />
        </Card>
      </Grid>

      <Card className="mt-6">
        <Title>Top Clientes</Title>
        <div className="mt-6">
          {data.clientesComMaisNotas.map((cliente, index) => (
            <div key={index} className="mb-4">
              <Flex>
                <Text>{cliente.nome}</Text>
                <Text>
                  R$ {cliente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </Flex>
              <ProgressBar
                value={(cliente.valor / data.totalValor) * 100}
                color="blue"
                className="mt-2"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 