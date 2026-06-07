export default function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const classes = className ? `container ${className}` : "container";
  return <div className={classes}>{children}</div>;
}
