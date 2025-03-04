import { useState } from 'react';

interface DashboardProps {
  totalCarteira: number;
  statusCarteira: {
    adimplente: number;
    inadimplente: number;
  };
  historicoInadimplencia: {
    mes: string;
    valor: number;
  }[];
  maioresInadimplentes: {
    nome: string;
    valor: number;
  }[];
}

export default function Dashboard({
  totalCarteira,
  statusCarteira,
  historicoInadimplencia,
  maioresInadimplentes,
}: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Carteira Total */}
      <div className="section-card">
        <h2 className="section-title">Carteira Total</h2>
        <div className="text-3xl font-bold text-gray-900">
          R$ {totalCarteira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Status da Carteira */}
      <div className="section-card">
        <h2 className="section-title">Status da Carteira</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">Adimplente</p>
            <p className="text-2xl font-semibold text-green-800">
              R$ {statusCarteira.adimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700">Inadimplente</p>
            <p className="text-2xl font-semibold text-red-800">
              R$ {statusCarteira.inadimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Histórico de Inadimplência */}
      <div className="section-card">
        <h2 className="section-title">Histórico de Inadimplência</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Mês</th>
                <th className="table-header">Valor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historicoInadimplencia.map((item, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">{item.mes}</td>
                  <td className="table-cell">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maiores Inadimplentes */}
      <div className="section-card">
        <h2 className="section-title">Maiores Inadimplentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Cliente</th>
                <th className="table-header">Valor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maioresInadimplentes.map((cliente, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">{cliente.nome}</td>
                  <td className="table-cell">
                    R$ {cliente.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 