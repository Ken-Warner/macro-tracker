export default function Loader({ size = 1, thickness = 10 }) {
  const sizeStyles = {
    width: `${size}em`,
    height: `${size}em`,
    border: `${thickness}px solid var(--bg-primary)`,
    borderBottom: `${thickness}px solid var(--call-to-action)`,
  };

  return <div className="loader" style={sizeStyles}></div>;
}
