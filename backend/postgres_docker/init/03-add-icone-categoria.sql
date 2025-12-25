-- Adicionar coluna icone na tabela categoria
-- Este script pode ser executado manualmente no banco de dados

ALTER TABLE categoria ADD COLUMN IF NOT EXISTS icone VARCHAR(10) DEFAULT '📦';

