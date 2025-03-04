'use client';

import { useState, useEffect } from 'react';
import { Card, Title, TextInput, Button, NumberInput, DatePicker } from '@tremor/react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '@/components/BackButton';

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
}

interface NotaForm {
  numero: string;
  valor: number;
  dataVencimento: Date;
  itensVendidos?: string;
  multaAtraso?: number;
  jurosAtraso?: number;
  clienteId: string;
}

export default function CadastrarNota() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clienteId = searchParams.get('clienteId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [pesquisaCliente, setPesquisaCliente] = useState('');
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);

  const [formData, setFormData] = useState<NotaForm>({
    numero: '',
    valor: 0,
    dataVencimento: new Date(),
    itensVendidos: '',
    multaAtraso: 2, // 2% padrão
    jurosAtraso: 1, // 1% ao mês padrão
    clienteId: clienteId || '',
  });

  useEffect(() => {
    if (clienteId) {
      carregarCliente(clienteId);
    }
  }, [clienteId]);

  const carregarCliente = async (id: string) => {
    try {
      const response = await fetch(`/api/clientes/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar dados do cliente');
      }
      const data = await response.json();
      setCliente(data);
      setFormData(prev => ({ ...prev, clienteId: id }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do cliente');
    }
  };

  const buscarClientes = async () => {
    if (!pesquisaCliente.trim()) return;

    setBuscandoCliente(true);
    try {
      const response = await fetch(`/api/clientes?nome=${encodeURIComponent(pesquisaCliente)}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
      }
      const data = await response.json();
      setClientesEncontrados(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar clientes');
    } finally {
      setBuscandoCliente(false);
    }
  };

  const selecionarCliente = (clienteSelecionado: Cliente) => {
    setCliente(clienteSelecionado);
    setFormData(prev => ({ ...prev, clienteId: clienteSelecionado.id }));
    setClientesEncontrados([]);
    setPesquisaCliente('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/notas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao cadastrar nota');
      }

      setSuccess(true);
      // Limpa o formulário
      setFormData({
        numero: '',
        valor: 0,
        dataVencimento: new Date(),
        itensVendidos: '',
        multaAtraso: 2,
        jurosAtraso: 1,
        clienteId: '',
      });
      setCliente(null);

      // Redireciona após 2 segundos
      setTimeout(() => {
        router.push('/notas/consultar');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar nota');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BackButton />
      <Card>
        <Title>Cadastrar Nota</Title>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {!cliente ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Buscar Cliente</label>
                <div className="mt-1 flex gap-2">
                  <TextInput
                    value={pesquisaCliente}
                    onChange={(e) => setPesquisaCliente(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                  <Button
                    type="button"
                    onClick={buscarClientes}
                    disabled={buscandoCliente}
                    loading={buscandoCliente}
                    className="bg-primary text-white"
                  >
                    Buscar
                  </Button>
                </div>
              </div>

              {clientesEncontrados.length > 0 && (
                <div className="mt-2 border rounded-md divide-y">
                  {clientesEncontrados.map((clienteEncontrado) => (
                    <div
                      key={clienteEncontrado.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => selecionarCliente(clienteEncontrado)}
                    >
                      <p className="font-medium">{clienteEncontrado.nome}</p>
                      <p className="text-sm text-gray-500">CPF: {clienteEncontrado.cpf}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium">Cliente Selecionado</h3>
                <p>{cliente.nome}</p>
                <p className="text-sm text-gray-500">CPF: {cliente.cpf}</p>
                <button
                  type="button"
                  onClick={() => {
                    setCliente(null);
                    setFormData(prev => ({ ...prev, clienteId: '' }));
                  }}
                  className="text-sm text-primary hover:text-primary-dark mt-2"
                >
                  Trocar Cliente
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número da Nota</label>
                  <TextInput
                    name="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                    placeholder="Número da nota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor</label>
                  <NumberInput
                    name="valor"
                    value={formData.valor}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, valor: value || 0 }))}
                    placeholder="Valor da nota"
                    required
                    min={0}
                    step={0.01}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                  <DatePicker
                    value={formData.dataVencimento}
                    onValueChange={(date) => setFormData(prev => ({ ...prev, dataVencimento: date }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Multa por Atraso (%)</label>
                  <NumberInput
                    name="multaAtraso"
                    value={formData.multaAtraso}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, multaAtraso: value }))}
                    placeholder="Multa por atraso"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Juros por Atraso (% ao mês)</label>
                  <NumberInput
                    name="jurosAtraso"
                    value={formData.jurosAtraso}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, jurosAtraso: value }))}
                    placeholder="Juros por atraso"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Itens Vendidos</label>
                <textarea
                  name="itensVendidos"
                  value={formData.itensVendidos}
                  onChange={(e) => setFormData(prev => ({ ...prev, itensVendidos: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  rows={3}
                  placeholder="Descrição dos itens vendidos"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  Nota cadastrada com sucesso! Redirecionando...
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={() => router.push('/notas/consultar')}
                  className="bg-gray-500 text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="bg-primary text-white"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Nota'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
} 