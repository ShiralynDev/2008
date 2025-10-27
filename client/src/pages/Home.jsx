import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import "../styles/Home.css";

function Home() {
	const navigate = useNavigate();

	useEffect(() => {
		document.title = "2008 | home";
	}, []);

	return (
		<div>
			<div className="home-container">
				<h1 className="home-title">Welcome to 2008</h1>
        <a href="https://github.com/ShiralynDev/2008">
					Source code at Github
				</a>
        <div className="button-container">
          <button
            type="button"
            className="home-button"
            onClick={() => navigate("/trainStatus")}
          >
            Train Status
          </button>

          <button
            type="button"
            className="home-button"
            onClick={() => navigate("/stationStatus")}
          >
            Station Status
          </button>
        </div>

					<div className="map-container">
						<iframe src="https://map.simrail.app/" title="Map" />
					</div>
				</div>
			</div>
	);
}

export default Home;
