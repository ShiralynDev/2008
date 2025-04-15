import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TrainStatus from './pages/TrainStatus'
import About from './pages/About'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trainStatus" element={<TrainStatus />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default App
