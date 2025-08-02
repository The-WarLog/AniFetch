const axios = require("axios");

const JIKAN_API_BASE_URL = process.env.JIKAN_API_BASE_URL || 'https://api.jikan.moe/v4';

const mapAnimeData = (item) => ({
    title: item.title,
    titleEnglish: item.title_english,
    malScore: item.score,
    status: item.status,
    rating: item.rating,
    airDate: item.aired?.from ? new Date(item.aired.from).toUTCString() : null,
    broadcast: item.broadcast ? `${item.broadcast.day} at ${item.broadcast.time} (${item.broadcast.timezone})` : null
});

const fetchFromJikan = async (url) => {
    try {
        console.log(`Fetching from Jikan API: ${url}`);
        const axiosResponse = await axios.get(url);
        return axiosResponse.data;
    } catch (error) {
        console.error(`Error fetching data from Jikan API: ${error.message}`);
        if (error.response) {
            console.error('Jikan API Response:', error.response.data);
        }
        throw error;
    }
};

// Helper to add optional query parameters to a URL
const buildUrl = (baseUrl, params) => {
    const url = new URL(baseUrl);
    for (const key in params) {
        if (params[key]) { // Add param if it has a value
            url.searchParams.append(key, params[key]);
        }
    }
    console.log(url.toString());
    
    return url.toString();
};

const allowedRatings = ['g', 'pg', 'pg13', 'r17', 'r', 'rx'];

exports.GetCurrentSeasonAnime = async (req, res, next) => {
    const { page = 1, limit = 25, rating } = req.query;
    
    try {
        const url = buildUrl(`${JIKAN_API_BASE_URL}/seasons/now`, {
            page,
            limit: limit > 25 ? 25 : limit,
            rating: allowedRatings.includes(rating) ? rating : null
        });
        const result = await fetchFromJikan(url);
        res.json({
            data: result.data.map(mapAnimeData),
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

exports.GetAnimeByYearAndSeason = async (req, res, next) => {
    const { year, season } = req.params;
    const { page = 1, limit = 25, rating } = req.query;

    try {
        const url = buildUrl(`${JIKAN_API_BASE_URL}/seasons/${year}/${season}`, {
            page,
            limit: limit > 25 ? 25 : limit,
            rating: allowedRatings.includes(rating) ? rating : null
        });
        const result = await fetchFromJikan(url);
        res.json({
            data: result.data.map(mapAnimeData),
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

exports.GetParticularAnimeInfo = async (req, res, next) => {
    const { name } = req.params;
    const { page = 1, limit = 25, rating } = req.query;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Anime name for search is required.' });
    }

    try {
        const url = buildUrl(`${JIKAN_API_BASE_URL}/anime`, {
            q: name,
            page,
            limit,
            rating: allowedRatings.includes(rating) ? rating : null
        });
        const result = await fetchFromJikan(url);
        
        const lowerCaseName = name.toLowerCase();
        const filteredData = result.data.filter(item => {
            const title = (item.title || '').toLowerCase();
            const titleEnglish = (item.title_english || '').toLowerCase();
            return title.includes(lowerCaseName) || titleEnglish.includes(lowerCaseName);
        });

        if (filteredData.length === 0) {
            return res.status(404).json({ success: false, message: `No relevant anime found matching "${name}".` });
        }
        
        res.json({
            data: filteredData.map(mapAnimeData)
        });

    } catch (error) {
        next(error);
    }
};
