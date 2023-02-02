import { useEffect, useState } from 'react'
import './Sidebar.css'
import { getStationSigns } from './utils'

function Sidebar(props){
    const [ containerClass, setContainerClass ] = useState("sidebar-container sidebar-container-inital")
    const [ backdrop, setBackdrop ] = useState(false)

    const [ fromStationName, setFromStationName ] = useState("")
    const [ fromStationSign, setFromStationSign ] = useState("")
    const [ fromStationSelected, setFromStationSelected ] = useState(false)
    const [ fromStationClass, setFromStationClass ] = useState("station-input")

    const [ toStationName, setToStationName ] = useState("")
    const [ toStationSign, setToStationSign ] = useState("")
    const [ toStationSelected, setToStationSelected ] = useState(false)
    const [ toStationClass, setToStationClass ] = useState("station-input")

    const [ rejectedSubmit, setRejectedSubmit ] = useState(false)

    useEffect(() => {
        setContainerClass("sidebar-container sidebar-container-final")
        setBackdrop(true)
    }, [])

    const exit = () => {
        setContainerClass("sidebar-container sidebar-container-inital")
        setBackdrop(false)
        setTimeout(() => props.closeFunc(), 200);
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form)

        const fromTo = Object.fromEntries(formData.entries());
        
        if(toStationSign && fromStationSign){
            props.setFromTo([fromStationSign, toStationSign])
            props.setFromToNames([fromStationName, toStationName])
            exit()
        }else{
            setRejectedSubmit(true)
            if(!toStationSign){
                setToStationClass("station-input rejected-input")
            }
            if(!fromStationSign){
                setFromStationClass("station-input rejected-input")
            }
        }
        
    }

    const setFromStation = (newFromStationName, newFromStationSign) => {
        setFromStationName(newFromStationName)
        setTimeout(() => {
            setFromStationSign(newFromStationSign)
        }, 150)
    }

    const setToStation = (newToStationName, newToStationSign) => {
        setToStationName(newToStationName)
        setTimeout(() => {
            setToStationSign(newToStationSign)
        }, 150)
    }

    return(
        <>
            <div onClick={() => exit()} className='backdrop' style={!backdrop ? {opacity: 0} : {}}></div>
            <div className={containerClass}>
                <button className='cross-button' onClick={() => exit()}>X</button>
                <div className='sidebar-content-container'>
                    <form onSubmit={handleSubmit}>
                        <label>
                        <span className='input-title'>Från:<br /></span>
                        <input className={fromStationClass} name='from' autoComplete='off' placeholder='Ex. Stockholm C' value={fromStationName} onChange={e => {setFromStationName(e.target.value); setFromStationSign("")}} onSelect={e => setFromStationSelected(true)} onBlur={e => setTimeout(() => {setFromStationSelected(false)}, 150)}/>
                        {fromStationSelected && fromStationName ? <div className='recomendation-box-container'><RecommendationBox station={fromStationName} setStation={(name, sign) => setFromStation(name, sign)} /></div>:<></>}
                        </label>
                        <label>
                        <span className='input-title'>Till:<br /></span>
                        <input className={toStationClass} name='to' autoComplete='off' placeholder='Ex. Göteborg C' value={toStationName} onChange={e => {setToStationName(e.target.value); setToStationSign("")}} onSelect={e => setToStationSelected(true)} onBlur={e => setTimeout(() => {setToStationSelected(false)}, 150)}/>
                        {toStationSelected && toStationName ? <div className='recomendation-box-container'><RecommendationBox station={toStationName} setStation={(name, sign) => setToStation(name, sign)} /></div>:<></>}
                        </label>
                        <br />
                        <button type='submit' className='submit-button bold-btn'>Sök trafikinfo</button>
                    </form>
                </div>
                <button onClick={() => {window.sessionStorage.clear()}} className="delete-btn bold-btn">Ta bort sparad data</button>
            </div>
        </>
    )
}

function RecommendationBox(props){

    const [ recommendations, setRecommendations ] = useState([])
    const [ boxClass, setBoxClass ] = useState("recommendation-box recommendation-box-inital")

    useEffect(() => {
        setBoxClass("recommendation-box")
    }, [])

    useEffect(() => {
        getStationSigns(props.station).then((data) => {
            const stations = data.slice(0, 5)
            setRecommendations(stations)
        })
    }, [props.station])

    return (
        <div className={boxClass}>
            {recommendations.map((recommendation) => 
                <div className='recommendation-item' onClick={() => props.setStation(recommendation.AdvertisedLocationName, recommendation.LocationSignature)}>{recommendation.AdvertisedLocationName}</div>
            )}
        </div>
    )
}

export default Sidebar