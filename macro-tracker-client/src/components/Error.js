import { useState, useEffect } from "react";

export default function Error({ errorMessage, onError }) {
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const changeStyleId = setTimeout(() => {
      setIsSliding(true);
    }, 4500);
    const removeErrorId = setTimeout(() => {
      onError("");
    }, 5000);

    return () => {
      clearTimeout(changeStyleId);
      clearTimeout(removeErrorId);
    };
  }, []);

  return (
    <div
      className={`error-container ${isSliding ? "error-container-slide" : ""}`}
    >
      {errorMessage}
    </div>
  );
}
