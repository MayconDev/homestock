export default function Loading({ texto = "Carregando..." }) {
  return (
    <div className="loading-box">
      <div className="spinner" />
      <p>{texto}</p>
    </div>
  );
}