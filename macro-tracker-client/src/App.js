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
            <div className="container-item user-info">
              <div className="container-item-header">User Info</div>
              <div className="container-item-body">
                This is just some text that goes inside of the container. This
                is just some text that goes inside of the container. This is
                just some text that goes inside of the container. This is just
                some text that goes inside of the container. This is just some
                text that goes inside of the container. This is just some text
                that goes inside of the container. This is just some text that
                goes inside of the container. This is just some text that goes
                inside of the container.
              </div>
            </div>
            <div className="container-item macro-history">
              <div className="container-item-header">Macro History</div>
              <div className="container-item-body">
                This is just some more text that is supposed to go inside of
                this card bro.
              </div>
              <button className="button">Test</button>
            </div>
            <div className="container-item daily-macros">
              <div className="container-item-header">Daily Macros</div>
              <div className="container-item-body">
                This is just some more text that is supposed to go inside of
                this card bro.This is just some more text that is supposed to go
                inside of this card bro.This is just some more text that is
                supposed to go inside of this card bro.This is just some more
                text that is supposed to go inside of this card bro.This is just
                some more text that is supposed to go inside of this card
                bro.This is just some more text that is supposed to go inside of
                this card bro.
              </div>
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
