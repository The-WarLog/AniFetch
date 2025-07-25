const axios = require("axios");

// Ensure JIKAN_API_BASE_URL is loaded from .env, with a fallback
const JIKAN_API_BASE_URL = process.env.JIKAN_API_BASE_URL || 'https://api.jikan.moe/v4';

/**
 * Maps the raw Jikan API item to our desired format.
 */
const mapAnimeData = (item) => ({
    title: item.title,
    titleEnglish: item.title_english,
    malScore: item.score,
    status: item.status,
    rating: item.rating,
    airDate: item.aired?.from ? new Date(item.aired.from).toUTCString() : null,
    broadcast: item.broadcast ? `${item.broadcast.day} at ${item.broadcast.time} (${item.broadcast.timezone})` : null
});

/**
 * Fetches data from the Jikan API and returns it in a structured format.
 * @param {string} url - The Jikan API URL to fetch.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of items per page.
 * @returns {Promise<object>} - A promise that resolves to the structured data.
 */
const fetchFromJikan = async (url, page = 1, limit = 25) => {
    try {
        const fullUrl = new URL(url);
        fullUrl.searchParams.append('page', page);
        fullUrl.searchParams.append('limit', limit);

        console.log(`Fetching from Jikan API: ${fullUrl.toString()}`);

        const axiosResponse = await axios.get(fullUrl.toString());
        const animeList = axiosResponse.data.data;
        const pagination = axiosResponse.data.pagination;

        return {
            data: animeList, // Return raw data for now, will be mapped later
            pagination
        };
    } catch (error) {
        console.error(`Error fetching data from Jikan API: ${error.message}`);
        if (error.response) {
            console.error('Jikan API Response:', error.response.data);
        }
        throw error; // Re-throw to be handled by the Express error handler
    }
};

// Controller for getting the current season's anime
exports.GetCurrentSeasonAnime = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 25;
    if (limit > 25) limit = 25;

    try {
        const url = `${JIKAN_API_BASE_URL}/seasons/now`;
        const result = await fetchFromJikan(url, page, limit);
        res.json({
            data: result.data.map(mapAnimeData),
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// Controller for getting anime by year and season
exports.GetAnimeByYearAndSeason = async (req, res, next) => {
    const { year, season } = req.params;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 25;
    if (limit > 25) limit = 25;

    if (!year || isNaN(parseInt(year))) {
        return res.status(400).json({ success: false, message: 'Invalid or missing year.' });
    }
    const validSeasons = ['spring', 'summer', 'fall', 'winter'];
    if (!season || !validSeasons.includes(season.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid or missing season.' });
    }

    try {
        const url = `${JIKAN_API_BASE_URL}/seasons/${year}/${season}`;
        const result = await fetchFromJikan(url, page, limit);
        res.json({
            data: result.data.map(mapAnimeData),
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// Controller for searching for a particular anime by name
exports.GetParticularAnimeInfo = async (req, res, next) => {
    const { name } = req.params;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 25; // Fetch more to have enough to filter from
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Anime name for search is required.' });
    }

    try {
        const url = `${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(name)}`;
        const result = await fetchFromJikan(url, page, limit);

        // --- THIS IS THE FIX ---
        // Filter the results to only include relevant anime
        const lowerCaseName = name.toLowerCase();
        const filteredData = result.data.filter(item => {
            const title = (item.title || '').toLowerCase();
            const titleEnglish = (item.title_english || '').toLowerCase();
            // Keep the item if its title or English title includes the search term
            return title.includes(lowerCaseName) || titleEnglish.includes(lowerCaseName);
        });

        if (filteredData.length === 0) {
            return res.status(404).json({ success: false, message: `No relevant anime found matching "${name}".` });
        }
        
        // Map the *filtered* data to our desired format
        res.json({
            data: filteredData.map(mapAnimeData),
            // Note: Pagination from Jikan might be misleading now, as we've filtered items.
            // For simplicity, we'll omit it for search results.
        });

    } catch (error) {
        next(error);
    }
};
