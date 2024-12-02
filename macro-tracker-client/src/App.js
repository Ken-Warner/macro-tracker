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
            <div className="container-box user-info">
              <div className="header">User Info</div>
              <p>This is just some text that goes inside of the container.</p>
            </div>
            <div className="container-box macro-history">
              <div className="header">Macro History</div>
              <p>
                This is just some more text that is supposed to go inside of
                this card bro.
              </p>
              <button>Test</button>
            </div>
            <div className="container-box daily-macros">
              <div className="header">Daily Macros</div>
              <p>
                This is just some more text that is supposed to go inside of
                this card bro.
              </p>
            </div>
          </Container>
        </div>
      ) : (
        <Login />
      )}
      <Footer />
    </>
  );
}
