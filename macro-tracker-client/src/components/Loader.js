export default function Loader({ size = 50, thickness = 10 }) {
  const sizeStyles = {
    width: `${size}px`,
    height: `${size}px`,
    border: `${thickness}px solid var(--bg-primary)`,
    borderBottom: `${thickness}px solid var(--call-to-action)`,
  };

  return <div className="loader" style={sizeStyles}></div>;
}
