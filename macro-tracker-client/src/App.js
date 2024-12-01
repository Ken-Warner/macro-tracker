import { useEffect, useState } from "react";
import Container from "./components/Container";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Nav from "./components/Nav";
import Login from "./components/Login";
import ContainerBox from "./components/ContainerBox";

const tempUser = {
  userId: 1,
  username: "Ken",
};

export default function App() {
  const [user, setUser] = useState(tempUser);
  const isUserLoggedIn = user.userId !== undefined;

  return (
    <>
      <Banner />
      {isUserLoggedIn ? (
        <div>
          <Nav>
            <span>Link</span>
            <span>Link</span>
            <span>Link</span>
          </Nav>
          <Container>
            <div className="user-info">User Info</div>
            <div className="macro-history">Macro History</div>
            <div className="daily-macros">Daily Macros</div>
          </Container>
        </div>
      ) : (
        <Login />
      )}
      <Footer />
    </>
  );
}
