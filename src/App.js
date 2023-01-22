import logo from './logo.svg';
import './App.css';
import { useEffect, useReducer, useState } from 'react';
import Overlay from './Overlay.js';

function App() {
  const [trains, setTrains] = useState([])
  const [type, setType] = useState(1)
  const [dayOfset, setDayOfset] = useState(0)
  const [stationsSignature, setStationsSignature] = useState([])
  const [stations, setStations] = useState([])
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayTrainIdent, setOverlayTrainIdent] = useState("")
  const [overlayTrainDepDate, setOverlayTrainDepDate] = useState("")

  const tabIndicatorLocations = ["left", "center", "right"]

  const ip = 'IP'

  useEffect(() => {
    fetch('http://' + ip + '/'+ type + '&' + dayOfset)
      .then((response) => response.json())
      .then((data) => {
        setTrains(data);
        let stationsArr = []
        data.map((train) => {
          if(!stationsArr.includes(train.FromLocation[0].LocationName)){
            stationsArr.push(train.FromLocation[0].LocationName)
          }
          if(!stationsArr.includes(train.ToLocation[0].LocationName)){
            stationsArr.push(train.ToLocation[0].LocationName)
          }
          train.ViaFromLocation.map((location) => {
            if(!stationsArr.includes(location.LocationName)){
              stationsArr.push(location.LocationName)
            }
          }) 
        })
        setStationsSignature(stationsArr)
      })
  }, [type, dayOfset])

  useEffect(() => {
    fetch('http://' + ip + '/stations', {
      method: 'POST',
      body: JSON.stringify({stations: stationsSignature}),
      headers: {'Content-Type': 'application/json'},
    })
    .then(res => res.json())
    .then(data => setStations(data))
  }, [stationsSignature])
  
  const showTrainOverlay = (trainIdent, depDate) => {
    setShowOverlay(true)
    console.log(trainIdent);
    setOverlayTrainIdent(trainIdent)
    setOverlayTrainDepDate(depDate)
  }

  const getFromStation = () => {
    if(type === 1){
      return "Cst"
    }else{
      return "Ör"
    }
  }

  return (
    <div className="App">
      {showOverlay && <>
      <Overlay ip={ip} trainIdent={overlayTrainIdent} closeFunc={() => setShowOverlay(false)} date={overlayTrainDepDate}/>
      <div onClick={() => setShowOverlay(false)} className='backdrop'></div>
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
          <button className={type === 1 ? 'track-tab selected' : 'track-tab'} onClick={() => setType(1)}>Stockholm - Örebro</button>
            <button className={type === 2 ? 'track-tab selected' : 'track-tab'} onClick={() => setType(2)}>Örebro - Stockholm</button>
          </div>
          <div className={'tab-indicator track-tab-indicator track-' + tabIndicatorLocations[type]}></div>
        </div>
      </div>
      <div className='schedule-container'>
        {trains.map((train) => 
          <TrainListing ip={ip} className='schedule-item' key={train.ActivityId} fromStation={() => getFromStation()} dayOfset={dayOfset} stations={stations} train={train} showTrainOverlay={(trainIdent, depDate) => showTrainOverlay(trainIdent, depDate)} /> 
        )}
      </div>
    </div>
  );
}

function TrainListing(props) {

  const timeFromString = (timeString) => {
    const time = new Date(Date.parse(timeString))
    return time
  }

  const [late, setLate] = useState(false)
  const [dotColor, setDotColor] = useState("yellow")
  const [depature, setDepature] = useState({
                                            advertisedTime: timeFromString("2023-01-21T00:00:00.000+01:00"),
                                            actualTime: timeFromString("2023-01-21T00:00:00.000+01:00"),
                                            track: "0"
                                          })
  const [lateDep, setLateDep] = useState(false)

  

  const advertisedTime = new Date(Date.parse(props.train.AdvertisedTimeAtLocation))
  const actualTime = new Date(Date.parse(props.train.TimeAtLocation))

  useEffect(() => {
    if(actualTime - advertisedTime > 5 * 60 * 1000){
      setLate("Försenat");
    }
    if(actualTime - advertisedTime > 60 * 60 * 1000){
      setDotColor("red")
    }
    if(props.train.Canceled){
      setLate("Inställt")
      setDotColor("red")
    }
    fetch('http://' + props.ip + '/trainid/' + props.train.AdvertisedTrainIdent + "&" + props.train.ScheduledDepartureDateTime)
        .then(res => res.json())
        .then(data => {
          data.map((location) => {
            if(location.LocationSignature === props.fromStation()){
              let dep = {
                advertisedTime: timeFromString(location.AdvertisedTimeAvgang),
                actualTime: timeFromString(location.ActuallTimeAnkomst),
                track: location.Track
              }
              setDepature(dep)
            }
          }) 
        })
  }, [])

  useEffect(() => {
    if(depature.actualTime - depature.advertisedTime > 5 * 60 * 1000){
      setLateDep(true)
    }
  }, [depature])

  

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
            <span style={{textDecorationLine: "line-through", opacity: 0.5}}>{depature.advertisedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </span> {depature.actualTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span> : depature.advertisedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          
          <span> &gt; </span>
          {late==="Försenat" ? <span>
            <span style={{textDecorationLine: "line-through", opacity: 0.5}}>{advertisedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </span> {actualTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span> : advertisedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}


        </h1>
        
        <span className='left-aligned no-mobile'>
          <span> Från </span>
          {props.stations.map((station) => 
            <>{station.signature === props.train.FromLocation[0].LocationName && <span key={0}>{station.name}</span>}</>
          )}
          <span> mot </span>
          {props.stations.map((station) => 
            <>{station.signature === props.train.ToLocation[0].LocationName && <span key={0}>{station.name}</span>}</>
          )}
        </span>
        
      </div>
      {/*Line three----------------------------------------------------------------------------------- */}
      <div style={{display: "flex"}}>
        
        <span className='no-mobile'>
          <span style={{marginRight: "5px"}}>Via</span>
          {props.train.ViaFromLocation.map((viaStation) => 
          <span key={viaStation.Order}>
            {props.stations.map((station) => 
              <>{station.signature === viaStation.LocationName && <>{station.name}</>}</>
            )}
            {viaStation.Order < props.train.ViaFromLocation.length - 2 && <>, </>} 
            {viaStation.Order === props.train.ViaFromLocation.length - 2 && <> och </>}
          </span>)}
        </span>

        <span className='mobile-only'>
          <span> Från </span>
          {props.stations.map((station) => 
            <>{station.signature === props.train.FromLocation[0].LocationName && <span key={0}>{station.name}</span>}</>
          )}
          <span> mot </span>
          {props.stations.map((station) => 
            <>{station.signature === props.train.ToLocation[0].LocationName && <span key={0}>{station.name}</span>}</>
          )}
         
        </span>
      </div>
    </div>
  );
}

export default App;
