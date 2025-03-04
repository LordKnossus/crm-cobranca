# Sistema de Controle de Cobranças

Sistema web para controle de vendas a prazo, com emissão e gerenciamento de notas promissórias.

## Funcionalidades

- Dashboard com indicadores financeiros
- Cadastro e gerenciamento de clientes
- Emissão e controle de notas a prazo
- Gestão de recebimentos e negociações
- Emissão de notas promissórias
- Relatórios financeiros

## Requisitos

- Node.js 18.0 ou superior
- PostgreSQL 12.0 ou superior

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd crm-cobranca
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/crm_cobranca"
```

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
crm-cobranca/
├── app/                    # Páginas e rotas da aplicação
├── components/             # Componentes React reutilizáveis
├── prisma/                 # Modelos e migrações do banco de dados
├── public/                 # Arquivos estáticos
└── styles/                 # Arquivos de estilo
```

## Tecnologias Utilizadas

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Chart.js
- Tremor

## Desenvolvimento

Para contribuir com o projeto:

1. Crie uma branch para sua feature:
```bash
git checkout -b feature/nova-funcionalidade
```

2. Faça suas alterações e commit:
```bash
git commit -m "Adiciona nova funcionalidade"
```

3. Push para o repositório:
```bash
git push origin feature/nova-funcionalidade
```

4. Crie um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 