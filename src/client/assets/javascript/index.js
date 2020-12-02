// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE
// ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-osx
// The store will hold all information needed globally
let store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
}


// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  onPageLoad()
  setupClickHandlers()
})

async function onPageLoad() {
  try {
    getTracks()
      .then(tracks => {
        const html = renderTrackCards(tracks)
        renderAt('#tracks', html)
      })

    getRacers()
      .then((racers) => {
        const html = renderRacerCars(racers)
        renderAt('#racers', html)
      })
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message)
    console.error(error)
  }
}

function setupClickHandlers() {
  document.addEventListener('click', function(event) {
    const {
      target
    } = event

    // Race track form field
    if (target.matches('.card.track')) {
      handleSelectTrack(target)
    }

    // Podracer form field
    if (target.matches('.card.podracer')) {
      handleSelectPodRacer(target)
    }

    // Submit create race form
    if (target.matches('#submit-create-race')) {
      event.preventDefault()

      // start race
      handleCreateRace()
    }

    // Handle acceleration click
    if (target.matches('#gas-peddle')) {
      handleAccelerate(target)
    }

  }, false)
}

async function delay(ms) {
  try {
    return await new Promise(resolve => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here")
    console.log(error)
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  // const race = TODO - invoke the API call to create the race, then save the result
  try {
    // render starting UI
    // const trackName = `Track ${store.track_id}`
    // TODO - Get player_id and track_id from the store
    const {track_id, player_id} = store;
    if(!track_id || !player_id){
      alert("Please select tract and racer to start the race!");
      return;
    }
    const race = await createRace(player_id, track_id);
    renderAt('#race', renderRaceStartView(race.Track, race.Cars))
    // TODO - update the store with the race id

    store.race_id = race.ID - 1;
    console.log("store.race_id", race.ID - 1)
    // The race has been created, now start the countdown
    // TODO - call the async function runCountdown
    await runCountdown()
    // TODO - call the async function startRace
    await startRace(store.race_id)
    // TODO - call the async function runRace
    await runRace(store.race_id)
  } catch (e) {
    console.log("problem with handleCreateRace()", e.message);
  }
}

function runRace(raceID) {
  return new Promise(resolve => {
    // TODO - use Javascript's built in setInterval method to get race info every 500ms
    const raceInterval = setInterval(() => {
      getRace(raceID)
        .then(result => {
          console.log(result);
          if (result.status === "in-progress") {
            renderAt('#leaderBoard', raceProgress(result.positions))
          } else if (result.status === "finished") {
            clearInterval(raceInterval) // to stop the interval from repeating
            renderAt('#race', resultsView(result.positions)) // to render the results view
            reslove(result) // resolve the promise
          }
        }).catch(err => console.log(err))

    }, 500);
  }).catch(error =>
    console.log("Problem with runRace::", error)) // remember to add error handling for the Promise
  }
    /*
    	TODO - if the race info status property is "in-progress", update the leaderboard by calling:

    	renderAt('#leaderBoard', raceProgress(res.positions))
    */

    /*
    	TODO - if the race info status property is "finished", run the following:

    	clearInterval(raceInterval) // to stop the interval from repeating
    	renderAt('#race', resultsView(res.positions)) // to render the results view
    	reslove(res) // resolve the promise
    */


async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000)
    let timer = 3
    return new Promise(resolve => {
      // TODO - use Javascript's built in setInterval method to count down once per second
      const runInterval = setInterval(() => {
        // run this DOM manipulation to decrement the countdown for the user
        document.getElementById('big-numbers').innerHTML = --timer
        // TODO - if the countdown is done, clear the interval, resolve the promise, and return
        if (timer === 0) {
          clearInterval(runInterval);
          resolve();
        }
      }, 1000);
    });
  } catch (error) {
    console.log("There is an erro on runCountdown", error);
  }
}

function handleSelectPodRacer(target) {
  console.log("selected a pod", target.id)

  // remove class selected from all racer options
  const selected = document.querySelector('#racers .selected')
  if (selected) {
    selected.classList.remove('selected')
  }

  // add class selected to current target
  target.classList.add('selected')

  // TODO - save the selected racer to the store

  store.player_id = parseInt(target.id)
}

function handleSelectTrack(target) {
  console.log("selected a track", target.id)

  // remove class selected from all track options
  const selected = document.querySelector('#tracks .selected')
  if (selected) {
    selected.classList.remove('selected')
  }

  // add class selected to current target
  target.classList.add('selected')

  // TODO - save the selected track id to the store
  store.track_id = parseInt(target.id)
}

