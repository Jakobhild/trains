export const getTrainInfo = async (station, dateOfset, trainIdents, depStation) => {
    var now = new Date();

    now.setDate(now.getDate() + dateOfset)

    let d = now.getDate() + "";
    if(d < 10){
        d = "0" + d
    }

    let m = now.getMonth() + 1 + "";
    if(m < 10){
        m = "0" + m
    }

    var req = "<REQUEST>" + 
                "<LOGIN authenticationkey='" + process.env.REACT_APP_API_KEY + "' />" +
                "<QUERY objecttype='TrainAnnouncement' schemaversion='1.8' limit='100' orderby='AdvertisedTimeAtLocation asc' >" +
                    "<FILTER>" +
                        "<OR>" +
                            "<AND>" +
                                "<EQ name='LocationSignature' value='"+ station +"' />" +
                                "<EQ name='ActivityType' value='Ankomst'/>" +
                            "</AND>" +
                            "<AND>" +
                                "<EQ name='LocationSignature' value='"+ depStation +"' />" +
                                "<EQ name='ActivityType' value='Avgang'/>" +
                            "</AND>" +
                        "</OR>" +
                        "<EQ name='ScheduledDepartureDateTime' value='2023-" + m + "-" + d + "T00:00:00.000+01:00' />" +
                        "<OR>"
                        trainIdents.map((id) => {req += "<EQ name='AdvertisedTrainIdent' value='" + id + "' />"})
                    req += "</OR>" +
                    "</FILTER>" +
                "</QUERY>" +
            "</REQUEST>";
    
    const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
        method: 'POST',
        body: req
    })
    return response.json()
}

export const getTrainIdents = async (station1r, station2r, dateOfset) => {
    var station1 = station1r
    var station2 = station2r
    var now = new Date();

    now.setDate(now.getDate() + dateOfset)

    let d = now.getDate() + "";
    if(d < 10){
        d = "0" + d
    }

    let m = now.getMonth() + 1 + "";
    if(m < 10){
        m = "0" + m
    }

    var change = false;

    if(station1 === 'Cst'){
        let a = station1;
        station1 = station2;
        station2 = a;
        change = true;
    }
    var req = "<REQUEST>" + 
                    "<LOGIN authenticationkey='" + process.env.REACT_APP_API_KEY + "' />" +
                    "<QUERY objecttype='TrainAnnouncement' schemaversion='1.8' limit='10000' orderby='AdvertisedTimeAtLocation asc'>" +
                        "<FILTER>" +
                            "<EQ name='LocationSignature' value='" + station1 + "' />" +
                            "<EQ name='Advertised' value='true' />" +
                            "<EQ name='ScheduledDepartureDateTime' value='2023-" + m + "-" + d + "T00:00:00.000+01:00' />" +
                        "</FILTER>" +
                        "<INCLUDE>AdvertisedTrainIdent</INCLUDE>" +
                        "<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>" +
                    "</QUERY>" +
                "</REQUEST>";

    var response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
        method: 'POST',
        body: req
    })

    var data = await response.json()

    var trainIdentsInital = []
    
    data.RESPONSE.RESULT[0].TrainAnnouncement.map((train) => {
        trainIdentsInital.push({id: train.AdvertisedTrainIdent, time: new Date(Date.parse(train.AdvertisedTimeAtLocation))})
    })

    req = "<REQUEST>" + 
                    "<LOGIN authenticationkey='" + process.env.REACT_APP_API_KEY + "' />" +
                    "<QUERY objecttype='TrainAnnouncement' schemaversion='1.8' limit='1000' orderby='AdvertisedTimeAtLocation asc'>" +
                        "<FILTER>" +
                            "<EQ name='LocationSignature' value='" + station2 + "' />" +
                            "<EQ name='Advertised' value='true' />" +
                            "<OR>"
                                trainIdentsInital.map((train) => {req += "<EQ name='AdvertisedTrainIdent' value='" + train.id + "' />"})
                    req += "</OR>" +
                            "<EQ name='ScheduledDepartureDateTime' value='2023-" + m + "-" + d + "T00:00:00.000+01:00' />" +
                        "</FILTER>" +
                    "</QUERY>" +
                "</REQUEST>";

    response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
        method: 'POST',
        body: req
    })

    data = await response.json()

    var trainIdentsFinal = [];

    data.RESPONSE.RESULT[0].TrainAnnouncement.map((train) => {
        trainIdentsFinal.push({id: train.AdvertisedTrainIdent, time: new Date(Date.parse(train.AdvertisedTimeAtLocation))})
    })

    var trainIdents1 = [];
    var trainIdents2 = [];

    trainIdentsFinal.map((station2T) => {
        trainIdentsInital.map((station1T) => {
            if(station1T.id === station2T.id){
                if(station1T.time - station2T.time < 0){
                    if(!trainIdents1.includes(station2T.id)){
                        trainIdents1.push(station2T.id)
                    }
                }else{
                    if(!trainIdents2.includes(station2T.id)){
                        trainIdents2.push(station2T.id)
                    }
                }
            }
        })
    })

    var trainIdents = []

    if(change){
        trainIdents.push(trainIdents2)
        trainIdents.push(trainIdents1)
    }else{
        trainIdents.push(trainIdents1)
        trainIdents.push(trainIdents2)
    }

    return trainIdents
}