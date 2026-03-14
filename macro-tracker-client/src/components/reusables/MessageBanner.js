export default function MessageBanner({ message, color, onClick }) {

  return (
    <div
      className={`message-banner ${(color === "bad") ? "message-banner-color-bad" : "message-banner-color-good"}`}
    >
      {message}
      <div className="message-banner-x" onClick={onClick}>❌</div>
    </div>
  );
}
