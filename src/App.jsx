import { useState, createContext } from 'react';
import { Routes, Route } from 'react-router-dom'
import TopBar from './components/TopBar';
import Home from './pages/Home'
import TrainStatus from './pages/TrainStatus'
import About from './pages/About'

export const SearchContext = createContext();

function App() {
  const [serverSelect, setServerSelect] = useState('default');

  return (
    <SearchContext.Provider value={{ serverSelect, setServerSelect }}>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trainStatus" element={<TrainStatus />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </SearchContext.Provider>
  )
}

export default App
