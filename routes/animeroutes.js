// ./routes/my-router.js (Correct)
var express = require('express');
var router = express.Router();
var animeController=require('../controllers/animecontroller');
//making some ger req for feching the current season animes which in turn will be controlled by the animecontroller.js
router.get('/current-season',animeController.GetCurrentSeasonAnime);
//getting an anime for a specific year and season
router.get('/:year/:season',animeController.GetAnimeByYearAndSeason);
//single anime
router.get('/:name',animeController.GetParticularAnimeInfo);


module.exports = router;
