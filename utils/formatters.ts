export function formatarDocumento(doc: string): string {
  if (!doc) return '';
  
  // Remove caracteres não numéricos
  const numeros = doc.replace(/\D/g, '');
  
  // CPF
  if (numeros.length === 11) {
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  // CNPJ
  if (numeros.length === 14) {
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return doc;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

export function formatarData(data: string | Date): string {
  if (!data) return '';
  
  const date = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function formatarCEP(cep: string): string {
  if (!cep) return '';
  
  // Remove caracteres não numéricos
  const numeros = cep.replace(/\D/g, '');
  
  if (numeros.length === 8) {
    return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  
  return cep;
} 