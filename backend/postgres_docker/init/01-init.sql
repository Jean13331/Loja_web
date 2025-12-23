-- Script de inicialização do banco de dados
-- Este script é executado automaticamente quando o container PostgreSQL é criado pela primeira vez

-- =========================================
-- Tabela: produto
-- =========================================
CREATE TABLE IF NOT EXISTS produto (
    idproduto SERIAL NOT NULL,
    nome VARCHAR(45) NOT NULL,
    descricao VARCHAR(5000) NOT NULL,
    valor DECIMAL NOT NULL,
    estoque INTEGER NOT NULL,
    media_avaliacao DECIMAL NOT NULL DEFAULT 0,
    PRIMARY KEY (idproduto)
);

-- =========================================
-- Tabela: produto_imagem (N imagens por produto)
-- =========================================
CREATE TABLE IF NOT EXISTS produto_imagem (
    idproduto_imagem SERIAL NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    imagem BYTEA NOT NULL,
    ordem INTEGER,
    PRIMARY KEY (idproduto_imagem),
    CONSTRAINT fk_produto_imagem_produto
        FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: usuario
-- =========================================
CREATE TABLE IF NOT EXISTS usuario (
    idusuario SERIAL NOT NULL,
    nome VARCHAR(45) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    numero_telefone VARCHAR(32) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    cpf VARCHAR(32) NOT NULL UNIQUE,
    nascimento DATE NOT NULL,
    admin SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (idusuario)
);

-- =========================================
-- Tabela: cartoes
-- =========================================
CREATE TABLE IF NOT EXISTS cartoes (
    idcartoes SERIAL NOT NULL,
    nome VARCHAR(45) NOT NULL,
    numero INTEGER NOT NULL,
    cvv INTEGER NOT NULL,
    vencimento DATE NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (idcartoes),
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: endereco
-- =========================================
CREATE TABLE IF NOT EXISTS endereco (
    idendereco SERIAL NOT NULL,
    estado VARCHAR(45) NOT NULL,
    cidade VARCHAR(45) NOT NULL,
    bairro VARCHAR(45) NOT NULL,
    rua VARCHAR(45),
    numero INTEGER,
    complemento VARCHAR(255),
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (idendereco),
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: produto_favorito
-- =========================================
CREATE TABLE IF NOT EXISTS produto_favorito (
    idproduto_favorito SERIAL NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (idproduto_favorito),
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: produto_favorito_has_produto
-- =========================================
CREATE TABLE IF NOT EXISTS produto_favorito_has_produto (
    produto_favorito_idproduto_favorito INTEGER NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    PRIMARY KEY (produto_favorito_idproduto_favorito, produto_idproduto),
    FOREIGN KEY (produto_favorito_idproduto_favorito)
        REFERENCES produto_favorito (idproduto_favorito)
        ON DELETE CASCADE,
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: avaliacao_usuario
-- =========================================
CREATE TABLE IF NOT EXISTS avaliacao_usuario (
    idavaliacao_usuario SERIAL NOT NULL,
    descricao_avaliacao VARCHAR(5000) NOT NULL,
    avaliacao_nota DECIMAL(2,1) NOT NULL,
    PRIMARY KEY (idavaliacao_usuario)
);

-- =========================================
-- Tabela: avaliacao_usuario_has_usuario
-- =========================================
CREATE TABLE IF NOT EXISTS avaliacao_usuario_has_usuario (
    avaliacao_usuario_idavaliacao_usuario INTEGER NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (avaliacao_usuario_idavaliacao_usuario, usuario_idusuario),
    FOREIGN KEY (avaliacao_usuario_idavaliacao_usuario)
        REFERENCES avaliacao_usuario (idavaliacao_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: avaliacao_usuario_has_produto
-- =========================================
CREATE TABLE IF NOT EXISTS avaliacao_usuario_has_produto (
    avaliacao_usuario_idavaliacao_usuario INTEGER NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    PRIMARY KEY (avaliacao_usuario_idavaliacao_usuario, produto_idproduto),
    FOREIGN KEY (avaliacao_usuario_idavaliacao_usuario)
        REFERENCES avaliacao_usuario (idavaliacao_usuario)
        ON DELETE CASCADE,
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: carrinho
-- =========================================
CREATE TABLE IF NOT EXISTS carrinho (
    idcarrinho SERIAL NOT NULL,
    status INTEGER NOT NULL DEFAULT 0,
    usuario_idusuario INTEGER NOT NULL,
    PRIMARY KEY (idcarrinho),
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: carrinho_item
-- =========================================
CREATE TABLE IF NOT EXISTS carrinho_item (
    idcarrinho_item SERIAL NOT NULL,
    quantidade INTEGER NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    carrinho_idcarrinho INTEGER NOT NULL,
    PRIMARY KEY (idcarrinho_item),
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE,
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE,
    FOREIGN KEY (carrinho_idcarrinho)
        REFERENCES carrinho (idcarrinho)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: pedido
-- =========================================
CREATE TABLE IF NOT EXISTS pedido (
    idpedido SERIAL NOT NULL,
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    status INTEGER NOT NULL DEFAULT 0,
    total DECIMAL NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    endereco_idendereco INTEGER NOT NULL,
    cartoes_idcartoes INTEGER NOT NULL,
    PRIMARY KEY (idpedido),
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE,
    FOREIGN KEY (endereco_idendereco)
        REFERENCES endereco (idendereco)
        ON DELETE CASCADE,
    FOREIGN KEY (cartoes_idcartoes)
        REFERENCES cartoes (idcartoes)
        ON DELETE CASCADE
);

-- =========================================
-- Tabela: pedido_item
-- =========================================
CREATE TABLE IF NOT EXISTS pedido_item (
    idpedido_item SERIAL NOT NULL,
    quantidade INTEGER NOT NULL,
    valor_unitario DECIMAL NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    pedido_idpedido INTEGER NOT NULL,
    PRIMARY KEY (idpedido_item),
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE,
    FOREIGN KEY (pedido_idpedido)
        REFERENCES pedido (idpedido)
        ON DELETE CASCADE
);

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Tabelas criadas com sucesso!';
END $$;

