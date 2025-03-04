'use client';

import { useState, useEffect } from 'react';
import { Card, Title, TextInput, Button } from '@tremor/react';
import { useRouter } from 'next/navigation';
import { formatDocument } from '@/utils/documentValidation';
import BackButton from '@/components/BackButton';

interface Cliente {
  id: number;
  nome: string;
  documento: string;
  observacoes: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

export default function EditarCliente({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente>({
    id: 0,
    nome: '',
    documento: '',
    observacoes: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await fetch(`/api/clientes/${params.id}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do cliente');
        }
        const data = await response.json();
        if (!data) {
          throw new Error('Cliente não encontrado');
        }
        setCliente({
          id: data.id,
          nome: data.nome,
          documento: data.documento,
          observacoes: data.observacoes || '',
          endereco: {
            rua: data.endereco?.rua || '',
            numero: data.endereco?.numero || '',
            bairro: data.endereco?.bairro || '',
            cidade: data.endereco?.cidade || '',
            estado: data.endereco?.estado || '',
            cep: data.endereco?.cep || '',
          },
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchCliente();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/clientes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao atualizar cliente');
      }

      router.push('/clientes/gerenciar');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 mx-auto max-w-7xl">
      <BackButton />
      <Card className="mt-6">
        <Title>Editar Cliente</Title>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <TextInput
              name="nome"
              value={cliente.nome}
              onChange={(e) => setCliente(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome do cliente"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
            <TextInput
              name="documento"
              value={cliente.documento}
              disabled
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <TextInput
              name="observacoes"
              value={cliente.observacoes}
              onChange={(e) => setCliente(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre o cliente"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rua</label>
              <TextInput
                name="rua"
                value={cliente.endereco.rua}
                onChange={(e) => setCliente(prev => ({
                  ...prev,
                  endereco: { ...prev.endereco, rua: e.target.value }
                }))}
                placeholder="Rua"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número</label>
              <TextInput
                name="numero"
                value={cliente.endereco.numero}
                onChange={(e) => setCliente(prev => ({
                  ...prev,
                  endereco: { ...prev.endereco, numero: e.target.value }
                }))}
                placeholder="Número"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bairro</label>
              <TextInput
                name="bairro"
                value={cliente.endereco.bairro}
                onChange={(e) => setCliente(prev => ({
                  ...prev,
                  endereco: { ...prev.endereco, bairro: e.target.value }
                }))}
                placeholder="Bairro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cidade</label>
              <TextInput
                name="cidade"
                value={cliente.endereco.cidade}
                onChange={(e) => setCliente(prev => ({
                  ...prev,
                  endereco: { ...prev.endereco, cidade: e.target.value }
                }))}
                placeholder="Cidade"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <TextInput
                name="estado"
                value={cliente.endereco.estado}
                onChange={(e) => setCliente(prev => ({
                  ...prev,
                  endereco: { ...prev.endereco, estado: e.target.value }
                }))}
                placeholder="Estado"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CEP</label>
              <TextInput
                name="cep"
                value={cliente.endereco.cep}
                onChange={(e) => setCliente(prev => ({
                  ...prev,
                  endereco: { ...prev.endereco, cep: e.target.value }
                }))}
                placeholder="CEP"
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Salvar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 