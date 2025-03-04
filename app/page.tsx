'use client';

import Dashboard from '@/components/Dashboard';

const dadosMock = {
  totalCarteira: 150000.00,
  statusCarteira: {
    adimplente: 112500.00,
    inadimplente: 37500.00
  },
  historicoInadimplencia: [
    { mes: 'Janeiro', valor: 30000.00 },
    { mes: 'Fevereiro', valor: 33000.00 },
    { mes: 'Março', valor: 37500.00 },
    { mes: 'Abril', valor: 34500.00 },
    { mes: 'Maio', valor: 37500.00 },
    { mes: 'Junho', valor: 36000.00 }
  ],
  maioresInadimplentes: [
    { nome: 'João Silva', valor: 15000.00 },
    { nome: 'Maria Santos', valor: 12000.00 },
    { nome: 'Pedro Oliveira', valor: 9000.00 },
    { nome: 'Ana Costa', valor: 7500.00 },
    { nome: 'Carlos Souza', valor: 6000.00 }
  ]
};

export default function Home() {
  return (
    <div>
      <Dashboard {...dadosMock} />
    </div>
  );
} 