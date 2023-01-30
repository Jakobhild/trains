export const getStationSign = async (station) => {
    var req = "<REQUEST>" +
                "<LOGIN authenticationkey='" + process.env.REACT_APP_API_KEY + "' /> " +
                "<QUERY objecttype='TrainStation' schemaversion='1' orderby='PlatformLine asc'>" +
                    "<FILTER>" +
                        "<EQ name='Advertised' value='true' />" +
                        "<EQ name='CountryCode' value='SE' />" +
                        "<LIKE name='AdvertisedLocationName' value='/^" + station + "/' />" +
                    "</FILTER>" +
                    "<INCLUDE>LocationSignature</INCLUDE>" +
                    "<INCLUDE>AdvertisedLocationName</INCLUDE>" +
                "</QUERY>" +
            "</REQUEST>"

    const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
        method: 'POST',
        body: req
    })
    return response.json()
    
}