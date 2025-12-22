const usuarioModel = require('../models/Usuario');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
   * Gera hash MD5 de um valor (CPF, telefone, etc)
   */
  hashValue(value) {
    // Remove caracteres não numéricos antes de fazer hash
    const cleanValue = value.replace(/\D/g, '');
    return crypto.createHash('md5').update(cleanValue).digest('hex');
  },

  /**
   * Gera token JWT para o usuário
   */
  generateToken(user) {
    const secret = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const payload = {
      id: user.idusuario,
      email: user.email,
      nome: user.nome,
      admin: user.admin,
    };
    
    return jwt.sign(payload, secret, { expiresIn });
  },

  /**
   * Verifica e decodifica token JWT
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'seu-secret-key-aqui-mude-em-producao';
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
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

    // Hash do CPF e telefone antes de verificar/buscar
    const hashedCPF = this.hashValue(userData.cpf);
    const hashedPhone = this.hashValue(userData.numero_telefone);

    // Verificar se CPF já existe (buscar pelo hash)
    const existingCPF = await usuarioModel.findByCPF(hashedCPF);
    if (existingCPF) {
      throw new Error('CPF já cadastrado');
    }

    // Hash da senha em MD5
    const hashedPassword = this.hashPassword(userData.senha);

    // Preparar dados para inserção (com CPF e telefone hasheados)
    const userToCreate = {
      nome: userData.nome,
      email: userData.email,
      numero_telefone: hashedPhone,
      senha: hashedPassword,
      cpf: hashedCPF,
      nascimento: userData.nascimento,
      admin: userData.admin || 0,
    };

    // Criar usuário
    const user = await usuarioModel.create(userToCreate);

    // Retornar dados sem a senha, CPF e telefone (dados sensíveis)
    const { senha, cpf, numero_telefone, ...userWithoutSensitiveData } = user;
    
    // Gerar token JWT
    const token = this.generateToken(userWithoutSensitiveData);
    
    return {
      user: userWithoutSensitiveData,
      token,
    };
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

    // Retornar dados sem a senha, CPF e telefone (dados sensíveis)
    const { senha: _, cpf, numero_telefone, ...userWithoutSensitiveData } = user;
    
    // Gerar token JWT
    const token = this.generateToken(userWithoutSensitiveData);
    
    return {
      user: userWithoutSensitiveData,
      token,
    };
  },
};

module.exports = authService;

