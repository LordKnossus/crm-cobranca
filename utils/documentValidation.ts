export function formatDocument(doc: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = doc.replace(/\D/g, '');
  
  // Verifica se é CPF ou CNPJ pelo número de dígitos
  if (numbers.length === 11) {
    // Formato CPF: 000.000.000-00
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // Formato CNPJ: 00.000.000/0000-00
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return numbers;
}

export function validateDocument(doc: string): boolean {
  const numbers = doc.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return validateCPF(numbers);
  } else if (numbers.length === 14) {
    return validateCNPJ(numbers);
  }
  
  return false;
}

function validateCPF(cpf: string): boolean {
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 === 10 || checkDigit1 === 11) checkDigit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 === 10 || checkDigit2 === 11) checkDigit2 = 0;
  
  return (
    checkDigit1 === parseInt(cpf.charAt(9)) &&
    checkDigit2 === parseInt(cpf.charAt(10))
  );
}

function validateCNPJ(cnpj: string): boolean {
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  let size = 12;
  let numbers = cnpj.substring(0, size);
  let digits = cnpj.substring(size);
  
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = 13;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return result === parseInt(digits.charAt(1));
} 