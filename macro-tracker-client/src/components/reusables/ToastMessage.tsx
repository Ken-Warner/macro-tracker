import { useState, useEffect } from "react";

export interface Toast {
  type: "error" | "good";
  message: string;
}

export default function ToastMessage({
  toast,
  onFinished,
}: {
  toast: Toast;
  onFinished: () => void;
}) {
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
