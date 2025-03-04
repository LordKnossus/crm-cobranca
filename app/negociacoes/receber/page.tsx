'use client';

import { useState, useEffect } from 'react';
import { Card, Title, TextInput, Button, NumberInput, Select, SelectItem } from '@tremor/react';
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

interface PagamentoForm {
  valor: number;
  tipoPagamento: 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO';
  comprovante?: string;
  horarioPix?: string;
}

export default function ReceberNota() {
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

  const [formData, setFormData] = useState<PagamentoForm>({
    valor: 0,
    tipoPagamento: 'DINHEIRO',
    comprovante: '',
    horarioPix: '',
  });

  const [removerMulta, setRemoverMulta] = useState(false);
  const [removerJuros, setRemoverJuros] = useState(false);

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
    const multa = diasAtraso > 0 && !removerMulta ? (principal * (notaData.multaAtraso || 0) / 100) : 0;
    const juros = diasAtraso > 0 && !removerJuros ? (principal * (notaData.jurosAtraso || 0) / 100 * Math.ceil(diasAtraso / 30)) : 0;
    
    const total = principal + multa + juros;
    
    setValorCalculado({ principal, multa, juros, total });
    setFormData(prev => ({ ...prev, valor: total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/notas/${nota.id}/receber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          removerMulta,
          removerJuros,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao registrar pagamento');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/notas/consultar');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento');
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
        <Title>Receber Nota</Title>
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
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Principal</label>
                <NumberInput
                  value={valorCalculado.principal}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Multa</label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={removerMulta}
                      onChange={(e) => {
                        setRemoverMulta(e.target.checked);
                        calcularValores(nota);
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-500">Remover multa</span>
                  </label>
                </div>
                <NumberInput
                  value={valorCalculado.multa}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Juros</label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={removerJuros}
                      onChange={(e) => {
                        setRemoverJuros(e.target.checked);
                        calcularValores(nota);
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-500">Remover juros</span>
                  </label>
                </div>
                <NumberInput
                  value={valorCalculado.juros}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Total</label>
                <NumberInput
                  value={valorCalculado.total}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                <Select
                  value={formData.tipoPagamento}
                  onValueChange={(value: 'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO') => setFormData(prev => ({ ...prev, tipoPagamento: value }))}
                >
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="CREDITO">Cartão de Crédito</SelectItem>
                  <SelectItem value="DEBITO">Cartão de Débito</SelectItem>
                </Select>
              </div>

              {formData.tipoPagamento === 'PIX' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Horário do PIX</label>
                  <TextInput
                    type="datetime-local"
                    value={formData.horarioPix}
                    onChange={(e) => setFormData(prev => ({ ...prev, horarioPix: e.target.value }))}
                  />
                </div>
              )}

              {(formData.tipoPagamento === 'CREDITO' || formData.tipoPagamento === 'DEBITO') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número do Comprovante</label>
                  <TextInput
                    value={formData.comprovante}
                    onChange={(e) => setFormData(prev => ({ ...prev, comprovante: e.target.value }))}
                    placeholder="Número do comprovante"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Pagamento registrado com sucesso! Redirecionando...
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
                {loading ? 'Registrando...' : 'Registrar Pagamento'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
} 