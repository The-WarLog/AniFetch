var express = require('express');
var router = express.Router();
var animeController = require('../controllers/animecontroller');

// Root route for /anime
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Anime API root' });
});




router.get('/current-season', animeController.GetCurrentSeasonAnime);

router.get('/search/:name', animeController.GetParticularAnimeInfo);

router.get('/:year/:season', animeController.GetAnimeByYearAndSeason);



module.exports = router;
