'use client';

import { useState } from 'react';
import { Card, TextInput, Button } from '@tremor/react';
import { useRouter } from 'next/navigation';
import { validateDocument, formatDocument } from '@/utils/documentValidation';
import BackButton from '@/components/BackButton';

interface FormData {
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

export default function CadastrarCliente() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
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
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateDocument(formData.documento)) {
      setError('CPF/CNPJ inválido');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          documento: formData.documento,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao cadastrar cliente');
      }

      router.push('/clientes/gerenciar');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value);
    setFormData(prev => ({ ...prev, documento: formatted }));
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-4">
          <BackButton className="btn-secondary" />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="section-card">
            <h2 className="section-title">DADOS PESSOAIS</h2>
            <div className="form-group">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <TextInput
                  name="nome"
                  value={formData.nome}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome do cliente"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                <TextInput
                  name="documento"
                  value={formData.documento}
                  onChange={handleDocumentoChange}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2 className="section-title">ENDEREÇO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                <TextInput
                  name="rua"
                  value={formData.endereco.rua}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, rua: e.target.value }
                  }))}
                  placeholder="Rua"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <TextInput
                  name="numero"
                  value={formData.endereco.numero}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, numero: e.target.value }
                  }))}
                  placeholder="Número"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <TextInput
                  name="bairro"
                  value={formData.endereco.bairro}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, bairro: e.target.value }
                  }))}
                  placeholder="Bairro"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <TextInput
                  name="cidade"
                  value={formData.endereco.cidade}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, cidade: e.target.value }
                  }))}
                  placeholder="Cidade"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <TextInput
                  name="estado"
                  value={formData.endereco.estado}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, estado: e.target.value }
                  }))}
                  placeholder="Estado"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <TextInput
                  name="cep"
                  value={formData.endereco.cep}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({
                    ...prev,
                    endereco: { ...prev.endereco, cep: e.target.value }
                  }))}
                  placeholder="CEP"
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2 className="section-title">OBSERVAÇÕES</h2>
            <div>
              <TextInput
                name="observacoes"
                value={formData.observacoes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações sobre o cliente"
                className="form-input"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              className="btn-primary"
              loading={loading}
              disabled={loading}
            >
              Cadastrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 