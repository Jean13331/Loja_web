const { query, getClient } = require('../../config/database');

/**
 * Classe base para modelos
 * Fornece métodos comuns para operações CRUD
 */
class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Busca todos os registros
   */
  async findAll() {
    const result = await query(`SELECT * FROM ${this.tableName}`);
    return result.rows;
  }

  /**
   * Busca um registro por ID
   */
  async findById(id) {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Cria um novo registro
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  /**
   * Atualiza um registro
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const result = await query(
      `UPDATE ${this.tableName} 
       SET ${setClause} 
       WHERE id = $1 
       RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  /**
   * Deleta um registro
   */
  async delete(id) {
    const result = await query(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Busca com condições customizadas
   */
  async findWhere(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
      values
    );
    return result.rows;
  }
}

module.exports = BaseModel;

