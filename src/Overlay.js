import { useEffect, useState } from 'react';
import './Overlay.css';

function Overlay(props){
    const [containerClass, setContainerClass] = useState('overlay-container inital-container')
    const [trainInfo, setTrainInfo] = useState([])
    const [stationsSignature, setStationsSignature] = useState([])
    const [stations, setStations] = useState([])

    useEffect(() => {
        setTimeout(() => {
            setContainerClass('overlay-container final-container')
        }, 1)
    }, [])

    useEffect(() => {
        fetch('http://[IP-adress]:5000/trainid/' + props.trainIdent + "&" + props.dayOfset)
        .then(res => res.json())
        .then(data => {
            setTrainInfo(data)
            let stationsArr = []
            data.map((activity) => {
                if(!stationsArr.includes(activity.LocationSignature)){
                    stationsArr.push(activity.LocationSignature)
                }
            })
            setStationsSignature(stationsArr)
        })
    }, [])

    useEffect(() => {
        fetch('http://[IP-adress]:5000/stations', {
          method: 'POST',
          body: JSON.stringify({stations: stationsSignature}),
          headers: {'Content-Type': 'application/json'},
        })
        .then(res => res.json())
        .then(data => setStations(data))
      }, [stationsSignature])

    return(
    <div className={containerClass}>
        <button className='cross-button' onClick={() => props.closeFunc()}>X</button>
        <p>{props.trainIdent}</p>
        <div className='activity-table'>
        {trainInfo.map((activity) => 
            <>{activity.Advertised && (<div className='activity-item'>
                <span>{activity.ActivityType==="Avgang" ? <>Avgång</> : <>{activity.ActivityType}</>}: </span>
                {stations.map((station) => 
                    <>{station.signature === activity.LocationSignature && <span key={0}>{station.name}</span>}</>
                )}
                <span> {activity.AdvertisedTimeAtLocation}</span>
            </div>)}</>
        )}
        </div>
    </div>)
}

export default Overlay;
