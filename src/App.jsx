import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TrainStatus from './pages/TrainStatus'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trainStatus" element={<TrainStatus />} />
    </Routes>
  )
}

export default App
