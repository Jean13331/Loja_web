-- =========================================
-- PRODUTO
-- =========================================
CREATE TABLE IF NOT EXISTS produto (
    idproduto SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(5000) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    estoque INTEGER NOT NULL,
    media_avaliacao DECIMAL(2,1) DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE
);

-- =========================================
-- IMAGENS DO PRODUTO
-- =========================================
CREATE TABLE IF NOT EXISTS produto_imagem (
    idproduto_imagem SERIAL PRIMARY KEY,
    produto_idproduto INTEGER NOT NULL,
    imagem BYTEA NOT NULL,
    ordem INTEGER,
    CONSTRAINT fk_produto_imagem_produto
        FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE
);

-- =========================================
-- USUÁRIO
-- =========================================
CREATE TABLE IF NOT EXISTS usuario (
    idusuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    numero_telefone VARCHAR(32) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    cpf VARCHAR(32) NOT NULL UNIQUE,
    nascimento DATE NOT NULL,
    admin BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_admin TIMESTAMP
);

-- =========================================
-- CARTÕES
-- =========================================
CREATE TABLE IF NOT EXISTS cartoes (
    idcartoes SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    numero BIGINT NOT NULL,
    cvv INTEGER NOT NULL,
    vencimento DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    usuario_idusuario INTEGER NOT NULL,
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE
);

-- =========================================
-- ENDEREÇO
-- =========================================
CREATE TABLE IF NOT EXISTS endereco (
    idendereco SERIAL PRIMARY KEY,
    estado VARCHAR(45) NOT NULL,
    cidade VARCHAR(45) NOT NULL,
    bairro VARCHAR(45) NOT NULL,
    rua VARCHAR(100),
    numero INTEGER,
    complemento VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    usuario_idusuario INTEGER NOT NULL,
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE
);

-- =========================================
-- FAVORITOS
-- =========================================
CREATE TABLE IF NOT EXISTS produto_favorito (
    usuario_idusuario INTEGER NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    data_favorito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_idusuario, produto_idproduto),
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE,
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE
);

-- =========================================
-- CATEGORIA
-- =========================================
CREATE TABLE IF NOT EXISTS categoria (
    idcategoria SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(500),
    icone VARCHAR(10) DEFAULT '📦',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- PRODUTO x CATEGORIA
-- =========================================
CREATE TABLE IF NOT EXISTS produto_has_categoria (
    produto_idproduto INTEGER NOT NULL,
    categoria_idcategoria INTEGER NOT NULL,
    PRIMARY KEY (produto_idproduto, categoria_idcategoria),
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE,
    FOREIGN KEY (categoria_idcategoria)
        REFERENCES categoria (idcategoria)
        ON DELETE CASCADE
);

-- =========================================
-- AVALIAÇÃO
-- =========================================
CREATE TABLE IF NOT EXISTS avaliacao (
    idavaliacao SERIAL PRIMARY KEY,
    usuario_idusuario INTEGER NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    nota DECIMAL(2,1) NOT NULL CHECK (nota BETWEEN 0 AND 5),
    comentario VARCHAR(5000),
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (usuario_idusuario, produto_idproduto),
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE,
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE
);

-- =========================================
-- CARRINHO
-- =========================================
CREATE TABLE IF NOT EXISTS carrinho (
    idcarrinho SERIAL PRIMARY KEY,
    status INTEGER DEFAULT 0,
    usuario_idusuario INTEGER NOT NULL,
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario)
        ON DELETE CASCADE
);

-- =========================================
-- ITENS DO CARRINHO
-- =========================================
CREATE TABLE IF NOT EXISTS carrinho_item (
    idcarrinho_item SERIAL PRIMARY KEY,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    produto_idproduto INTEGER NOT NULL,
    carrinho_idcarrinho INTEGER NOT NULL,
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE,
    FOREIGN KEY (carrinho_idcarrinho)
        REFERENCES carrinho (idcarrinho)
        ON DELETE CASCADE
);

-- =========================================
-- PEDIDO
-- =========================================
CREATE TABLE IF NOT EXISTS pedido (
    idpedido SERIAL PRIMARY KEY,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    endereco_idendereco INTEGER NOT NULL,
    cartoes_idcartoes INTEGER NOT NULL,
    FOREIGN KEY (usuario_idusuario)
        REFERENCES usuario (idusuario),
    FOREIGN KEY (endereco_idendereco)
        REFERENCES endereco (idendereco),
    FOREIGN KEY (cartoes_idcartoes)
        REFERENCES cartoes (idcartoes)
);

-- =========================================
-- ITENS DO PEDIDO
-- =========================================
CREATE TABLE IF NOT EXISTS pedido_item (
    idpedido_item SERIAL PRIMARY KEY,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_unitario DECIMAL(10,2) NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    pedido_idpedido INTEGER NOT NULL,
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto),
    FOREIGN KEY (pedido_idpedido)
        REFERENCES pedido (idpedido)
        ON DELETE CASCADE
);

-- =========================================
-- DESTAQUE
-- =========================================
CREATE TABLE IF NOT EXISTS destaque (
    iddestaque SERIAL PRIMARY KEY,
    produto_idproduto INTEGER NOT NULL UNIQUE,
    desconto_percentual DECIMAL(5,2) DEFAULT 0 CHECK (desconto_percentual BETWEEN 0 AND 100),
    valor_com_desconto DECIMAL(10,2),
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    FOREIGN KEY (produto_idproduto)
        REFERENCES produto (idproduto)
        ON DELETE CASCADE
);

DO $$
BEGIN
    RAISE NOTICE 'Script executado sem conflitos de tabelas!';
END $$;
