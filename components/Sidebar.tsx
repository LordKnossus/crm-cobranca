'use client';

import Link from 'next/link';
import { useState } from 'react';

interface MenuItem {
  title: string;
  icon: string;
  path: string;
  submenu?: {
    title: string;
    path: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Clientes',
    icon: '👥',
    path: '/clientes',
    submenu: [
      { title: 'Cadastrar Clientes', path: '/clientes/cadastrar' },
      { title: 'Pesquisar Clientes', path: '/clientes/pesquisar' },
      { title: 'Editar/Excluir Clientes', path: '/clientes/gerenciar' },
    ],
  },
  {
    title: 'Notas a Prazo',
    icon: '📝',
    path: '/notas',
    submenu: [
      { title: 'Cadastrar Notas', path: '/notas/cadastrar' },
      { title: 'Consultar Notas', path: '/notas/consultar' },
      { title: 'Editar/Excluir Notas', path: '/notas/gerenciar' },
    ],
  },
  {
    title: 'Receber e Negociar',
    icon: '💰',
    path: '/negociacoes',
    submenu: [
      { title: 'Receber Nota', path: '/negociacoes/receber' },
      { title: 'Negociar Nota', path: '/negociacoes/negociar' },
    ],
  },
  {
    title: 'Financeiro',
    icon: '📊',
    path: '/financeiro',
    submenu: [
      { title: 'Recebimentos', path: '/financeiro/recebimentos' },
      { title: 'Emissões', path: '/financeiro/emissoes' },
      { title: 'Demonstrativos', path: '/financeiro/demonstrativos' },
    ],
  },
  {
    title: 'Nota Promissória',
    icon: '📄',
    path: '/nota-promissoria',
  },
];

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleSubmenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="w-64 h-screen bg-white shadow-lg fixed left-0 top-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">Sistema de Cobranças</h1>
      </div>
      <nav className="p-4">
        {menuItems.map((item) => (
          <div key={item.title} className="mb-2">
            <button
              onClick={() => toggleSubmenu(item.title)}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <span className="flex items-center">
                <span className="mr-2">{item.icon}</span>
                {item.title}
              </span>
              {item.submenu && (
                <span className={`transform transition-transform ${
                  openMenus.includes(item.title) ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              )}
            </button>
            {item.submenu && openMenus.includes(item.title) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.path}
                    href={subItem.path}
                    className="block p-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded transition-colors"
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
} 