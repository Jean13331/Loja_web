"""
Views para produtos, categorias e destaques
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import connection
from django.utils import timezone
from rest_framework_simplejwt.tokens import UntypedToken
from .models import Produto, Categoria, Destaque, ProdutoHasCategoria, Usuario
from .serializers import ProdutoSerializer, CategoriaSerializer, DestaqueSerializer
from .utils.produto_historico import registrar_historico_produto


def format_response(status_type, message, data=None, status_code=200):
    """Formata resposta no padrão da API"""
    response_data = {
        'status': status_type,
        'message': message,
    }
    if data is not None:
        response_data['data'] = data
    return Response(response_data, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def listar_produtos(request):
    """Lista todos os produtos com a primeira imagem"""
    try:
        produtos = Produto.objects.all()
        serializer = ProdutoSerializer(produtos, many=True)
        produtos_data = serializer.data
        
        # Buscar primeira imagem de cada produto (ordem = 1)
        with connection.cursor() as cursor:
            for produto in produtos_data:
                cursor.execute("""
                    SELECT imagem 
                    FROM produto_imagem 
                    WHERE produto_idproduto = %s AND ordem = 1
                    LIMIT 1
                """, [produto['idproduto']])
                
                row = cursor.fetchone()
                if row and row[0]:
                    # Converter bytes para base64
                    import base64
                    imagem_data = row[0]
                    # Garantir que seja bytes (pode vir como memoryview ou bytes)
                    if isinstance(imagem_data, memoryview):
                        imagem_bytes = imagem_data.tobytes()
                    elif isinstance(imagem_data, bytes):
                        imagem_bytes = imagem_data
                    else:
                        imagem_bytes = bytes(imagem_data)
                    
                    imagem_base64 = base64.b64encode(imagem_bytes).decode('utf-8')
                    # Tentar detectar o tipo de imagem (jpeg, png, etc)
                    # Por padrão, assumimos JPEG
                    produto['imagem_principal'] = f"data:image/jpeg;base64,{imagem_base64}"
                else:
                    produto['imagem_principal'] = None
        
        return format_response('success', 'Produtos listados com sucesso', produtos_data, status.HTTP_200_OK)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return format_response('error', str(e), None, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def listar_destaques(request):
    """Lista produtos em destaque (ativos e dentro do prazo)"""
    try:
        # Buscar destaques ativos usando SQL direto (já que managed=False)
        with connection.cursor() as cursor:
            agora = timezone.now()
            cursor.execute("""
                SELECT d.iddestaque, d.produto_idproduto, d.desconto_percentual, 
                       d.valor_com_desconto, d.ordem,
                       p.idproduto, p.nome, p.descricao, p.valor, p.estoque, p.media_avaliacao
                FROM destaque d
                INNER JOIN produto p ON d.produto_idproduto = p.idproduto
                WHERE d.ativo = 1
                  AND d.data_inicio <= %s
                  AND (d.data_fim IS NULL OR d.data_fim >= %s)
                ORDER BY d.ordem, d.iddestaque
            """, [agora, agora])
            
            rows = cursor.fetchall()
            
        resultado = []
        for row in rows:
            iddestaque, produto_id, desconto, valor_desconto, ordem, idproduto, nome, descricao, valor, estoque, media = row
            
            valor_original = float(valor)
            desconto_float = float(desconto)
            valor_com_desconto = valor_original * (1 - desconto_float / 100)
            
            resultado.append({
                'idproduto': idproduto,
                'nome': nome,
                'descricao': descricao,
                'valor': valor_original,
                'estoque': estoque,
                'media_avaliacao': float(media),
                'destaque': {
                    'iddestaque': iddestaque,
                    'desconto_percentual': desconto_float,
                    'valor_original': valor_original,
                    'valor_com_desconto': valor_com_desconto,
                    'ordem': ordem,
                }
            })
        
        return format_response('success', 'Destaques listados com sucesso', resultado, status.HTTP_200_OK)
    except Exception as e:
        return format_response('error', str(e), None, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def listar_categorias(request):
    """Lista todas as categorias"""
    try:
        categorias = Categoria.objects.all().order_by('nome')
        serializer = CategoriaSerializer(categorias, many=True)
        return format_response('success', 'Categorias listadas com sucesso', serializer.data, status.HTTP_200_OK)
    except Exception as e:
        return format_response('error', str(e), None, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cadastrar_produto(request):
    """Cadastra um novo produto (apenas admin)"""
    try:
        # Verificar se o usuário é admin
        user_id = None
        if hasattr(request.user, 'idusuario'):
            user_id = request.user.idusuario
            user = request.user
        else:
            # Tentar extrair do token
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    decoded = UntypedToken(token)
                    user_id = decoded.get('id')
                    user = Usuario.objects.get(idusuario=user_id)
                except Exception:
                    return format_response('error', 'Token inválido', None, status.HTTP_401_UNAUTHORIZED)
            else:
                return format_response('error', 'Token não fornecido', None, status.HTTP_401_UNAUTHORIZED)
        
        # Verificar se é admin
        if not (user.admin == 1 or user.admin is True):
            return format_response('error', 'Acesso negado. Apenas administradores podem cadastrar produtos.', None, status.HTTP_403_FORBIDDEN)
        
        # Validar dados do produto
        nome = request.data.get('nome', '').strip()
        descricao = request.data.get('descricao', '').strip()
        valor = request.data.get('valor')
        estoque = request.data.get('estoque')
        imagens = request.FILES.getlist('imagens')  # Múltiplas imagens
        
        if not nome:
            return format_response('error', 'O nome do produto é obrigatório', None, status.HTTP_400_BAD_REQUEST)
        if not descricao:
            return format_response('error', 'A descrição do produto é obrigatória', None, status.HTTP_400_BAD_REQUEST)
        if not valor:
            return format_response('error', 'O valor do produto é obrigatório', None, status.HTTP_400_BAD_REQUEST)
        if not estoque:
            return format_response('error', 'O estoque do produto é obrigatório', None, status.HTTP_400_BAD_REQUEST)
        
        try:
            valor_decimal = float(valor)
            if valor_decimal <= 0:
                return format_response('error', 'O valor do produto deve ser maior que zero', None, status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return format_response('error', 'O valor do produto deve ser um número válido', None, status.HTTP_400_BAD_REQUEST)
        
        try:
            estoque_int = int(estoque)
            if estoque_int < 0:
                return format_response('error', 'O estoque deve ser um número não negativo', None, status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return format_response('error', 'O estoque deve ser um número válido', None, status.HTTP_400_BAD_REQUEST)
        
        if not imagens or len(imagens) == 0:
            return format_response('error', 'É necessário adicionar pelo menos uma imagem para o produto', None, status.HTTP_400_BAD_REQUEST)
        
        # Validar tamanho das imagens (máximo 5MB cada)
        for img in imagens:
            if img.size > 5 * 1024 * 1024:
                return format_response('error', f'A imagem {img.name} excede o tamanho máximo de 5MB', None, status.HTTP_400_BAD_REQUEST)
        
        # Inserir produto no banco
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO produto (nome, descricao, valor, estoque, media_avaliacao)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING idproduto
            """, [nome, descricao, valor_decimal, estoque_int, 0.0])
            
            produto_id = cursor.fetchone()[0]
            
            # Inserir imagens
            for ordem, imagem in enumerate(imagens, start=1):
                # Ler o conteúdo do arquivo
                imagem_bytes = imagem.read()
                cursor.execute("""
                    INSERT INTO produto_imagem (produto_idproduto, imagem, ordem)
                    VALUES (%s, %s, %s)
                """, [produto_id, imagem_bytes, ordem])
        
        # Criar/atualizar destaque se solicitado
        is_destaque = request.data.get('is_destaque', 'false').lower() == 'true'
        if is_destaque:
            desconto_percentual = request.data.get('desconto_percentual', '0')
            valor_com_desconto = request.data.get('valor_com_desconto')
            try:
                desconto_float = float(desconto_percentual)
                if desconto_float < 0 or desconto_float > 100:
                    return format_response('error', 'O desconto deve estar entre 0 e 100%', None, status.HTTP_400_BAD_REQUEST)
                
                valor_com_desconto_float = None
                if valor_com_desconto:
                    valor_com_desconto_float = float(valor_com_desconto)
                    if valor_com_desconto_float < 0 or valor_com_desconto_float > valor_decimal:
                        return format_response('error', 'O valor com desconto deve estar entre 0 e o valor original', None, status.HTTP_400_BAD_REQUEST)
                
                with connection.cursor() as cursor:
                    # Verificar se já existe destaque para este produto
                    cursor.execute("""
                        SELECT iddestaque FROM destaque WHERE produto_idproduto = %s
                    """, [produto_id])
                    existing = cursor.fetchone()
                    
                    if existing:
                        # Atualizar destaque existente
                        if valor_com_desconto_float is not None:
                            cursor.execute("""
                                UPDATE destaque 
                                SET desconto_percentual = %s, valor_com_desconto = %s, ativo = 1, data_inicio = CURRENT_TIMESTAMP
                                WHERE produto_idproduto = %s
                            """, [desconto_float, valor_com_desconto_float, produto_id])
                        else:
                            cursor.execute("""
                                UPDATE destaque 
                                SET desconto_percentual = %s, ativo = 1, data_inicio = CURRENT_TIMESTAMP
                                WHERE produto_idproduto = %s
                            """, [desconto_float, produto_id])
                    else:
                        # Criar novo destaque
                        if valor_com_desconto_float is not None:
                            cursor.execute("""
                                INSERT INTO destaque (produto_idproduto, desconto_percentual, valor_com_desconto, ativo, ordem)
                                VALUES (%s, %s, %s, 1, 0)
                            """, [produto_id, desconto_float, valor_com_desconto_float])
                        else:
                            cursor.execute("""
                                INSERT INTO destaque (produto_idproduto, desconto_percentual, ativo, ordem)
                                VALUES (%s, %s, 1, 0)
                            """, [produto_id, desconto_float])
            except (ValueError, TypeError):
                return format_response('error', 'O desconto e valor com desconto devem ser números válidos', None, status.HTTP_400_BAD_REQUEST)
        
        # Registrar no histórico
        dados_novos = {
            'nome': nome,
            'descricao': descricao,
            'valor': valor_decimal,
            'estoque': estoque_int,
        }
        registrar_historico_produto(
            produto_id=produto_id,
            usuario_id=user_id,
            acao='criado',
            dados_novos=dados_novos,
            observacao=f'Produto cadastrado por {user.nome}'
        )
        
        # Buscar produto criado para retornar
        produto = Produto.objects.get(idproduto=produto_id)
        serializer = ProdutoSerializer(produto)
        
        return format_response('success', 'Produto cadastrado com sucesso', serializer.data, status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return format_response('error', f'Erro ao cadastrar produto: {str(e)}', None, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deletar_produto(request, produto_id):
    """Deleta um produto (apenas admin)"""
    try:
        # Verificar se o usuário é admin
        user_id = None
        if hasattr(request.user, 'idusuario'):
            user_id = request.user.idusuario
            user = request.user
        else:
            # Tentar extrair do token
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    decoded = UntypedToken(token)
                    user_id = decoded.get('id')
                    user = Usuario.objects.get(idusuario=user_id)
                except Exception:
                    return format_response('error', 'Token inválido', None, status.HTTP_401_UNAUTHORIZED)
            else:
                return format_response('error', 'Token não fornecido', None, status.HTTP_401_UNAUTHORIZED)
        
        # Verificar se é admin
        if not (user.admin == 1 or user.admin is True):
            return format_response('error', 'Acesso negado. Apenas administradores podem deletar produtos.', None, status.HTTP_403_FORBIDDEN)
        
        # Verificar se o produto existe e buscar dados antes de deletar
        try:
            produto = Produto.objects.get(idproduto=produto_id)
            dados_anteriores = {
                'idproduto': produto.idproduto,
                'nome': produto.nome,
                'descricao': produto.descricao,
                'valor': float(produto.valor),
                'estoque': produto.estoque,
                'media_avaliacao': float(produto.media_avaliacao),
            }
        except Produto.DoesNotExist:
            return format_response('error', 'Produto não encontrado', None, status.HTTP_404_NOT_FOUND)
        
        # Registrar no histórico antes de deletar
        registrar_historico_produto(
            produto_id=produto_id,
            usuario_id=user_id,
            acao='deletado',
            dados_anteriores=dados_anteriores,
            observacao=f'Produto deletado por {user.nome}'
        )
        
        # Deletar produto (as imagens serão deletadas automaticamente por CASCADE)
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM produto WHERE idproduto = %s", [produto_id])
        
        return format_response('success', 'Produto deletado com sucesso', None, status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return format_response('error', f'Erro ao deletar produto: {str(e)}', None, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def obter_produto(request, produto_id):
    """Obtém um produto específico com suas imagens"""
    try:
        produto = Produto.objects.get(idproduto=produto_id)
        serializer = ProdutoSerializer(produto)
        produto_data = serializer.data
        
        # Buscar todas as imagens do produto
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT imagem, ordem 
                FROM produto_imagem 
                WHERE produto_idproduto = %s
                ORDER BY ordem
            """, [produto_id])
            
            rows = cursor.fetchall()
            imagens_base64 = []
            
            for row in rows:
                if row[0]:
                    import base64
                    imagem_data = row[0]
                    ordem = row[1]
                    
                    # Garantir que seja bytes
                    if isinstance(imagem_data, memoryview):
                        imagem_bytes = imagem_data.tobytes()
                    elif isinstance(imagem_data, bytes):
                        imagem_bytes = imagem_data
                    else:
                        imagem_bytes = bytes(imagem_data)
                    
                    imagem_base64 = base64.b64encode(imagem_bytes).decode('utf-8')
            imagens_base64.append({
                'ordem': ordem,
                'data': f"data:image/jpeg;base64,{imagem_base64}"
            })
            
            produto_data['imagens'] = imagens_base64
        
        # Buscar dados de destaque se existir
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT desconto_percentual, valor_com_desconto, ativo 
                FROM destaque 
                WHERE produto_idproduto = %s AND ativo = 1
            """, [produto_id])
            
            destaque_row = cursor.fetchone()
            if destaque_row:
                produto_data['destaque'] = {
                    'desconto_percentual': float(destaque_row[0]),
                    'valor_com_desconto': float(destaque_row[1]) if destaque_row[1] else None,
                    'ativo': destaque_row[2],
                }
        
        return format_response('success', 'Produto obtido com sucesso', produto_data, status.HTTP_200_OK)
    except Produto.DoesNotExist:
        return format_response('error', 'Produto não encontrado', None, status.HTTP_404_NOT_FOUND)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return format_response('error', str(e), None, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def editar_produto(request, produto_id):
    """Edita um produto existente (apenas admin)"""
    try:
        # Verificar se o usuário é admin
        user_id = None
        if hasattr(request.user, 'idusuario'):
            user_id = request.user.idusuario
            user = request.user
        else:
            # Tentar extrair do token
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                try:
                    decoded = UntypedToken(token)
                    user_id = decoded.get('id')
                    user = Usuario.objects.get(idusuario=user_id)
                except Exception:
                    return format_response('error', 'Token inválido', None, status.HTTP_401_UNAUTHORIZED)
            else:
                return format_response('error', 'Token não fornecido', None, status.HTTP_401_UNAUTHORIZED)
        
        # Verificar se é admin
        if not (user.admin == 1 or user.admin is True):
            return format_response('error', 'Acesso negado. Apenas administradores podem editar produtos.', None, status.HTTP_403_FORBIDDEN)
        
        # Verificar se o produto existe e buscar dados anteriores
        try:
            produto = Produto.objects.get(idproduto=produto_id)
            dados_anteriores = {
                'idproduto': produto.idproduto,
                'nome': produto.nome,
                'descricao': produto.descricao,
                'valor': float(produto.valor),
                'estoque': produto.estoque,
                'media_avaliacao': float(produto.media_avaliacao),
            }
        except Produto.DoesNotExist:
            return format_response('error', 'Produto não encontrado', None, status.HTTP_404_NOT_FOUND)
        
        # Validar dados do produto
        nome = request.data.get('nome', '').strip()
        descricao = request.data.get('descricao', '').strip()
        valor = request.data.get('valor')
        estoque = request.data.get('estoque')
        imagens_novas = request.FILES.getlist('imagens')  # Novas imagens para adicionar
        imagens_remover = request.data.getlist('imagens_remover')  # IDs das imagens para remover
        
        if not nome:
            return format_response('error', 'O nome do produto é obrigatório', None, status.HTTP_400_BAD_REQUEST)
        if not descricao:
            return format_response('error', 'A descrição do produto é obrigatória', None, status.HTTP_400_BAD_REQUEST)
        if not valor:
            return format_response('error', 'O valor do produto é obrigatório', None, status.HTTP_400_BAD_REQUEST)
        if not estoque:
            return format_response('error', 'O estoque do produto é obrigatório', None, status.HTTP_400_BAD_REQUEST)
        
        try:
            valor_decimal = float(valor)
            if valor_decimal <= 0:
                return format_response('error', 'O valor do produto deve ser maior que zero', None, status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return format_response('error', 'O valor do produto deve ser um número válido', None, status.HTTP_400_BAD_REQUEST)
        
        try:
            estoque_int = int(estoque)
            if estoque_int < 0:
                return format_response('error', 'O estoque deve ser um número não negativo', None, status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return format_response('error', 'O estoque deve ser um número válido', None, status.HTTP_400_BAD_REQUEST)
        
        # Validar tamanho das novas imagens (máximo 5MB cada)
        for img in imagens_novas:
            if img.size > 5 * 1024 * 1024:
                return format_response('error', f'A imagem {img.name} excede o tamanho máximo de 5MB', None, status.HTTP_400_BAD_REQUEST)
        
        # Atualizar produto no banco
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE produto 
                SET nome = %s, descricao = %s, valor = %s, estoque = %s
                WHERE idproduto = %s
            """, [nome, descricao, valor_decimal, estoque_int, produto_id])
            
            # Remover imagens solicitadas
            if imagens_remover:
                for img_id in imagens_remover:
                    try:
                        cursor.execute("DELETE FROM produto_imagem WHERE idproduto_imagem = %s", [int(img_id)])
                    except (ValueError, TypeError):
                        pass
            
            # Adicionar novas imagens
            if imagens_novas:
                # Buscar a maior ordem atual
                cursor.execute("""
                    SELECT COALESCE(MAX(ordem), 0) 
                    FROM produto_imagem 
                    WHERE produto_idproduto = %s
                """, [produto_id])
                max_ordem = cursor.fetchone()[0] or 0
                
                for ordem, imagem in enumerate(imagens_novas, start=max_ordem + 1):
                    imagem_bytes = imagem.read()
                    cursor.execute("""
                        INSERT INTO produto_imagem (produto_idproduto, imagem, ordem)
                        VALUES (%s, %s, %s)
                    """, [produto_id, imagem_bytes, ordem])
            
            # Gerenciar destaque
            is_destaque = request.data.get('is_destaque', 'false').lower() == 'true'
            if is_destaque:
                desconto_percentual = request.data.get('desconto_percentual', '0')
                valor_com_desconto = request.data.get('valor_com_desconto')
                try:
                    desconto_float = float(desconto_percentual)
                    if desconto_float < 0 or desconto_float > 100:
                        return format_response('error', 'O desconto deve estar entre 0 e 100%', None, status.HTTP_400_BAD_REQUEST)
                    
                    valor_com_desconto_float = None
                    if valor_com_desconto:
                        valor_com_desconto_float = float(valor_com_desconto)
                        if valor_com_desconto_float < 0 or valor_com_desconto_float > valor_decimal:
                            return format_response('error', 'O valor com desconto deve estar entre 0 e o valor original', None, status.HTTP_400_BAD_REQUEST)
                    
                    # Verificar se já existe destaque para este produto
                    cursor.execute("""
                        SELECT iddestaque FROM destaque WHERE produto_idproduto = %s
                    """, [produto_id])
                    existing = cursor.fetchone()
                    
                    if existing:
                        # Atualizar destaque existente
                        if valor_com_desconto_float is not None:
                            cursor.execute("""
                                UPDATE destaque 
                                SET desconto_percentual = %s, valor_com_desconto = %s, ativo = 1, data_inicio = CURRENT_TIMESTAMP
                                WHERE produto_idproduto = %s
                            """, [desconto_float, valor_com_desconto_float, produto_id])
                        else:
                            cursor.execute("""
                                UPDATE destaque 
                                SET desconto_percentual = %s, ativo = 1, data_inicio = CURRENT_TIMESTAMP
                                WHERE produto_idproduto = %s
                            """, [desconto_float, produto_id])
                    else:
                        # Criar novo destaque
                        if valor_com_desconto_float is not None:
                            cursor.execute("""
                                INSERT INTO destaque (produto_idproduto, desconto_percentual, valor_com_desconto, ativo, ordem)
                                VALUES (%s, %s, %s, 1, 0)
                            """, [produto_id, desconto_float, valor_com_desconto_float])
                        else:
                            cursor.execute("""
                                INSERT INTO destaque (produto_idproduto, desconto_percentual, ativo, ordem)
                                VALUES (%s, %s, 1, 0)
                            """, [produto_id, desconto_float])
                except (ValueError, TypeError):
                    return format_response('error', 'O desconto e valor com desconto devem ser números válidos', None, status.HTTP_400_BAD_REQUEST)
            else:
                # Desativar destaque se existir
                cursor.execute("""
                    UPDATE destaque SET ativo = 0 WHERE produto_idproduto = %s
                """, [produto_id])
        
        # Registrar no histórico
        dados_novos = {
            'nome': nome,
            'descricao': descricao,
            'valor': valor_decimal,
            'estoque': estoque_int,
        }
        registrar_historico_produto(
            produto_id=produto_id,
            usuario_id=user_id,
            acao='editado',
            dados_anteriores=dados_anteriores,
            dados_novos=dados_novos,
            observacao=f'Produto editado por {user.nome}'
        )
        
        # Buscar produto atualizado para retornar
        produto = Produto.objects.get(idproduto=produto_id)
        serializer = ProdutoSerializer(produto)
        
        return format_response('success', 'Produto editado com sucesso', serializer.data, status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return format_response('error', f'Erro ao editar produto: {str(e)}', None, status.HTTP_500_INTERNAL_SERVER_ERROR)

