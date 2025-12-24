-- Script para criar tabela de histórico de produtos
-- Rastreia quem criou, editou ou deletou produtos e quando

-- =========================================
-- Tabela: produto_historico
-- =========================================
-- Este script é idempotente - pode ser executado múltiplas vezes sem erro
CREATE TABLE IF NOT EXISTS produto_historico (
    idproduto_historico SERIAL NOT NULL,
    produto_idproduto INTEGER NOT NULL,
    usuario_idusuario INTEGER NOT NULL,
    acao VARCHAR(20) NOT NULL, -- 'criado', 'editado', 'deletado'
    data_acao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dados_anteriores JSONB NULL, -- Armazena estado anterior do produto (para edições)
    dados_novos JSONB NULL, -- Armazena novo estado do produto
    observacao TEXT NULL, -- Observações sobre a alteração
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produto_historico_produto ON produto_historico(produto_idproduto);
CREATE INDEX IF NOT EXISTS idx_produto_historico_usuario ON produto_historico(usuario_idusuario);
CREATE INDEX IF NOT EXISTS idx_produto_historico_data ON produto_historico(data_acao);
CREATE INDEX IF NOT EXISTS idx_produto_historico_acao ON produto_historico(acao);

-- Criar função para registrar histórico automaticamente
CREATE OR REPLACE FUNCTION registrar_historico_produto()
RETURNS TRIGGER AS $$
DECLARE
    dados_antigos JSONB;
    dados_novos JSONB;
BEGIN
    -- Se for DELETE
    IF TG_OP = 'DELETE' THEN
        dados_antigos := jsonb_build_object(
            'idproduto', OLD.idproduto,
            'nome', OLD.nome,
            'descricao', OLD.descricao,
            'valor', OLD.valor,
            'estoque', OLD.estoque,
            'media_avaliacao', OLD.media_avaliacao
        );
        -- Inserir registro de histórico
        -- Nota: usuario_idusuario precisa ser passado via contexto ou trigger
        -- Por enquanto, vamos usar 0 como padrão (será atualizado pela aplicação)
        INSERT INTO produto_historico (produto_idproduto, usuario_idusuario, acao, dados_anteriores)
        VALUES (OLD.idproduto, 0, 'deletado', dados_antigos);
        RETURN OLD;
    END IF;
    
    -- Se for INSERT
    IF TG_OP = 'INSERT' THEN
        dados_novos := jsonb_build_object(
            'idproduto', NEW.idproduto,
            'nome', NEW.nome,
            'descricao', NEW.descricao,
            'valor', NEW.valor,
            'estoque', NEW.estoque,
            'media_avaliacao', NEW.media_avaliacao
        );
        -- Inserir registro de histórico
        INSERT INTO produto_historico (produto_idproduto, usuario_idusuario, acao, dados_novos)
        VALUES (NEW.idproduto, 0, 'criado', dados_novos);
        RETURN NEW;
    END IF;
    
    -- Se for UPDATE
    IF TG_OP = 'UPDATE' THEN
        dados_antigos := jsonb_build_object(
            'idproduto', OLD.idproduto,
            'nome', OLD.nome,
            'descricao', OLD.descricao,
            'valor', OLD.valor,
            'estoque', OLD.estoque,
            'media_avaliacao', OLD.media_avaliacao
        );
        dados_novos := jsonb_build_object(
            'idproduto', NEW.idproduto,
            'nome', NEW.nome,
            'descricao', NEW.descricao,
            'valor', NEW.valor,
            'estoque', NEW.estoque,
            'media_avaliacao', NEW.media_avaliacao
        );
        -- Inserir registro de histórico apenas se houver mudanças
        IF dados_antigos != dados_novos THEN
            INSERT INTO produto_historico (produto_idproduto, usuario_idusuario, acao, dados_anteriores, dados_novos)
            VALUES (NEW.idproduto, 0, 'editado', dados_antigos, dados_novos);
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers (comentados por enquanto - serão gerenciados pela aplicação)
-- DROP TRIGGER IF EXISTS trigger_historico_produto ON produto;
-- CREATE TRIGGER trigger_historico_produto
--     AFTER INSERT OR UPDATE OR DELETE ON produto
--     FOR EACH ROW
--     EXECUTE FUNCTION registrar_historico_produto();

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Tabela produto_historico criada com sucesso!';
END $$;

