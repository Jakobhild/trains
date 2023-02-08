import { useState, useEffect } from "react"

function TrainListing(props) {

    const getActuallTime = (activityObj) => {
      if(activityObj.TimeAtLocation){
        return activityObj.TimeAtLocation
      }else if(activityObj.PlannedEstimatedTimeAtLocationIsValid){
        return activityObj.PlannedEstimatedTimeAtLocation
      }else{
        return activityObj.AdvertisedTimeAtLocation
      }
    } 
  
  
    const timeFromString = (timeString) => {
      const time = new Date(Date.parse(timeString))
      return time
    }
  
    const [late, setLate] = useState(false)
    const [dotColor, setDotColor] = useState("yellow")
  
    const [depatureInfo, setDepartureInfo] = useState(false)
  
    const [lateDep, setLateDep] = useState(false)
  
    const advertisedTimeDep = new Date(Date.parse(props.depature.AdvertisedTimeAtLocation)) 
    const actuallTimeDep = new Date(Date.parse(getActuallTime(props.depature)))
  
    const advertisedTime = new Date(Date.parse(props.train.AdvertisedTimeAtLocation))
    const actuallTime = new Date(Date.parse(getActuallTime(props.train)))
  
    
    useEffect(() => {
      if(actuallTime - advertisedTime > 5 * 60 * 1000){
        setLate("Försenat");
      }
      if(actuallTime - advertisedTime > 60 * 60 * 1000){
        setDotColor("red")
      }
      if(props.train.Canceled){
        setLate(props.train.Deviation[0].Description)
        setDotColor("red")
      }
      if(actuallTimeDep - actuallTimeDep > 5 * 60 * 1000){
        setLateDep(true)
      }
      if(props.depature.TimeAtLocation){
        if(props.train.TimeAtLocation){
          setDepartureInfo("Har ankommit")
        }else{
          setDepartureInfo("Har avgått")
        }
      }
    }, [])
  
  
    
  
    return (
      <div className='train-listing' onClick={() => props.showTrainOverlay(props.train.AdvertisedTrainIdent, props.train.ScheduledDepartureDateTime)}>
         {/*Line one----------------------------------------------------------------------------------- */}
        <div style={{display: "flex", alignItems: "center"}}>
          <span>
            <span>{props.train.ProductInformation ? <>{props.train.ProductInformation[0].Description}</> : <>{props.train.InformationOwner}</>}</span>
            <span> ({props.train.AdvertisedTrainIdent})</span>
          </span>
          {late ? <span className='left-aligned'>{late}<span className={'status-dot ' + dotColor}></span></span> : <span className='left-aligned'>I tid<span className={'status-dot green'}></span></span>}
        </div>
        {/*Line two----------------------------------------------------------------------------------- */}
        <div style={{display: "flex", alignItems: "center"}}>
          <h1 style={{fontSize: "20px", margin: "0"}}>
            {lateDep ? <span>
              <span style={{textDecorationLine: "line-through", opacity: 0.5}}>{advertisedTimeDep.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </span> {actuallTimeDep.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span> : advertisedTimeDep.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            
            <span> &gt; </span>
            {late ? <span>
              <span style={{textDecorationLine: "line-through", opacity: 0.5}}>{advertisedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </span> {actuallTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span> : advertisedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
  
  
          </h1>
          
          <span className='left-aligned no-mobile'>
            <span> Från </span>
            {props.stations[props.stations.findIndex((station) => station.signature === props.train.FromLocation[0].LocationName)] && <>{props.stations[props.stations.findIndex((station) => station.signature === props.train.FromLocation[0].LocationName)].name}</>}
            <span> mot </span>
            {props.stations[props.stations.findIndex((station) => station.signature === props.train.ToLocation[0].LocationName)] && <>{props.stations[props.stations.findIndex((station) => station.signature === props.train.ToLocation[0].LocationName)].name}</>}
          </span>
          
        </div>
        {/*Line three----------------------------------------------------------------------------------- */}
        <div style={{display: "flex"}}>
          
        {props.train.ViaFromLocation ? 
        <span className='no-mobile'>
          <span style={{marginRight: "5px"}}>Via</span>
          {props.train.ViaFromLocation.map((viaStation) => 
          <span key={viaStation.Order}>
            {props.stations[props.stations.findIndex((station) => station.signature === viaStation.LocationName)] && <>{props.stations[props.stations.findIndex((station) => station.signature === viaStation.LocationName)].name}</>}
            {viaStation.Order < props.train.ViaFromLocation.length - 2 && <>, </>} 
            {viaStation.Order === props.train.ViaFromLocation.length - 2 && <> och </>}
          </span>)}
        </span> : <span>Direkt</span>
        }
          
  
          <span className='mobile-only'>
            <span> Från </span>
            {props.stations[props.stations.findIndex((station) => station.signature === props.train.FromLocation[0].LocationName)] && <>{props.stations[props.stations.findIndex((station) => station.signature === props.train.FromLocation[0].LocationName)].name}</>}
            <span> mot </span>
            {props.stations[props.stations.findIndex((station) => station.signature === props.train.ToLocation[0].LocationName)] && <>{props.stations[props.stations.findIndex((station) => station.signature === props.train.ToLocation[0].LocationName)].name}</>}
          </span>
        </div>
      </div>
    );
  }

  export default TrainListing