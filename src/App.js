import logo from './logo.svg';
import './App.css';
import { useEffect, useReducer, useState } from 'react';

const getStationNames = (state, action) => {
  
}

function App() {
  const [trains, setTrains] = useState([])
  const [type, setType] = useState(1)
  const [dayOfset, setDayOfset] = useState(0)
  const [stationsSignature, setStationsSignature] = useState([])
  const [stations, setStations] = useState([])

  const tabIndicatorLocations = ["left", "center", "right"]

  useEffect(() => {
    fetch('http://[IP-adress]:5000/'+ type + '&' + dayOfset)
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
    fetch('http://[IP-adress]:5000/stations', {
      method: 'POST',
      body: JSON.stringify({stations: stationsSignature}),
      headers: {'Content-Type': 'application/json'},
    })
    .then(res => res.json())
    .then(data => setStations(data))
  }, [stationsSignature])
  

  return (
    <div className="App">
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
          <TrainListing className='schedule-item' key={train.ActivityId} stations={stations} train={train} /> 
        )}
      </div>
    </div>
  );
}

function TrainListing(props) {
  const [late, setLate] = useState(false)
  const [dotColor, setDotColor] = useState("yellow")

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
  }, [])

  return (
    <div className='train-listing'>
      <div style={{display: "flex", alignItems: "center"}}>
        <h1 style={{fontSize: "20px", margin: "0"}}>
        {late==="Försenat" ? <span><span style={{textDecorationLine: "line-through", opacity: 0.5}}>{advertisedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span> {actualTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span> : advertisedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        <span> till </span>
        {props.stations.map((station) => 
          <>{station.signature === props.train.ToLocation[0].LocationName && <span key={0}>{station.name}</span>}</>
        )}
        </h1>
        {late ? <span className='left-aligned'>{late}<span className={'status-dot ' + dotColor}></span></span> : <span className='left-aligned'>I tid<span className={'status-dot green'}></span></span>}
      </div>
      <div style={{display: "flex"}}>
        <span style={{marginRight: "5px"}}>Från</span>
        {props.stations.map((station) => 
          <>{station.signature === props.train.FromLocation[0].LocationName && <span key={0}>{station.name}</span>}</>
        )}
        <span className='left-aligned'>Tåg nr. {props.train.AdvertisedTrainIdent}</span>
      </div>
      <div style={{display: "flex"}}>
        <span>{props.train.ProductInformation ? <>{props.train.ProductInformation[0].Description}</> : <>{props.train.InformationOwner}</>}</span>
        <span className='left-aligned via-stations'>
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
      </div>
    </div>
  );
}

export default App;
