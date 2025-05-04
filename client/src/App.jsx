import { createContext, useState } from "react";
import { Route, Routes } from "react-router-dom";
import TopBar from "./components/TopBar";
import About from "./pages/About";
import Home from "./pages/Home";
import TrainStatus from "./pages/TrainStatus";

export const SearchContext = createContext();

function App() {
	const [serverSelect, setServerSelect] = useState("default");

	return (
		<SearchContext.Provider value={{ serverSelect, setServerSelect }}>
			<TopBar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/trainStatus" element={<TrainStatus />} />
				<Route path="/about" element={<About />} />
			</Routes>
		</SearchContext.Provider>
	);
}

export default App;
