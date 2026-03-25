import { useState, useEffect } from "react";

export default function ToastMessage({ toast, onFinished }) {
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const startSliding = setTimeout(() => {
      setIsSliding(true);
    }, 4500);
    const finishSliding = setTimeout(() => {
      onFinished();
    }, 5000);

    return () => {
      clearTimeout(startSliding);
      clearTimeout(finishSliding);
    };
  }, [onFinished]);

  return (
    <div
      className={`toast-container ${isSliding ? "toast-container-slide" : ""} ${toast.type === "error" ? "message-banner-color-bad" : "message-banner-color-good"}`}
    >
      {toast.message}
    </div>
  );
}
