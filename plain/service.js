const baseUrl = 'https://api.tfl.gov.uk'
function extractTimeFromISODateString(s){
    return (new Date(s)).toTimeString().substr(0,8);
}
function extractArrivalInfo(arr){
     return arr.map(el=>{
        let {destinationName,lineName,expectedArrival,timestamp,timeToStation}=el;
        expectedArrival=extractTimeFromISODateString(expectedArrival);
        timestamp= extractTimeFromISODateString(timestamp);
        return {destinationName,lineName,expectedArrival,timestamp,timeToStation}
    });
}
function sortByArrivalTime(arr){
    return arr.sort( (a,b)=> a.timeToStation-b.timeToStation );
}
export default {
    async getStopID(smsCode) {
        let response=await fetch(baseUrl + '/StopPoint/Search?query=' + smsCode);
        let json=await response.json();
        if (json.total==0){
            console.log("No stops found");
            return null;
        } else {
            let {id,towards,name,stopLetter}=json.matches[0];
            return {id,towards,name,stopLetter}
        }
    },
    async getArrivailAtStopID(id){
        let response=await fetch(baseUrl + '/StopPoint/'+id+'/Arrivals');
        return await response.json();
    },
    async getStopInfo(id){
        let response=await fetch(baseUrl + '/StopPoint/'+id);
        return await response.json();
    },
    extractTimeFromISODateString,
    extractArrivalInfo,
    sortByArrivalTime,
}