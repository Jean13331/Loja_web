const BaseModel = require('./BaseModel');
const { query } = require('../../config/database');

class Usuario extends BaseModel {
  constructor() {
    super('usuario');
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email) {
    const result = await this.findWhere({ email });
    return result[0];
  }

  /**
   * Busca usuário por CPF
   */
  async findByCPF(cpf) {
    const result = await this.findWhere({ cpf });
    return result[0];
  }

  /**
   * Busca usuário por ID
   */
  async findById(id) {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE idusuario = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Cria um novo usuário
   * Nota: idusuario deve ser gerado automaticamente (SERIAL) ou fornecido
   */
  async create(userData) {
    // Se não tiver idusuario, precisamos gerar ou usar DEFAULT
    // Assumindo que idusuario é SERIAL no banco
    const { idusuario, ...dataToInsert } = userData;
    const keys = Object.keys(dataToInsert);
    const values = Object.values(dataToInsert);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING idusuario, nome, email, numero_telefone, cpf, nascimento, admin`,
      values
    );
    return result.rows[0];
  }
}

module.exports = new Usuario();

