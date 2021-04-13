const API_URL = "http://localhost:3001/api/"

export const fetchVideos = async (channel) => {
    let url = API_URL + "youtube"
    if (channel) {
        if (channel == "All" || "") {
            url += ""
        }
        else {
            url += "?channel=" + channel
        }
    }
    try {
        const playlist = await fetch(url)
            .then(res => res.json(),
                (error) => {
                    console.log(error)
                }
            )
            console.log(url);
            console.log(playlist);
            
            return playlist;

    } catch (e) {
        console.log(e);
    }


}

export const fetchChannels = async () => {
    const channelList= await fetch(API_URL + "author")
        .then(res => res.json(),
            (error) => {
                console.log(error)
            }
        )
        return channelList

}