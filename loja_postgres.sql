-- Script gerado a partir do modelo MySQL Workbench
-- Convertido para PostgreSQL

-- Tabela: produto
CREATE TABLE IF NOT EXISTS produto (
    idproduto INTEGER NOT NULL,
    imagem_produto BYTEA NOT NULL,
    nome VARCHAR(45) NOT NULL,
    descricao VARCHAR(5000) NOT NULL,
    valor DECIMAL NOT NULL,
    estoque INTEGER NOT NULL,
    media_avaliacao DECIMAL NOT NULL,
    PRIMARY KEY (idproduto)
);

-- Tabela: usuario
CREATE TABLE IF NOT EXISTS usuario (
    idusuario INTEGER NOT NULL,
    nome VARCHAR(45) NOT NULL,
    email VARCHAR(100) NOT NULL,
    numero_telefone VARCHAR(15) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    cpf VARCHAR(20) NOT NULL,
    nascimento DATE NOT NULL,
    admin SMALLINT NOT NULL,
    PRIMARY KEY (idusuario)
);

-- Tabela: cartoes
CREATE TABLE IF NOT EXISTS cartoes (
    idcartoes INTEGER NOT NULL,
    nome VARCHAR(45) NOT NULL,
    numero INTEGER NOT NULL,
    cvv INTEGER NOT NULL,
    vencimento DATE NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (idcartoes)
);

-- Tabela: endereco
CREATE TABLE IF NOT EXISTS endereco (
    idendereco INTEGER NOT NULL,
    estado VARCHAR(45) NOT NULL,
    cidade VARCHAR(45) NOT NULL,
    bairro VARCHAR(45) NOT NULL,
    rua VARCHAR(45),
    numero INTEGER,
    complemento VARCHAR(255),
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (idendereco)
);

-- Tabela: produto_favorito
CREATE TABLE IF NOT EXISTS produto_favorito (
    idproduto_favorito INTEGER NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (idproduto_favorito)
);

-- Tabela: produto_favorito_has_produto
CREATE TABLE IF NOT EXISTS produto_favorito_has_produto (
    produto_favorito_idproduto_favorito INTEGER NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    PRIMARY KEY (produto_favorito_idproduto_favorito, produto_idproduto)
);

-- Tabela: avaliacao_usuario
CREATE TABLE IF NOT EXISTS avaliacao_usuario (
    idavaliacao_usuario INTEGER NOT NULL,
    descricao_avaliacao VARCHAR(5000) NOT NULL,
    avaliacao_nota DECIMAL(2,3) NOT NULL,
    PRIMARY KEY (idavaliacao_usuario)
);

-- Tabela: avaliacao_usuario_has_usuario
CREATE TABLE IF NOT EXISTS avaliacao_usuario_has_usuario (
    avaliacao_usuario_idavaliacao_usuario INTEGER NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (avaliacao_usuario_idavaliacao_usuario, usuario_idusuario)
);

-- Tabela: avaliacao_usuario_has_produto
CREATE TABLE IF NOT EXISTS avaliacao_usuario_has_produto (
    avaliacao_usuario_idavaliacao_usuario INTEGER NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    PRIMARY KEY (avaliacao_usuario_idavaliacao_usuario, produto_idproduto)
);

-- Tabela: carrinho
CREATE TABLE IF NOT EXISTS carrinho (
    idcarrinho INTEGER NOT NULL,
    status INTEGER NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (idcarrinho)
);

-- Tabela: carrinho_item
CREATE TABLE IF NOT EXISTS carrinho_item (
    idcarrinho_item INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    carrinho_idcarrinho INTEGER NOT NULL,
    PRIMARY KEY (idcarrinho_item, produto_idproduto, carrinho_idcarrinho)
);

-- Tabela: pedido
CREATE TABLE IF NOT EXISTS pedido (
    idpedido INTEGER NOT NULL,
    data_pedido DATE NOT NULL,
    status INTEGER NOT NULL,
    total DECIMAL NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    endereco_idendereco INTEGER NOT NULL,
    cartoes_idcartoes INTEGER NOT NULL,
    PRIMARY KEY (idpedido)
);

-- Tabela: pedido_item
CREATE TABLE IF NOT EXISTS pedido_item (
    idpedido_item INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    valor_unitario DECIMAL NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    pedido_idpedido INTEGER NOT NULL,
    PRIMARY KEY (idpedido_item)
);

