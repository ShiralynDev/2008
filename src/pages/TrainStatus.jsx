import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import '../styles/Global.css';
import '../styles/TrainStatus.css';

function TrainStatus() {

    const [today, setToday] = useState("");
    const [server, setServer] = useState("");
    const [trainNumber, setTrainNumber] = useState("");
    const [date, setDate] = useState("");
    const [serverList, setServerList] = useState([]);
    const [searchResults, setSearchResults] = useState(null);

    useEffect(() => {
        const now = new Date();
        const formatted = now.toISOString().split("T")[0];
        setToday(formatted);
        setDate(formatted);

        const fetchServers = async () => {
            try {
                const res = await fetch("https://apis.simrail.tools/sit-servers/v1/");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setServerList(data.filter(s => s.online));
                }
            } catch (err) {
                console.error("Failed to fetch server list", err);
            }
        };

        fetchServers();
    }, []);

    const handleSearch = async () => {
        if (!trainNumber || !server || !date) {
            alert("Please enter all info");
            return;
        }

        try {
            const isoDateOnly = new Date(date || today).toISOString().split("T")[0];
            const res = await fetch(`https://apis.simrail.tools/sit-journeys/v1/by-event?serverId=${server}&date=${isoDateOnly}&journeyNumber=${trainNumber}`);
            const data = await res.json();
            setSearchResults(data.items);
            console.log(data.items);
        } catch (err) {
            console.error("Failed to fetch train status", err);
        }
    };

    return (
        <div>
            <TopBar />

            <div className="status-container">
                <title>2008 | trainStatus</title>
                
                <div className="search-bar">
                    <select
                        className="search-input"
                        onChange={(e) => setServer(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>Select Server</option>
                        {serverList.map(server => (
                            <option key={server.id} value={server.id}>
                                {server.code}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Train Number"
                        className="search-input"
                        onChange={(e) => setTrainNumber(e.target.value)}
                    />

                    <input
                        type="date"
                        className="search-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    <button className="search-button" onClick={handleSearch}>Search</button>
                </div>
            </div>

            {searchResults && (
                    <div className="results-container">
                    {searchResults.length > 0 ? (
                        <ul>
                            {searchResults.map((journey, idx) => (
                                <li key={idx}>
                                    {journey.originEvent.transport.category} <strong>{journey.originEvent.transport.number}</strong> {journey.originEvent.stopPlace.name} - {journey.destinationEvent.stopPlace.name}<br/>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No results found.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default TrainStatus;
