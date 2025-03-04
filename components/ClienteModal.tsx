'use client';

import { Dialog } from '@headlessui/react';

interface NotaDebito {
  id: number;
  valor: number;
  dataVencimento: string;
  status: 'atrasado' | 'pendente';
}

interface Cliente {
  id: number;
  nome: string;
  documento: string;
  observacoes?: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  totalDevido: number;
  totalAdimplente: number;
  totalInadimplente: number;
  notas: NotaDebito[];
}

interface ClienteModalProps {
  cliente: Cliente | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClienteModal({ cliente, isOpen, onClose }: ClienteModalProps) {
  if (!cliente) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Detalhes do Cliente
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fechar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                <p className="mt-1 text-base text-gray-900">{cliente.nome}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">CPF/CNPJ</h3>
                <p className="mt-1 text-base text-gray-900">{cliente.documento}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
                <p className="mt-1 text-base text-gray-900">
                  {cliente.endereco.rua}, {cliente.endereco.numero}
                  <br />
                  {cliente.endereco.bairro} - {cliente.endereco.cidade}/{cliente.endereco.estado}
                  <br />
                  CEP: {cliente.endereco.cep}
                </p>
              </div>

              {cliente.observacoes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Observações</h3>
                  <p className="mt-1 text-base text-gray-900">{cliente.observacoes}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Devido</h3>
                <p className="mt-1 text-base text-gray-900">
                  R$ {(cliente.totalDevido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status da Carteira</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700">Total Adimplente</p>
                    <p className="text-lg font-semibold text-green-800">
                      R$ {(cliente.totalAdimplente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-700">Total Inadimplente</p>
                    <p className="text-lg font-semibold text-red-800">
                      R$ {(cliente.totalInadimplente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notas de Débito</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="table-header">Valor</th>
                        <th className="table-header">Vencimento</th>
                        <th className="table-header">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cliente.notas?.map((nota) => (
                        <tr key={nota.id} className="table-row">
                          <td className="table-cell">
                            R$ {(nota.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="table-cell">
                            {new Date(nota.dataVencimento).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="table-cell">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              nota.status === 'pendente' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {nota.status === 'pendente' ? 'No prazo' : 'Atrasado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 