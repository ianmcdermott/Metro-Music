const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
const SPOTIFY_CATEGORY_URL = "https://api.spotify.com/v1/browse/categories"
const AUTHORIZATION_CODE = "BQD00ug5rVXrlkIx653AaudEez3IZN7ihOyJPTKenTzyr4Nb2JGeVu4RMnexG7S017sxdj7t3vRKYzMKZX35SQ";
const WMATA_DELAY_URL = "https://api.wmata.com/Incidents.svc/json/Incidents";
const WMATA_STATIONS_URL = "https://api.wmata.com/Rail.svc/json/jStations";
const WMATA_STATION_TO_STATION_URL = "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo"

const WMATA_KEY = "13e8f78159294a85838f6215c2f4c1f0";
const WMATA_URL = "";

var client_id = '29c07facce49487e810599c1d0acc975'; // Your client id
var client_secret = '68c6d1e908974c128266cf2eeba29552'; // Your secret
var redirect_uri = 'https://www.getpostman.com/oauth2/callback'; // Your redi5rect uri

const TRACK_IDS = [];
const PLAYLIST = [];
//const TRACKS = [];
const MASTER_TRACKLIST = [];
let playlistTime = 0;
const playlistArray = [];

let waitTime;
let tripTime;
let delayTime = 0;
// 	====================================== * * * * * * WMATA API  * * * * * * ====================================== //
//Add station names to the loc/dest options

function calculateJourneyTime(fromStation, toStation){
	getWaitTime();
	getDelayTime();
	getTripTime(fromStation, toStation);
	console.log("waitTime: "+ waitTime +" \n tripTime:"+ tripTime +" \n delayTime: "+ delayTime);
	return parseInt(waitTime)+parseInt(tripTime)+parseInt(delayTime);
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
	let location;
	$(".js-journey-form").submit(event => {
		location = $("#location").val();
	});
	//function that retrieves location's code*/
	return getWaitPredictionAPI(returnWaitTime, "A01", "B11");
}

//gets wait time from Predictions API
function getWaitPredictionAPI(callback, currentLocation, destination){
	$.ajax({
		headers: { "api_key": WMATA_KEY},			
		url: `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${currentLocation}`,
		async: false,
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
		success: callback,
		async: false
	}
	$.ajax(settings)
}

//returns delay time as a number
function returnDelayTime(data, passengerLine){
	for(let incident in data.Incidents){
		if(passengerLine == incident.LinesAffected){
			return 0;//	data.Incidents[0].PassengerDelay;
		} else {
			return 0;
		}
	}
}

///////// ::::: :: : : TRIP TIME CALCULATIONS : : :: :::::: /////////
//function that returns length of trip
function getTripTime(fromStation, toStation){	
	getTripPredictionAPI(returnTripTime, fromStation, toStation);
}

function getTripPredictionAPI(callback, fromStation, toStation){
	const settings = {	
		headers: { "api_key": WMATA_KEY },
		url: "https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo",
		q: `FromStationCode=${fromStation}&ToStationCode=${toStation}`,
		success: callback,
		async: false
	};
	console.log(`from station is ${fromStation} to station is ${toStation}`);
	$.ajax(settings)
}

//Return the Railtime of the first/only item in Station to Station Info
function returnTripTime(data){
	tripTime =  data.StationToStationInfos[0].RailTime;
	direction = data.StationToStationInfos[0].RailTime;
}

//Get wait time based on destination
function processWaitTime(data, destination){
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
}

//Find 
function findDirection(){
	
}


//Function that gets the Authorization




//Function that returns client credentials authorization

//Render Media Player

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////

										//	SPOTIFY METHODS  //

//////////////////// ###### ###### ###### ###### ###### ###### ###### ###### ###### ////////////////////
function handleSpotify(desiredMood, totalTime){
	let playlistIDs = getPlaylists(desiredMood, totalTime);
	parsePlaylists();
}

//Takes user's selected category and gets the api data from the playlist
function getPlaylists(category, time){
	let playlistUrl = "https://api.spotify.com/v1/browse/categories/"+category+"/playlists";
	getSpotifyPlaylist(getPlaylistItems, playlistUrl);
	console.log(PLAYLIST);
	PLAYLIST.forEach(item => {
		getPlaylistTracks(getTrackIDs, item);
	});
}

function getPlaylistTracks(callback, playlistID){
	settings = {
		url: `https://api.spotify.com/v1/users/Spotify/playlists/${playlistID}/tracks`,
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		success: callback,
		async: false
	};
	$.ajax(settings);
}

function getTrackIDs(data){
	for(let i = 0; i < data.items.length; i++){
		TRACK_IDS.push(data.items[i].track.album.id);
	};
}
//calls playlist API
function getSpotifyPlaylist(callback, playlistUrl){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: playlistUrl,
		success: callback,
		async: false
	};
	$.ajax(settings)
}

