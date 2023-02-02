import { useEffect, useState } from 'react';
import { getStations, getTrainById } from './utils';
import './Overlay.css';

function Overlay(props){
    const [containerClass, setContainerClass] = useState('overlay-container inital-container')
    const [backdrop, setBackdrop] = useState(false)
    const [trainInfo, setTrainInfo] = useState([])
    const [stationsSignature, setStationsSignature] = useState([])
    const [stations, setStations] = useState([])

    useEffect(() => {
        setContainerClass('overlay-container final-container')
        setBackdrop(true)
    }, [])

    useEffect(() => {
        getTrainById(props.trainIdent, props.date)
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
        getStations(stationsSignature)
        .then(data => setStations(data))
      }, [stationsSignature])

    const timeFromString = (timeString) => {
        const time = new Date(Date.parse(timeString))
        return time
    }
    const exit = () => {
        setContainerClass("overlay-container inital-container")
        setBackdrop(false)
        setTimeout(() => props.closeFunc(), 200);
    }

    return(<>
    <div onClick={() => exit()} className='backdrop' style={!backdrop ? {opacity: 0} : {}}></div>
    <div className={containerClass}>
        <button className='cross-button' onClick={() => exit()}>X</button>
        <h1>Tåg nr. {props.trainIdent}</h1>
        <table className='activity-table'>
            <tbody>
            <tr>
                <th className="time-column">Ank</th>
                <th className="time-column">Avg</th>
                <th>Station</th>
                <th>Spår</th>
            </tr>
            {trainInfo.map((location, index) => 
                <tr className='activity-item' key={index}>
                    {location.AdvertisedTimeAnkomst !== "" ? (<td>
                        {timeFromString(location.ActuallTimeAnkomst) - timeFromString(location.AdvertisedTimeAnkomst) > 60*1000 && <span style={{textDecorationLine: "line-through", opacity: 0.5}}>{timeFromString(location.AdvertisedTimeAnkomst).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </span>}
                        {timeFromString(location.ActuallTimeAnkomst).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>) : <td></td>}
                    {location.AdvertisedTimeAvgang !== "" ? (<td>
                        {timeFromString(location.ActuallTimeAvgang) - timeFromString(location.AdvertisedTimeAvgang) > 60*1000 && <span style={{textDecorationLine: "line-through", opacity: 0.5}}>{timeFromString(location.AdvertisedTimeAvgang).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} </span>}
                        {timeFromString(location.ActuallTimeAvgang).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>) : <td></td>}
                    <td className="station-column">
                        <div style={{textAlign: "left", marginLeft: "20%"}}>
                        {stations[stations.findIndex((station) => station.signature === location.LocationSignature)] && <span style={{fontWeight: "bold"}}>{stations[stations.findIndex((station) => station.signature === location.LocationSignature)].name}</span>}
                            <br />
                            <span>
                            {location.Deviation.map((description, index) => <span key={index}>
                                {description} 
                                {index < location.Deviation.length - 1 && <br />}
                            </span>)}
                            </span>
                        </div>
                    </td>
                    <td>{location.Track}</td>
                </tr>
            )}
            </tbody>
        </table>
    </div></>)
}

export default Overlay;
