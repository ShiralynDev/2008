class trainStop {
	constructor(
		cancelled,
		realTimeArrive,
		realTimeDepart,
		stopTrack,
		stopTrackReal,
		scheduledArrive,
		scheduledDepart,
		stopPlace,
		stopType,
	) {
		this.cancelled = cancelled;
		this.realTimeArrive = realTimeArrive;
		this.realTimeDepart = realTimeDepart;
		this.stopTrack = stopTrack;
		this.stopTrackReal = stopTrackReal;
		this.scheduledArrive = scheduledArrive;
		this.scheduledDepart = scheduledDepart;
		this.stopPlace = stopPlace;
		this.stopType = stopType;
	}
}
export default trainStop;
