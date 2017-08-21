const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
const SPOTIFY_CATEGORY_URL = "https://api.spotify.com/v1/browse/categories"
const AUTHORIZATION_CODE = "";
const WMATA_DELAY_URL = "https://api.wmata.com/Incidents.svc/json/Incidents";
const WMATA_STATIONS_URL = "https://api.wmata.com/Rail.svc/json/jStations";
const WMATA_STATION_TO_STATION_URL = "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo"
const STATION_CODE_URL = "https://api.wmata.com/Rail.svc/json/jStations/"

const WMATA_KEY = "";
const WMATA_URL = "";

var client_id = ''; // Your client id
var client_secret = ''; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redi5rect uri

const TRACK_IDS = [];
const PLAYLIST = [];
//const TRACKS = [];
const MASTER_TRACKLIST = [];
let playlistArray = [];

let musicKey = 5;
let desiredMood = "";

let waitTime = 0;
let tripTime = 0;
let delayTime = 0;

let playlistTime = 0;

let fromStation = "";
let toStation = "";
let totalTime = 0;
let masterTrackCount = 0;

// 	====================================== * * * * * * WMATA API  * * * * * * ====================================== //
//Add station names to the loc/dest options

function calculateJourneyTime(){
	console.log("calculateJourneyTime ran");
//	getStationCodeAPI(returnStationCode);
	getWaitTime();	

}

function getStationCodeAPI(callback){
	console.log('getStationCodeAPI ran');
	const settings = {	
		headers: { "api_key": WMATA_KEY },
		url: "https://api.wmata.com/Rail.svc/json/jStations",
		success: callback,
		error: console.log("station code error")
	};	
	console.log("station code error2");

	$.ajax(settings)
}

function returnStationCode(data){

	if(data.stations.name === fromStation){
		fromStation = data.stations.code;
		console.log("From station is "+ fromStation);
	}
	getWaitTime();	

}

function convertJourneyTime(time){
	return parseInt(parseInt(totalTime)*6000+6000);
}

function returnStationCode(){

}

//Adds Station Names to the Loc/Dest Menus
function addStationNames(){
	let stations = getWMATAStations(getStationID);
	$(clearSelectionBoxes);
}

function getStationID(data){
	const station =  data.Stations.map((item, index) => item.Name);
	station.sort();
	for(let i=0; i < station.length; i++){
		$("#location").append(`<option>${station[i]}</option>`);
		$("#destination").append(`<option>${station[i]}</option>`);
	}
}

function getWMATAStations(callback){
	const settings = {
		headers: {'api_key': WMATA_KEY},
		url: WMATA_STATIONS_URL,
		success: callback
	};
	$.ajax(settings)
}

///////// ::::: :: : : WAIT TIME CALCULATIONS : : :: :::::: /////////
//function that returns wait time
function getWaitTime(){
	console.log("getWaitTime");
	let location;
//	$(".js-journey-form").submit(event => {
//		location = $("#location").val();
//	});
	//function that retrieves location's code*/
	getWaitPredictionAPI(returnWaitTime, "A01", "D08");
}

//gets wait time from Predictions API
function getWaitPredictionAPI(callback, currentLocation, destination){
	console.log("getWaitPredictionAPI");
	let params = {
            "api_key": WMATA_KEY,
            // Request parameters
        };
     let settings = {
        url: `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${currentLocation}?`
         + $.param(params),
        type: "GET",
        success: function(data){
        	console.log("success!");
        	callback(data, currentLocation, destination);
        },
   //     async: false
    };

    $.ajax(settings);
        

	
}

//returns wait time as a number
function returnWaitTime(data, location, destination){
	console.log("returnWaitTime");
	for(let i = 0; i < data.Trains.length; i++){
		if(data.Trains[i].DestinationCode == destination){
			waitTime = data.Trains[i].Min;
		} 	
	}
	getDelayTime();	
}


