var express = require('express');
var router = express.Router();
var animeController = require('../controllers/animecontroller');

// Root route for /anime/
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Anime API root' });
});

// --- CORRECTED ROUTE ORDER ---
// More specific routes MUST come before more general ones.

// 1. Route for getting the current season
router.get('/current-season', animeController.GetCurrentSeasonAnime);

// 2. Route for searching by name (Moved Up)
router.get('/search/:name', animeController.GetParticularAnimeInfo);

// 3. Route for getting by year and season (Moved Down)
router.get('/:year/:season', animeController.GetAnimeByYearAndSeason);


module.exports = router;
