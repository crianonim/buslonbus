const baseUrl = "https://api.tfl.gov.uk";
function extractTimeFromISODateString(s) {
  return new Date(s).toTimeString().substr(0, 8);
}
function extractArrivalInfo(arr) {
  return arr.map(el => {
    const {
      destinationName,
      lineName,
      expectedArrival,
      timestamp,
      timeToStation
    } = el;
    expectedArrival = extractTimeFromISODateString(expectedArrival);
    timestamp = extractTimeFromISODateString(timestamp);
    return {
      destinationName,
      lineName,
      expectedArrival,
      timestamp,
      timeToStation
    };
  });
}
function sortByArrivalTime(arr) {
  return arr.sort((a, b) => a.timeToStation - b.timeToStation);
}


const stopLetterCorrected = (stopLetter) => (stopLetter || "-").replace("->", "");
function secondsToTime(s) {
  if (s < 0) return "due";
  const mins = (s / 60) >> 0;
  const secs = s - mins * 60;

  return (mins + "").padStart(2, "0") + ":" + (secs + "").padStart(2, "0");
}
function timeDifference(start, end) {
  return ((new Date(end) - new Date(start)) / 1000) >> 0;
}

async function getStopsWithinRadius(r = 200) {
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(async pos => {
      const { coords } = pos;
      console.log(coords);
      const lat = coords.latitude;
      const lon = coords.longitude;
      const response = await fetch(
        `${baseUrl}/StopPoint?stopTypes=NaptanPublicBusCoachTram&radius=${r}&lat=${lat}&lon=${lon}`
      );
      const json = await response.json();
      console.log(json.stopPoints.length);
      const stops = json.stopPoints.map(stop => {
        const lines = stop.lines.map(el => el.name);
        let towards = stop.additionalProperties.find(el => el.key == "Towards");
        if (towards) {
          towards = towards.value;
        }
        const stopInfo = {
          stopLetter: stopLetterCorrected( stop.stopLetter),
          lines,
          id: stop.id,
          name: stop.commonName,
          distance: stop.distance,
          towards
        };
        return stopInfo;
      });
      resolve(stops);
    });
  });
}
async function getStopID(smsCode) {
  const response = await fetch(`${baseUrl}/StopPoint/Search?query=${smsCode}`);
  const json = await response.json();
  if (json.total == 0) {
    console.log("No stops found");
    throw new Error("No stop found");
  } else {
    console.log(json);
    let { id, towards, name, stopLetter, lines } = json.matches[0];
    lines = lines.map(el => el.name);
    return { id, towards, name, stopLetter:stopLetterCorrected(stopLetter), lines };
  }
}
export default {
  getStopID,
  async getArrivailAtStopID(id) {
    const response = await fetch(`${baseUrl}/StopPoint/${id}/Arrivals`);
    return await response.json();
  },
  //not working
  async getStopInfo(id) {
    const response = await fetch(baseUrl + "/StopPoint/" + id);
    const json = await response.json();
    return getStopID(json.smsCode);
  },
  extractTimeFromISODateString,
  extractArrivalInfo,
  sortByArrivalTime,
  secondsToTime,
  timeDifference,
  getStopsWithinRadius
};
