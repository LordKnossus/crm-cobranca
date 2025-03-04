'use client';

import { useState } from 'react';
import { Card, Title, TextInput, Button, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, NumberInput, DatePicker, Select, SelectItem } from '@tremor/react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

interface Nota {
  id: string;
  numero: string;
  valor: number;
  dataVencimento: string;
  status: string;
  itensVendidos?: string;
  cliente: {
    nome: string;
  };
}

export default function ConsultarNotas() {
  const [searchParams, setSearchParams] = useState({
    numero: '',
    clienteId: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    valorMinimo: '',
    valorMaximo: '',
  });
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchParams.numero) params.append('numero', searchParams.numero);
      if (searchParams.clienteId) params.append('clienteId', searchParams.clienteId);
      if (searchParams.status) params.append('status', searchParams.status);
      if (searchParams.dataInicio) params.append('dataInicio', searchParams.dataInicio);
      if (searchParams.dataFim) params.append('dataFim', searchParams.dataFim);
      if (searchParams.valorMinimo) params.append('valorMinimo', searchParams.valorMinimo);
      if (searchParams.valorMaximo) params.append('valorMaximo', searchParams.valorMaximo);

      const response = await fetch(`/api/notas?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar notas');
      }

      const data = await response.json();
      setNotas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar notas');
      setNotas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDENTE: 'Pendente',
      PAGO: 'Pago',
      RENEGOCIADO: 'Renegociado',
      PERDIDO: 'Perdido',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      PENDENTE: 'text-warning',
      PAGO: 'text-success',
      RENEGOCIADO: 'text-primary',
      PERDIDO: 'text-danger',
    };
    return colorMap[status] || 'text-gray-500';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BackButton />
      <Card>
        <Title>Consultar Notas</Title>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Número da Nota</label>
            <TextInput
              value={searchParams.numero}
              onChange={(e) => setSearchParams(prev => ({ ...prev, numero: e.target.value }))}
              placeholder="Número da nota"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <Select
              value={searchParams.status}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
            >
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="PAGO">Pago</SelectItem>
              <SelectItem value="RENEGOCIADO">Renegociado</SelectItem>
              <SelectItem value="PERDIDO">Perdido</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data Inicial</label>
            <DatePicker
              value={searchParams.dataInicio ? new Date(searchParams.dataInicio) : undefined}
              onValueChange={(date) => setSearchParams(prev => ({ ...prev, dataInicio: date?.toISOString() || '' }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Data Final</label>
            <DatePicker
              value={searchParams.dataFim ? new Date(searchParams.dataFim) : undefined}
              onValueChange={(date) => setSearchParams(prev => ({ ...prev, dataFim: date?.toISOString() || '' }))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Valor Mínimo</label>
            <NumberInput
              value={searchParams.valorMinimo ? parseFloat(searchParams.valorMinimo) : undefined}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, valorMinimo: value?.toString() || '' }))}
              min={0}
              step={0.01}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Valor Máximo</label>
            <NumberInput
              value={searchParams.valorMaximo ? parseFloat(searchParams.valorMaximo) : undefined}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, valorMaximo: value?.toString() || '' }))}
              min={0}
              step={0.01}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSearch}
            disabled={loading}
            loading={loading}
            className="bg-primary text-white"
          >
            {loading ? 'Pesquisando...' : 'Pesquisar'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {notas.length > 0 && (
          <div className="mt-6">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Número</TableHeaderCell>
                  <TableHeaderCell>Cliente</TableHeaderCell>
                  <TableHeaderCell>Valor</TableHeaderCell>
                  <TableHeaderCell>Vencimento</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Ações</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notas.map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell>{nota.numero}</TableCell>
                    <TableCell>{nota.cliente.nome}</TableCell>
                    <TableCell>
                      R$ {nota.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{formatarData(nota.dataVencimento)}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(nota.status)}>
                        {formatarStatus(nota.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link
                          href={`/notas/editar/${nota.id}`}
                          className="text-primary hover:text-primary-dark"
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/negociacoes/receber?notaId=${nota.id}`}
                          className="text-success hover:text-success-dark"
                        >
                          Receber
                        </Link>
                        <Link
                          href={`/negociacoes/negociar?notaId=${nota.id}`}
                          className="text-warning hover:text-warning-dark"
                        >
                          Negociar
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {notas.length === 0 && !loading && !error && (
          <div className="mt-6 text-center text-gray-500">
            Nenhuma nota encontrada
          </div>
        )}
      </Card>
    </div>
  );
} 