///////// ::::: :: : : DELAY TIME CALCULATIONS : : :: :::::: /////////
//function that returns delay time
function getDelayTime(){
//	console.log('getDelayTime');
	$(".js-journey-form").submit(event => {
		const destination = $("#destination")
	})
	getDelayPredictionAPI(returnDelayTime("GR"));
}
//gets API data from incidents API
function getDelayPredictionAPI(callback, passengerLine){
	const settings = {
		headers: { "api_key": WMATA_KEY},
		url: WMATA_DELAY_URL,
		success: callback,
	}
	$.ajax(settings)
}

//returns delay time as a number
function returnDelayTime(data, passengerLine){
//	console.log("returnDelayTime");
	for(let incident in data.Incidents){
		if(passengerLine == incident.LinesAffected){
			delayTime = data.Incidents[0].PassengerDelay;
		} else {
			delayTime = 0;
		}
	}
	getTripPredictionAPI(returnTripTime, fromStation, toStation);
}

///////// ::::: :: : : TRIP TIME CALCULATIONS : : :: :::::: /////////
//function that returns length of trip
function getTripPredictionAPI(callback, fromStation, toStation){
	const settings = {	
		headers: { "api_key": WMATA_KEY },
		url: "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo",
		q: `FromStationCode=${fromStation}&ToStationCode=${toStation}`,
		success: callback,
	//	async: false
	};
	$.ajax(settings)
}

//Return the Railtime of the first/only item in Station to Station Info
function returnTripTime(data){
	console.log("returnTripTime");
	tripTime =  data.StationToStationInfos[0].RailTime;
	direction = data.StationToStationInfos[0].RailTime;
	totalTime = parseInt(tripTime+waitTime+delayTime);

	console.log("total time 1 is: "+totalTime);
	sessionStorage.totalTime = JSON.stringify(totalTime);

	sessionStorage.tripTime = JSON.stringify(tripTime);
	sessionStorage.waitTime = JSON.stringify(waitTime);
	sessionStorage.delayTime = JSON.stringify(delayTime);

	handleSpotify(desiredMood);
}

/*
//Get wait time based on destination
function processWaitTime(data, destination){
	console.log("processing");
	for(let i = 0; i < data.Trains.lengh; i++){
		if(data.Trains.Desination = destination){
			//make sure wait time isn't boarding or arriving
			if(data.Trains.Min !== "") tripTime = data.Trains.Min;
			else return 0;			
			break;
		}else {
			return null;
		}
	}
	handleSpotify(desiredMood);

}

//Find 
function findDirection(){
	
}
*/

//Function that gets the Authorization




//Function that returns client credentials authorization

//Render Media Player

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////

										//	SPOTIFY METHODS  //

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////
function handleSpotify(desiredMood){
	console.log("handling...");
   //let playlistIDs = !!!	
	getSpotifyPlaylist(getPlaylistItems, desiredMood);
	
}

//calls playlist API
function getSpotifyPlaylist(callback, category){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url:  `https://api.spotify.com/v1/browse/categories/${category}/playlists`,
		success: callback,
	//	async: false
	};
	$.ajax(settings)
}


//returns array of playlist id's
function getPlaylistItems(data){	
//	let loop = 0;
console.log("playlists length is "+data.playlists.items.length);
	//while(playlistTime < parseInt(totalTime*60000+60000)){
	for(let i = 0; i < data.playlists.items.length; i++){
		PLAYLIST.push(data.playlists.items[i].id);
		getPlaylistTracks(getTrackIDs, data.playlists.items[i].id);
	//	loop++;
	}
}

//gets the tracks listed in a playlist
function getPlaylistTracks(callback, playlistID){
	settings = {
		url: `https://api.spotify.com/v1/users/Spotify/playlists/${playlistID}/tracks`,
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		success: callback,
	//	async: false
	};
	$.ajax(settings);
}

