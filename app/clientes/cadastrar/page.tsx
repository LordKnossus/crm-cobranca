'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { cadastrarCliente } from '@/utils/supabaseClient';
import EstadoSelect from '@/components/EstadoSelect';

interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface ClienteForm {
  nome: string;
  documento: string;
  endereco: Endereco;
  observacoes?: string;
}

export default function CadastrarCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<ClienteForm>({
    nome: '',
    documento: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    },
    observacoes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validação do documento
    const documentoLimpo = formData.documento.replace(/\D/g, '');
    if (documentoLimpo.length !== 11 && documentoLimpo.length !== 14) {
      setError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      setLoading(false);
      return;
    }

    try {
      await cadastrarCliente(formData);
      router.push('/clientes/gerenciar');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    if (name.startsWith('endereco.')) {
      const enderecoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }));
    } else if (name === 'documento') {
      // Remove todos os caracteres não numéricos
      const numeros = value.replace(/\D/g, '');
      
      // Formata o documento baseado no tamanho
      let documentoFormatado = numeros;
      if (numeros.length <= 11) {
        // Formato CPF: 123.456.789-00
        documentoFormatado = numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else {
        // Formato CNPJ: 12.345.678/0001-00
        documentoFormatado = numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }

      setFormData(prev => ({
        ...prev,
        [name]: documentoFormatado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="mb-4">
          <BackButton className="btn-secondary" />
        </div>

        <div className="section-card">
          <h2 className="section-title">Cadastrar Cliente</h2>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nome" className="form-label">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="documento" className="form-label">CPF/CNPJ</label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="endereco.rua" className="form-label">Rua</label>
              <input
                type="text"
                id="endereco.rua"
                name="endereco.rua"
                value={formData.endereco.rua}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="endereco.numero" className="form-label">Número</label>
              <input
                type="text"
                id="endereco.numero"
                name="endereco.numero"
                value={formData.endereco.numero}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="endereco.bairro" className="form-label">Bairro</label>
              <input
                type="text"
                id="endereco.bairro"
                name="endereco.bairro"
                value={formData.endereco.bairro}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="endereco.cidade" className="form-label">Cidade</label>
              <input
                type="text"
                id="endereco.cidade"
                name="endereco.cidade"
                value={formData.endereco.cidade}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <EstadoSelect
                value={formData.endereco.estado}
                onChange={(value) => handleChange({ target: { name: 'endereco.estado', value } } as any)}
              />
            </div>

            <div>
              <label htmlFor="endereco.cep" className="form-label">CEP</label>
              <input
                type="text"
                id="endereco.cep"
                name="endereco.cep"
                value={formData.endereco.cep}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="observacoes" className="form-label">Observações</label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={4}
                className="form-input"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 