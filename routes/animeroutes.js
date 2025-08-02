var express = require('express');
var router = express.Router();
var animeController = require('../controllers/animecontroller');

// Root route for /anime/
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Anime API root' });
});

// More specific routes first to avoid overlap
router.get('/current-season', animeController.GetCurrentSeasonAnime);
router.get('/:year/:season', animeController.GetAnimeByYearAndSeason);
router.get('/search/:name', animeController.GetParticularAnimeInfo);

module.exports = router;
