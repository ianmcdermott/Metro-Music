const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
const SPOTIFY_CATEGORY_URL = "https://api.spotify.com/v1/browse/categories"
const AUTHORIZATION_CODE = "BQCwqjxHZuNVTR_-CVv-jRduQlqzKH2sh-mRsERxlWYdsWSGraNVd6Np7D5C1-dYyQmvxoXnHBt6zu4WKj3SFQ";
const WMATA_DELAY_URL = "https://api.wmata.com/Incidents.svc/json/Incidents";
const WMATA_STATIONS_URL = "https://api.wmata.com/Rail.svc/json/jStations";
const WMATA_STATION_TO_STATION_URL = "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo"
const STATION_CODE_URL = "https://api.wmata.com/Rail.svc/json/jStations/"

const WMATA_KEY = "";
const WMATA_URL = "";

let user_id = '';
var client_id = ''; // Your client id
var client_secret = ''; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redi5rect uri

let TRACK_IDS = [];
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
let toCode = "";
let fromCode = "";
const stationItems = [];
let lineColor = "";
let playlistLoop = 0;
let trackCount = 0;

// 	====================================== * * * * * * WMATA API  * * * * * * ====================================== //
//Add station names to the loc/dest options
function getStationCode(fs, ts){
	let tc = stationItems.find(function(item){
		return getCode(item, ts, "Code");
	});
	let fc = stationItems.find(function(item){
		return getCode(item, fs, "Code");
	});
	let lc = stationItems.find(function(item){
		return getCode(item, fs, "LineCode1");
	});

	fromCode = fc.Code;
	toCode = tc.Code;
	lineColor = lc.LineCode1;
////////	console.log(toCode+"::::"+fromCode+"::::"+lineColor);
}

function getCode(item, variable, key){
	if(item.Name === variable){
		return item.Code;
	}
}

function getLine(item, variable, key){
	if(item.Name === variable){
		return item.LineCode1;
	}
}


function calculateJourneyTime(){
//	getWMATAStations(returnStationCode);
	getWaitTime();	

}

//Adds Station Names to the Loc/Dest Menus
function addStationNames(){
	let stations = getWMATAStations(getStationID);
//	$(clearSelectionBoxes);
}

function getWMATAStations(callback){
	const settings = {
		headers: {'api_key': WMATA_KEY},
		url: WMATA_STATIONS_URL,
		success: callback
	};
	$.ajax(settings)
}

function getStationID(data){
	const station = [];
	data.Stations.map(function(item, index){
		station.push(item.Name);
		stationItems.push(item);
	});
	station.sort();
	for(let i=0; i < station.length; i++){
		$("#location").append(`<option>${station[i]}</option>`);
		$("#destination").append(`<option>${station[i]}</option>`);
	};
}
/*
function getStationCode(data){
	data.Stations.map(function(item, index){ 
	////////	console.log(item.Name);
	////////	console.log(toStation);
		if(item.Name === toStation){
		////////	console.log("to object");
			toObject = item;
		} else if(item.Name === fromStation){
			fromObject = item;
		////////	console.log("fro object");
		}
	});
}*/

///////// ::::: :: : : WAIT TIME CALCULATIONS : : :: :::::: /////////
//function that returns wait time
function getWaitTime(){
	//function that retrieves location's code*/
	getWaitPredictionAPI(returnWaitTime);
}

//gets wait time from Predictions API
function getWaitPredictionAPI(callback){
	let params = {
            "api_key": WMATA_KEY,
            // Request parameters
        };
     let settings = {
        url: `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${fromCode}?`
         + $.param(params),
        type: "GET",
        success: function(data){
        ////////	console.log("success!");
        	callback(data);
        },
   //     async: false
    };

    $.ajax(settings);
}