//Push track ID's to its own array
function getTrackIDs(data){
	for(let i = 0; i < data.items.length; i++){
		TRACK_IDS.push({id: data.items[i].track.id, name: data.items[i].track.name});
	};

	parsePlaylists(data.items.length);
}
//take TRACK_IDS array an d
function parsePlaylists(limit){
	for(let i = 0; i < limit; i++){ // HEYO
			if(TRACK_IDS[i] !== undefined){
				filterTracks(TRACK_IDS[i].id, TRACK_IDS[i].name);		
		}else{
			console.log('breaking');
		}
	};
}

function orderSongs(){
	console.log("ordering songs" + MASTER_TRACKLIST[1] + "H");
	//add a name key/value to each object in the master tracklist so we can print name when needed
	MASTER_TRACKLIST.forEach(item =>{
		console.log("name is "+ item );

	})

}

///////// ::::: :: : : PLAYLIST SORTING ALGORITHMS : : :: :::::: /////////
//returns array of track IDs
function filterTracks(trackID, trackName){
//	console.log("filtering");
	getAudioFeaturesEndpoint(parseKey, trackID, trackName);
}

//get the Audio features from first 100 tracks in list
function getAudioFeaturesEndpoint(callback, trackID, trackName){
	//Spotify's https://api.spotify.com/v1/audio-features endpoint can take up to 100
	//comma-separated track ID's
	let stringOfTracks = [];
	for(let i =0; i < 100; i++){
		if(TRACK_IDS[i] !== undefined) stringOfTracks.push(TRACK_IDS[i].id);
	}
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/audio-features/?ids=${stringOfTracks.toString()}`,
		success: function(data){
			callback(data, trackName);
		}
//		async: false
	}; 
	$.ajax(settings);
}

function parseKey(data, trackName){
	//let playlistTime;
	//console.log("A features lenght is "+data.audio_features.length);

	for(let i = 0; i < data.audio_features.length; i++){
		if(data.audio_features[i].key == musicKey){
			playlistTime += data.audio_features[i].duration_ms;	
			if(playlistTime < parseInt(20*60000+60000)){
				console.log("~match!~");
				MASTER_TRACKLIST.push(data.audio_features[i]);
				MASTER_TRACKLIST[i].name = trackName;
			//	getTrackEndpoint(getTrackName, data.id);
				masterTrackCount++;
			} else {
				sessionStorage.songs = JSON.stringify(MASTER_TRACKLIST); 
				console.log("submitting");
				//unbind and submit
				$("#js-journey-form").unbind().submit();
			}
		}
	}
	
}
//!!!
function getTrackEndpoint(callback, id){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/tracks/${id}`,
		success: callback(data)
	}
	$.ajax(settings)
}

//add track name to master track count 
function getTrackName(data){
	//console.log("trackname is "+data.name);
	MASTER_TRACKLIST[masterTrackCount].name = data.name;
	//console.log('name is '+MASTER_TRACKLIST[masterTrackCount].name);
	//playlistArray = MASTER_TRACKLIST;//.sort(sorbByEnergy);
}
//!!!
function sortByEnergy(a, b){
	return a - b;
}

//order songs by lowest energy to highest

///////// ::::: :: : : DOM RENDERING : : :: :::::: /////////
function renderPlaylist(songs){
	console.log("rendering "+ songs);
	songs.forEach(item => {
		let duration = convertTrackTime(item.duration_ms);
		console.log(item);
		$(".js-playlist").append(`
			<div class="js-playlist-entry">
				<p class="js-song-name">${item.name}</p>
				<p class="js-song-time">${duration}</p>
			</div>	
		`);
	})
}

function convertTrackTime(trackDuration){
	return Math.floor(trackDuration/60000)+":"+Math.floor(((trackDuration/60000) % 1)*60);
}

///////// ::::: :: : : Menu Item Methods : : :: :::::: /////////
//Add category names to the mood options
function addCategoryNames(){
	let categories = getSpotifyCategory(getCategoryID);
	$(clearSelectionBoxes);
}
//Gets Category Data from Spotify API
function getSpotifyCategory(callback){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: SPOTIFY_CATEGORY_URL,
		success: callback
	};
	$.ajax(settings)
}
//gets playlist API based on categories

