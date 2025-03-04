'use client';

import React, { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@tremor/react';
import { Cliente } from '@/types/cliente';

interface ClienteAcoesModalProps {
  cliente: Cliente;
  isOpen: boolean;
  onClose: () => void;
  onClienteDeleted: () => void;
}

export default function ClienteAcoesModal({ cliente, isOpen, onClose, onClienteDeleted }: ClienteAcoesModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/clientes/editar/${cliente.id}`);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === 'Não é possível excluir um cliente com débitos pendentes.') {
          throw new Error('Não é possível excluir cliente com dívida vigente');
        }
        throw new Error(data.error || data.message || 'Erro ao excluir cliente');
      }

      onClienteDeleted();
    } catch (err: any) {
      setError(err.message);
      setShowConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="section-card max-w-sm w-full">
          <Dialog.Title className="section-title">
            {showConfirmDelete ? 'Confirmar Exclusão' : 'Opções do Cliente'}
          </Dialog.Title>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
              {error}
            </div>
          )}

          {!showConfirmDelete ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Selecione uma ação para o cliente <strong>{cliente.nome}</strong>
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button
                  className="btn-primary"
                  onClick={handleEdit}
                >
                  Editar Cliente
                </Button>
                <Button
                  className="btn-danger"
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Excluir Cliente
                </Button>
                <Button
                  className="btn-secondary"
                  onClick={handleClose}
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Tem certeza que deseja excluir o cliente <strong>{cliente.nome}</strong>?
                {cliente.totalDevido > 0 && (
                  <span className="block text-red-600 mt-2">
                    Este cliente possui débitos pendentes e não pode ser excluído.
                  </span>
                )}
              </p>
              
              <div className="flex flex-col space-y-2">
                {cliente.totalDevido === 0 && (
                  <Button
                    className="btn-danger"
                    onClick={handleDelete}
                    loading={loading}
                    disabled={loading}
                  >
                    Confirmar Exclusão
                  </Button>
                )}
                <Button
                  className="btn-secondary"
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 