import { useEffect, useState, useReducer } from 'react'
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

	const [ showCalendar, setShowCalendar ] = useState(false)

	const [ tempDate, setTempDate ] = useReducer((prev, next) => {
		const now = new Date()
		var newDate = new Date(next[0], next[1], next[2])
//		if(newDate.getDate() < new Date().setDate(now.getDate()-1).getDate() && newDate.getMonth() <= now.getMonth() && newDate.getYear() <= now.getYear()){
	//		newDate = now
//		}
			setTimeout(() => {
					setShowCalendar(true)
			}, 150)
		return newDate;
	},new Date())

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
						<label>
							<span>Datum:<br /></span>
							<input name='date' autoComplete='off' value={tempDate} onSelect={e => setShowCalendar(true)}/>
							{showCalendar && <div className='recomendatioon-box-container' onBlur={e => setShowCalendar(false)}>
									<Calendar date={tempDate} setDate={date => setTempDate(date)} />
							</div> }
						</label>
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

function Calendar(props){

	const months = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"]

	const getDaysInMonth = (month, year) => {
		return new Date(year, month+1, 0).getDate();
	}

	const getFirstDayInMonth = (month, year) => {
		return new Date(year, month, 1).getDay();
	}

	const getCalendarArray = (dateObj) => {
		const daysInMonth = getDaysInMonth(dateObj.getMonth(), dateObj.getYear())
		const firstDayInMonth = getFirstDayInMonth(dateObj.getMonth(), dateObj.getYear())
		
		var response = []

		response.push(new Array(7).fill("").map((value, index) => {
			if(index <= firstDayInMonth){
				return ""
			}else{
				return index-firstDayInMonth + ""
			}
		}))


		for(let i = 7-firstDayInMonth; i <= daysInMonth; i++){
			if((i+firstDayInMonth)%7 === 0){
				response.push([i + ""])
			}else{
				response[response.length-1].push(i + "")
			}
		}

		return response;
	}


	const [ boxClass, setBoxClass ] = useState("recommendation-box recommendation-box-inital")
	const [ month, setMonth ] = useState(props.date.getMonth())
	
	useEffect(() => {
		setBoxClass("recommendation-box")
	}, [])

	return(
		<div className={boxClass}>
				<div className="calendar-controls">
					<div onClick={() => props.setDate([props.date.getFullYear(), props.date.getMonth()-1, 1])}>&#60; </div>
					<div>{months[props.date.getMonth()]}</div>
					<div onClick={() => props.setDate([props.date.getFullYear(), props.date.getMonth()+1, 1])}> &#62;</div>
				</div>
				<table>
					{getCalendarArray(props.date).map((week, wIndex) => (<tr key={wIndex+100}>
							{week.map((day, dIndex) => <td>{day}</td>)}
					</tr>))}
				</table>
		</div>
	)
}

export default Sidebar
