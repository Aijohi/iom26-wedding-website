import { useState } from "react";
import CurtainReveal from "./Page/CurtainReveal.jsx";
import LandingPage from "./Page/LandingPage.jsx";
import "./App.css";

function App() {
  const [invitationOpened, setInvitationOpened] = useState(false);

  return invitationOpened ? (
    <LandingPage />
  ) : (
    <CurtainReveal onReveal={() => setInvitationOpened(true)} />
  );
}

export default App;
