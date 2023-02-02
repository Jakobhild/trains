import { getTrainInfo, getTrainIdents } from "./getTrains";
import { getStationNames } from "./getStationNames";
import { getById, getByIdAndStation } from "./getTrainById";
import { getStationSign } from "./getStationSign";

export const getTrains = async (type, dayOfset, station1, station2) => {
    const now = new Date();
    

    if(window.sessionStorage.getItem(station1 + station2 + type + dayOfset)){
        let sessionObject = JSON.parse(window.sessionStorage.getItem(station1 + station2 + type + dayOfset))
        if(Date.parse(sessionObject.expiresAt) > Date.parse(now)){
            return sessionObject.data
        }else{
            sessionStorage.removeItem(station1 + station2 + type + dayOfset)
        }
    }

    const trainIdents = await getTrainIdents(station1, station2, dayOfset)
    
    var expire = new Date()
    expire.setMinutes(now.getMinutes() + 5)

    if(type === 1){
        const data = await getTrainInfo(station1, dayOfset, trainIdents[1], station2)

        const sortedData = sortTrains(data.RESPONSE.RESULT[0].TrainAnnouncement)

        let sessionObject = {
            expiresAt: expire,
            data: sortedData
        }


        window.sessionStorage.setItem(station1 + station2 + type + dayOfset, JSON.stringify(sessionObject));
        return sortedData
    } else {
        const data = await getTrainInfo(station2, dayOfset, trainIdents[0], station1)

        const sortedData = sortTrains(data.RESPONSE.RESULT[0].TrainAnnouncement)

        let sessionObject = {
            expiresAt: expire,
            data: sortedData
        }
        window.sessionStorage.setItem(station1 + station2 + type + dayOfset, JSON.stringify(sessionObject));
        return sortedData
    }
}

export const getStations = async (stations) => {
    if(stations.length === 0){
        return []
    }
    var newStations = []
    var response = [{}]
    if(window.sessionStorage.getItem("stations")){
        let sessionObject = JSON.parse(window.sessionStorage.getItem("stations"))
        for(let i = 0; i < stations.length; i++){
            let saved = false
            for(let j = 0; j < sessionObject.length; j++){
                if(sessionObject[j].signature === stations[i]){
                    saved = true;
                    break
                }
            }
            if(!saved){
                newStations.push(stations[i])
            }
        }
        response = sessionObject
    }else{
        newStations = stations
    }
    if(newStations.length > 0){
        const data = await getStationNames(newStations)
        const stationNames = data.RESPONSE.RESULT[0].TrainStation
        if(stationNames === undefined){
            return []
        }else{
        response.push({signature: stationNames[0].LocationSignature, name: stationNames[0].AdvertisedLocationName})
        for(let i = 1; i < stationNames.length; i++){
            response.push({signature: stationNames[i].LocationSignature, name: stationNames[i].AdvertisedLocationName})
        }
    }
    window.sessionStorage.setItem("stations", JSON.stringify(response))
    }
    return response
}

export const getStationSigns = async (station) => {
    const data = await getStationSign(station)
    const stations = data.RESPONSE.RESULT[0].TrainStation
    return stations
}

export const getTrainById = async (id, date) => {
    const data = await getById(id, date)
    const response = getTimetable(data)
    return response
}

