'use client';

import React, { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClienteAcoesModalProps {
  cliente: {
    id: string;
    nome: string;
    totalDevido: number;
  };
  onClose: () => void;
}

export default function ClienteAcoesModal({ cliente, onClose }: ClienteAcoesModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDelete = async () => {
    if (cliente.totalDevido > 0) {
      setError('Não é possível excluir cliente com dívida vigente.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir cliente');
      }

      router.push('/clientes/gerenciar');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Ações para {cliente.nome}</h2>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => router.push(`/clientes/editar/${cliente.id}`)}
            className="btn-primary w-full"
          >
            Editar Cliente
          </button>

          <button
            onClick={() => router.push(`/notas/cadastrar?clienteId=${cliente.id}`)}
            className="btn-primary w-full"
          >
            Cadastrar Nota
          </button>

          <button
            onClick={() => router.push(`/negociacoes/negociar?clienteId=${cliente.id}`)}
            className="btn-primary w-full"
          >
            Negociar Dívida
          </button>

          {cliente.totalDevido === 0 && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-danger w-full"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir Cliente'}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn-secondary w-full mt-4"
        >
          Fechar
        </button>
      </div>
    </div>
  );
} 