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