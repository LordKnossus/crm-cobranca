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
  id: string;
  nome: string;
  documento: string;
  endereco: Endereco;
  observacoes: string;
  totalDevido: number;
  statusCarteira: 'adimplente' | 'inadimplente';
  totalAdimplente: number;
  totalInadimplente: number;
  notas: Array<{
    id: string;
    valor: number;
    dataVencimento: string;
    status: 'pago' | 'pendente' | 'atrasado';
  }>;
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