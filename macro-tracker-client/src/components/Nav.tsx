export default function Nav({
  navItems,
  selectedNavItem,
  onClick,
}: {
  navItems: string[];
  selectedNavItem: string;
  onClick: (navItem: string) => void;
}) {
  return (
    <nav>
      {navItems.map((navItem) => (
        <span
          key={navItem}
          className={navItem === selectedNavItem ? "active" : ""}
          onClick={() => onClick(navItem)}
        >
          {navItem}
        </span>
      ))}
    </nav>
  );
}
