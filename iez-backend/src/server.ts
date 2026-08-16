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
    // Pegamos o email e senha do body, removendo espaços acidentais do email (.trim())
    const email = req.body.email?.trim();
    const senha = req.body.senha;

    console.log(`[LOGIN] Tentativa de acesso recebida para: '${email}'`);

    if (!email || !senha) {
      res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
      return;
    }

    // Busca o usuário no banco de dados real usando Prisma
    // Nota: Se o model no schema for "usuario", o Prisma aceita prisma.usuario
    // Usamos 'any' temporariamente para evitar falhas de tipagem (build error) no Render caso os nomes das colunas mudem
    const user = await (prisma as any).user.findUnique({ 
      where: { email: email } 
    }) || await (prisma as any).usuario?.findUnique({ 
      where: { email: email } 
    });

    // Se não encontrou o e-mail no banco
    if (!user) {
      console.log('[LOGIN] Falha: E-mail não encontrado no banco de dados.');
      res.status(401).json({ message: 'E-mail ou senha inválidos.' });
      return;
    }

    // Compara a senha informada com a do banco (considerando as colunas 'senha' ou 'password')
    if (user.senha !== senha && user.password !== senha) {
      console.log('[LOGIN] Falha: Senha incorreta.');
      res.status(401).json({ message: 'E-mail ou senha inválidos.' });
      return;
    }

    console.log(`[LOGIN] Sucesso! Bem-vindo, ${user.nome || user.name}`);
    
    // Retorna os dados para o Frontend salvar no LocalStorage
    res.status(200).json({
      token: 'fake-jwt-token-iez', // Em breve substituiremos por um token JWT real
      user: {
        id: user.id,
        nome: user.nome || user.name,
        email: user.email,
        role: user.role || 'USUARIO',
        empresa: user.empresa || user.company || 'IEZ! TELECOM',
      },
    });
  } catch (error) {
    console.error('[LOGIN ERRO] Falha interna:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// --- Rota de Solicitação de Cadastro ---
app.post('/api/solicitacoes', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body.email?.trim();
    const { nome, empresa, senha, perfil } = req.body;

    console.log(`[CADASTRO] Nova solicitação recebida para: ${email}`);

    // TODO: Criar a inserção no banco via Prisma quando o model Solicitacao estiver pronto
    // await prisma.solicitacao.create({ data: { nome, email, empresa, senha, perfil } });

    res.status(201).json({
      message: 'Solicitação criada com sucesso. Aguardando aprovação.',
      dados: { nome, email, empresa, perfil }
    });
  } catch (error) {
    console.error('[CADASTRO ERRO] Falha ao criar solicitação:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação de cadastro.' });
  }
});

// --- Rota de Documentos (Listagem) ---
app.get('/api/documentos', async (req: Request, res: Response): Promise<void> => {
  try {
    // Mock temporário para não quebrar o frontend antes da integração do banco de documentos
    const documentosMock = [
      { id: '1', titulo: 'Guia de Fibra Óptica', categoria: 'Guias Técnicos', data: '2026-08-14' },
      { id: '2', titulo: 'Tabela de Preços 2026', categoria: 'Material Comercial', data: '2026-08-10' }
    ];

    res.status(200).json(documentosMock);
  } catch (error) {
    console.error('[DOCS ERRO] Erro ao buscar documentos:', error);
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