//returns array of playlist id's
function getPlaylistItems(data){	
	for(let i = 0; i < data.playlists.items.length; i++){
		PLAYLIST.push(data.playlists.items[i].id);
	}
}

//Handle Spotify Track API
function getPlaylistEndpoint(callback, tracksArray){
	const settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `https://api.spotify.com/v1/users/spotify/playlists/${tracksArray}/tracks`,
		success: callback,
		async: false
	};
	$.ajax(settings);
}

//Return Array of songs
function getSongs(data){
	data.item.forEach(item => {
		MASTER_TRACKLIST.push(item.track.id)
	});
}

//take each playlist ID, put it into the get tracks API
function parsePlaylists(){
	const tracks = [];
	//TRACK_IDS.forEach(item =>{
	for(let i = 0; i< 10; i++){
		filterTracks(TRACK_IDS[i], i);
	
	};
}


///////// ::::: :: : : PLAYLIST SORTING ALGORITHMS : : :: :::::: /////////
//returns array of track IDs
function filterTracks(trackID, counter){
	//take the journey time and sort through songs until journey time is matched	
	//if(playlistTime < totalTime * 6000 + 6000){ 
	//while(count < 4){
		//Filter out songs that don't match the generated key
		if(counter < 9){
			getAudioFeaturesEndpoint(parseKey, trackID, 10);
	//	count++;
		}	else {
			getAudioFeaturesEndpoint(parseKey, trackID, 10);
			orderSongs();
			renderPlaylist();
	}
}
function getAudioFeaturesEndpoint(callback, trackID, key){
	settings = {
		headers: {'Authorization': "Bearer "+ AUTHORIZATION_CODE},
		url: `http://api.spotify.com/v1/audio-features/${trackID}`,
		success: function(data){
			callback(data, key);
		}
	}; 
	$.ajax(callback);
}

function parseKey(data, key){
	if(data.key === key){
		MASTER_TRACKLIST.push(data)
	}
	playlistTime+= data.duration_ms;
	playlistArray.push(data);
}

//order songs by lowest energy to highest
function orderSongs(){
	let reorder = [MASTER_TRACKLIST[0].energy];
	for(let i = 0; i < MASTER_TRACKLIST.length; i++){
		//if the next track from the master tracklist is greater than the current one in reorder, 
		//place as next item in reorder

		if(MASTER_TRACKLIST[i+1].energy >= reorder[i])
			reorder.append(MASTER)
		//else place before current item in reorder
		else {
			let item = reorder.pop(reorder.length);
			reorder.push(MASTER_TRACKLIST[i+1]);
			reorder.push(item);
		}
	}
	console.log(reorder);
}


///////// ::::: :: : : DOM RENDERING : : :: :::::: /////////
function renderPlaylist(){
	playlistArray.forEach(item =>{
		$(".js-playlist").append(`
			<div class="js-playlist-entry">
				<p class="js-song-name">item.id</p>
				<p class="js-song-time">${item.duration_ms/6000}</p>
			</div>	
		`);
	})
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
		let desiredMood = $(this).find("#mood").val(); 
		let fromStation = $(this).find("#location").val();
		let toStation = $(this).find("#destination").val();
		let totalTime = $(calculateJourneyTime(fromStation, toStation));
		handleSpotify(desiredMood, totalTime)
	})
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
