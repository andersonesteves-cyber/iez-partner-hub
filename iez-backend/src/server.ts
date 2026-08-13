import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Middlewares
app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// ROTAS DE AUTENTICAÇÃO (LOGIN E CADASTRO REAL)
// ------------------------------------------------------------------

// ROTA: CADASTRO DE USUÁRIO
app.post('/api/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, company, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Este e-mail já está em uso.' });
      return;
    }

    const requiredApprovalRole = role === 'COMPANY_ADMIN' ? 'IEZ_ADMIN' : 'COMPANY_ADMIN';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        companyName: company,
        role: role || 'USER',
        status: 'PENDING',
        requiredApprovalRole,
      },
    });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso! Aguardando aprovação.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, status: newUser.status }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao realizar cadastro.' });
  }
});

// ROTA: LOGIN
app.post('/api/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'E-mail ou senha inválidos. Tente novamente.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'E-mail ou senha inválidos. Tente novamente.' });
      return;
    }

    if (user.status === 'PENDING') {
      res.status(403).json({ message: 'Sua conta ainda está aguardando aprovação.' });
      return;
    }

    if (user.status === 'REJECTED') {
      res.status(403).json({ message: 'Sua solicitação de acesso foi reprovada.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, company: user.companyName },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.companyName
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao realizar login.' });
  }
});
// ------------------------------------------------------------------
// ROTAS DE ADMINISTRAÇÃO (GESTÃO DE USUÁRIOS)
// ------------------------------------------------------------------

// ROTA: LISTAR TODOS OS USUÁRIOS
app.get('/api/users', async (req: Request, res: Response): Promise<void> => {
  try {
    // Busca todos os usuários, retornando os mais recentes primeiro
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro interno ao buscar usuários.' });
  }
});

// ROTA: ATUALIZAR STATUS/PERFIL DO USUÁRIO
app.put('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role, status },
    });

    res.status(200).json({ message: 'Usuário atualizado com sucesso', user: updatedUser });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados do usuário.' });
  }
});
// ------------------------------------------------------------------
// ROTAS MOCKADAS
// ------------------------------------------------------------------
app.get('/api/documentos', async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Endpoint de documentos' });
  app.get('/api/documentos', async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Endpoint de documentos' });
});

// NOVA ROTA PARA EXCLUIR DOCUMENTO (MOCK)
app.delete('/api/documentos/:id', async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Documento excluído com sucesso' });
});
// NOVA ROTA PARA EDITAR DOCUMENTO (MOCK)
app.put('/api/documentos/:id', async (req: Request, res: Response) => {
  // Em um cenário real, aqui usaríamos o Prisma para atualizar o banco:
  // const { titulo, descricao } = req.body;
  // await prisma.documento.update({ ... })
  res.status(200).json({ message: 'Documento atualizado com sucesso' });
});
});

app.post('/api/upload', async (req: Request, res: Response) => {
  res.status(200).json({ message: 'Endpoint de upload' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'iez! Partner Hub API is running.' });
});

// ------------------------------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR (MANTÉM O PROCESSO VIVO)
// ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔒 Autenticação com Bcrypt e JWT configurada.`);
});