function getCategoryID(data){
	const category =  data.categories.items.map((item, index) => item.id);
	category.sort();
	for(let i=0; i < category.length; i++){
		$("#mood").append(`<option>${category[i]}</option>`);
	}
}


function clearSelectionBoxes(){
	$("#mood").attr("selectedIndex", -1);
	$("#location").attr("selectedIndex", -1);
	$("#destination").attr("selectedIndex", -1);
}

function convertToSeconds(milliseconds){
	return milliseconds/1000;
}

///////// ::::: :: : : Event Listeners : : :: :::::: /////////
//Function listens for submit button, runs getplaylist functions
function handleSubmit(){
	$(".js-journey-form").submit(event => { 
		event.preventDefault();
		desiredMood = $(this).find("#mood").val(); 
		fromStation = $(this).find("#location").val();
		toStation = $(this).find("#destination").val();
		sessionStorage.mood = JSON.stringify(desiredMood);
		sessionStorage.fromStation = JSON.stringify(fromStation);
		sessionStorage.toStation = JSON.stringify(toStation);
		calculateJourneyTime();
		$(updatePlaylist);
	});
}

function updatePlaylist(){
	//convert local storage string back into object array
	let songs = JSON.parse(sessionStorage.getItem("songs"));
	$(renderPlaylist(songs));
}

function renderJourney(){
	tripTime = JSON.parse(sessionStorage.tripTime);
	waitTime = JSON.parse(sessionStorage.waitTime);
	delayTime = JSON.parse(sessionStorage.delayTime);
	fromStation = JSON.parse(sessionStorage.fromStation);
	toStation = JSON.parse(sessionStorage.toStation);
	let mood = JSON.parse(sessionStorage.mood);

	$(".js-journey-description").text(`A ${mood} Journey from ${fromStation} to ${toStation}`);
	$(".js-wait-time").text(`Wait Time: ${waitTime}`);
	$(".js-trip-time").text(`Travel Time: ${tripTime}`);
	$(".js-delay-time").text(`Delay Time: ${delayTime}`);
}


//take total time and add songs until they equal it in duration

//search through each playlist finding a random key, spotify labels these 0-11 ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

//Gather the tempo, time signature, track uri for each song as you collect them

//line up slowest to fastest, third slowest is second to last, fourth slowest is last

//Return Array of songs, render playlist

$(addStationNames);
$(addCategoryNames);
$(handleSubmit);


//let duration = .duration_ms

//Function that adds a track 
/*function addDuration(totalDuration, currentTrackDuration){
	//if total duration
	//We're rounding up by a minute to ensure the finale song of the playlist lasts until the user exits the train 
	if(totalDuration + currentTrackDuration < travelTime *6000 + 6000){
		totalDuration + currentTrackDuration
	} else {
		//function to stop generating and activate the platylist
	}


//WMATA API
1. Get Length of Wait
//api.wmata.com/StationPrediction.svc/json/GetPrediction/D03
2. Check for delays
//api.wmata.com/Rail.svc/json/jPath?FromStationCode=D03&ToStationCode=C01
3. Calculate full time
4. PLAYLIST_TIME = fullTime + addedDelay + waitTime 
//SPOTIFY API
1. Get Playlists

2. Get the tracks in each playlist
Needed Links:
	https://api.spotify.com/v1/tracks/{id} ::::: INFO : https://developer.spotify.com/web-api/get-track/

3. Check tracks against each other using Audio Features and Analysis
Needed Links:
	Analysis - https://api.spotify.com/v1/audio-analysis/{id} ::::: INFO : https://developer.spotify.com/web-api/get-audio-analysis/
	Features - https://api.spotify.com/v1/audio-features/{id} ::::: INFO : https://developer.spotify.com/web-api/get-audio-features/
	a. Matching the key
	b. Checking tempos so we can transition gradually ()
3. Calculate the length to match the length of train journey
	https://api.spotify.com/v1/audio-features/{id}
*/

//Get total time properly
//Get Destination/line
//Fix Journey Details

