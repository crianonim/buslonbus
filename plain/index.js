import Service from './service.js';

Service.getStopID(53510).then(
    (res)=>{
        let id=res.id
        console.log(res);
        Service.getStopInfo(id).then(console.log)
        Service.getArrivailAtStopID(id).then(
            (arr)=>{
                let processed=Service.sortByArrivalTime( 
                    Service.extractArrivalInfo(arr)
                )
            
                // processed.forEach(el=>console.log(JSON.stringify(el,null,2)))
                processed.forEach(el=>{
                    console.log(`${el.expectedArrival} ${el.lineName} ${el.destinationName}`);
                });
                renderResults(res,arr)
            })
    }
)
function renderResults(stopInfo,arrivals){
    let s="<div class='results'>";
    s+="<div class='stop-info'>";
    s+=`<div><span class='letter'>${stopInfo.stopLetter}</span>
        <span class='stop-name'>${stopInfo.name}</span> towards ${stopInfo.towards} 
        </div>`

    s+="</div>";
    s+="</div>"; // results
    document.getElementById('app').innerHTML=s;
}