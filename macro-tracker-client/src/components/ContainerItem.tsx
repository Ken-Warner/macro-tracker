export default function ContainerItem({
  gridArea,
  itemHeader,
  children,
}: {
  gridArea: string;
  itemHeader: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`container-item ${gridArea}`}>
      <div className="container-item-header">{itemHeader}</div>
      <div className="container-item-body">{children}</div>
    </div>
  );
}
