export const getById = async (id, date) => {

    const req = "<REQUEST>" + 
                "<LOGIN authenticationkey='" + process.env.REACT_APP_API_KEY + "' />" +
                "<QUERY objecttype='TrainAnnouncement' schemaversion='1.8' limit='100' orderby='AdvertisedTimeAtLocation asc' >" +
                    "<FILTER>" +
                        "<EQ name='AdvertisedTrainIdent' value='"+ id +"' />" +
                        "<EQ name='Advertised' value='true' />" +
                        "<EQ name='ScheduledDepartureDateTime' value='" + date + "' />" +
                    "</FILTER>" +
                    "<INCLUDE>LocationSignature</INCLUDE>" +
                    "<INCLUDE>ActivityType</INCLUDE>" +
                    "<INCLUDE>PlannedEstimatedTimeAtLocation</INCLUDE>" +
                    "<INCLUDE>PlannedEstimatedTimeAtLocationIsValid</INCLUDE>" +
                    "<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>" +
                    "<INCLUDE>TimeAtLocation</INCLUDE>" +
                    "<INCLUDE>Deviation</INCLUDE>" + 
                    "<INCLUDE>OtherInformation</INCLUDE>" +
                    "<INCLUDE>TrackAtLocation</INCLUDE>" +
                "</QUERY>" +
            "</REQUEST>";
    
    const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
        method: 'POST',
        body: req
    })
    return response.json()
}