"use strict";

// Initialise manual input fields with cursor
let timeInput;
let distanceInput;
let paceDisplay;
let timeCursor;
let distanceCursor;
let selectedField;
let content;

// Initialise Start button for live distance/pace calculation
let startStopButton;
let liveDistance;
let livePace;

// Initialise Incline paragraph
let inclineParagraph;

// MANUAL ENTRY FUNCTIONS //
const buttonClickHandler = function (evt) {
  const buttonValue = evt.target.innerText;

  if (selectedField === "time") {
    if (buttonValue === "C") {
      timeInput.innerText = "0";
    } else if (buttonValue === "←") {
      if (timeInput.innerText.length > 2) {
        timeInput.innerText = timeInput.innerText.slice(0, -1);
      } else {
        timeInput.innerText = "0";
      }
    } else {
      if (timeInput.innerText.length === 1 && timeInput.innerText === "0") {
        timeInput.innerText = "";
      }
      if (timeInput.innerText.length < 3) {
        timeInput.innerText += buttonValue;
      }
    }
    localStorage.setItem(selectedField, timeInput.innerText);
  } else if (selectedField === "distance") {
    if (buttonValue === "C") {
      distanceInput.innerText = "0";
    } else if (buttonValue === "←") {
      if (distanceInput.innerText.length > 2) {
        distanceInput.innerText = distanceInput.innerText.slice(0, -1);
      } else {
        distanceInput.innerText = "0";
      }
    } else {
      if (
        distanceInput.innerText.length === 1 &&
        distanceInput.innerText === "0"
      ) {
        distanceInput.innerText = "";
      }
      if (distanceInput.innerText.length < 5) {
        distanceInput.innerText += buttonValue;
      }
    }
    localStorage.setItem(selectedField, distanceInput.innerText);
  }
};
// END OF MANUAL ENTRY FUNCTIONS //

// LIVE DISTANCE AND PACE FUNCTIONS //

// Options for the GPS watcher

let options;

options = {
  enableHighAccuracy: true,
  timeout: 100000,
  maximumAge: 0,
};

let previousCoordinate;
let previousTimestamp;
let previousDistance;
let distance = 0;
let paceCalculation;
let watchID;

function haversign(coords1, coords2) {
  let radius = 6371;
  let toRad = function (number) {
    return (number * Math.PI) / 180;
  };

  let latitudeDistance = toRad(coords2.latitude - coords1.latitude);
  let longitudeDistance = toRad(coords2.longitude - coords1.longitude);
  let a =
    Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2) +
    Math.cos(toRad(coords1.latitude)) *
      Math.cos(toRad(coords2.latitude)) *
      Math.sin(longitudeDistance / 2) *
      Math.sin(longitudeDistance / 2);

  return radius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function error(error) {
  alert("GPS ERROR: " + error.code);
}
//
function newPosition(position) {
  if (previousCoordinate) {
    distance = haversign(previousCoordinate, position.coords);

    liveDistance.innerText =
      "Live Distance: " + Math.floor(1000 * distance) + " m";
    paceCalculation = Math.abs(
      Math.round(
        (position.timestamp - previousTimestamp) /
          1000 /
          60 /
          (distance - previousDistance)
      )
    );
    console.log(paceCalculation);
    livePace.innerText =
      "Live Pace: " +
      (paceCalculation < Infinity
        ? paceCalculation + " mins/km"
        : "0" + " mins/km");

    previousCoordinate = position.coords;
    previousTimestamp = position.timestamp;
    previousDistance = distance;
  } else {
    previousTimestamp = position.timestamp;
    previousDistance = 0;
    previousCoordinate = position.coords;
  }
}

function startGPS() {
  if ("geolocation" in navigator) {
    watchID = navigator.geolocation.watchPosition(newPosition, error, options);
  } else {
    alert("Your device does not support Geolocation");
  }
}

function stopGPS() {
  navigator.geolocation.clearWatch(watchID);
  distance = 0;
  paceCalculation = 0;
}

const startStopHandler = function () {
  if (startStopButton.innerText === "Start Live Tracking") {
    // Button active
    startStopButton.classList.remove("startStopBackgroundGreen");
    startStopButton.classList.add("startStopBackgroundRed");
    startStopButton.innerText = "Stop Live Tracking";
    liveDistance.style.display = "block";
    livePace.style.display = "block";

    // Add margin to the top of content
    //content.style.marginTop = "5vh";
    // Start GPS tracking
    startGPS();
  } else {
    // Button inactive
    content.style.marginTop = "0";
    startStopButton.classList.remove("startStopBackgroundRed");
    startStopButton.classList.add("startStopBackgroundGreen");
    startStopButton.innerText = "Start Live Tracking";
    liveDistance.style.display = "none";
    livePace.style.display = "none";

    // Stop GPS tracking
    stopGPS();
  }
};
// END OF LIVE DISTANCE AND PACE FUNCTIONS

