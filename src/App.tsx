import { HashRouter as Router, Routes, Route } from "react-router";
import './app.css'
import Home from './routes/home';
import Accept from './routes/accept';
import Decline from "./routes/decline";
import { MinigamesPage } from "./routes/minigames";
import { TranslationProvider } from "./contexts/TranslationContext";

function App() {

  return (
    < TranslationProvider >
      <Router>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/accept" element={<Accept />} />
          <Route path="/decline" element={<Decline />} />
          <Route path="/minigames" element={<MinigamesPage />} />
        </Routes>
      </Router>
    </TranslationProvider>
  )
}

export default App

