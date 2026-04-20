import { useEffect, useState } from "react";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import Loading from "../components/Loading";
import FeedbackMessage from "../components/FeedbackMessage";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [marca, setMarca] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState("un");
  const [dataValidade, setDataValidade] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [localArmazenamento, setLocalArmazenamento] = useState("");
  const [observacao, setObservacao] = useState("");
  const [categoria, setCategoria] = useState("");

  const [buscaNome, setBuscaNome] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [produtoEditandoId, setProdutoEditandoId] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [erroModal, setErroModal] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarCategorias() {
    try {
      const resposta = await api.get("/categorias/");
      setCategorias(resposta.data);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar as categorias.");
    }
  }

  async function carregarProdutos(nomeFiltro = buscaNome, categoriaFiltro = filtroCategoria) {
    try {
      setErro("");

      const params = {};

      if (nomeFiltro.trim()) {
        params.nome = nomeFiltro.trim();
      }

      if (categoriaFiltro) {
        params.categoria = categoriaFiltro;
      }

      const resposta = await api.get("/produtos/", { params });
      setProdutos(resposta.data);
    } catch (error) {
      setErro("Não foi possível carregar os produtos.");
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDadosIniciais() {
    setCarregando(true);
    await Promise.all([carregarCategorias(), carregarProdutos("", "")]);
  }

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  function limparFormulario() {
    setNome("");
    setDescricao("");
    setMarca("");
    setQuantidade("");
    setUnidadeMedida("un");
    setDataValidade("");
    setEstoqueMinimo("");
    setLocalArmazenamento("");
    setObservacao("");
    setCategoria("");
    setProdutoEditandoId(null);
  }

  function editarProduto(produto) {
    setProdutoEditandoId(produto.id);
    setNome(produto.nome || "");
    setDescricao(produto.descricao || "");
    setMarca(produto.marca || "");
    setQuantidade(produto.quantidade || "");
    setUnidadeMedida(produto.unidade_medida || "un");
    setDataValidade(produto.data_validade || "");
    setEstoqueMinimo(produto.estoque_minimo || "");
    setLocalArmazenamento(produto.local_armazenamento || "");
    setObservacao(produto.observacao || "");
    setCategoria(String(produto.categoria || ""));

    setMensagem("");
    setErro("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function abrirModalExclusao(id) {
    setProdutoParaExcluir(id);
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModalExclusao() {
    setProdutoParaExcluir(null);
    setErroModal("");
    setModalAberto(false);
  }

  async function confirmarExclusaoProduto() {
    try {
      setErro("");
      setMensagem("");
      setErroModal("");
      setExcluindo(true);

      // pausa curta para deixar o texto "Excluindo..." visível
      await new Promise((resolve) => setTimeout(resolve, 700));

      await api.delete(`/produtos/${produtoParaExcluir}/`);

      if (produtoEditandoId === produtoParaExcluir) {
        limparFormulario();
      }

      setMensagem("Produto excluído com sucesso.");
      fecharModalExclusao();
      await carregarProdutos();
    } catch (error) {
      const detalhe = error?.response?.data?.detail;

      if (detalhe) {
        setErroModal(detalhe);
      } else {
        setErroModal("Não foi possível excluir o produto.");
      }

      console.error(error);
    } finally {
      setExcluindo(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nome.trim() || !categoria || !quantidade || !estoqueMinimo) {
      setErro("Preencha nome, categoria, quantidade e estoque mínimo.");
      return;
    }

    const payload = {
      nome,
      descricao,
      marca,
      quantidade,
      unidade_medida: unidadeMedida,
      data_validade: dataValidade || null,
      estoque_minimo: estoqueMinimo,
      local_armazenamento: localArmazenamento,
      observacao,
      categoria,
    };

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      if (produtoEditandoId) {
        await api.put(`/produtos/${produtoEditandoId}/`, payload);
        setMensagem("Produto atualizado com sucesso.");
      } else {
        await api.post("/produtos/", payload);
        setMensagem("Produto cadastrado com sucesso.");
      }

      limparFormulario();
      await carregarProdutos();
    } catch (error) {
      setErro("Não foi possível salvar o produto.");
      console.error(error);
    } finally {
      setSalvando(false);
    }
  }

  async function aplicarFiltros(e) {
    e.preventDefault();
    setCarregando(true);
    await carregarProdutos(buscaNome, filtroCategoria);
  }

  async function limparFiltros() {
    setBuscaNome("");
    setFiltroCategoria("");
    setCarregando(true);
    await carregarProdutos("", "");
  }

  return (
    <div>
      <h2 className="page-title">Produtos</h2>

      <div className="section-box">
        <h3 className="form-title">
          {produtoEditandoId ? "Editar produto" : "Novo produto"}
        </h3>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              placeholder="Ex.: Arroz"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              placeholder="Ex.: Arroz branco tipo 1"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Marca</label>
            <input
              type="text"
              placeholder="Ex.: Tio João"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Quantidade</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex.: 5"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Unidade de medida</label>
            <select
              value={unidadeMedida}
              onChange={(e) => setUnidadeMedida(e.target.value)}
            >
              <option value="un">Unidade</option>
              <option value="kg">Quilograma</option>
              <option value="g">Grama</option>
              <option value="l">Litro</option>
              <option value="ml">Mililitro</option>
              <option value="cx">Caixa</option>
              <option value="pct">Pacote</option>
              <option value="fd">Fardo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Data de validade</label>
            <input
              type="date"
              value={dataValidade}
              onChange={(e) => setDataValidade(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Estoque mínimo</label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex.: 1"
              value={estoqueMinimo}
              onChange={(e) => setEstoqueMinimo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Local de armazenamento</label>
            <input
              type="text"
              placeholder="Ex.: Despensa"
              value={localArmazenamento}
              onChange={(e) => setLocalArmazenamento(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Observação</label>
            <input
              type="text"
              placeholder="Ex.: Comprar mais no fim do mês"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          <div className="action-row">
            <button className="primary-btn" type="submit" disabled={salvando}>
              {salvando
                ? "Salvando..."
                : produtoEditandoId
                ? "Atualizar produto"
                : "Cadastrar produto"}
            </button>

            {produtoEditandoId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={limparFormulario}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <FeedbackMessage type="error" message={erro} />
        <FeedbackMessage type="success" message={mensagem} />
      </div>

      <div className="section-box">
        <h3 className="form-title">Buscar e filtrar produtos</h3>

        <form className="filter-grid" onSubmit={aplicarFiltros}>
          <div className="form-group">
            <label>Buscar por nome</label>
            <input
              type="text"
              placeholder="Ex.: arroz"
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Filtrar por categoria</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categorias.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="action-row">
            <button className="primary-btn" type="submit">
              Aplicar filtros
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        </form>
      </div>

      <div className="section-box">
        <h3 className="form-title">Produtos cadastrados</h3>

        {carregando ? (
          <Loading texto="Carregando produtos..." />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Quantidade</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {produtos.length > 0 ? (
                  produtos.map((produto) => (
                    <tr key={produto.id}>
                      <td>{produto.nome}</td>
                      <td>{produto.categoria_nome}</td>
                      <td>
                        {produto.quantidade} {produto.unidade_medida}
                      </td>
                      <td>{produto.data_validade || "Sem validade"}</td>
                      <td>
                        <div className="status-badges">
                          {produto.esta_vencido ? (
                            <span className="badge badge-danger">Vencido</span>
                          ) : produto.vence_em_breve ? (
                            <span className="badge badge-warning">Vence em breve</span>
                          ) : (
                            <span className="badge badge-success">Em dia</span>
                          )}

                          {produto.estoque_baixo && (
                            <span className="badge badge-info">Estoque baixo</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="edit-btn"
                            onClick={() => editarProduto(produto)}
                          >
                            Editar
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => abrirModalExclusao(produto.id)}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">Nenhum produto encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        aberto={modalAberto}
        titulo="Excluir produto"
        mensagem="Tem certeza que deseja excluir este produto?"
        erro={erroModal}
        carregando={excluindo}
        onConfirm={confirmarExclusaoProduto}
        onCancel={fecharModalExclusao}
      />
    </div>
  );
}