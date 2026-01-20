import { HashRouter as Router, Routes, Route } from "react-router-dom";
import './app.css'
import Home from './routes/home';
import Accept from './routes/accept';
import Decline from "./routes/decline";
import { MinigamesPage } from "./routes/minigames";
import Events from "./routes/events";
import ErrorPage from "./routes/error";
import { TranslationProvider } from "./contexts/TranslationContext";
import { AudioProvider } from "./contexts/AudioContext";
import { Layout } from "./components/Layout"

function App() {

  return (
    <TranslationProvider>
      <AudioProvider volume={0.1}>
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
            <Route path="/error" element={
              <Layout>
                <ErrorPage />
              </Layout>} />
            <Route path="*" element={
              <Layout>
                <ErrorPage />
              </Layout>} />
          </Routes>
        </Router>
      </AudioProvider>
    </TranslationProvider>
  )
}

export default App

