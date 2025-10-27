import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SearchContext } from "../App";
import "../styles/Global.css";
import "../styles/TrainStatus.css";

function StationStatus() {
	const [serverTimeOffset, setServerTimeOffset] = useState(0);
	const [dispatchPoints, setDispatchPoints] = useState([]);
	const [dispatchPointSelect, setDispatchPointSelect] = useState(null);
	const [searchTriggered, setSearchTriggered] = useState(false);
	const [date, setDate] = useState(null);
	const [searchResults, setSearchResults] = useState(null);
	const { serverSelect } = useContext(SearchContext);
	const [reasons, setReasons] = useState({});

	function formatTimeWithOffset(isoTime) {
		if (!isoTime) return null;
		const date = new Date(isoTime);
		date.setHours(date.getUTCHours() + serverTimeOffset);
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	const dispatchPointName = useMemo(() => {
		if (!dispatchPointSelect) return "";
		const dp = dispatchPoints.find((dp) => dp.id === dispatchPointSelect);
		return dp ? dp.name : "";
	}, [dispatchPointSelect, dispatchPoints]);

	const dispatchPointId = useMemo(() => {
		if (!dispatchPointSelect) return "";
		const dp = dispatchPoints.find((dp) => dp.id === dispatchPointSelect);
		return dp ? dp.pointId : "";
	}, [dispatchPointSelect, dispatchPoints]);

	useEffect(() => {
		if (!serverSelect) return;
		const fetchTimeoffset = async () => {
			try {
				const res = await fetch(
					`https://apis.simrail.tools/sit-servers/v1/by-id/${serverSelect}`,
				);
				const data = await res.json();
				setServerTimeOffset(data.utcOffsetHours);
			} catch (err) {
				console.error("Error fetching for server: ", err);
			}
		};
		fetchTimeoffset();
	}, [serverSelect]);

	useEffect(() => {
		if (serverSelect === "default") return;
		const fetchDispatchPoints = async () => {
			try {
				const res = await fetch(
					`https://apis.simrail.tools/sit-dispatch-posts/v1/find?serverId=${serverSelect}&limit=100`,
				);
				const data = await res.json();
				setDispatchPoints(data.items);
			} catch (err) {
				console.error("Error fetching dispatch points: ", err);
			}
		};
		fetchDispatchPoints();
	}, [serverSelect]);

	const fetchTrainReason = useCallback(
		async (trainNumber) => {
			try {
				const res = await fetch(
					`${window.location.origin}/api/getMessage/${date}/${serverSelect}/${trainNumber}/${encodeURIComponent(dispatchPointName)}`,
				);

				if (res.ok) {
					const reasonData = await res.json();
					setReasons((prev) => ({
						...prev,
						[trainNumber]: reasonData?.message || "",
					}));
				} else {
					setReasons((prev) => ({
						...prev,
						[trainNumber]: "",
					}));
				}
			} catch (err) {
				console.error(`Error fetching reason for train ${trainNumber}:`, err);
				setReasons((prev) => ({
					...prev,
					[trainNumber]: "",
				}));
			}
		},
		[serverSelect, date, dispatchPointName],
	);

	const handleEdit = useCallback(
		async (train) => {
			try {
				const message = prompt(
					`Enter message for ${train}\nPlease only do this if you are the dispatcher and be nice`,
				);

				if (message != null && message.length > 0) {
					const res = await fetch(
						`${window.location.origin}/api/setMessage/${date}/${serverSelect}/${train}/${dispatchPointName}/null/${message}`,
					);
					if (!res.ok) {
						res.json().then((errorData) => {
							console.error("Error:", errorData.error);
							alert(errorData.error);
						});
					} else {
						fetchTrainReason(train);
					}
				}
			} catch (err) {
				console.error("Error sending message:", err);
			}
		},
		[serverSelect, date, dispatchPointName, fetchTrainReason],
	);

	const handleSearch = useCallback(async () => {
		if (!serverSelect || serverSelect === "default" || serverSelect === "") {
			alert("Please select a server from the topbar first");
			return;
		}

		if (!dispatchPointSelect) {
			alert("Please select a dispatch point");
			return;
		}

		setSearchTriggered(true);
		try {
			const res = await fetch(
				`https://apis.simrail.tools/sit-boards/v1/departures?serverId=${serverSelect}&pointId=${dispatchPointId}`,
			);
			const data = await res.json();
			setSearchResults(data);

			for (let i = 0; i < data.length; i++) {
				const trainNumber = data[i].transport.number;
				fetchTrainReason(trainNumber);
			}
		} catch (err) {
			console.error("Error fetching dispatch points: ", err);
		}
	}, [serverSelect, dispatchPointSelect, dispatchPointId, fetchTrainReason]);

	useEffect(() => {
		if (!searchTriggered) return;

		const interval = setInterval(() => {
			handleSearch();
		}, 40000);

		return () => clearInterval(interval);
	}, [searchTriggered, handleSearch]);

	useEffect(() => {
		document.title = "2008 | stationStatus";
	}, []);

	useEffect(() => {
		const todayDate = new Date();
		const formattedDate = todayDate.toISOString().split("T")[0];
		setDate(formattedDate);
	}, []);

	return (
		<div>
			<div className="status-container">
				<div className="search-bar">
					<select
						className="server-input"
						onChange={(e) => setDispatchPointSelect(e.target.value)}
						defaultValue=""
					>
						<option value="" disabled>
							Select dispatch post
						</option>
						{dispatchPoints
							.sort((a, b) => {
								const nameA = a?.name || "";
								const nameB = b?.name || "";
								return nameA.localeCompare(nameB);
							})
							.map((dispatchPoint) => (
								<option key={dispatchPoint.id} value={dispatchPoint.id}>
									{dispatchPoint.name}
								</option>
							))}
					</select>

					<button
						type="button"
						className="search-button"
						onClick={handleSearch}
					>
						Search
					</button>
				</div>
			</div>

			{searchResults && (
				<div className="train-status-container">
					<div className="train-status-header">
						<div>
							<div>
								{dispatchPoints.find((dp) => dp.id === dispatchPointSelect)
									?.name || ""}
							</div>
							<div className="train-status-header-second-row">
								<div>Train number</div>
								<div>Track</div>
							</div>
						</div>
						<div>
							<div>Timetable</div>
							<div className="train-status-header-second-row">
								<div>Dep</div>
							</div>
						</div>
						<div>
							<div>Diff (min)</div>
							<div className="train-status-header-second-row">
								<div>Dep</div>
							</div>
						</div>
						<div>
							<div>Real time</div>
							<div className="train-status-header-second-row">
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

					{searchResults.map((train) => {
						let trackString;
						if (train.scheduledPassengerStop != null) {
							trackString = train.scheduledPassengerStop.track;
						}

						let departDiffMinutes = null;
						if (train.scheduledTime && train.realtimeTime) {
							const scheduled = new Date(train.scheduledTime);
							const real = new Date(train.realtimeTime);

							departDiffMinutes = Math.round((real - scheduled) / 60000);
						}

						let timeType = "Timetable";
						if (train.realtimeTimeType === "PREDICTION")
							timeType = "Prediction";
						if (train.realtimeTimeType === "REAL") timeType = "Real";

						return (
							<div className="train-status-row" key={train.transport.number}>
								<div>
									<div>{train.transport.number}</div>
									<div>{trackString}</div>
								</div>
								<div>
									<div>
										{train.scheduledTime
											? formatTimeWithOffset(train.scheduledTime)
											: "-"}
									</div>
								</div>
								<div>
									<div
										style={{ color: departDiffMinutes > 0 ? "red" : "green" }}
									>
										{departDiffMinutes !== null ? `${departDiffMinutes}` : "-"}
									</div>
								</div>
								<div>
									<div>
										{train.realtimeTime
											? formatTimeWithOffset(train.realtimeTime)
											: "-"}
									</div>
									<div>{timeType}</div>
								</div>
								<div>
									{train.cancelled ? (
										<div>cancelled</div>
									) : reasons[train.transport.number] ? (
										<div title={reasons[train.transport.number]}>
											{reasons[train.transport.number]}
										</div>
									) : (
										<button
											type="button"
											onClick={() => handleEdit(train.transport.number)}
											style={{
												background: "none",
												border: "1px solid #ccc",
												padding: "2px 6px",
												cursor: "pointer",
												color: "white",
											}}
										>
											Edit
										</button>
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

export default StationStatus;
