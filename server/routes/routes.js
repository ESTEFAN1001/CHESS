const express = require("express");
const router = express.Router();

const games = {};

// set an automatic cleaner (every hour)
setInterval(() => {
    const now = Date.now();
    Object.keys(games).forEach(gameCode => {
        if (now - games[gameCode].created > 24 * 60 * 60 * 1000) {
            delete games[gameCode]
        }
    });
}, 60 * 60 * 1000); //1 hour

// post route to create a new game
router.post('/create', (req, res) => {
    const { gameCode, timeControl } = req.body;

    // validate code 
    if (!gameCode) {
        return res.status(400).json({
            success: false,
            message: "Game code is missing"
        })
    }

    // verify code is already used
    if (games[gameCode]) {
        return res.status(400).json({
            success: false,
            message: "Game code is already used"
        })
    }

    // create a new game 
    games[gameCode] = {
        timeControl: parseInt(timeControl) || 10,
        whitePlayer: req.session.userId,
        created: Date.now(),
        status: 'waiting',
        players: [],
        board
    };

    // response with succes
    res.json({
        success: true,
        message: 'Game created successfully',
        gameCode
    });
});
