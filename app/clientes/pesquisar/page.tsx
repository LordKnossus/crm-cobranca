'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { buscarClientes } from '@/utils/supabaseClient';
import ClienteModal from '@/components/ClienteModal';
import { Cliente } from '@/types/cliente';

export default function PesquisarClientes() {
  const [termoBusca, setTermoBusca] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  const handleBuscar = async () => {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await buscarClientes(termoBusca);
      setClientes(resultado);
    } catch (error) {
      setErro('Erro ao buscar clientes. Tente novamente.');
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesquisar Clientes</h1>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Digite o nome ou documento do cliente"
            value={termoBusca}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermoBusca(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleBuscar}
            disabled={carregando}
            className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        {clientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Devido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Adimplente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor em Atraso</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientes.map((cliente) => (
                  <tr 
                    key={cliente.id}
                    onClick={() => setClienteSelecionado(cliente)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {`${cliente.endereco.rua}, ${cliente.endereco.numero} - ${cliente.endereco.bairro}, ${cliente.endereco.cidade}/${cliente.endereco.estado} - CEP: ${cliente.endereco.cep}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {(cliente.totalDevido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {(cliente.totalAdimplente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {(cliente.totalInadimplente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            {carregando ? 'Buscando clientes...' : 'Nenhum cliente encontrado.'}
          </div>
        )}
      </div>

      {clienteSelecionado && (
        <ClienteModal
          cliente={clienteSelecionado}
          isOpen={!!clienteSelecionado}
          onClose={() => setClienteSelecionado(null)}
        />
      )}
    </div>
  );
} 