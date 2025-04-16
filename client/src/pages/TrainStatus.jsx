import { useEffect, useState, useCallback, useContext } from "react";
import { SearchContext } from "../App";
import '../styles/Global.css';
import '../styles/TrainStatus.css';
import trainStop from "../components/Classes";

function TrainStatus() {

    const [today, setToday] = useState("");
    const [trainNumber, setTrainNumber] = useState("");
    const [date, setDate] = useState("");
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const [searchResults, setSearchResults] = useState(null);
    const [journeyStops, setJourneyStops] = useState(null);
    const [searchTriggered, setSearchTriggered] = useState(false);
    const { serverSelect } = useContext(SearchContext);

    function formatTimeWithOffset(isoTime) {
        if (!isoTime) return null;
        const date = new Date(isoTime);
        date.setHours(date.getUTCHours() + serverTimeOffset);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }    

    useEffect(() => {
        if (!serverSelect) return;
        const fetchTimeoffset = async () => {
            try {
                const res = await fetch(`https://apis.simrail.tools/sit-servers/v1/by-id/${serverSelect}`);
                const data = await res.json();
                setServerTimeOffset(data.utcOffsetHours);
            } catch (err) {
                console.error("Error fetching for server:", err);
            }
        };
        fetchTimeoffset();
    }, [serverSelect]);

    const findJourney = useCallback(async (journeyId) => {
        try {
            const res = await fetch(`https://apis.simrail.tools/sit-journeys/v1/by-id/${journeyId}`);
            const data = await res.json();
    
            const reasonRes = await fetch(`https://2008.name/api/getMessages/${date}/${serverSelect}/${trainNumber}/`);
            const reasonData = await reasonRes.json();
            const reasonArray = reasonData.map(obj => [obj.station, obj.message, obj.name]);
    
            const stopMap = {};
    
            data.events.forEach(event => {
                const name = event.stopPlace.name;
    
                if (!stopMap[name]) {
                    stopMap[name] = {
                        cancelled: null,
                        arrivalTime: null,
                        depatureTime: null,
                        track: null,
                        trackReal: null,
                        scheduledArrival: null,
                        scheduledDeparture: null,
                        name: name,
                        stopType: event.stopType
                    };
                }
    
                if (event.type === "ARRIVAL") {
                    if (event.realtimeTimeType === "REAL")
                        stopMap[name].arrivalTime = event.realtimeTime;
                    stopMap[name].scheduledArrival = event.scheduledTime;
                } else if (event.type === "DEPARTURE") {
                    if (event.realtimeTimeType === "REAL")
                        stopMap[name].depatureTime = event.realtimeTime;
                    stopMap[name].scheduledDeparture = event.scheduledTime;
                }
    
                if (event.realtimePassengerStop) {
                    stopMap[name].track = event.realtimePassengerStop;
                }
    
                if (event.scheduledPassengerStop) {
                    stopMap[name].trackReal = event.scheduledPassengerStop;
                }
    
                const normalize = str => str.trim().toLowerCase().replace(/\s+/g, " ");
                const matches = reasonArray.filter(
                    row => normalize(row[0]) === normalize(name)
                );

                if (matches.length > 0) {
                    stopMap[name].cancelled = matches[0][1];
                }
    
                if (event.cancelled) {
                    stopMap[name].cancelled = "Cancelled";
                }
    
                if (stopMap[name].cancelled === null) {
                    stopMap[name].cancelled = "";
                }
            });
    
            const stops = Object.values(stopMap).map(s => {
                return new trainStop(
                    s.cancelled,
                    s.arrivalTime,
                    s.depatureTime,
                    s.track,
                    s.trackReal,
                    s.scheduledArrival,
                    s.scheduledDeparture,
                    s.name,
                    s.stopType
                );
            });
    
            setJourneyStops(stops);
        } catch (err) {
            console.error("Failed to fetch journey details", err);
        }
    }, [date, serverSelect, trainNumber]);

    const handleEdit = useCallback(async (station) => {
        try {
        const message = prompt(`Enter message for ${station}\nPlease only do this if you are the dispatcher and be nice`);

        if (message != null && message.length > 0)
            await fetch(`https://2008.name/api/setMessage/${date}/${serverSelect}/${trainNumber}/${station}/null/${message}`);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }, [date, serverSelect, trainNumber]);

    const handleSearch = useCallback(async () => {

        if (!serverSelect || serverSelect === 'default' || serverSelect === '') {
            alert("Please select a server from the topbar first");
            return;
        }

        if (!trainNumber || !serverSelect || !date) {
            alert("Please enter train number and date");
            return;
        }
    
        setSearchTriggered(true);
    
        try {
            const isoDateOnly = new Date(date || today).toISOString().split("T")[0];
            const res = await fetch(`https://apis.simrail.tools/sit-journeys/v1/by-event?serverId=${serverSelect}&date=${isoDateOnly}&journeyNumber=${trainNumber}`);
            const data = await res.json();
            setSearchResults(data.items);
            findJourney(data.items[0].journeyId);
        } catch (err) {
            console.error("Failed to fetch train status", err);
        }
    }, [trainNumber, serverSelect, date, today, findJourney]);

    useEffect(() => {
        if (!searchTriggered) return;
    
        const interval = setInterval(() => {
            handleSearch();
        }, 40000);
    
        return () => clearInterval(interval);
    }, [searchTriggered, trainNumber, serverSelect, date, handleSearch]);

    useEffect(() => {
        document.title = "2008 | trainStatus";
      }, []);      

    useEffect(() => {
        const todayDate = new Date();
        const formattedDate = todayDate.toISOString().split("T")[0];
        setToday(formattedDate);
        setDate(formattedDate);
    }, []);

    return (
        <div>
            <div className="status-container">
                
                <div className="search-bar">
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
                        <p>No results found</p>
                    )}
                </div>
            )}

            {journeyStops && (
            <div className="train-status-container">
                
                <div className="train-status-header">
                <div>
                    <div>{trainNumber}</div>
                    <div className="train-status-header-second-row">
                    <div>Station</div> 
                    <div>Track</div>
                    </div>
                </div>
                <div>
                    <div>Timetable</div>
                    <div className="train-status-header-second-row">
                    <div>Arr</div> 
                    <div>Dep</div>
                    </div>
                </div>
                <div>
                    <div>Diff (min)</div>
                    <div className="train-status-header-second-row">
                    <div>Arr</div> 
                    <div>Dep</div>
                    </div>
                </div>
                <div>
                    <div>Real time</div>
                    <div className="train-status-header-second-row">
                    <div>Arr</div> 
                    <div>Dep</div>
                    </div>
                </div>
                <div>
                    <div>Other</div>
                    <div className="train-status-header-second-row">
                    <div>Reason</div> 
                    </div>
                </div>
                </div>

                {journeyStops.map((stop, idx) => {
                let trackString;
                if (stop.stopTrackReal != null && stop.stopTrack != null && stop.stopTrack.track !== stop.stopTrackReal.track) {
                    trackString = (
                    <>
                    <s>{stop.stopTrack?.track || ' '}</s>&nbsp;{stop.stopTrackReal.track}
                    </>);
                } else if(stop.stopTrackReal != null) {
                    trackString = <>{stop.stopTrackReal.track}</>;
                } else {
                    trackString = <>{stop.stopTrack?.track || ' '}</>;
                }

                let scheduledArriveDisplay = null;
                if (
                    stop.scheduledArrive &&
                    stop.scheduledDepart &&
                    new Date(stop.scheduledArrive).getTime() !== new Date(stop.scheduledDepart).getTime()
                ) {
                    scheduledArriveDisplay = formatTimeWithOffset(stop.scheduledArrive);
                }

                let realTimeArrive = null;

                if (stop.realTimeArrive && stop.realTimeDepart) {
                    const arrive = new Date(stop.realTimeArrive);
                    const depart = new Date(stop.realTimeDepart);
                
                    arrive.setSeconds(0, 0);
                    depart.setSeconds(0, 0);
                
                    if (arrive.getTime() !== depart.getTime()) {
                        realTimeArrive = formatTimeWithOffset(arrive)
                    }
                }                
                
                let arriveDiffMinutes = null;
                if (stop.scheduledArrive && stop.realTimeArrive) {
                    const scheduled = new Date(stop.scheduledArrive);
                    const real = new Date(stop.realTimeArrive);

                    arriveDiffMinutes = Math.round((real - scheduled) / 60000);
                }

                let departDiffMinutes = null;
                if (stop.scheduledDepart && stop.realTimeDepart) {
                    const scheduled = new Date(stop.scheduledDepart);
                    const real = new Date(stop.realTimeDepart);

                    departDiffMinutes = Math.round((real - scheduled) / 60000);

                }

                return (
                    <div className="train-status-row" key={idx}>
                    <div>
                        <div>{stop.stopPlace}</div>
                        <div>{trackString}</div>
                    </div>
                    <div>
                        <div>{scheduledArriveDisplay}</div>
                        <div>{stop.scheduledDepart ? formatTimeWithOffset(stop.scheduledDepart) : '-'}</div>
                    </div>
                    <div>
                        {arriveDiffMinutes !== departDiffMinutes ? (
                            <div style={{ color: arriveDiffMinutes > 0 ? 'red' : 'green' }}>
                            {arriveDiffMinutes !== null ? `${arriveDiffMinutes}` : '-'}
                            </div>
                        ) : (
                            <div>&nbsp;</div>
                        )}
                        <div style={{ color: departDiffMinutes > 0 ? 'red' : 'green' }}>
                            {departDiffMinutes !== null ? `${departDiffMinutes}` : '-'}
                        </div>
                    </div>
                    <div>
                        <div>{realTimeArrive}</div>
                        <div>{stop.realTimeDepart ? formatTimeWithOffset(stop.realTimeDepart) : '-'}</div>
                    </div>
                    <div>
                        {stop.cancelled === "" ? (
                            <button
                            onClick={() => handleEdit(stop.stopPlace)}
                            style={{ background: "none", border: "1px solid #ccc", padding: "2px 6px", cursor: "pointer", color: "white" }} // move to css
                            >
                            Edit
                            </button>
                        ) : (
                            <div>{stop.cancelled}</div>
                        )}
                    </div>
                    </div>
                );
                })}
            </div>
            )}

        </div>
    );
}

export default TrainStatus;
