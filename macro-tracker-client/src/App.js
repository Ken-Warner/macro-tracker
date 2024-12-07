import { useEffect, useState } from "react";
import Container from "./components/Container";
import ContainerItem from "./components/ContainerItem";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Nav from "./components/Nav";
import Login from "./components/Login";

const tempUser = {
  userId: 1,
  username: "Ken",
};

export default function App() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({});
  const isUserLoggedIn = user.userId !== undefined;

  function handleLogUserIn(user) {
    setUser(user);
  }

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
            <ContainerItem gridArea="user-info" itemHeader="User Info">
              This is just some text that goes inside of the container. This is
              just some text that goes inside of the container. This is just
              some text that goes inside of the container. This is just some
              text that goes inside of the container. This is just some text
              that goes inside of the container. This is just some text that
              goes inside of the container. This is just some text that goes
              inside of the container. This is just some text that goes inside
              of the container.
            </ContainerItem>
            <ContainerItem gridArea="macro-history" itemHeader="Macro History">
              This is just some more text that is supposed to go inside of this
              card bro.
              <button className="button">Test</button>
            </ContainerItem>
            <ContainerItem gridArea="daily-macros" itemHeader="Daily Macros">
              This is just some more text that is supposed to go inside of this
              card bro.This is just some more text that is supposed to go inside
              of this card bro.This is just some more text that is supposed to
              go inside of this card bro.This is just some more text that is
              supposed to go inside of this card bro.This is just some more text
              that is supposed to go inside of this card bro.This is just some
              more text that is supposed to go inside of this card bro.
            </ContainerItem>
          </Container>
        </div>
      ) : (
        <Login onUserLogin={handleLogUserIn} onError={setError} />
      )}
      <Footer />
    </>
  );
}
