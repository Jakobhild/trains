import { getTrainInfo, getTrainIdents } from "./getTrains";
import { getStationNames } from "./getStationNames";
import { getById } from "./getTrainById";
import { getStationSign } from "./getStationSign";

export const getTrains = async (type, dayOfset, station1, station2) => {
    const trainIdents = await getTrainIdents(station1, station2, dayOfset)
    
    if(type === 1){
        const data = await getTrainInfo(station1, dayOfset, trainIdents[1])
        return data.RESPONSE.RESULT[0].TrainAnnouncement
    } else {
        const data = await getTrainInfo(station2, dayOfset, trainIdents[0])
        return data.RESPONSE.RESULT[0].TrainAnnouncement
    }
}

export const getStations = async (stations) => {
    if(stations.length === 0){
        return []
    }
    const data = await getStationNames(stations)
    const stationNames = data.RESPONSE.RESULT[0].TrainStation
    if(stationNames === undefined){
        return []
    }else{
    var response = [{signature: stationNames[0].LocationSignature, name: stationNames[0].AdvertisedLocationName}]
    for(let i = 1; i < stationNames.length; i++){
        response.push({signature: stationNames[i].LocationSignature, name: stationNames[i].AdvertisedLocationName})
    }
    return response
    }
}

export const getStationSigns = async (station) => {
    const data = await getStationSign(station)
    const stations = data.RESPONSE.RESULT[0].TrainStation
    return stations
}

export const getTrainById = async (id, date) => {
    const data = await getById(id, date)
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