// INCLINE FUNCTIONS //

function orientationChangeHandler(event) {
  // Set the orientation variables
  let inclineAngle = event.beta;
  let inclineAngleRounded = Math.round(inclineAngle);

  // Max incline at -45 or +45 degrees
  const minIncline = -45;
  const maxIncline = 45;
  if (inclineAngle > maxIncline || inclineAngle < minIncline) {
    inclineParagraph.innerText = `◬ Lay flat on ground ◬`;
  } else {
    const inclineAngleRadians = (inclineAngle * Math.PI) / 180;
    const tanElevationAngle = Math.tan(inclineAngleRadians);
    const inclinePercentage = Math.round(tanElevationAngle * 100);

    const upOrDown = inclineAngle > 0 ? "uphill" : "downhill";
    inclineParagraph.innerText = `◬ Incline: ${inclinePercentage}% ${upOrDown} (${inclineAngleRounded}°) ◬`;
  }
}

// END OF INCLINE FUNCTIONS //

// Initialise page display and handlers on page load
const init = function () {
  content = document.getElementById("content");
  startStopButton = document.getElementById("startStop");
  liveDistance = document.getElementById("liveDistance");
  livePace = document.getElementById("livePace");
  inclineParagraph = document.getElementById("inclineParagraph");

  timeInput = document.getElementById("timeInput");
  timeInput.innerText = "0";

  timeCursor = document.getElementById("timeCursor");
  timeCursor.style.display = "inline";

  distanceInput = document.getElementById("distanceInput");
  distanceInput.innerText = "0";
  distanceCursor = document.getElementById("distanceCursor");

  // Set active field to time
  selectedField = "time";
  timeCursor.style.display = "inline";
  distanceCursor.style.display = "none";

  paceDisplay = document.getElementById("paceDisplay");
  paceDisplay.innerText = "--";

  if (localStorage.getItem("time") !== null) {
    timeInput.innerText = localStorage.getItem("time");
  }
  if (localStorage.getItem("distance") !== null) {
    distanceInput.innerText = localStorage.getItem("distance");
  }

  document.getElementById("b0").addEventListener("click", buttonClickHandler);
  document.getElementById("b1").addEventListener("click", buttonClickHandler);
  document.getElementById("b2").addEventListener("click", buttonClickHandler);
  document.getElementById("b3").addEventListener("click", buttonClickHandler);
  document.getElementById("b4").addEventListener("click", buttonClickHandler);
  document.getElementById("b5").addEventListener("click", buttonClickHandler);
  document.getElementById("b6").addEventListener("click", buttonClickHandler);
  document.getElementById("b7").addEventListener("click", buttonClickHandler);
  document.getElementById("b8").addEventListener("click", buttonClickHandler);
  document.getElementById("b9").addEventListener("click", buttonClickHandler);
  document.getElementById("bC").addEventListener("click", buttonClickHandler);
  document.getElementById("bB").addEventListener("click", buttonClickHandler);

  timeInput.addEventListener("click", () => {
    selectedField = "time";
    timeCursor.style.display = "inline";
    distanceCursor.style.display = "none";
  });
  distanceInput.addEventListener("click", () => {
    selectedField = "distance";
    timeCursor.style.display = "none";
    distanceCursor.style.display = "inline";
  });

  // Calculates manual entry every 0.1 seconds
  setInterval(() => {
    if (timeInput.innerText >= 5 && distanceInput.innerText >= 10) {
      let time = timeInput.innerText;
      let manualDistance = distanceInput.innerText;
      paceDisplay.innerText =
        Math.floor(time / (manualDistance / 1000)).toString() + " mins/km";
    } else {
      paceDisplay.innerText = "--";
    }
  }, 100);

  // StartStop button event listener
  startStopButton.addEventListener("click", startStopHandler);

  // Orientation event listener
  inclineParagraph.addEventListener("click", () => {
    window.addEventListener("deviceorientation", orientationChangeHandler);
    // Remove the handler after 30 seconds
    setTimeout(function () {
      window.removeEventListener("deviceorientation", orientationChangeHandler);
      inclineParagraph.innerText = "◬ Tap to show incline ◬";
    }, 30000);
  });
};

window.addEventListener("pageshow", init);
