export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

export interface NotaDebito {
  id: number;
  valor: number;
  dataVencimento: string;
  status: 'ADIMPLENTE' | 'INADIMPLENTE';
}

export interface Cliente {
  id: number;
  nome: string;
  documento: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes?: string;
  totalDevido: number;
  totalAdimplente: number;
  totalInadimplente: number;
  notas: NotaDebito[];
}

export interface BuscarClientesParams {
  nome?: string;
  documento?: string;
  endereco?: string;
}

export interface BuscarClientesResponse {
  data: Cliente[];
  error: Error | null;
} 