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
        fetch('http://' + props.ip + '/trainid/' + props.trainIdent + "&" + props.date)
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
        fetch('http://' + props.ip + '/stations', {
          method: 'POST',
          body: JSON.stringify({stations: stationsSignature}),
          headers: {'Content-Type': 'application/json'},
        })
        .then(res => res.json())
        .then(data => setStations(data))
      }, [stationsSignature])

    const timeFromString = (timeString) => {
        const time = new Date(Date.parse(timeString))
        return time
    }

    return(
    <div className={containerClass}>
        <button className='cross-button' onClick={() => props.closeFunc()}>X</button>
        <h1>Tåg nr. {props.trainIdent}</h1>
        <table className='activity-table'>
            <tr>
                <th>Ankomst</th>
                <th>Avgång</th>
                <th>Station</th>
                <th>Spår</th>
            </tr>
            {trainInfo.map((location) => 
                <tr className='activity-item'>
                    {location.AdvertisedTimeAnkomst !== "" ? (<td>
                        {timeFromString(location.ActuallTimeAnkomst) - timeFromString(location.AdvertisedTimeAnkomst) > 60*1000 && <span style={{textDecorationLine: "line-through", opacity: 0.5}}>{timeFromString(location.AdvertisedTimeAnkomst).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </span>}
                        {timeFromString(location.ActuallTimeAnkomst).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>) : <td></td>}
                    {location.AdvertisedTimeAvgang !== "" ? (<td>
                        {timeFromString(location.ActuallTimeAvgang) - timeFromString(location.AdvertisedTimeAvgang) > 60*1000 && <span style={{textDecorationLine: "line-through", opacity: 0.5}}>{timeFromString(location.AdvertisedTimeAvgang).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </span>}
                        {timeFromString(location.ActuallTimeAvgang).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>) : <td></td>}
                    {stations.map((station) => 
                        <>{station.signature === location.LocationSignature && <td key={0}>{station.name}</td>}</>
                    )}
                    <td>{location.Track}</td>
                </tr>
            )}
        </table>
    </div>)
}

export default Overlay;
