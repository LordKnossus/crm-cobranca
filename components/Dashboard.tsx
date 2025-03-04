import { Card, Title, BarChart, DonutChart } from '@tremor/react';
import { useState } from 'react';

interface DashboardProps {
  carteiraTotal: number;
  percentualAdimplente: number;
  percentualInadimplente: number;
  historicoInadimplencia: {
    periodo: string;
    percentual: number;
  }[];
  maioresInadimplentes: {
    nome: string;
    valor: number;
    diasAtraso: number;
  }[];
}

export default function Dashboard({
  carteiraTotal,
  percentualAdimplente,
  percentualInadimplente,
  historicoInadimplencia,
  maioresInadimplentes,
}: DashboardProps) {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'dias' | 'semanas' | 'meses'>('meses');

  const dadosGraficoCarteira = [
    {
      name: 'Adimplente',
      valor: percentualAdimplente,
    },
    {
      name: 'Inadimplente',
      valor: percentualInadimplente,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <Title>Carteira Total</Title>
          <p className="mt-2 text-2xl font-bold text-primary">
            R$ {carteiraTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        <Card>
          <Title>Status da Carteira</Title>
          <DonutChart
            className="mt-4 h-40"
            data={dadosGraficoCarteira}
            category="valor"
            index="name"
            colors={['emerald', 'red']}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
        </Card>

        <Card>
          <Title>Histórico de Inadimplência</Title>
          <div className="mb-4">
            <select
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(e.target.value as 'dias' | 'semanas' | 'meses')}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="dias">Últimos Dias</option>
              <option value="semanas">Últimas Semanas</option>
              <option value="meses">Últimos Meses</option>
            </select>
          </div>
          <BarChart
            className="mt-4 h-40"
            data={historicoInadimplencia}
            index="periodo"
            categories={['percentual']}
            colors={['red']}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
        </Card>
      </div>

      <Card>
        <Title>Maiores Inadimplentes</Title>
        <div className="mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dias em Atraso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maioresInadimplentes.map((cliente, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {cliente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cliente.diasAtraso}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
} 