//Get Time of Wait 
function returnWaitTime(data){
////////	console.log("returnWaitTime");
	for(let i = 0; i < data.Trains.length; i++){
		//if(data.Trains[i].DestinationCode == destination){
			waitTime = data.Trains[i].Min;
	//	} 	
	}
////////	console.log("Wait time is  "+ waitTime)
	getDelayTime();	
}



///////// ::::: :: : : DELAY TIME CALCULATIONS : : :: :::::: /////////
//function that returns delay time
function getDelayTime(){
//////////	console.log('getDelayTime');
	$(".js-journey-form").submit(event => {
		const destination = $("#destination")
	})
	getDelayPredictionAPI(returnDelayTime); //placeholder
}
//gets API data from incidents API
function getDelayPredictionAPI(callback){
	const settings = {
		headers: { "api_key": WMATA_KEY},
		url: WMATA_DELAY_URL,
		success: callback,
	}
	$.ajax(settings)
}

//returns delay time as a number
function returnDelayTime(data){
////////	console.log("incident "+ data.Incidents[0]);
	for(let incident in data.Incidents){
		if(incident !== undefined){
			if(lineColor === incident.LinesAffected){
				delayTime = data.Incidents[0].PassengerDelay;
			}
		} else {
			delayTime = 0;
		}
	}
	getTripPredictionAPI(returnTripTime);
}

///////// ::::: :: : : TRIP TIME CALCULATIONS : : :: :::::: /////////
//function that returns length of trip
function getTripPredictionAPI(callback){
////////	console.log(`FromStationCode=${fromCode}&ToStationCode=${toCode}`);
	let query= `FromStationCode=${fromCode}&ToStationCode=${toCode}`;

	const settings = {	
		headers: { "api_key": WMATA_KEY },

		url: `https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo?${query}`,
		success: callback,
	//	async: false
	};
	$.ajax(settings);
}

//Return the Railtime of the first/only item in Station to Station Info
function returnTripTime(data){
////////	console.log("returnTripTime");
////////	console.log(data.StationToStationInfos[0].RailTime);
	tripTime =  data.StationToStationInfos[0].RailTime;
	direction = data.StationToStationInfos[0].RailTime;
	totalTime = parseInt(parseInt(tripTime)+parseInt(waitTime)+parseInt(delayTime));
////////	console.log("wait time: "+waitTime);
////////	console.log("trip time: "+tripTime);
////////	console.log("delay time: "+delayTime);

////////	console.log("total time is: "+totalTime);
	sessionStorage.totalTime = JSON.stringify(totalTime);

	sessionStorage.tripTime = JSON.stringify(tripTime);
	sessionStorage.waitTime = JSON.stringify(waitTime);
	sessionStorage.delayTime = JSON.stringify(delayTime);

	handleSpotify(desiredMood);
}

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////

										//	SPOTIFY METHODS  //

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////
function handleSpotify(desiredMood){
////////	console.log("handling...");
   //let playlistIDs = !!!	
	getSpotifyPlaylist(getPlaylistItems, desiredMood);
	
}

//calls playlist API
function getSpotifyPlaylist(callback, category){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url:  `https://api.spotify.com/v1/browse/categories/${category}/playlists`,
		success: callback,
		error: "Error getting playlist"
	//	async: false
	};
	$.ajax(settings)
}


