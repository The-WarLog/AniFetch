const axios=require("axios");
const { name } = require("ejs");
const JIKAN_API_BASE_URL = process.env.JIKAN_API_BASE_URL || 'https://api.jikan.moe/v4';
if(!JIKAN_API_BASE_URL){
    console.log("JIKAN_API_BASE_URL is not defined");
    process.exit(1);
    
}

//making an fetch helper fucntion 
const fetchtheanimeinfo = async (url,page=1,limit=10) => {
    try {
        const response = new URL(url);
        response.searchParams.append('page', page);
        response.searchParams.append('limit', limit);
        //for debuugin
        console.log(`fetching from the API ${response.toString()}`);
        const axion=await axios.get(response.toString());
        const AnimeList=axion.data.data;
        const pagination = axion.data.pagination;
        const filteroutput=AnimeList.map((item)=>({
            
                "title_english":item.title_english,
                "title_japanese":item.title_japanese,
                "rating":item.rating,
                "Air_Date":item.aired&& item.aired.from ? new Date(item.aired.from).toUTCString() : null,
                "MAL":item.score,
                "Status":item.status,
                "Time and Date" : [item.broadcast.day,item.broadcast.time]


           
        }));
        //const page=axion.data.pagination;
        
        
        return{
            data:filteroutput,
          pagination:{
            current_page:pagination.current_page,
            has_next_page:pagination.has_next_page,
          ttotalPages: pagination.last_visible_page,
                limit:pagination.items.per_page
          }
        }

        
    
        
    } catch (error) {
        console.error(`Error fetching data from API: ${error.message}`);
        // Re-throw the error to be caught by the controller's catch block
        next(error);
    }
};

//gettting anime for the current season
exports.GetCurrentSeasonAnime = async (req, res, next) => {
    const url = `${JIKAN_API_BASE_URL}/seasons/now`;
    try {
        const data = await fetchtheanimeinfo(url);
        res.json(data);
    } catch (error) {
        next(error); // Pass error to Express error handler
    }
};

// getting anime for a specific year and season
exports.GetAnimeByYearAndSeason = async (req, res, next) => {
    const { year, season } = req.params;
    const url = `${JIKAN_API_BASE_URL}/seasons/${year}/${season}`;
    try {
        const data = await fetchtheanimeinfo(url);
        res.json(data);
    } catch (error) {
        next(error); // Pass error to Express error handler
    }
}
//getting a particular anime info 
exports.GetParticularAnimeInfo = async (req, res) => {
    const { name} = req.params;
    const url = `${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(name)}&limit=${encodeURIComponent(10)}`;
    try {
        const data = await fetchtheanimeinfo(url);
        res.json(data);
    }catch(error){
        throw new Error("cannot get the anime info");
        
    }
}
