import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Configuração do Multer
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanFileName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${uniqueSuffix}-${cleanFileName}`);
  }
});

const upload = multer({ storage });

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// --- AUTO-SEED DO USUÁRIO ADMIN ---
async function seedAdmin() {
  try {
    const adminEmail = 'anderson.esteves@iez.com.br';
    const adminExists = await prisma.usuario.findUnique({
      where: { email: adminEmail }
    });

    if (!adminExists) {
      await prisma.usuario.create({
        data: {
          nome: 'Anderson Luiz Fernandes Esteves',
          email: adminEmail,
          senha: '123456',
          role: 'ADMIN',
          empresa: 'IEZ! TELECOM',
          status: 'ATIVO'
        }
      });
      console.log(`[IEZ! SEED] Usuário ADMIN (${adminEmail}) criado com sucesso! Senha: 123456`);
    }
  } catch (error) {
    console.error('Erro ao rodar seed do Admin:', error);
  }
}

// --- ROTAS DA API ---

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API do iez! Partner Hub operando 100% 🚀' });
});

// 2. ROTA DE LOGIN (Compatível com 'senha' e 'password')
app.post('/api/login', async (req, res) => {
  try {
    const rawEmail = req.body.email || '';
    const email = rawEmail.toLowerCase().trim();
    
    // Aceita tanto 'senha' quanto 'password' vindos do front-end
    const senhaForm = req.body.senha || req.body.password;

    if (!email || !senhaForm) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario || usuario.senha !== senhaForm) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    if (usuario.status === 'PENDENTE') {
      return res.status(403).json({ error: 'Seu cadastro está aguardando aprovação do Admin.' });
    }

    if (usuario.status === 'BLOQUEADO') {
      return res.status(403).json({ error: 'Acesso bloqueado. Entre em contato com o suporte.' });
    }

    return res.json({
      success: true,
      token: 'jwt-token-fake-iez-partner-hub',
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        empresa: usuario.empresa
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno ao processar o login.' });
  }
});

// 3. ROTA DE DOCUMENTOS (Listagem)
app.get('/api/documentos', async (req, res) => {
  try {
    const documentos = await prisma.documento.findMany({
      orderBy: { criadoEm: 'desc' }
    });
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar documentos.' });
  }
});

// 4. ROTA DE DOCUMENTOS (Cadastro)
app.post('/api/documentos', upload.single('arquivo'), async (req, res) => {
  try {
    const { titulo, categoria, nivelAcesso, regraVisibilidade, empresa, descricao } = req.body;
    const arquivoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!arquivoUrl) {
      return res.status(400).json({ error: 'O envio do arquivo é obrigatório.' });
    }

    const novoDocumento = await prisma.documento.create({
      data: {
        titulo,
        categoria,
        nivelAcesso,
        regraVisibilidade,
        empresa: empresa || null,
        descricao: descricao || null,
        arquivoUrl,
      }
    });

    res.status(201).json(novoDocumento);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao cadastrar o documento.' });
  }
});

// 5. GESTÃO DE ACESSOS: Listar Usuários
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { criadoEm: 'desc' }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// 6. GESTÃO DE ACESSOS: Aprovar/Bloquear Usuário
app.patch('/api/usuarios/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: { status }
    });

    res.json(usuarioAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do usuário.' });
  }
});

// Inicialização e execução do Seed
app.listen(PORT, async () => {
  console.log(`[IEZ! BACKEND] Servidor rodando na porta ${PORT}`);
  await seedAdmin();
});