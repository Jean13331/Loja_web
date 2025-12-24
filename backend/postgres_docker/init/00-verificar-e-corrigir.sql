-- Script de verificação e correção
-- Garante que todas as tabelas e campos existam
-- Este script pode ser executado múltiplas vezes sem erro

-- =========================================
-- Verificar e criar tabela usuario com todos os campos
-- =========================================
DO $$
BEGIN
    -- Se a tabela não existe, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'usuario'
    ) THEN
        CREATE TABLE usuario (
            idusuario SERIAL NOT NULL,
            nome VARCHAR(45) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            numero_telefone VARCHAR(32) NOT NULL,
            senha VARCHAR(100) NOT NULL,
            cpf VARCHAR(32) NOT NULL UNIQUE,
            nascimento DATE NOT NULL,
            admin SMALLINT NOT NULL DEFAULT 0,
            data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            data_admin TIMESTAMP NULL,
            PRIMARY KEY (idusuario)
        );
        RAISE NOTICE 'Tabela usuario criada';
    ELSE
        -- Se a tabela existe, verificar e adicionar campos faltantes
        -- Verificar data_cadastro
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'usuario' AND column_name = 'data_cadastro'
        ) THEN
            ALTER TABLE usuario 
            ADD COLUMN data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
            RAISE NOTICE 'Coluna data_cadastro adicionada à tabela usuario';
        END IF;
        
        -- Verificar data_admin
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'usuario' AND column_name = 'data_admin'
        ) THEN
            ALTER TABLE usuario 
            ADD COLUMN data_admin TIMESTAMP NULL;
            RAISE NOTICE 'Coluna data_admin adicionada à tabela usuario';
        END IF;
        
        -- Atualizar valores NULL em data_cadastro
        UPDATE usuario 
        SET data_cadastro = CURRENT_TIMESTAMP 
        WHERE data_cadastro IS NULL;
    END IF;
END $$;

-- =========================================
-- Verificar e criar tabela produto_historico
-- =========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'produto_historico'
    ) THEN
        CREATE TABLE produto_historico (
            idproduto_historico SERIAL NOT NULL,
            produto_idproduto INTEGER NOT NULL,
            usuario_idusuario INTEGER NOT NULL,
            acao VARCHAR(20) NOT NULL,
            data_acao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            dados_anteriores JSONB NULL,
            dados_novos JSONB NULL,
            observacao TEXT NULL,
            PRIMARY KEY (idproduto_historico),
            CONSTRAINT fk_produto_historico_produto
                FOREIGN KEY (produto_idproduto)
                REFERENCES produto (idproduto)
                ON DELETE CASCADE,
            CONSTRAINT fk_produto_historico_usuario
                FOREIGN KEY (usuario_idusuario)
                REFERENCES usuario (idusuario)
                ON DELETE CASCADE,
            CONSTRAINT chk_acao_valida
                CHECK (acao IN ('criado', 'editado', 'deletado'))
        );
        
        -- Criar índices
        CREATE INDEX idx_produto_historico_produto ON produto_historico(produto_idproduto);
        CREATE INDEX idx_produto_historico_usuario ON produto_historico(usuario_idusuario);
        CREATE INDEX idx_produto_historico_data ON produto_historico(data_acao);
        CREATE INDEX idx_produto_historico_acao ON produto_historico(acao);
        
        RAISE NOTICE 'Tabela produto_historico criada';
    END IF;
END $$;

-- =========================================
-- Verificar e criar tabela categoria
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
    END IF;
END $$;

-- =========================================
-- Verificar e criar tabela produto_has_categoria
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
        
        CREATE INDEX idx_produto_has_categoria_produto ON produto_has_categoria(produto_idproduto);
        CREATE INDEX idx_produto_has_categoria_categoria ON produto_has_categoria(categoria_idcategoria);
        
        RAISE NOTICE 'Tabela produto_has_categoria criada';
    END IF;
END $$;

-- =========================================
-- Verificar e criar tabela destaque
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
            desconto_percentual DECIMAL(5,2) NOT NULL DEFAULT 0,
            valor_com_desconto DECIMAL(10,2) NULL,
            data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            data_fim TIMESTAMP NULL,
            ativo SMALLINT NOT NULL DEFAULT 1,
            ordem INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (iddestaque),
            CONSTRAINT fk_destaque_produto
                FOREIGN KEY (produto_idproduto)
                REFERENCES produto (idproduto)
                ON DELETE CASCADE,
            CONSTRAINT chk_desconto_valido
                CHECK (desconto_percentual >= 0 AND desconto_percentual <= 100)
        );
        
        CREATE INDEX idx_destaque_produto ON destaque(produto_idproduto);
        CREATE INDEX idx_destaque_ativo ON destaque(ativo);
        CREATE INDEX idx_destaque_ordem ON destaque(ordem);
        CREATE INDEX idx_destaque_datas ON destaque(data_inicio, data_fim);
        
        RAISE NOTICE 'Tabela destaque criada';
    END IF;
END $$;

-- =========================================
-- Criar função calcular_valor_desconto
-- =========================================
CREATE OR REPLACE FUNCTION calcular_valor_desconto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.valor_com_desconto IS NULL THEN
        SELECT (p.valor * (1 - NEW.desconto_percentual / 100))
        INTO NEW.valor_com_desconto
        FROM produto p
        WHERE p.idproduto = NEW.produto_idproduto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular valor_com_desconto
DROP TRIGGER IF EXISTS trigger_calcular_valor_desconto ON destaque;
CREATE TRIGGER trigger_calcular_valor_desconto
    BEFORE INSERT OR UPDATE ON destaque
    FOR EACH ROW
    EXECUTE FUNCTION calcular_valor_desconto();

-- =========================================
-- Criar função atualizar_data_admin
-- =========================================
CREATE OR REPLACE FUNCTION atualizar_data_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.admin = 1 AND (OLD.admin = 0 OR OLD.admin IS NULL) AND NEW.data_admin IS NULL THEN
        NEW.data_admin := CURRENT_TIMESTAMP;
    END IF;
    IF NEW.admin = 0 AND OLD.admin = 1 THEN
        NEW.data_admin := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para data_admin
DROP TRIGGER IF EXISTS trigger_atualizar_data_admin ON usuario;
CREATE TRIGGER trigger_atualizar_data_admin
    BEFORE UPDATE ON usuario
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_admin();

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE 'Verificação e correção concluídas!';
END $$;

