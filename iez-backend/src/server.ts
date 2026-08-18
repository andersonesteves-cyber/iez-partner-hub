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
// CONFIGURAÇÃO DE PASTA E MULTER (SANITIZAÇÃO E RENDER)
// ==========================================
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
    // 1. Corrige o bug nativo do Multer que distorce caracteres UTF-8
    const utf8Name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    // 2. Remove acentos e caracteres especiais
    const nameWithoutAccents = utf8Name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // 3. Troca o que não for letra/número por hífen
    const safeName = nameWithoutAccents
      .replace(/[^a-zA-Z0-9.]/g, '-')
      .replace(/-+/g, '-') 
      .toLowerCase(); 
      
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// ==========================================
// ROTAS GERAIS E AUTENTICAÇÃO
// ==========================================
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API iez! Partner Hub rodando 🚀' });
});

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

// ==========================================
// ROTAS DE DOCUMENTOS 
// ==========================================
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
      regraVisibilidade: doc.regraVisibilidade, 
      dataCriacao: doc.atualizadoEm.toISOString(),
      enviadoPor: doc.enviadoPor || 'Admin iez!'
    }));

    res.status(200).json(docsFormatados);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar documentos.' });
  }
});

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
      regraVisibilidade: doc.regraVisibilidade, 
      dataCriacao: doc.atualizadoEm.toISOString(),
      enviadoPor: doc.enviadoPor || 'Admin iez!',
      secoes: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao buscar o documento.' });
  }
});

app.post('/api/documentos', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, resumo, categoria, nivelAcesso, visibilidade, empresa } = req.body;
    const arquivo = req.file;

    if (!arquivo) {
      res.status(400).json({ message: 'Nenhum arquivo enviado.' }); return;
    }

    const arquivoUrl = `/uploads/${arquivo.filename}`;
    const regraFormatada = visibilidade === 'restrita' ? `RESTRITA:${empresa || ''}` : 'GERAL';

    const novoDocumento = await prisma.documento.create({
      data: {
        titulo,
        resumo: resumo || '',
        categoria,
        nivelAcesso: nivelAcesso || 'Partner (Todos)',
        regraVisibilidade: regraFormatada, 
        arquivoUrl,
        enviadoPor: 'Admin iez!'
      }
    });

    res.status(201).json({
      id: novoDocumento.id,
      titulo: novoDocumento.titulo,
      resumo: novoDocumento.resumo,
      categoria: novoDocumento.categoria,
      pdfUrl: novoDocumento.arquivoUrl,
      regraVisibilidade: novoDocumento.regraVisibilidade, 
      dataCriacao: novoDocumento.atualizadoEm.toISOString(),
      enviadoPor: novoDocumento.enviadoPor
    });
  } catch (error) {