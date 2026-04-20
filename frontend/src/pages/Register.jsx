import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      await api.post("/usuarios/cadastro/", {
        username,
        email,
        password,
        confirmar_password: confirmarPassword,
      });

      setMensagem("Conta criada com sucesso.");
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      console.error("Erro completo no cadastro:", error);
      console.error("Resposta do backend:", error?.response?.data);

      const data = error?.response?.data;

      if (typeof data === "string") {
        setErro(data);
      } else if (data?.username?.[0]) {
        setErro(data.username[0]);
      } else if (data?.email?.[0]) {
        setErro(data.email[0]);
      } else if (data?.confirmar_password?.[0]) {
        setErro(data.confirmar_password[0]);
      } else if (data?.password?.[0]) {
        setErro(data.password[0]);
      } else if (data?.non_field_errors?.[0]) {
        setErro(data.non_field_errors[0]);
      } else if (data?.detail) {
        setErro(data.detail);
      } else {
        setErro("Não foi possível criar a conta.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>
        <p>Cadastre-se para usar o HomeStock</p>

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmarPassword}
          onChange={(e) => setConfirmarPassword(e.target.value)}
        />

        {erro && <p className="erro-login">{erro}</p>}
        {mensagem && <p className="mensagem-sucesso">{mensagem}</p>}

        <button type="submit" disabled={carregando}>
          {carregando ? "Criando..." : "Criar conta"}
        </button>

        <p className="auth-link-text">
          Já tem conta? <Link to="/">Entrar</Link>
        </p>
      </form>
    </div>
  );
}