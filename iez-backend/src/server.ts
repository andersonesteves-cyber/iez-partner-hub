// Lista de empresas persistente em memória (com suporte a 'nome' e 'name')
let empresasMock = [
  { id: '1', nome: 'Zamix', name: 'Zamix', status: 'Ativo', createdAt: new Date().toISOString() },
  { id: '2', nome: 'NetSpeed', name: 'NetSpeed', status: 'Ativo', createdAt: new Date().toISOString() },
  { id: '3', nome: 'Telecom S.A.', name: 'Telecom S.A.', status: 'Em Contratação', createdAt: new Date().toISOString() },
  { id: '4', nome: 'Conecta Fibra', name: 'Conecta Fibra', status: 'Suspenso', createdAt: new Date().toISOString() },
];

// ROTA GET /api/empresas
app.get('/api/empresas', async (req: Request, res: Response): Promise<void> => {
  try {
    if (typeof prisma !== 'undefined' && prisma.company) {
      const dbEmpresas = await prisma.company.findMany({ orderBy: { name: 'asc' } });
      if (dbEmpresas.length > 0) {
        const formatted = dbEmpresas.map((e: any) => ({
          id: e.id,
          nome: e.name || e.nome,
          name: e.name || e.nome,
          status: e.status || 'Ativo',
        }));
        res.status(200).json(formatted);
        return;
      }
    }
    res.status(200).json(empresasMock);
  } catch (error) {
    res.status(200).json(empresasMock);
  }
});

// ROTA POST /api/empresas
app.post('/api/empresas', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, status } = req.body;
    if (!nome) {
      res.status(400).json({ message: 'Nome da empresa é obrigatório.' });
      return;
    }

    const novaEmpresa = {
      id: Date.now().toString(),
      nome,
      name: nome,
      status: status || 'Ativo',
      createdAt: new Date().toISOString(),
    };

    empresasMock.unshift(novaEmpresa);

    if (typeof prisma !== 'undefined' && prisma.company) {
      await prisma.company.create({
        data: { name: nome, status: status || 'Ativo' },
      });
    }

    res.status(201).json({ message: 'Empresa cadastrada com sucesso.', empresa: novaEmpresa });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar empresa.' });
  }
});