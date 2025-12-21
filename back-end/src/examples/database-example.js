/**
 * Exemplos de uso da conexão com o banco de dados PostgreSQL
 */

const { query, getClient } = require('../../config/database');

// Exemplo 1: Query simples
async function exemploQuerySimples() {
  try {
    const result = await query('SELECT * FROM produto LIMIT 5');
    console.log('Produtos encontrados:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
}

// Exemplo 2: Query com parâmetros (prevenção de SQL injection)
async function exemploQueryComParametros(id) {
  try {
    const result = await query('SELECT * FROM produto WHERE idproduto = $1', [id]);
    console.log('Produto encontrado:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    throw error;
  }
}

// Exemplo 3: Inserção de dados
async function exemploInsert(nome, descricao, valor, estoque) {
  try {
    const result = await query(
      `INSERT INTO produto (nome, descricao, valor, estoque) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [nome, descricao, valor, estoque]
    );
    console.log('Produto inserido:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao inserir produto:', error);
    throw error;
  }
}

// Exemplo 4: Transação usando cliente do pool
async function exemploTransacao() {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Primeira operação
    const produtoResult = await client.query(
      'INSERT INTO produto (nome, descricao, valor, estoque) VALUES ($1, $2, $3, $4) RETURNING idproduto',
      ['Produto Teste', 'Descrição teste', 99.99, 10]
    );
    
    const produtoId = produtoResult.rows[0].idproduto;
    
    // Segunda operação (exemplo: inserir em outra tabela relacionada)
    // await client.query('INSERT INTO outra_tabela ...', [produtoId]);
    
    await client.query('COMMIT');
    console.log('Transação concluída com sucesso!');
    
    return produtoId;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação, rollback executado:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exemplo 5: Múltiplas queries em sequência
async function exemploMultiplasQueries() {
  try {
    // Buscar produtos
    const produtos = await query('SELECT * FROM produto LIMIT 10');
    
    // Buscar usuários
    const usuarios = await query('SELECT * FROM usuario LIMIT 10');
    
    // Buscar pedidos
    const pedidos = await query('SELECT * FROM pedido LIMIT 10');
    
    return {
      produtos: produtos.rows,
      usuarios: usuarios.rows,
      pedidos: pedidos.rows,
    };
  } catch (error) {
    console.error('Erro ao executar múltiplas queries:', error);
    throw error;
  }
}

module.exports = {
  exemploQuerySimples,
  exemploQueryComParametros,
  exemploInsert,
  exemploTransacao,
  exemploMultiplasQueries,
};

