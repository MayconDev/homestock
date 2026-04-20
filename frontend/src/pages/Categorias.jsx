import { useEffect, useState } from "react";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";
import Loading from "../components/Loading";
import FeedbackMessage from "../components/FeedbackMessage";

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [categoriaEditandoId, setCategoriaEditandoId] = useState(null);

    const [modalAberto, setModalAberto] = useState(false);
    const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [erroModal, setErroModal] = useState("");
    const [excluindo, setExcluindo] = useState(false);

    async function carregarCategorias() {
        try {
            setErro("");
            const resposta = await api.get("/categorias/");
            setCategorias(resposta.data);
        } catch (error) {
            setErro("Não foi possível carregar as categorias.");
            console.error(error);
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarCategorias();
    }, []);

    function limparFormulario() {
        setNome("");
        setDescricao("");
        setCategoriaEditandoId(null);
    }

    function editarCategoria(categoria) {
        setCategoriaEditandoId(categoria.id);
        setNome(categoria.nome || "");
        setDescricao(categoria.descricao || "");
        setErro("");
        setMensagem("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function abrirModalExclusao(id) {
        setCategoriaParaExcluir(id);
        setErroModal("");
        setModalAberto(true);
    }

    function fecharModalExclusao() {
        setCategoriaParaExcluir(null);
        setErroModal("");
        setModalAberto(false);
    }

    async function confirmarExclusaoCategoria() {
        try {
            setErro("");
            setMensagem("");
            setErroModal("");
            setExcluindo(true);

            await api.delete(`/categorias/${categoriaParaExcluir}/`);

            if (categoriaEditandoId === categoriaParaExcluir) {
                limparFormulario();
            }

            setMensagem("Categoria excluída com sucesso.");
            fecharModalExclusao();
            await carregarCategorias();
        } catch (error) {
            const detalhe = error?.response?.data?.detail;

            if (detalhe) {
                setErroModal(detalhe);
            } else {
                setErroModal("Não foi possível excluir a categoria.");
            }

            console.error(error);
        } finally {
            setExcluindo(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!nome.trim()) {
            setErro("O nome da categoria é obrigatório.");
            return;
        }

        try {
            setSalvando(true);
            setErro("");
            setMensagem("");

            const payload = {
                nome,
                descricao,
            };

            if (categoriaEditandoId) {
                await api.put(`/categorias/${categoriaEditandoId}/`, payload);
                setMensagem("Categoria atualizada com sucesso.");
            } else {
                await api.post("/categorias/", payload);
                setMensagem("Categoria cadastrada com sucesso.");
            }

            limparFormulario();
            await carregarCategorias();
        } catch (error) {
            setErro("Não foi possível salvar a categoria.");
            console.error(error);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div>
            <h2 className="page-title">Categorias</h2>

            <div className="section-box">
                <h3 className="form-title">
                    {categoriaEditandoId ? "Editar categoria" : "Nova categoria"}
                </h3>

                <form className="form-grid" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome da categoria</label>
                        <input
                            type="text"
                            placeholder="Ex.: Alimentos"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <input
                            type="text"
                            placeholder="Ex.: Produtos alimentícios da casa"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />
                    </div>

                    <div className="action-row">
                        <button className="primary-btn" type="submit" disabled={salvando}>
                            {salvando
                                ? "Salvando..."
                                : categoriaEditandoId
                                    ? "Atualizar categoria"
                                    : "Cadastrar categoria"}
                        </button>

                        {categoriaEditandoId && (
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
                <h3 className="form-title">Categorias cadastradas</h3>

                {carregando ? (
                    <Loading texto="Carregando categorias..." />
                ) : categorias.length > 0 ? (
                    <div className="list-box">
                        {categorias.map((categoria) => (
                            <div key={categoria.id} className="list-item category-item">
                                <div>
                                    <strong>{categoria.nome}</strong>
                                    <p>{categoria.descricao || "Sem descrição"}</p>
                                </div>

                                <div className="table-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => editarCategoria(categoria)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() => abrirModalExclusao(categoria.id)}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Nenhuma categoria cadastrada.</p>
                )}
            </div>

            <ConfirmModal
                aberto={modalAberto}
                titulo="Excluir categoria"
                mensagem="Tem certeza que deseja excluir esta categoria?"
                erro={erroModal}
                carregando={excluindo}
                onConfirm={confirmarExclusaoCategoria}
                onCancel={fecharModalExclusao}
            />
        </div>
    );
}