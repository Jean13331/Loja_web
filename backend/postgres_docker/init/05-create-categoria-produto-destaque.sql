-- Script para criar tabelas de categoria, relacionamento N:N e destaques
-- Este script é idempotente - pode ser executado múltiplas vezes sem erro

-- =========================================
-- Tabela: categoria
-- =========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'categoria'
    ) THEN
        CREATE TABLE categoria (
            idcategoria SERIAL NOT NULL,
            nome VARCHAR(100) NOT NULL UNIQUE,
            descricao VARCHAR(500) NULL,
            data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (idcategoria)
        );
        RAISE NOTICE 'Tabela categoria criada';
    ELSE
        RAISE NOTICE 'Tabela categoria já existe';
    END IF;
END $$;

-- =========================================
-- Tabela: produto_has_categoria (N:N)
-- =========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'produto_has_categoria'
    ) THEN
        CREATE TABLE produto_has_categoria (
            produto_idproduto INTEGER NOT NULL,
            categoria_idcategoria INTEGER NOT NULL,
            PRIMARY KEY (produto_idproduto, categoria_idcategoria),
            CONSTRAINT fk_produto_has_categoria_produto
                FOREIGN KEY (produto_idproduto)
                REFERENCES produto (idproduto)
                ON DELETE CASCADE,
            CONSTRAINT fk_produto_has_categoria_categoria
                FOREIGN KEY (categoria_idcategoria)
                REFERENCES categoria (idcategoria)
                ON DELETE CASCADE
        );
        RAISE NOTICE 'Tabela produto_has_categoria criada';
    ELSE
        RAISE NOTICE 'Tabela produto_has_categoria já existe';
    END IF;
END $$;

-- Criar índices para melhor performance (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_produto_has_categoria_produto'
    ) THEN
        CREATE INDEX idx_produto_has_categoria_produto ON produto_has_categoria(produto_idproduto);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_produto_has_categoria_categoria'
    ) THEN
        CREATE INDEX idx_produto_has_categoria_categoria ON produto_has_categoria(categoria_idcategoria);
    END IF;
END $$;

-- =========================================
-- Tabela: destaque
-- =========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'destaque'
    ) THEN
        CREATE TABLE destaque (
            iddestaque SERIAL NOT NULL,
            produto_idproduto INTEGER NOT NULL UNIQUE,
            desconto_percentual DECIMAL(5,2) NOT NULL DEFAULT 0, -- Ex: 25.00 = 25%
            valor_com_desconto DECIMAL(10,2) NULL, -- Valor calculado (opcional, pode ser calculado)
            data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            data_fim TIMESTAMP NULL, -- NULL = sem data de término
            ativo SMALLINT NOT NULL DEFAULT 1, -- 1 = ativo, 0 = inativo
            ordem INTEGER NOT NULL DEFAULT 0, -- Ordem de exibição no carrossel
            PRIMARY KEY (iddestaque),
            CONSTRAINT fk_destaque_produto
                FOREIGN KEY (produto_idproduto)
                REFERENCES produto (idproduto)
                ON DELETE CASCADE,
            CONSTRAINT chk_desconto_valido
                CHECK (desconto_percentual >= 0 AND desconto_percentual <= 100)
        );
        RAISE NOTICE 'Tabela destaque criada';
    ELSE
        RAISE NOTICE 'Tabela destaque já existe';
    END IF;
END $$;

-- Criar índices para melhor performance (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_destaque_produto'
    ) THEN
        CREATE INDEX idx_destaque_produto ON destaque(produto_idproduto);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_destaque_ativo'
    ) THEN
        CREATE INDEX idx_destaque_ativo ON destaque(ativo);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_destaque_ordem'
    ) THEN
        CREATE INDEX idx_destaque_ordem ON destaque(ordem);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_destaque_datas'
    ) THEN
        CREATE INDEX idx_destaque_datas ON destaque(data_inicio, data_fim);
    END IF;
END $$;

-- Função para calcular valor com desconto automaticamente
CREATE OR REPLACE FUNCTION calcular_valor_desconto()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular valor com desconto baseado no valor do produto e percentual de desconto
    IF NEW.valor_com_desconto IS NULL THEN
        SELECT (p.valor * (1 - NEW.desconto_percentual / 100))
        INTO NEW.valor_com_desconto
        FROM produto p
        WHERE p.idproduto = NEW.produto_idproduto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular valor com desconto ao inserir/atualizar
DROP TRIGGER IF EXISTS trigger_calcular_valor_desconto ON destaque;
CREATE TRIGGER trigger_calcular_valor_desconto
    BEFORE INSERT OR UPDATE ON destaque
    FOR EACH ROW
    EXECUTE FUNCTION calcular_valor_desconto();

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Tabelas de categoria e destaque criadas com sucesso!';
END $$;

