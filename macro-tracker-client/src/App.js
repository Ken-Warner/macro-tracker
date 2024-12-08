import { useState } from "react";
import Container from "./components/Container";
import ContainerItem from "./components/ContainerItem";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import Nav from "./components/Nav";
import Login from "./components/Login";
import Error from "./components/Error";

const tempUser = {
  userId: 1,
  username: "Ken",
};

export default function App() {
  const [error, setError] = useState("");
  const [user, setUser] = useState(tempUser);
  const isUserLoggedIn = user.userId !== undefined;

  function handleLogUserIn(user) {
    setUser(user);
  }
  function handleLogUserOut() {
    async function fetchLogout() {
      const apiResult = await fetch("/api/users/logout");
      if (!apiResult.ok) handleSetError("An error occurred while logging out.");
    }
    fetchLogout();
    setUser({});
  }
  function handleSetError(errorMessage) {
    setError(errorMessage);
  }

  return (
    <>
      {error && <Error errorMessage={error} onError={handleSetError} />}
      <Banner />
      {isUserLoggedIn && (
        <Nav>
          <span>Link</span>
          <span>Link</span>
          <span>Link</span>
        </Nav>
      )}
      <Container>
        {isUserLoggedIn ? (
          <>
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
              <button
                className="button"
                onClick={() => handleSetError("testing")}
              >
                Test
              </button>
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
          </>
        ) : (
          <Login onUserLogin={handleLogUserIn} onError={handleSetError} />
        )}
      </Container>
      <Footer />
    </>
  );
}
