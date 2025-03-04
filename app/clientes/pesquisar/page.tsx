'use client';

import { useState } from 'react';
import { Card, TextInput, Button } from '@tremor/react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { buscarClientes } from '@/utils/supabaseClient';
import { Cliente } from '@/types/cliente';
import ClienteModal from '@/components/ClienteModal';

export default function PesquisarCliente() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setClientes([]);

    try {
      const { data, error } = await buscarClientes({ nome: searchTerm });
      
      if (error) {
        console.error('Erro na busca:', error);
        setError('Erro ao buscar clientes: ' + error.message);
        return;
      }

      setClientes(data || []);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao buscar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleClienteSelect = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setIsModalOpen(false);
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-4">
          <BackButton className="btn-secondary" />
        </div>

        <div className="section-card">
          <h2 className="section-title">PESQUISAR CLIENTES</h2>
          
          <form onSubmit={handleSearch} className="search-form">
            <TextInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome ou CPF/CNPJ do cliente"
              className="search-input"
            />
            <Button
              type="submit"
              className="btn-primary"
              loading={loading}
              disabled={loading}
            >
              Pesquisar
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md mt-4">
              {error}
            </div>
          )}

          {clientes.length > 0 && (
            <div className="mt-6">
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th className="table-header">Nome</th>
                    <th className="table-header">Rua</th>
                    <th className="table-header">Número</th>
                    <th className="table-header">Bairro</th>
                    <th className="table-header">Total Devido</th>
                    <th className="table-header">Adimplente</th>
                    <th className="table-header">Em Atraso</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr 
                      key={cliente.id} 
                      className="table-row cursor-pointer hover:bg-gray-50"
                      onClick={() => handleClienteSelect(cliente)}
                    >
                      <td className="table-cell">{cliente.nome}</td>
                      <td className="table-cell">{cliente.endereco.rua}</td>
                      <td className="table-cell">{cliente.endereco.numero}</td>
                      <td className="table-cell">{cliente.endereco.bairro}</td>
                      <td className="table-cell">R$ {cliente.totalDevido.toFixed(2)}</td>
                      <td className="table-cell">R$ {cliente.totalAdimplente.toFixed(2)}</td>
                      <td className="table-cell">R$ {cliente.totalInadimplente.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {clientes.length === 0 && searchTerm && !loading && (
            <div className="text-center py-4 text-gray-500">
              Nenhum cliente encontrado
            </div>
          )}
        </div>

        {selectedCliente && (
          <ClienteModal
            cliente={selectedCliente}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
} 