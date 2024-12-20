export default function Nav({ navItems, selectedNavItem, onClick }) {
  return (
    <nav>
      {navItems.map((navItem) => (
        <span
          className={navItem === selectedNavItem ? "active" : ""}
          onClick={() => onClick(navItem)}
        >
          {navItem}
        </span>
      ))}
    </nav>
  );
}
