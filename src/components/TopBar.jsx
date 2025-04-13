import { useEffect, useState } from 'react'
import '../styles/Global.css'

function TopBar() {
    const [theme, setTheme] = useState('dark')
  
    const toggleTheme = () => {
      setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
    }
  
    useEffect(() => {
      document.body.className = theme
    }, [theme])
  
    return (
      <div className="top-bar">
        <h1 className="logo" onClick={() => window.location.href = '/'}>2008</h1>
        <nav>
          <button onClick={() => window.location.href = '/about'}>About</button>
  
          <label className="switch">
            <input type="checkbox" onChange={toggleTheme} checked={theme === 'light'} />
            <span className="slider round">
              <span className="icon sun">☀️</span>
              <span className="icon moon">🌙</span>
            </span>
          </label>
        </nav>
      </div>
    )
  }

export default TopBar
