export const getStationNames = async (stations) => {
    var req = "<REQUEST>" +
                "<LOGIN authenticationkey='" + process.env.REACT_APP_API_KEY + "' /> " +
                "<QUERY objecttype='TrainStation' schemaversion='1'>" +
                    "<FILTER>" +
                        "<EQ name='Advertised' value='true' />" +
                        "<OR>"
    stations.map((station) => {req += "<EQ name='LocationSignature' value='" + station + "' />"})

    req += "</OR>" +
        "</FILTER>" +
        "</QUERY>" +
        "</REQUEST>"

    const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
        method: 'POST',
        body: req
    })

    return response.json()
    
}