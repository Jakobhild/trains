import logo from './logo.svg';
import sidebarBtnImg from './sidebar-btn.png';
import leftRigthArrow from './left-right-arrow.jpg'
import trainImg from './train.png'
import calendarImg from './calendar.png'
import './App.css';
import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from 'react';
import Overlay from './Overlay.js';
import { getTrains, getStations, getTrainById } from './utils';
import Sidebar from './Sidebar';
import './LoadingCircle.css'
import TrainListing from './TrainListing';

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

  const [offset, setOffset] = useState(0);
  const [showSideMenu, setShowSideMenu] = useState(false)

  useEffect(() => {
      const onScroll = () => setOffset(window.pageYOffset);
      // clean up code
      window.removeEventListener('scroll', onScroll);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if(offset > 200){
      setShowSideMenu(true)
    }
  }, [offset])

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
      <img src={sidebarBtnImg} className='sidebar-button' onClick={() => setShowSidebar(true)}></img>
      {showOverlay && <>
        <Overlay trainIdent={overlayTrainIdent} closeFunc={() => setShowOverlay(false)} date={overlayTrainDepDate}/>
      </>}
      {showSidebar && <>
        <Sidebar closeFunc={() => setShowSidebar(false)} setFromTo={(fromTo) => setFromTo(fromTo)} setFromToNames={(fromToNames) => setFromToNames(fromToNames)} />
      </>}
      {showSideMenu && <>
        <SideMenu dayOfset={dayOfset} setDayOfset={(n) => setDayOfset(n)} type={type} setType={(n) => setType(n)} fromToNames={fromToNames} offset={offset} setShowSideMenu={(e) => setShowSideMenu(e)} />
      </>}

      <h1>Tåg:</h1>
      <DayMenu dayOfset={dayOfset} setDayOfset={(n) => setDayOfset(n)} />
      <TypeMenu type={type} setType={(n) => setType(n)} fromToNames={fromToNames} />
      <div className='schedule-container'>
      {apiLoaded ? <>
            {trains ? <>
              {trains.map((train) => 
                <TrainListing className='schedule-item' key={train.ankomst.ActivityId} fromStation={type === 1 ? fromTo[1] : fromTo[0]} dayOfset={dayOfset} stations={stations} train={train.ankomst} depature={train.avgang} showTrainOverlay={(trainIdent, depDate) => showTrainOverlay(trainIdent, depDate)} /> 
              )}
      </> : <p>Det finns inga tåg som går vald sträcka</p>}</>
      : <LoadingCircle />
	    }
      </div>
    </div>
  );
}



function LoadingCircle(){
  const size = 100

  const circleRef = useRef(null)

  const [ circlePathLength, setCirclePathlength ] = useState();

  useEffect(() => {
    var pathLength = circleRef.current.getTotalLength()

    setCirclePathlength(pathLength);
    console.log(pathLength);
  }, [])
  
  return(
    <div className='loading-container' style={{width: size+10, heigth: size+10}}>
      <svg>
        <circle cx={size/2+5} cy={size/2+5} r={size/2} ref={circleRef} className='loading-circle' />
      </svg>
    </div>
  )
}

export default App;


function SideMenu(props) {
  const [ showDayMenu, setShowDayMenu ] = useState(false)
  const [ showTypeMenu, setShowTypeMenu ] = useState(false)
  const [ menuLeftProp, setMenuLeftProp ] = useState("-50px") 

  const toggleDayMenu = () => {
    if(showDayMenu){
      setShowDayMenu(false)
    }else{
      setShowDayMenu(true)
      setShowTypeMenu(false)
    }
  }

  const toggleTypeMenu = () => {
    if(showTypeMenu){
      setShowTypeMenu(false)
    }else{
      setShowTypeMenu(true)
      setShowDayMenu(false)
    }
  }

  const toggleType = () => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    if(props.type === 1){
      props.setType(2)
    }else{
      props.setType(1)
    }
  }

  const setDayOfsetAndScroll = (n) => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    props.setDayOfset(n)
  }

  useEffect(() => {
    setTimeout(() => {
      setMenuLeftProp("-5px")
    }, 10)
  }, [])

  useEffect(() => {
    if(props.offset < 200){
      setMenuLeftProp("-50px")
      setTimeout(() => {
        props.setShowSideMenu(false)
      }, 1000)
    }
  }, [props.offset])

  return(
    <>
    {showTypeMenu || showDayMenu ? <div className='backdrop' onClick={() => {setShowTypeMenu(false); setShowDayMenu(false)}} style={{opacity: "0"}}></div> : <></>}
    <div className='side-menu no-mobile' style={{left: menuLeftProp}}>
      {showDayMenu && <div className='side-extend-menu side-day-menu' onBlur={() => setShowDayMenu(false)} onClick={() => setShowDayMenu(false)}><DayMenu dayOfset={props.dayOfset} setDayOfset={(n) => setDayOfsetAndScroll(n)} /></div>}
      {showTypeMenu && <div className='side-extend-menu side-type-menu' onBlur={() => setShowTypeMenu(false)} onClick={() => setShowTypeMenu(false)}><TypeMenu type={props.type} setType={(n) => props.setType(n)} fromToNames={props.fromToNames} /></div>}
      <div className='side-main-menu'>
        <img src={calendarImg} onClick={() => toggleDayMenu()} className='side-menu-btn' />
        <img src={trainImg} onClick={() => toggleType()} className='side-menu-btn' />
      </div>
    </div>
    </>
  )
}

function DayMenu(props) {

  const tabIndicatorLocations = ["left", "center", "right"]

  return(
    <div className='menu'>
      <div>
        <div className='tabs'>
          <button className={props.dayOfset === -1 ? 'time-tab selected' : 'time-tab'} onClick={() => props.setDayOfset(-1)}>Igår</button>
          <button className={props.dayOfset === 0 ? 'time-tab selected' : 'time-tab'} onClick={() => props.setDayOfset(0)}>Idag</button>
          <button className={props.dayOfset === 1 ? 'time-tab selected' : 'time-tab'} onClick={() => props.setDayOfset(1)}>Imorgon</button>
        </div>
        <div className={'tab-indicator time-tab-indicator time-' + tabIndicatorLocations[props.dayOfset+1]}></div>
      </div>
    </div>
  )
}

function TypeMenu(props) {

  const tabIndicatorLocations = ["left", "center", "right"]

  return(
    <div className='menu'>
      <div>
        <div className='tabs'>
          <button className={props.type === 2 ? 'track-tab selected' : 'track-tab'} onClick={() => props.setType(2)}>
            {props.fromToNames[0]}
            <span> - </span>
            {props.fromToNames[1]}
          </button>
          <button className={props.type === 1 ? 'track-tab selected' : 'track-tab'} onClick={() => props.setType(1)}>
            {props.fromToNames[1]}
            <span> - </span>
            {props.fromToNames[0]}
        </button>
        </div>
        <div className={'tab-indicator track-tab-indicator track-' + tabIndicatorLocations[props.type]}></div>
      </div>
    </div>
  )
}