async function handleAccelerate() {
  try{  console.log("accelerate button clicked")
    // TODO - Invoke the API call to accelerate
	       await accelerate(store.race_id)
       }catch (error) {
         console.error(error)
      }
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`
  }

  const results = racers.map(renderRacerCard).join('')

  return `
		<ul id="racers">
			${results}
		</ul>
	`
}

// function renderRacerCard(racer) {
//   const {
//     id,
//     driver_name,
//     top_speed,
//     acceleration,
//     handling
//   } = racer
//
//   return `
// 		<li class="card podracer" id="${id}">
// 			<h3>${driver_name}</h3>
// 			<p>${top_speed}</p>
// 			<p>${acceleration}</p>
// 			<p>${handling}</p>
// 		</li>
// 	`
// }

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`
  }

  const results = tracks.map(renderTrackCard).join('')

  return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

// function renderTrackCard(track) {
//   const {
//     id,
//     name
//   } = track
//
//   return `
// 		<li id="${id}" class="card track">
// 			<h3>${name}</h3>
// 		</li>
// 	`
// }

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
  const raceTracks = positions.map((r) => {
    // There are 201 segments in the race and kept track length as 25vh
    const completion = r.segment/201;
    // function youColor(positions){
    //   document.getElementById("youcolor").style.color = 'blue'
    // }
      if (r.id === store.player_id){
    return`
    <div class="racetrack">
      <div class="race-car style="bottom:${completion * 25}vh">
      <img>
      </div>
      <div class="racer-name">
        <div id="youcolor">
        ${customRacerName[r.driver_name]}

        </div>
        <div>${Math.round(completion * 100)}%</div>
      </div>
    </div>
    `
  }
  return`
  <div class="racetrack">
    <div class="race-car style="bottom:${completion * 25}vh">
    <img>
    </div>
    <div class="racer-name">
      <div>
      ${customRacerName[r.driver_name]}
      </div>
      <div>${Math.round(completion * 100)}%</div>
    </div>
  </div>
  `
  }).join('');







  const racers = positions.map(p => p.driver_name);
  let userPlayer = positions.find(e => e.id === parseInt(store.player_id))
  console.log("userPlayer::::::", userPlayer);



  positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
  let count = 1

  const results = positions.map(p => {
    if (p.id === store.player_id){
    return `
        <td>
          <h3>${count++} - ${customRacerName[p.driver_name]}(you)</h3>
        </td>  
        `
    }
    return `
      <tr>
				<td>
					<h3>${count++} - ${customRacerName[p.driver_name]}</h3>
				</td>

			</tr>
		`
  }).join("")






  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard" class="leaderBoard">
      <div class="progress-section">
              ${results}
            </div>
            <div class="progress-racetracks">
              ${raceTracks}
            </div>
          </section>
        </main>
	`

}

function renderAt(element, html) {
  const node = document.querySelector(element)

  node.innerHTML = html
}

// ^ Provided code ^ do not remove
// add players
const customRacerName = {
  "Racer 1": "Bazzi",
  "Racer 2": "Diz",
  "Racer 3": "Erini",
  "Racer 4": "Lodumani",
  "Racer 5": "Mos",
}
function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer
  return `
    <li class="card podracer" id="${id}">
      <h3>${customRacerName[driver_name]}</h3>
      <p>${`Top Speed: ${top_speed}`}</p>
      <p>${`Acceleration: ${acceleration}`}</p>
      <p>${`Handling: ${handling}`}</p>
    </li>
  `
}

//add tracks
const customTrackName = {
  "Track 1": "Seoul",
  "Track 2": "Tokyo",
  "Track 3": "Barcelona",
  "Track 4": "Paris",
  "Track 5": "NYC",
  "Track 6": "Seattle",
}

function renderTrackCard(track){
  const{id, name} = track
  return `
    <li id="${id}" class="card track">
      <h3>${customTrackName[name]}</h3>
    </li>
  `
}

// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
  return {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': SERVER,
    },
  }
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

function getTracks() {
  defaultFetchOpts()
  // GET request to `${SERVER}/api/tracks`
  return fetch(`${SERVER}/api/tracks`)
    .then(response => response.json())
    .catch(error => console.log("Problem with getTracks()::",error))
}

function getRacers() {
  defaultFetchOpts()
  // GET request to `${SERVER}/api/cars`
  return fetch(`${SERVER}/api/cars`)
    .then(response => response.json())
    .catch(error => console.log("Problem with getRacers()::",error))
}

function createRace(player_id, track_id) {
  // player_id = player_id
  // track_id = track_id
  const body = {player_id, track_id }

  return fetch(`${SERVER}/api/races`, {
      method: 'POST',
      ...defaultFetchOpts(),
      dataType: 'jsonp',
      body: JSON.stringify(body)
    })
    .then(res => res.json())
    .catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
  defaultFetchOpts()
  // GET request to `${SERVER}/api/races/${id}`
  return fetch(`${SERVER}/api/races/${id}`)
    .then(res => res.json())
    // .then(response => console.log(response))
    .catch(error => console.log("Problem with getRace()::",error))
}

function startRace(id) {
  return fetch(`${SERVER}/api/races/${id}/start`, {
      method: 'POST',
      ...defaultFetchOpts(),
    })
    // .then(res => res.json())
    .catch(err => console.log("Problem with startRace() request::", err))
}

//track cars completion
// const player = positions.find(p =>
//       p.driver_name.includes(playerName));
// const completion = player.segment/201;
//completionPercentage = completion * 100


function accelerate(id) {
  // POST request to `${SERVER}/api/races/${id}/accelerate`
  // options parameter provided as defaultFetchOpts
  // no body or datatype needed for this request

  //const postData
  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
      method: 'POST',
      ...defaultFetchOpts(),
    })
    .then(res => res.json())
    .catch(err => console.log("Problem with accelerate request::", err))
}
