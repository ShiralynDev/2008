import TopBar from "../components/TopBar";
import '../styles/Global.css';
import '../styles/About.css';
import React, { useEffect } from 'react'

function About() {
    useEffect(() => {
        document.title = "2008 | about";
    }, []);      

    return (
        <div>
            <div className="about-container">
                <h1 className="about-title">About 2008</h1>
                <p>2008 is a open source project that displays intresting data from https://github.com/simrailtools/backend</p>
                <p>The project is inspired by https://1409.se/ that is based on real Swedish train API data and is commonly used within the railway (with a pro version providing much more tools and data)</p>
                <p>The name 2008 comes from the inspiration of 1409, 1409 is the last Rc locomotive (commercially(?) used) with the old SJ paintscheme. 2008 is the first X2 driving unit that was upgraded/converted to an X2C unit</p>
            </div>
        </div>
    )
}

export default About;