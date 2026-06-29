const { move } = require("../routes/auth");

const games = {};

const players = {};

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('New client connected');

        // event when a player tries to join a game
        socket.on('joinGame', (data) => {
            const { code, color, timeControl, username } = data;
            console.log('Player ${username} joining game ${code} as ${color}');

            // if the game does not exist, create it with initial values
            if (!games[code]) {
                games[code] = {
                    white: null,
                    black: null,
                    timeControl: timeControl,
                    whiteReady: false,
                    blackReady: false,
                    gameStarted: false,
                    WhiteTime: timeControl * 60,
                    BlackTime: timeControl * 60,
                    turn: 'white',
                    moves: []
                };
            }

            // save the information about the player in the players object
            players[socket.id] = {
                username: username,
                gameCode: code,
                color: color
            };

            // players join the game room of Socket.io with the game code
            socket.join(code);

            // we assign the player to the game color
            if (color === 'white') {
                games[code].white = socket.id;
            } else if (color === 'black') {
                games[code].black = socket.id;
            }

            // if both players are connected we notify everyone in the game room
            if (games[code].white && games[code].black) {
                console.log('Both players are connected in game ${code}');

                io.to(code).emit('playersConnected', {
                    white: players[games[code].white].username,
                    black: players[games[code].black].username,

                });
            }
        });

        // event when a player shows that is ready to play
        socket.on('playerReady', () => {
            const player = players[socket.id];
            if (!player) return;

            const game = games[player.gameCode];
            if (!game) return;

            console.log('Player ${player.username} is ready');

            if (player.color === 'white') {
                game.whiteReady = true;
            } else if (player.color === 'black') {
                game.blackReady = true;
            }

            // if both players are ready and the game is not started, we start the game
            if (game.whiteReady && game.blackReady && !game.gameStarted) {
                console.log('Game ${player.gameCode} starting');
                game.gameStarted = true;
                io.to(player.gameCode).emit('bothPlayersReady');

                // initialize the timer for each player
                game.timer = setInterval(() => {
                    if (game.turn === 'white') {
                        game.WhiteTime--;
                    } else {
                        game.BlackTime--;
                    }

                    // notify all players about the new time
                    io.to(player.gameCode).emit('timeUpdate', {
                        white: game.WhiteTime,
                        black: game.BlackTime
                    });

                    //verify if a player has no time
                    if (game.whiteTime <= 0) {
                        clearInterval(game.timer);
                        io.to(player.gameCode).emit('gameOverTime', {
                            winnerUsername: players[game.black].username
                        });
                    } else if (game.blackTime <= 0) {
                        clearInterval(game.timer);
                        io.to(player.gameCode).emit('gameOverTime', {
                            winnerUsername: players[game.white].username
                        });
                    }
                }, 1000);
            }
        });
    });
};

