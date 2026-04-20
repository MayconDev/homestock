import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <h1>404</h1>
        <p>Página não encontrada.</p>
        <Link className="primary-btn" to="/dashboard">
          Voltar ao dashboard
        </Link>
      </div>
    </div>
  );
}