import { BrowserRouter as Router, Routes, Route } from "react-router";
import './app.css'
import Home from './routes/home';
import Accept from './routes/accept';

function App() {

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/accept" element={<Accept />} />
        {/* <Route path="/decline" element={<Decline />} /> */}
      </Routes>
    </Router>
  )
}

export default App
