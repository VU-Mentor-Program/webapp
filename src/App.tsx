import { lazy, Suspense } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './app.css'
import Home from './routes/home';
import Accept from './routes/accept';
import Decline from "./routes/decline";
import Events from "./routes/events";
import ErrorPage from "./routes/error";
import { TranslationProvider } from "./contexts/TranslationContext";
import { AudioProvider } from "./contexts/AudioContext";
import { Layout } from "./components/Layout"
import { LoadingAnimation } from "./components/LoadingAnimation";

const ChessPage = lazy(() => import("./routes/chess"));

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
            <Route path="/chess" element={
              <Layout>
                <Suspense fallback={<div className="flex justify-center pt-32"><LoadingAnimation /></div>}>
                  <ChessPage />
                </Suspense>
              </Layout>} />
            <Route path="/minigames" element={<Navigate to="/chess" replace />} />
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

