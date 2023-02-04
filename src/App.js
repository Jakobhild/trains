import logo from './logo.svg';
import sidebarBtn from './sidebar-btn.png';
import './App.css';
import { useEffect, useReducer, useState } from 'react';
import Overlay from './Overlay.js';
import { getTrains, getStations, getTrainById } from './utils';
import Sidebar from './Sidebar';

function App() {
  const [trains, setTrains] = useState([])
  const [apiLoaded, setApiLoaded] = useState(true)

  const [type, setType] = useState(2)
  const [dayOfset, setDayOfset] = useState(0)
  const [stationsSignature, setStationsSignature] = useState([])
  const [stations, setStations] = useState([])
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayTrainIdent, setOverlayTrainIdent] = useState("")
  const [overlayTrainDepDate, setOverlayTrainDepDate] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [fromTo, setFromTo] = useState(["Cst", "Ör"])
  const [fromToNames, setFromToNames] = useState(["Stockholm C", "Örebro C"])

  const tabIndicatorLocations = ["left", "center", "right"]

  useEffect(() => {
    setApiLoaded(false)
    getTrains(type, dayOfset, fromTo[0], fromTo[1]).then((data) => {
      setTrains(data);
      setApiLoaded(true)
      let stationsArr = []
      if(data){
        data.map((train) => {
          if(!stationsArr.includes(train.ankomst.FromLocation[0].LocationName)){
            stationsArr.push(train.ankomst.FromLocation[0].LocationName)
          }
          if(!stationsArr.includes(train.ankomst.ToLocation[0].LocationName)){
            stationsArr.push(train.ankomst.ToLocation[0].LocationName)
          }
          if(train.ankomst.ViaFromLocation){
            train.ankomst.ViaFromLocation.map((location) => {
              if(!stationsArr.includes(location.LocationName)){
                stationsArr.push(location.LocationName)
              }
            }) 
          }
        })
      }
      if(!stationsArr.includes(fromTo[0])){
        stationsArr.push(fromTo[0])
      }
      if(!stationsArr.includes(fromTo[1])){
        stationsArr.push(fromTo[1])
      }
      setStationsSignature(stationsArr)
    })
  }, [type, dayOfset, fromTo])

  useEffect(() => {
    getStations(stationsSignature)
    .then(data => {
      setStations(data)
    })
  }, [stationsSignature])
  
  const showTrainOverlay = (trainIdent, depDate) => {
    setShowOverlay(true)
    setOverlayTrainIdent(trainIdent)
    setOverlayTrainDepDate(depDate)
  }


  return (
    <div className="App">
      <img src={sidebarBtn} className='sidebar-button' onClick={() => setShowSidebar(true)}></img>
      {showOverlay && <>
      <Overlay trainIdent={overlayTrainIdent} closeFunc={() => setShowOverlay(false)} date={overlayTrainDepDate}/>
      </>}
      {showSidebar && <>
        <Sidebar closeFunc={() => setShowSidebar(false)} setFromTo={(fromTo) => setFromTo(fromTo)} setFromToNames={(fromToNames) => setFromToNames(fromToNames)} />
      </>}
      
      <h1>Tåg:</h1>
      <div className='menu'>
        <div>
          <div className='tabs'>
            <button className={dayOfset === -1 ? 'time-tab selected' : 'time-tab'} onClick={() => setDayOfset(-1)}>Igår</button>
            <button className={dayOfset === 0 ? 'time-tab selected' : 'time-tab'} onClick={() => setDayOfset(0)}>Idag</button>
            <button className={dayOfset === 1 ? 'time-tab selected' : 'time-tab'} onClick={() => setDayOfset(1)}>Imorgon</button>
          </div>
          <div className={'tab-indicator time-tab-indicator time-' + tabIndicatorLocations[dayOfset+1]}></div>
        </div>
      </div>
      <div className='menu'>
        <div>
          <div className='tabs'>
            <button className={type === 2 ? 'track-tab selected' : 'track-tab'} onClick={() => setType(2)}>
              {fromToNames[0]}
              <span> - </span>
              {fromToNames[1]}
            </button>
            <button className={type === 1 ? 'track-tab selected' : 'track-tab'} onClick={() => setType(1)}>
              {fromToNames[1]}
              <span> - </span>
              {fromToNames[0]}
          </button>
          </div>
          <div className={'tab-indicator track-tab-indicator track-' + tabIndicatorLocations[type]}></div>
        </div>
      </div>
      <div className='schedule-container'>
	{apiLoaded ? <>
        {trains ? <>
          {trains.map((train) => 
            <TrainListing className='schedule-item' key={train.ankomst.ActivityId} fromStation={type === 1 ? fromTo[1] : fromTo[0]} dayOfset={dayOfset} stations={stations} train={train.ankomst} depature={train.avgang} showTrainOverlay={(trainIdent, depDate) => showTrainOverlay(trainIdent, depDate)} /> 
          )}
	</> : <p>Det finns inga tåg som går vald sträcka</p>}</>
	: <progress value={null} className='progressBar' />
	}
      </div>
    </div>
  );
}

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

export default App;
