'use client';

import Dashboard from '@/components/Dashboard';

const dadosMock = {
  carteiraTotal: 150000.00,
  percentualAdimplente: 75,
  percentualInadimplente: 25,
  historicoInadimplencia: [
    { periodo: 'Jan', percentual: 20 },
    { periodo: 'Fev', percentual: 22 },
    { periodo: 'Mar', percentual: 25 },
    { periodo: 'Abr', percentual: 23 },
    { periodo: 'Mai', percentual: 25 },
    { periodo: 'Jun', percentual: 24 },
  ],
  maioresInadimplentes: [
    { nome: 'João Silva', valor: 15000.00, diasAtraso: 45 },
    { nome: 'Maria Santos', valor: 12000.00, diasAtraso: 30 },
    { nome: 'Pedro Oliveira', valor: 9000.00, diasAtraso: 60 },
    { nome: 'Ana Costa', valor: 7500.00, diasAtraso: 15 },
    { nome: 'Carlos Souza', valor: 6000.00, diasAtraso: 90 },
  ],
};

export default function Home() {
  return (
    <div>
      <Dashboard {...dadosMock} />
    </div>
  );
} 