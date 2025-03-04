'use client';

import { useState, useEffect } from 'react';
import { Card, Title, TextInput, Button, NumberInput, DatePicker, Select, SelectItem } from '@tremor/react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '@/components/BackButton';

interface Nota {
  id: string;
  numero: string;
  valor: number;
  dataVencimento: string;
  multaAtraso?: number;
  jurosAtraso?: number;
  cliente: {
    nome: string;
    cpf: string;
  };
}

interface NegociacaoForm {
  valorTotal: number;
  numeroParcelas: number;
  dataVencimentoPrimeiraParcela: Date;
  multaAtraso: number;
  jurosAtraso: number;
  observacoes?: string;
}

export default function NegociarNota() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notaId = searchParams.get('notaId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [nota, setNota] = useState<Nota | null>(null);
  const [valorCalculado, setValorCalculado] = useState<{
    principal: number;
    multa: number;
    juros: number;
    total: number;
  }>({
    principal: 0,
    multa: 0,
    juros: 0,
    total: 0,
  });

  const [formData, setFormData] = useState<NegociacaoForm>({
    valorTotal: 0,
    numeroParcelas: 1,
    dataVencimentoPrimeiraParcela: new Date(),
    multaAtraso: 2,
    jurosAtraso: 1,
    observacoes: '',
  });

  useEffect(() => {
    if (notaId) {
      carregarNota(notaId);
    }
  }, [notaId]);

  const carregarNota = async (id: string) => {
    try {
      const response = await fetch(`/api/notas/${id}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar dados da nota');
      }
      const data = await response.json();
      setNota(data);
      calcularValores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados da nota');
    }
  };

  const calcularValores = (notaData: Nota) => {
    const hoje = new Date();
    const vencimento = new Date(notaData.dataVencimento);
    const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24)));
    
    const principal = notaData.valor;
    const multa = diasAtraso > 0 ? (principal * (notaData.multaAtraso || 0) / 100) : 0;
    const juros = diasAtraso > 0 ? (principal * (notaData.jurosAtraso || 0) / 100 * Math.ceil(diasAtraso / 30)) : 0;
    
    const total = principal + multa + juros;
    
    setValorCalculado({ principal, multa, juros, total });
    setFormData(prev => ({ ...prev, valorTotal: total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/notas/${nota.id}/negociar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao registrar negociação');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/notas/consultar');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar negociação');
    } finally {
      setLoading(false);
    }
  };

  if (!nota) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <div className="text-center p-4">
            {error ? error : 'Carregando...'}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BackButton />
      <Card>
        <Title>Negociar Nota</Title>
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="font-medium text-lg mb-2">Dados da Nota</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Número</p>
                <p className="font-medium">{nota.numero}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">{nota.cliente.nome}</p>
                <p className="text-sm text-gray-500">{nota.cliente.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor Original</p>
                <p className="font-medium">
                  R$ {nota.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vencimento</p>
                <p className="font-medium">
                  {new Date(nota.dataVencimento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Principal</p>
                <p className="font-medium">
                  R$ {valorCalculado.principal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Multa</p>
                <p className="font-medium">
                  R$ {valorCalculado.multa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Juros</p>
                <p className="font-medium">
                  R$ {valorCalculado.juros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Valor Total Devido</p>
              <p className="font-medium text-lg">
                R$ {valorCalculado.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Total da Negociação</label>
                <NumberInput
                  value={formData.valorTotal}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, valorTotal: value || 0 }))}
                  min={0}
                  step={0.01}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Parcelas</label>
                <NumberInput
                  value={formData.numeroParcelas}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, numeroParcelas: value || 1 }))}
                  min={1}
                  max={12}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Data do Primeiro Vencimento</label>
                <DatePicker
                  value={formData.dataVencimentoPrimeiraParcela}
                  onValueChange={(date) => setFormData(prev => ({ ...prev, dataVencimentoPrimeiraParcela: date }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Multa por Atraso (%)</label>
                <NumberInput
                  value={formData.multaAtraso}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, multaAtraso: value || 2 }))}
                  min={0}
                  max={100}
                  step={0.1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Juros por Atraso (% ao mês)</label>
                <NumberInput
                  value={formData.jurosAtraso}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, jurosAtraso: value || 1 }))}
                  min={0}
                  max={100}
                  step={0.1}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Negociação registrada com sucesso! Redirecionando...
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
                {loading ? 'Registrando...' : 'Registrar Negociação'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
} 