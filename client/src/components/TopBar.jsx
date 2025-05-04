import { useContext, useEffect, useState } from "react";
import { SearchContext } from "../App";
import "../styles/Global.css";

function navigateToAbout() {
	window.location.href = "/about";
}

function navigateToHome() {
	window.location.href = "/";
}

function TopBar() {
	const [theme, setTheme] = useState("dark");
	const [serverList, setServerList] = useState([]);
	const { setServerSelect } = useContext(SearchContext);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	useEffect(() => {
		document.body.className = theme;
	}, [theme]);

	useEffect(() => {
		const fetchServers = async () => {
			try {
				const res = await fetch("https://apis.simrail.tools/sit-servers/v1/");
				const data = await res.json();
				if (Array.isArray(data)) {
					setServerList(data.filter((s) => s.online));
				}
			} catch (err) {
				console.error("Failed to fetch server list", err);
			}
		};

		fetchServers();
	}, []);

	const handleKeyDown = (event) => {
		if (event.key === "Enter" || event.key === " ") {
			navigateToHome();
		}
	};

	return (
		<div className="top-bar">
			<h1 className="logo" onClick={navigateToHome} onKeyDown={handleKeyDown}>
				2008
			</h1>
			<select
				className="server-input"
				onChange={(e) => setServerSelect(e.target.value)}
				defaultValue=""
			>
				<option value="" disabled>
					Select Server
				</option>
				{serverList
					.sort((a, b) => a.code.localeCompare(b.code))
					.map((server) => (
						<option key={server.id} value={server.id}>
							{server.code}
						</option>
					))}
			</select>
			<nav>
				<button type="button" onClick={navigateToAbout}>
					About
				</button>

				<label className="switch">
					<input
						type="checkbox"
						onChange={toggleTheme}
						checked={theme === "light"}
					/>
					<span className="slider round">
						<span className="icon sun">☀️</span>
						<span className="icon moon">🌙</span>
					</span>
				</label>
			</nav>
		</div>
	);
}

export default TopBar;
