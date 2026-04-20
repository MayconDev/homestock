export default function ConfirmModal({
  aberto,
  titulo = "Confirmar ação",
  mensagem = "Deseja continuar?",
  erro = "",
  carregando = false,
  onConfirm,
  onCancel,
}) {
  if (!aberto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{titulo}</h3>

        <p>{mensagem}</p>

        {erro && <p className="feedback-message error">{erro}</p>}

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={onCancel}
            disabled={carregando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="delete-btn"
            onClick={onConfirm}
            disabled={carregando}
          >
            {carregando ? "Excluindo..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}