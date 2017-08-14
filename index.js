const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
const SPOTIFY_CATEGORY_URL = "https://api.spotify.com/v1/browse/categories"
const AUTHORIZATION_CODE = "BQAxKrY4wfHMbOyXRoIKAq4lNTEHriggRid-eTPzbn4wazyDc_WiU-M3vnAmldcDOVoBDwALHgYY0SihS9MWKw";

const WMATA_DELAY_URL = "https://api.wmata.com/Incidents.svc/json/Incidents";
const WMATA_STATIONS_URL = "https://api.wmata.com/Rail.svc/json/jStations";
const WMATA_STATION_TO_STATION_URL = "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo"

const WMATA_KEY = "13e8f78159294a85838f6215c2f4c1f0";
const WMATA_URL = "";

var client_id = '29c07facce49487e810599c1d0acc975'; // Your client id
var client_secret = '68c6d1e908974c128266cf2eeba29552'; // Your secret
var redirect_uri = 'https://www.getpostman.com/oauth2/callback'; // Your redi5rect uri

let waitTime = 0;
let tripTime = 0;
let delayTime = 0;
// 	====================================== * * * * * * WMATA API  * * * * * * ====================================== //
//Add station names to the loc/dest options

function calculateJourneyTime(fromStation, toStation){
	getWaitTime()+getDelayTime()+getTripTime(fromStation, toStation)
	console.log("Total Time is: " + waitTime+tripTime+delayTime);
	return waitTime+tripTime+delayTime;
}

function returnStationCode(){

}

//Adds Statino Names to the Loc/Dest Menus
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
	/*let location;
	$(".js-journey-form").submit(event => {
		location = $("#location").val();
	});
	//function that retrieves location's code*/
	getWaitPredictionAPI(returnWaitTime, "A01", "B11");
	console.log("wait time is " + waitTime);
}

//gets wait time from Predictions API
function getWaitPredictionAPI(callback, currentLocation, destination){
	$.ajax({
		headers: { "api_key": WMATA_KEY},			
		url: `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${currentLocation}`,
		success: function(data){
			callback(data, currentLocation, destination);
		}
	
	});
	console.log("Wait time ajax ran");
}

//returns wait time as a number
function returnWaitTime(data, location, destination){
	for(let i = 0; i < data.Trains.length; i++){
		if(data.Trains[i].DestinationCode == destination){
			waitTime = data.Trains[i].Min;
		} 	
	}	
	console.log("wait time is " + waitTime);
}


///////// ::::: :: : : DELAY TIME CALCULATIONS : : :: :::::: /////////
//function that returns delay time
function getDelayTime(){
	$(".js-journey-form").submit(event => {
		const destination = $("#destination")
	})
	return getDelayPredictionAPI(returnDelayTime("GR"));
}
//gets API data from incidents API
function getDelayPredictionAPI(callback, passengerLine){
	const settings = {
		headers: { "api_key": WMATA_KEY},
		url: WMATA_DELAY_URL,
		success: callback	
	}
	$.ajax(settings)
}

//returns delay time as a number
function returnDelayTime(data, passengerLine){
	for(let incident in data.Incidents){
		if(passengerLine == incident.LinesAffected){
		//	return	data.Incidents[0].PassengerDelay;
		} else {
			return 0;
		}
	}
}

///////// ::::: :: : : TRIP TIME CALCULATIONS : : :: :::::: /////////
//function that returns length of trip
function getTripTime(fromStation, toStation){	
	return getTripPredictionAPI(returnTripTime, fromStation, toStation);
}

function getTripPredictionAPI(callback, fromStation, toStation){
	const settings = {	
		headers: { "api_key": WMATA_KEY },
		url: "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo",
		q: `FromStationCode=${fromStation}&ToStationCode=${toStation}`,
		success: callback
	};
	$.ajax(settings)
}

//Return the Railtime of the first/only item in Station to Station Info
function returnTripTime(data){
	tripTime =  data.StationToStationInfos[0].RailTime;
}
//Get wait time based on destination
function processWaitTime(data, destination){
	for(let i = 0; i < data.Trains.lengh; i++){
		if(data.Trains.Desination = destination){
			if(data.Trains.Min !== "") tripTime = data.Trains.Min;
			else return 0;			
			break;
		}else {
			return null;
		}
	}
}

//currentLocation = $("#location").val();


//gets necessary data from Spotify API
/*function getDataFromSpotifyAPI(callback){
	query{
		client: “ID”,
		response_type: “code”,
		redirect_uri: “”,
		state: “”,
	}
	$.getJSON(SPOTIFY_URL, query, callback);
}
*/
//gets necessary data from WMATA API

//Function that gets the Authorization

//Gets Category Data from Spotify API
function getSpotifyCategory(callback){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: SPOTIFY_CATEGORY_URL,
		success: callback
	};
	$.ajax(settings)
}

function getSpotifyPlaylist(playlistUrl, callback){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: playlistUrl,
		success: getPlaylistItems
	};
	$.ajax(settings)
}

//Function that returns client credentials authorization

//Render Media Player

//Add category names to the mood options
function addCategoryNames(){
	let categories = titleCase(getSpotifyCategory(getCategoryID));
	$(clearSelectionBoxes);
}

//Function That retrieves wait time from WMATA API

//gets playlist API based on categories

function getCategoryID(data){
	const category =  data.categories.items.map((item, index) => item.id);
	category.sort();
	for(let i=0; i < category.length; i++){
		$("#mood").append(`<option>${category[i]}</option>`);
	}
}



function getPlaylistItems(data){
	const playlist =  data.playlists.items;
	return playlist;

}

//Function listens for submit button, runs getplaylist functions
function handleSubmit(){
	$(".js-journey-form").submit(event => { 
		event.preventDefault();
		let desiredMood = $(this).find("#mood").val(); 
		let fromStation = $(this).find("#location").val();
		let toStation = $(this).find("#destination").val();
		$(calculateJourneyTime);
		getPlaylists(desiredMood);
		calculateJourneyTime(fromStation, toStation)
	})
}

//Takes user's selected category and gets the api data from the playlist
function getPlaylists(category){
	let playlistUrl = "https://api.spotify.com/v1/browse/categories/"+category+"/playlists";
	let plist = getSpotifyPlaylist(playlistUrl);
	for(let i = 0; i < plist.length; i++){
		getPlaylistTracks(plist[i].href);
	}
}
//Gather the tempo, time signature, track uri for each song as you collect them
function getPlaylistTracks(tracksArray){
	let playlistKey =  Math.floor(Math.random(12));
	getPlaylistEndpoint(getSongs, playlistKey);

}
//Handle Spotify Track API
function getPlaylistEndpoint(callback, key){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/users/spotify/playlists/${playlistID}/tracks`,
		success: function(data){
			callback(data, key);
		}
	};
	$.ajax(settings);
}

//Return Array of songs
function getSongs(data, key){
	for(let item in data){
		let trackIDs = data[i].items.track.id;
	}

	//put key into a function that parses for that key
}

function parseKey(){
	settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/audio-features/${track}`,
		success: callback
	}; 
	$.ajax(callback)
}

function orderSongs(){

}

function handleSongs(){

}

function clearSelectionBoxes(){
	$("#mood").attr("selectedIndex", -1);
	$("#location").attr("selectedIndex", -1);
	$("#destination").attr("selectedIndex", -1);
}

function convertToSeconds(milliseconds){
	return milliseconds/1000;
}

function titleCase(str) {

}
//take total time and add songs until they equal it in duration

//search through each playlist finding a random key from an array ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

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
