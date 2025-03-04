import { config } from 'dotenv';
import { resolve } from 'path';
import { inserirNotaDebito } from '../utils/supabaseClient';

// Carrega as variáveis de ambiente do arquivo .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function main() {
  const notasDebito = [
    // Cliente 3 (DIEGO)
    {
      cliente_id: 3,
      valor: 1500.00,
      data_vencimento: '2024-02-15' // Vencida
    },
    {
      cliente_id: 3,
      valor: 1500.00,
      data_vencimento: '2024-04-15' // A vencer
    },
    // Cliente 4 (João Silva)
    {
      cliente_id: 4,
      valor: 2000.00,
      data_vencimento: '2024-01-10' // Vencida
    },
    {
      cliente_id: 4,
      valor: 2000.00,
      data_vencimento: '2024-03-10' // Vencida
    },
    // Cliente 5 (Maria Santos)
    {
      cliente_id: 5,
      valor: 3000.00,
      data_vencimento: '2024-05-20' // A vencer
    }
  ];

  console.log('Variáveis de ambiente:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...'
  });

  for (const nota of notasDebito) {
    try {
      const notaInserida = await inserirNotaDebito(nota);
      console.log('Nota inserida:', notaInserida);
    } catch (error) {
      console.error('Erro ao inserir nota:', error);
    }
  }
}

main().catch(console.error); 