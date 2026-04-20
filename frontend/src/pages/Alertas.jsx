import { useEffect, useState } from "react";
import api from "../services/api";

export default function Alertas() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await api.get("/produtos/");
        setProdutos(resposta.data);
      } catch (error) {
        setErro("Erro ao carregar alertas.");
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const vencidos = produtos.filter((p) => p.esta_vencido);
  const venceEmBreve = produtos.filter((p) => p.vence_em_breve);
  const estoqueBaixo = produtos.filter((p) => p.estoque_baixo);

  return (
    <div>
      <h2 className="page-title">Alertas</h2>

      {carregando && <p>Carregando alertas...</p>}
      {erro && <p className="erro-login">{erro}</p>}

      {!carregando && !erro && (
        <>
          <div className="alert-card danger">
            <h3>Produtos vencidos ({vencidos.length})</h3>

            {vencidos.length > 0 ? (
              vencidos.map((p) => (
                <p key={p.id}>
                  {p.nome} - validade: {p.data_validade}
                </p>
              ))
            ) : (
              <p>Nenhum produto vencido.</p>
            )}
          </div>

          <div className="alert-card warning">
            <h3>Próximos da validade ({venceEmBreve.length})</h3>

            {venceEmBreve.length > 0 ? (
              venceEmBreve.map((p) => (
                <p key={p.id}>
                  {p.nome} - validade: {p.data_validade}
                </p>
              ))
            ) : (
              <p>Nenhum produto próximo da validade.</p>
            )}
          </div>

          <div className="alert-card info">
            <h3>Estoque baixo ({estoqueBaixo.length})</h3>

            {estoqueBaixo.length > 0 ? (
              estoqueBaixo.map((p) => (
                <p key={p.id}>
                  {p.nome} - quantidade: {p.quantidade}
                </p>
              ))
            ) : (
              <p>Nenhum produto com estoque baixo.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}