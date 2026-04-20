import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="logo">HomeStock</h2>

      <nav className="menu">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/produtos"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
        >
          Produtos
        </NavLink>

        <NavLink
          to="/categorias"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
        >
          Categorias
        </NavLink>

        <NavLink
          to="/alertas"
          className={({ isActive }) =>
            isActive ? "menu-link active" : "menu-link"
          }
        >
          Alertas
        </NavLink>
      </nav>
    </aside>
  );
}