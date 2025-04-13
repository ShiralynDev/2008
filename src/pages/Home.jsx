import { useNavigate } from 'react-router-dom'
import TopBar from "../components/TopBar";
import '../styles/Home.css'

function Home() {
    const navigate = useNavigate()
  
    return (
    <div>
      <TopBar />

      <div className="home-container">
        <title>2008 | home</title>
        <h1 className="home-title">Welcome to 2008</h1>
        <button className="home-button" onClick={() => navigate('/trainStatus')}>
          Go to Train Status
        </button>
      </div>
    </div>
    )
  }

export default Home
