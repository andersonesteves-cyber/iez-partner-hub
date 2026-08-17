import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ==========================================
// CONFIGURAÇÃO DE PASTA E MULTER (ROBUSTO)
// ==========================================
// Garante o caminho correto tanto em ambiente dev quanto após build
const uploadDir = process.env.NODE_ENV === 'production' 
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Servidor de arquivos estáticos configurado com fallback explícito
app.use('/uploads', express.static(uploadDir));

// ==========================================
// ROTAS DA API
// ==========================================

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API iez! Partner Hub rodando 🚀' });
});

// --- Rota de Login ---
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body.email?.trim();
    const senha = req.body.senha;

    if (!email || !senha) {
      res.status(400).json({ message: 'E-mail e senha são obrigatórios.' }); return;
    }

    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user || user.senha !== senha) {
      res.status(401).json({ message: 'E-mail ou senha inválidos.' }); return;
    }

    if (user.status !== 'ATIVO') {
      res.status(403).json({ message: `Acesso negado. Seu cadastro está: ${user.status}.` }); return;
    }

    res.status(200).json({
      token: 'fake-jwt-token-iez', 
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role, empresa: user.empresa }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// --- Rota de Cadastro ---
app.post('/api/solicitacoes', async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.body.email?.trim();
    const { nome, empresa, senha, perfil } = req.body;

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      res.status(400).json({ message: 'Este e-mail já possui um cadastro.' }); return;
    }

    const roleFormatada = perfil === 'COMPANY_ADMIN' ? 'ADMIN' : 'PARTNER';
    await prisma.usuario.create({
      data: { nome, email, senha, empresa, role: roleFormatada, status: 'PENDENTE' }
    });

    res.status(201).json({ message: 'Solicitação criada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar solicitação.' });
  }
});

// --- Listagem Geral de Documentos ---
app.get('/api/documentos', async (req: Request, res: Response): Promise<void> => {
  try {
    const documentos = await prisma.documento.findMany({
      orderBy: { atualizadoEm: 'desc' }
    });

    const docsFormatados = documentos.map(doc => ({
      id: doc.id,
      titulo: doc.titulo,
      resumo: doc.resumo || '',
      categoria: doc.categoria,
      pdfUrl: doc.arquivoUrl,
      dataCriacao: doc.atualizadoEm.toISOString(),
      enviadoPor: doc.enviadoPor || 'IEZ! Telecom'
    }));

    res.status(200).json(docsFormatados);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar documentos.' });
  }
});

// --- Detalhes do Documento por ID ---
app.get('/api/documentos/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await prisma.documento.findUnique({ where: { id } });

    if (!doc) {
      res.status(404).json({ message: 'Documento não encontrado no banco de dados.' });
      return;
    }

    res.status(200).json({
      id: doc.id,
      titulo: doc.titulo,
      resumo: doc.resumo || '',
      categoria: doc.categoria,
      pdfUrl: doc.arquivoUrl,
      dataCriacao: doc.atualizadoEm.toISOString(),
      enviadoPor: doc.enviadoPor || 'IEZ! Telecom',
      secoes: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao buscar documento por ID.' });
  }
});

// --- Upload de Novo Documento ---
app.post('/api/documentos', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, resumo, categoria, nivelAcesso, visibilidade, empresa } = req.body;
    const arquivo = req.file;

    if (!arquivo) {
      res.status(400).json({ message: 'Nenhum arquivo enviado.' }); return;
    }

    const arquivoUrl = `/uploads/${arquivo.filename}`;

    const novoDocumento = await prisma.documento.create({
      data: {
        titulo,
        resumo: resumo || '',
        categoria,
        nivelAcesso: nivelAcesso || 'Partner (Todos)',
        regraVisibilidade: visibilidade === 'restrita' ? `RESTRITA:${empresa || ''}` : 'GERAL',
        arquivoUrl,
        enviadoPor: 'Admin'
      }
    });

    res.status(201).json({
      id: novoDocumento.id,
      titulo: novoDocumento.titulo,
      resumo: novoDocumento.resumo,
      categoria: novoDocumento.categoria,
      pdfUrl: novoDocumento.arquivoUrl,
      dataCriacao: novoDocumento.atualizadoEm.toISOString(),
      enviadoPor: novoDocumento.enviadoPor || 'Admin'
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao salvar o documento.' });
  }
});

// --- Edição In-line de Documento ---
app.put('/api/documentos/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titulo, categoria, resumo } = req.body;

    const documentoAtualizado = await prisma.documento.update({
      where: { id },
      data: { titulo, categoria, resumo }
    });

    res.status(200).json(documentoAtualizado);
  } catch (error) {
    console.error('Erro na edição:', error);
    res.status(500).json({ message: 'Erro ao atualizar o documento.' });
  }
});

// --- Gestão de Usuários ---
app.get('/api/usuarios', async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: [{ status: 'asc' }, { criadoEm: 'desc' }],
      select: { id: true, nome: true, email: true, role: true, empresa: true, status: true, criadoEm: true }
    });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar lista de usuários.' });
  }
});

app.put('/api/usuarios/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const dadosAtualizados: any = {};
    if (status) dadosAtualizados.status = status;
    if (role) dadosAtualizados.role = role;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dadosAtualizados,
      select: { id: true, nome: true, status: true, role: true }
    });

    res.status(200).json({ message: 'Acesso atualizado com sucesso!', usuario: usuarioAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status do usuário.' });
  }
});

process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });

app.listen(PORT, () => {
  console.log(`[IEZ! BACKEND] Servidor rodando na porta ${PORT}`);
});