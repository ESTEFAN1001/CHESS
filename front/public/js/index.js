// Game state variables
let gameHasStarted = false;
let gameOver = false;
let board = null;
let game = new Chess();

// DOM elements
const $status = $('#status');
const $pgn = $('#pgn');

/**
 * Initialize the chess game
*/
function initGame() {

    // Initialize the board with configuration
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: '/public/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('myBoard', config);

    // flip board if player is black
    if (playerColor === 'black') {
        board.flip();
    }

    // join the game room
    socket.emit('joinGame',
        {
            code: gameCode,
            color: playerColor,
            timeControl: timeControl,
            username: playerUsername
        });
    console.log('Game initialized', {
        color: playerColor,
        code: gameCode,
        timeControl: timeControl,
        username: playerUsername
    });
}

// Socket event handlers
socket.on('playersConnected', function (data) {
    console.log('Players connected:', data);
    $status.text(`Both players connected (${data.white} vs ${data.black}). Click Ready when you want to start!`);
    $('#readyButton').prop('disabled', false);
});

socket.on('bothPlayersReady', function () {
    console.log('Both players ready, game starting');
    gameHasStarted = true;
    $status.text(`Game started! ${playerColor === 'white' ? 'You play white' : 'You play black'} `);
    $('#readyButton').text('Game in progress').prop('disabled', true);
});

socket.on('move', function (moveData) {
    console.log('Received move:', moveData);

    if (moveData.color !== playerColor) {
        const move = {
            from: moveData.from,
            to: moveData.to,
            promotion: moveData.promotion || 'q' //default to queen if it's not specified.
        };
        game.move(move);
        board.position(game.fen());
        updateStatus();
    }
});

socket.on('gameOver', function (data) {
    gameOver = true;
    $status.text('Game Over').prop('disabled', true);
});