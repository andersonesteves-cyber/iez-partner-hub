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
    const email = req.body.email?.trim();
    const senha = req.body.senha;

    console.log(`[LOGIN] Tentativa de acesso recebida para: '${email}'`);

    if (!email || !senha) {
      res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
      return;
    }

    // AQUI ESTAVA O ERRO 500: Agora usamos prisma.usuario exatamente como no schema!
    const user = await prisma.usuario.findUnique({ 
      where: { email: email } 
    });

    // Se não encontrou o e-mail no banco
    if (!user) {
      console.log('[LOGIN] Falha: E-mail não encontrado no banco de dados.');
      res.status(401).json({ message: 'E-mail ou senha inválidos.' });
      return;
    }

    // Compara a senha informada com a do banco
    if (user.senha !== senha) {
      console.log('[LOGIN] Falha: Senha incorreta.');
      res.status(401).json({ message: 'E-mail ou senha inválidos.' });
      return;
    }

    // Verifica se o usuário não está pendente ou bloqueado
    if (user.status !== 'ATIVO') {
      console.log(`[LOGIN] Falha: Usuário com status ${user.status}.`);
      res.status(403).json({ message: `Acesso negado. Seu cadastro está: ${user.status}.` });
      return;
    }

    console.log(`[LOGIN] Sucesso! Bem-vindo, ${user.nome}`);
    
    // Retorna os dados para o Frontend salvar no LocalStorage
    res.status(200).json({
      token: 'fake-jwt-token-iez', 
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        empresa: user.empresa,
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

    // Verifica se o e-mail já existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      res.status(400).json({ message: 'Este e-mail já possui um cadastro no sistema.' });
      return;
    }

    // Converte o perfil do frontend ("COMPANY_ADMIN" ou "USER") para o do banco ("ADMIN" ou "PARTNER")
    const roleFormatada = perfil === 'COMPANY_ADMIN' ? 'ADMIN' : 'PARTNER';

    // Cria o usuário no banco com status PENDENTE (conforme seu schema)
    await prisma.usuario.create({
      data: {
        nome,
        email,
        senha,
        empresa,
        role: roleFormatada,
        status: 'PENDENTE' // Bloqueia o login até aprovação
      }
    });

    res.status(201).json({
      message: 'Solicitação criada com sucesso. Aguardando aprovação.'
    });
  } catch (error) {
    console.error('[CADASTRO ERRO] Falha ao criar solicitação:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação de cadastro.' });
  }
});

// --- Rota de Documentos (Listagem) ---
app.get('/api/documentos', async (req: Request, res: Response): Promise<void> => {
  try {
    // Busca real dos documentos no banco de dados!
    const documentos = await prisma.documento.findMany({
      orderBy: { atualizadoEm: 'desc' }
    });

    // Se o banco estiver vazio, manda o mock como fallback para você não perder o visual
    if (documentos.length === 0) {
      const documentosMock = [
        { id: '1', titulo: 'Guia de Fibra Óptica', categoria: 'Guias Técnicos', data: '2026-08-14' },
        { id: '2', titulo: 'Tabela de Preços 2026', categoria: 'Material Comercial', data: '2026-08-10' }
      ];
      res.status(200).json(documentosMock);
      return;
    }

    // Formata a data para exibir bonito no frontend
    const docsFormatados = documentos.map(doc => ({
      id: doc.id,
      titulo: doc.titulo,
      categoria: doc.categoria,
      data: doc.atualizadoEm.toISOString().split('T')[0] // Formato YYYY-MM-DD
    }));

    res.status(200).json(docsFormatados);
  } catch (error) {
    console.error('[DOCS ERRO] Erro ao buscar documentos:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos.' });
  }
});

// ==========================================
// 3. INICIALIZAÇÃO DO SERVIDOR
// ==========================================

// Tratamento de encerramento amigável
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