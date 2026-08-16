import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Carrega as variáveis de ambiente (.env)
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ==========================================
// CONFIGURAÇÃO DE UPLOAD (MULTER)
// ==========================================
// Garante que a pasta 'uploads' exista
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configura onde e com que nome o arquivo será salvo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Adiciona a data atual no nome para evitar arquivos duplicados
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage });

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(
  cors({
    origin: ['https://iez-partner-hub.vercel.app', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());

// Transforma a pasta 'uploads' numa rota pública para podermos acessar os PDFs via URL
app.use('/uploads', express.static(uploadDir));

// ==========================================
// ROTAS DA API
// ==========================================

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API iez! Partner Hub rodando 🚀' });
});

// --- Rota de Login (MANTIDA IGUAL) ---
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

// --- Rota de Cadastro (MANTIDA IGUAL) ---
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

// --- Rota de Documentos (Listagem) ---
app.get('/api/documentos', async (req: Request, res: Response): Promise<void> => {
  try {
    const documentos = await prisma.documento.findMany({
      orderBy: { atualizadoEm: 'desc' }
    });

    const docsFormatados = documentos.map(doc => ({
      id: doc.id,
      titulo: doc.titulo,
      categoria: doc.categoria,
      arquivoUrl: doc.arquivoUrl,
      enviadoPor: doc.enviadoPor,
      data: doc.atualizadoEm.toISOString().split('T')[0]
    }));

    res.status(200).json(docsFormatados);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar documentos.' });
  }
});

// --- NOVA ROTA: UPLOAD DE NOVO DOCUMENTO ---
app.post('/api/documentos', upload.single('arquivo'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, categoria, nivelAcesso, regraVisibilidade, enviadoPor } = req.body;
    const arquivo = req.file;

    if (!arquivo) {
      res.status(400).json({ message: 'Nenhum arquivo enviado.' }); return;
    }

    // Cria a URL pública para acessar o arquivo
    const arquivoUrl = `/uploads/${arquivo.filename}`;

    const novoDocumento = await prisma.documento.create({
      data: {
        titulo,
        categoria,
        nivelAcesso: nivelAcesso || 'TODOS',
        regraVisibilidade: regraVisibilidade || 'GERAL',
        arquivoUrl,
        enviadoPor
      }
    });

    res.status(201).json(novoDocumento);
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao salvar o documento.' });
  }
});

// --- NOVA ROTA: EDIÇÃO DE DOCUMENTO EXISTENTE ---
app.put('/api/documentos/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { titulo, categoria } = req.body;

    const documentoAtualizado = await prisma.documento.update({
      where: { id },
      data: { titulo, categoria }
    });

    res.status(200).json(documentoAtualizado);
  } catch (error) {
    console.error('Erro na edição:', error);
    res.status(500).json({ message: 'Erro ao atualizar o documento.' });
  }
});
// --- Rota de Gestão de Acessos (Listar Usuários) ---
app.get('/api/usuarios', async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: [
        { status: 'asc' }, // Traz os PENDENTES primeiro (ordem alfabética: ATIVO, BLOQUEADO, PENDENTE... na verdade PENDENTE vai pro final, vamos ordenar por criadoEm)
        { criadoEm: 'desc' }
      ],
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        empresa: true,
        status: true,
        criadoEm: true
      }
    });

    res.status(200).json(usuarios);
  } catch (error) {
    console.error('[USUARIOS ERRO] Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar lista de usuários.' });
  }
});

// --- Rota de Gestão de Acessos (Aprovar/Bloquear/Alterar Status) ---
app.put('/api/usuarios/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, role } = req.body; // status: "ATIVO" | "BLOQUEADO" | "PENDENTE"

    const dadosAtualizados: any = {};
    if (status) dadosAtualizados.status = status;
    if (role) dadosAtualizados.role = role;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dadosAtualizados,
      select: { id: true, nome: true, status: true, role: true }
    });

    console.log(`[GESTAO] Usuário ${usuarioAtualizado.nome} alterado para status: ${usuarioAtualizado.status}`);
    res.status(200).json({ message: 'Acesso atualizado com sucesso!', usuario: usuarioAtualizado });
  } catch (error) {
    console.error('[GESTAO ERRO] Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do usuário.' });
  }
});
// ==========================================
// INICIALIZAÇÃO
// ==========================================
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });

app.listen(PORT, () => {
  console.log(`[IEZ! BACKEND] Servidor rodando na porta ${PORT}`);
});