import { HashRouter as Router, Routes, Route } from "react-router";
import './app.css'
import Home from './routes/home';
import Accept from './routes/accept';
import Decline from "./routes/decline";
import { MinigamesPage } from "./routes/minigames";
import Events from "./routes/events";
import { TranslationProvider } from "./contexts/TranslationContext";
import { Layout } from "./components/Layout"

function App() {

  return (
    < TranslationProvider >
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>}/>
          <Route path="/accept" element={
            <Layout>
              <Accept />
            </Layout>} />
          <Route path="/decline" element={
            <Layout>
              <Decline />
            </Layout>} />
          <Route path="/minigames" element={
            <Layout>
              <MinigamesPage />
            </Layout>} />
          <Route path="/events" element={
            <Layout>
              <Events />
            </Layout>} />
        </Routes>
      </Router>
    </TranslationProvider>
  )
}

export default App

