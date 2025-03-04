'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { buscarClientes, excluirCliente } from '@/utils/supabaseClient';
import { Cliente } from '@/types/cliente';

export default function GerenciarClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setCarregando(true);
    setErro(null);

    try {
      const resultado = await buscarClientes('');
      setClientes(resultado);
    } catch (error) {
      setErro('Erro ao carregar clientes. Tente novamente.');
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setCarregando(false);
    }
  };

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    cliente.documento.includes(termoBusca)
  );

  const handleExcluirCliente = async (cliente: Cliente) => {
    if (cliente.totalDevido > 0) {
      alert('Não é possível excluir um cliente com dívidas pendentes.');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await excluirCliente(cliente.id);
      setClientes(clientes.filter(c => c.id !== cliente.id));
    } catch (error) {
      setErro('Erro ao excluir cliente. Tente novamente.');
      console.error('Erro ao excluir cliente:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h1>
          <button
            onClick={() => router.push('/clientes/cadastrar')}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Novo Cliente
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Digite o nome ou documento do cliente"
            value={termoBusca}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTermoBusca(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {erro && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="text-center text-gray-500 py-8">
            Carregando clientes...
          </div>
        ) : clientesFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Devido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cliente.documento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {(cliente.totalDevido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cliente.statusCarteira === 'adimplente' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.statusCarteira === 'adimplente' ? 'Adimplente' : 'Inadimplente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => router.push(`/clientes/editar/${cliente.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluirCliente(cliente)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  );
} 