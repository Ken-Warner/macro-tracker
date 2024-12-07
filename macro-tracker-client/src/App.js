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
    console.log("user login handler called");
    console.log(user);
    setUser(user);
  }
  function handleLogUserOut() {
    //this needs to be an API call to destroy the session
    setUser({});
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
              <p>
                Logged in as {user.username}. (
                <span className="link" onClick={handleLogUserOut}>
                  Logout
                </span>
                )
              </p>
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
