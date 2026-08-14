import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carrega as variáveis de ambiente (.env)
dotenv.config();

// Inicializa o Express e o Prisma Client (Conexão com PostgreSQL)
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. MIDDLEWARES
// ==========================================

// Configuração do CORS para permitir comunicação com o frontend na Vercel e local
app.use(
  cors({
    origin: [
      'https://iez-partner-hub.vercel.app', // Frontend em Produção
      'http://localhost:3000',               // Frontend em Desenvolvimento
    ],
    credentials: true, // Permite envio de cookies/tokens se necessário
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parser para requisições com corpo em JSON
app.use(express.json());

// ==========================================
// 2. ROTAS DA API
// ==========================================

// Rota de Healthcheck (Útil para o Render saber que a API está viva)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API iez! Partner Hub rodando 🚀' });
});

// --- Rota de Autenticação (Login) ---
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // TODO: Ajuste a busca abaixo de acordo com o nome do seu model no schema.prisma (ex: user, usuario)
    // const user = await prisma.user.findUnique({ where: { email } });
    
    // Simulação temporária baseada nos logs da sua seed (Remova após plugar o Prisma real)
    if (email === 'anderson.esteves@iez.com.br' && senha === '123456') {
      res.status(200).json({
        token: 'fake-jwt-token-iez',
        user: {
          id: '1',
          nome: 'Anderson Esteves',
          email: email,
          role: 'ADMIN',
        },
      });
      return;
    }

    res.status(401).json({ message: 'E-mail ou senha inválidos.' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// --- Rota de Solicitação de Cadastro ---
app.post('/api/solicitacoes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, empresa, senha, perfil } = req.body;

    // TODO: Criar a inserção no banco via Prisma
    // await prisma.solicitacao.create({ data: { nome, email, empresa, senha, perfil } });

    res.status(201).json({
      message: 'Solicitação criada com sucesso. Aguardando aprovação.',
      dados: { nome, email, empresa, perfil }
    });
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação de cadastro.' });
  }
});

// --- Rota de Documentos (Listagem) ---
app.get('/api/documentos', async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoria, busca } = req.query;

    // TODO: Implementar filtros no Prisma baseados nos query params
    // const documentos = await prisma.documento.findMany({ ... });

    // Mock temporário para não quebrar o frontend antes da integração do banco
    const documentosMock = [
      { id: '1', titulo: 'Guia de Fibra Óptica', categoria: 'Guias Técnicos', data: '2026-08-14' },
      { id: '2', titulo: 'Tabela de Preços 2026', categoria: 'Material Comercial', data: '2026-08-10' }
    ];

    res.status(200).json(documentosMock);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos.' });
  }
});

// ==========================================
// 3. INICIALIZAÇÃO DO SERVIDOR
// ==========================================

// Tratamento de encerramento amigável (Graceful Shutdown)
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[IEZ! BACKEND] Servidor rodando na porta ${PORT}`);
});