-- Script de migração para adicionar campos de data na tabela usuario
-- Data de cadastro e data de promoção a admin
-- Este script é idempotente - pode ser executado múltiplas vezes sem erro

-- Adicionar coluna de data de cadastro (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuario' AND column_name = 'data_cadastro'
    ) THEN
        ALTER TABLE usuario 
        ADD COLUMN data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Coluna data_cadastro adicionada';
    ELSE
        RAISE NOTICE 'Coluna data_cadastro já existe';
    END IF;
END $$;

-- Adicionar coluna de data de promoção a admin (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuario' AND column_name = 'data_admin'
    ) THEN
        ALTER TABLE usuario 
        ADD COLUMN data_admin TIMESTAMP NULL;
        RAISE NOTICE 'Coluna data_admin adicionada';
    ELSE
        RAISE NOTICE 'Coluna data_admin já existe';
    END IF;
END $$;

-- Atualizar data_cadastro para usuários existentes (usar uma data padrão se necessário)
-- Se já existirem usuários, manter a data atual como data de cadastro
UPDATE usuario 
SET data_cadastro = CURRENT_TIMESTAMP 
WHERE data_cadastro IS NULL;

-- Se algum usuário já é admin, definir data_admin como a data atual
UPDATE usuario 
SET data_admin = CURRENT_TIMESTAMP 
WHERE admin = 1 AND data_admin IS NULL;

-- Criar trigger para atualizar data_admin automaticamente quando admin mudar de 0 para 1
CREATE OR REPLACE FUNCTION atualizar_data_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Se admin mudou de 0 para 1, definir data_admin
    IF NEW.admin = 1 AND (OLD.admin = 0 OR OLD.admin IS NULL) AND NEW.data_admin IS NULL THEN
        NEW.data_admin := CURRENT_TIMESTAMP;
    END IF;
    -- Se admin mudou de 1 para 0, limpar data_admin
    IF NEW.admin = 0 AND OLD.admin = 1 THEN
        NEW.data_admin := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger (se não existir)
DROP TRIGGER IF EXISTS trigger_atualizar_data_admin ON usuario;
CREATE TRIGGER trigger_atualizar_data_admin
    BEFORE UPDATE ON usuario
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_admin();
    
-- Se a função já existir, apenas recriar o trigger

-- Mensagem de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Campos de data adicionados à tabela usuario com sucesso!';
END $$;

