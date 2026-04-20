export default function FeedbackMessage({ type = "success", message }) {
  if (!message) return null;

  return <p className={`feedback-message ${type}`}>{message}</p>;
}