import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  function sair() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/");
  }

  return (
    <header className="topbar">
      <h1 className="topbar-title">Sistema de Estoque Doméstico</h1>

      <button className="logout-btn" onClick={sair}>
        Sair
      </button>
    </header>
  );
}