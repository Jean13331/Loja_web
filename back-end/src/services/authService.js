const usuarioModel = require('../models/Usuario');
const crypto = require('crypto');

const authService = {
  /**
   * Gera hash MD5 da senha
   */
  hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
  },

  /**
   * Compara senha com hash MD5
   */
  comparePassword(password, hash) {
    const passwordHash = this.hashPassword(password);
    return passwordHash === hash;
  },

  /**
   * Registra um novo usuário
   */
  async register(userData) {
    // Verificar se email já existe
    const existingEmail = await usuarioModel.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email já cadastrado');
    }

    // Verificar se CPF já existe
    const existingCPF = await usuarioModel.findByCPF(userData.cpf);
    if (existingCPF) {
      throw new Error('CPF já cadastrado');
    }

    // Hash da senha em MD5
    const hashedPassword = this.hashPassword(userData.senha);

    // Preparar dados para inserção
    const userToCreate = {
      nome: userData.nome,
      email: userData.email,
      numero_telefone: userData.numero_telefone,
      senha: hashedPassword,
      cpf: userData.cpf,
      nascimento: userData.nascimento,
      admin: userData.admin || 0,
    };

    // Criar usuário
    const user = await usuarioModel.create(userToCreate);

    // Retornar dados sem a senha
    const { senha, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Autentica um usuário
   */
  async login(email, senha) {
    // Buscar usuário por email
    const user = await usuarioModel.findByEmail(email);
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar senha
    if (!this.comparePassword(senha, user.senha)) {
      throw new Error('Email ou senha inválidos');
    }

    // Retornar dados sem a senha
    const { senha: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

module.exports = authService;

