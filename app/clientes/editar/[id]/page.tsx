'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDocument } from '@/utils/documentValidation';
import BackButton from '@/components/BackButton';
import { buscarClientePorId, atualizarCliente } from '@/utils/supabaseClient';
import { Cliente } from '@/types/cliente';
import EstadoSelect from '@/components/EstadoSelect';

export default function EditarCliente({ params }: { params: { id: string } }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    carregarCliente();
  }, [params.id]);

  const carregarCliente = async () => {
    try {
      const clienteData = await buscarClientePorId(params.id);
      setCliente(clienteData);
    } catch (error) {
      setErro('Erro ao carregar dados do cliente.');
      console.error('Erro ao carregar cliente:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;

    setSalvando(true);
    setErro(null);

    try {
      await atualizarCliente(cliente.id, cliente);
      router.push('/clientes/gerenciar');
    } catch (error) {
      setErro('Erro ao salvar alterações.');
      console.error('Erro ao atualizar cliente:', error);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">Cliente não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Cliente</h1>

        {erro && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              value={cliente.nome}
              onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="documento" className="block text-sm font-medium text-gray-700">
              CPF/CNPJ
            </label>
            <input
              type="text"
              id="documento"
              value={formatDocument(cliente.documento)}
              disabled
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
              Endereço
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rua" className="block text-sm font-medium text-gray-700">
                  Rua
                </label>
                <input
                  type="text"
                  id="rua"
                  value={cliente.endereco.rua}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCliente({ 
                    ...cliente, 
                    endereco: { ...cliente.endereco, rua: e.target.value }
                  })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
                  Número
                </label>
                <input
                  type="text"
                  id="numero"
                  value={cliente.endereco.numero}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCliente({ 
                    ...cliente, 
                    endereco: { ...cliente.endereco, numero: e.target.value }
                  })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                  Bairro
                </label>
                <input
                  type="text"
                  id="bairro"
                  value={cliente.endereco.bairro}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCliente({ 
                    ...cliente, 
                    endereco: { ...cliente.endereco, bairro: e.target.value }
                  })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                  Cidade
                </label>
                <input
                  type="text"
                  id="cidade"
                  value={cliente.endereco.cidade}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCliente({ 
                    ...cliente, 
                    endereco: { ...cliente.endereco, cidade: e.target.value }
                  })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <EstadoSelect
                  value={cliente.endereco.estado}
                  onChange={(value) => setCliente({ 
                    ...cliente, 
                    endereco: { ...cliente.endereco, estado: value }
                  })}
                />
              </div>
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
                  CEP
                </label>
                <input
                  type="text"
                  id="cep"
                  value={cliente.endereco.cep}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCliente({ 
                    ...cliente, 
                    endereco: { ...cliente.endereco, cep: e.target.value }
                  })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
              Observações
            </label>
            <textarea
              id="observacoes"
              value={cliente.observacoes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCliente({ ...cliente, observacoes: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/clientes/gerenciar')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 