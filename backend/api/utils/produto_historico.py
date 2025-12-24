"""
Utilitários para registrar histórico de produtos
"""
from django.utils import timezone
from ..models import ProdutoHistorico


def registrar_historico_produto(produto_id, usuario_id, acao, dados_anteriores=None, dados_novos=None, observacao=None):
    """
    Registra uma ação no histórico de produtos
    
    Args:
        produto_id: ID do produto
        usuario_id: ID do usuário que realizou a ação
        acao: 'criado', 'editado' ou 'deletado'
        dados_anteriores: Dicionário com estado anterior (para edições)
        dados_novos: Dicionário com novo estado
        observacao: Observação opcional sobre a alteração
    """
    try:
        ProdutoHistorico.objects.create(
            produto_idproduto=produto_id,
            usuario_idusuario=usuario_id,
            acao=acao,
            dados_anteriores=dados_anteriores,
            dados_novos=dados_novos,
            observacao=observacao,
            data_acao=timezone.now()
        )
        return True
    except Exception as e:
        print(f'Erro ao registrar histórico: {e}')
        return False


def obter_historico_produto(produto_id):
    """Retorna o histórico completo de um produto"""
    return ProdutoHistorico.objects.filter(
        produto_idproduto=produto_id
    ).order_by('-data_acao')


def obter_historico_por_usuario(usuario_id):
    """Retorna o histórico de ações de um usuário"""
    return ProdutoHistorico.objects.filter(
        usuario_idusuario=usuario_id
    ).order_by('-data_acao')

