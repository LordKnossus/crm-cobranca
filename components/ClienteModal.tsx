'use client';

import { Dialog } from '@headlessui/react';
import { Card, Title, Text } from '@tremor/react';

interface NotaDebito {
  id: number;
  valor: number;
  dataVencimento: string;
  status: 'ADIMPLENTE' | 'INADIMPLENTE';
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
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg p-6">
          <div className="flex justify-between items-start">
            <Title>Detalhes do Cliente</Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <Card className="p-4">
              <div className="space-y-2">
                <Text><strong>Nome:</strong> {cliente.nome}</Text>
                <Text><strong>CPF/CNPJ:</strong> {cliente.documento}</Text>
                <Text>
                  <strong>Endereço:</strong> {cliente.endereco.rua}, {cliente.endereco.numero} - {cliente.endereco.bairro}, {cliente.endereco.cidade}/{cliente.endereco.estado} - CEP: {cliente.endereco.cep}
                </Text>
                {cliente.observacoes && (
                  <Text><strong>Observações:</strong> {cliente.observacoes}</Text>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Text className="font-medium">Total Devido</Text>
                  <Text className="text-lg">R$ {cliente.totalDevido.toFixed(2)}</Text>
                </div>
                <div>
                  <Text className="font-medium">Total Adimplente</Text>
                  <Text className="text-lg">R$ {cliente.totalAdimplente.toFixed(2)}</Text>
                </div>
                <div>
                  <Text className="font-medium">Total Inadimplente</Text>
                  <Text className="text-lg text-red-500">R$ {cliente.totalInadimplente.toFixed(2)}</Text>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <Title className="mb-4">Notas de Débito</Title>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">ID</th>
                      <th className="py-2 px-4 text-left">Valor</th>
                      <th className="py-2 px-4 text-left">Vencimento</th>
                      <th className="py-2 px-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cliente.notas.map((nota) => (
                      <tr key={nota.id} className="border-b">
                        <td className="py-2 px-4">{nota.id}</td>
                        <td className="py-2 px-4">R$ {nota.valor.toFixed(2)}</td>
                        <td className="py-2 px-4">
                          {new Date(nota.dataVencimento).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 px-4">
                          <span className={nota.status === 'INADIMPLENTE' ? 'text-red-500 font-bold' : 'text-green-500'}>
                            {nota.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 