const getTimetable = (data) => {
    const activitys = data.RESPONSE.RESULT[0].TrainAnnouncement;
        var responseTemplate = {
            LocationSignature: activitys[0].LocationSignature,
            AdvertisedTimeAvgang: "",
            ActuallTimeAvgang: "",
            AdvertisedTimeAnkomst: "",
            ActuallTimeAnkomst: "",
            Track: activitys[0].TrackAtLocation,
            Deviation: []
        }
        let actuallTimeDep = ""
                if(activitys[0].TimeAtLocation){
                    actuallTimeDep = activitys[0].TimeAtLocation
                }else{
                    if(activitys[0].PlannedEstimatedTimeAtLocationIsValid){
                        actuallTimeDep = activitys[0].PlannedEstimatedTimeAtLocation
                    }else{
                        actuallTimeDep = activitys[0].AdvertisedTimeAtLocation
                    }
                }
        var response = [{...responseTemplate,
                ActuallTimeAvgang: actuallTimeDep,
                AdvertisedTimeAvgang: activitys[0].AdvertisedTimeAtLocation,
            }]
        if(activitys[0].Deviation){
            activitys[0].Deviation.map((deviation) => {
                response[0].Deviation.push(deviation.Description)
            })
        }
        if(activitys[0].OtherInformation){
            activitys[0].OtherInformation.map((deviation) => {
                if(!response[0].Deviation.includes(deviation.Description)){
                    response[0].Deviation.push(deviation.Description)
                } 
            })
        }
        for(let i = 1; i < activitys.length; i++){
            if(response[response.length - 1].LocationSignature === activitys[i].LocationSignature && activitys[i].ActivityType === "Avgang"){
                response[response.length - 1].AdvertisedTimeAvgang = activitys[i].AdvertisedTimeAtLocation
                if(activitys[i].TimeAtLocation){
                    response[response.length - 1].ActuallTimeAvgang = activitys[i].TimeAtLocation
                }else{
                    if(activitys[i].PlannedEstimatedTimeAtLocationIsValid){
                        response[response.length - 1].ActuallTimeAvgang = activitys[i].PlannedEstimatedTimeAtLocation
                    }else{
                        response[response.length - 1].ActuallTimeAvgang = activitys[i].AdvertisedTimeAtLocation
                    }
                }
            }else if(response[response.length - 1].LocationSignature === activitys[i].LocationSignature && activitys[i].ActivityType === "Ankomst"){
                response[response.length - 1].AdvertisedTimeAnkomst = activitys[i].AdvertisedTimeAtLocation
                if(activitys[i].TimeAtLocation){
                    response[response.length - 1].ActuallTimeAnkomst = activitys[i].TimeAtLocation
                }else{
                    if(activitys[i].PlannedEstimatedTimeAtLocationIsValid){
                        response[response.length - 1].ActuallTimeAnkomst = activitys[i].PlannedEstimatedTimeAtLocation
                    }else{
                        response[response.length - 1].ActuallTimeAnkomst = activitys[i].AdvertisedTimeAtLocation
                    }
                }
            }else if(activitys[i].ActivityType === "Ankomst"){
                let actuallTime = ""
                if(activitys[i].TimeAtLocation){
                    actuallTime = activitys[i].TimeAtLocation
                }else{
                    if(activitys[i].PlannedEstimatedTimeAtLocationIsValid){
                        actuallTime = activitys[i].PlannedEstimatedTimeAtLocation
                    }else{
                        actuallTime = activitys[i].AdvertisedTimeAtLocation
                    }
                }
                response.push({...responseTemplate, 
                        LocationSignature: activitys[i].LocationSignature,
                        AdvertisedTimeAnkomst: activitys[i].AdvertisedTimeAtLocation,
                        ActuallTimeAnkomst: actuallTime,
                        Track: activitys[i].TrackAtLocation
                    })
            }else{
                let actuallTime = ""
                if(activitys[i].TimeAtLocation){
                    actuallTime = activitys[i].TimeAtLocation
                }else{
                    if(activitys[i].PlannedEstimatedTimeAtLocationIsValid){
                        actuallTime = activitys[i].PlannedEstimatedTimeAtLocation
                    }else{
                        actuallTime = activitys[i].AdvertisedTimeAtLocation
                    }
                }
                response.push({...responseTemplate, 
                        LocationSignature: activitys[i].LocationSignature,
                        AdvertisedTimeAvgang: activitys[i].AdvertisedTimeAtLocation,
                        ActuallTimeAvgang: actuallTime,
                        Track: activitys[i].TrackAtLocation
                    })
            }
            let dev = [];
            if(activitys[i].Deviation){
                activitys[i].Deviation.map((deviation) => {
                    if(!dev.includes(deviation.Description)){
                        dev.push(deviation.Description)
                    } 
                })
            }
            if(activitys[i].OtherInformation){
                activitys[i].OtherInformation.map((deviation) => {
                    if(!dev.includes(deviation.Description)){
                        dev.push(deviation.Description)
                    } 
                })
            }
            response[response.length - 1].Deviation = dev
        }
        
        return response
}

const sortTrains = (data) => {
    
    var response = []

    const responseTemplate = {
        avgang: {},
        ankomst: {}
    }

    data.map((activity) => {
        if(activity.ActivityType === "Ankomst"){
            for(let i = 0; i < response.length; i++){
                if(activity.AdvertisedTrainIdent === response[i].avgang.AdvertisedTrainIdent){
                    response[i].ankomst = activity
                }
            }
        }else if(activity.ActivityType === "Avgang"){
            let alredyIncludes = false
            for(let i = 0; i < response.length; i++){
                if(activity.AdvertisedTrainIdent === response[i].avgang.AdvertisedTrainIdent){
                    alredyIncludes = true
                }
            }
            if(!alredyIncludes){
                response.push({...responseTemplate, avgang: activity})
            }
        }
    })

    return response
}