//returns array of playlist id's
function getPlaylistItems(data){
	console.log("Loop is "+playlistLoop);	
	getPlaylistTracks(getTrackIDs, data.playlists.items[playlistLoop].id);
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

//Push and object with track ID's and track names to its own array
function getTrackIDs(data){
	TRACK_IDS = [];
	for(let i = 0; i < data.items.length; i++){
		TRACK_IDS.push({id: data.items[i].track.id, name: data.items[i].track.name});
	}	
//	console.log(TRACK_IDS[0]);

	parsePlaylists(data.items.length);
}
//take TRACK_IDS array an d


function parsePlaylists(limit){
//	for(let i = 0; i < limit; i++){ 
//		if(TRACK_IDS[i] !== undefined){
			filterTracks(parseKey, TRACK_IDS.id, TRACK_IDS.name); 
//		}
//	}
}

///////// ::::: :: : : PLAYLIST SORTING ALGORITHMS : : :: :::::: /////////
//get the Audio features from first tracks in list
function filterTracks(callback, trackID, trackName){
	//Spotify's https://api.spotify.com/v1/audio-features endpoint can take up to 100
	//comma-separated track ID's
	let stringOfTracks = [];
	TRACK_IDS.forEach(item => stringOfTracks.push(item.id));
	//console.log("String of Tracks "+stringOfTracks);

	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/audio-features/?ids=${stringOfTracks.toString()}`,
		success: function(data){
			callback(data, trackName);
		},
	}; 
	$.ajaxSetup({
   		cache: false
	});
	$.ajax(settings);
}

//Add song if key matches
function parseKey(data, trackName){
//	data.audio_features.forEach(item => console.log(item.id));

	//loop through array from multi-track audio features api
	for(let i = 0; i < data.audio_features.length; i++){
		//check if song is the same key
		if(data.audio_features[i].key === musicKey){
			//check if there's still time to be added to playlist
			if(playlistTime < parseInt(totalTime*60000+60000)){
				MASTER_TRACKLIST.push(data.audio_features[i]);
				MASTER_TRACKLIST[MASTER_TRACKLIST.length-1].name = TRACK_IDS[i].name;
				playlistTime += data.audio_features[i].duration_ms;	
			} else {
				sessionStorage.songs = JSON.stringify(MASTER_TRACKLIST); 
				//unbind and submit
			$("#js-journey-form").unbind().submit();
			}
		}	
	}
	playlistLoop+=1;
	getSpotifyPlaylist(getPlaylistItems, desiredMood);
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

//!!!
function sortByEnergy(a, b){
	return a - b;
}

//order songs by lowest energy to highest

///////// ::::: :: : : DOM RENDERING : : :: :::::: /////////
function renderPlaylist(songs){
	songs.forEach(item => {
//	////	console.log("rendering "+ item.name);

		let duration = convertTrackTime(item.duration_ms);
		$(".js-playlist").append(`
			<div class="js-playlist-entry">
				<p class="js-song-name">${item.name}</p>
				<p class="js-song-time">${duration}</p>
			</div>	
		`);
	});
}


function createPlaylist(callback, tracks){
	settings= {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
		type: "POST",
		"Content-Type": "application/json",
		name: "Test-Playlist",
		success: callback
	}
	$.ajax(settings);
}

function addTracksToPlaylist(){
	let tracksString = []
	trackString.append(tracks.forEach(item => `spotify:track:${item}`));
	settings= {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/users/${user_id}/playlists/Test-Playlist/tracks?uris=${tracksString.toString()}`,
		type: "POST",
		"Content-Type": "application/json"
		//description:
	//	q: tracksString.toString();
	}
	$.ajax(settings);
}

function openPlaylist(data){
	window.open(`http://open.spotify.com/track/${data.uri}`)
}

function convertTrackTime(trackDuration){
	return Math.floor(trackDuration/60000)+":"+Math.ceil(((trackDuration/60000) % 1)*60);
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
	$(".js-journey-form").submit(function(event){ 
		event.preventDefault();
		sessionStorage.clear();
		desiredMood = $(this).find("#mood").val(); 
		fromStation = $(this).find("#location").val();
		toStation = $(this).find("#destination").val();
		getStationCode(fromStation, toStation);
	////////	console.log("To station is "+ toStation + "::: From station is "+ fromStation)
	////////	console.log(fromStation);
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

function runApp(){
	addStationNames();
	addCategoryNames();
	handleSubmit();
}

$(runApp);


//get wait time properly
//Get total time properly
//Get Destination/line
//Fix Journey Details
//Fix
//Order the playlist

