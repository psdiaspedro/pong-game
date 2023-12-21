export default function renderScreen(context, game, requestAnimationFrame) {

    if (game.state.pong.running) {
        game.moveBall()
    }
    
    draw(context, game)

    // renderiza o menu se o jogo ainda nao começou
    if (game.state.pong.renderMenu) {
        renderMenu(context, game)
    }

    requestAnimationFrame(() => {
        renderScreen(canvas, game, requestAnimationFrame)
    })
}

// Draw elements on screen
function draw(context, game) {

    const { players, ball, pong, screen } = game.state;
    const { width, height } = screen;
    
    // Clear the Canvas
    context.clearRect(0, 0, width, height)

    // Set the fill style (for the background)
    context.fillStyle = pong.color

    // Draw the background
    context.fillRect(0, 0, width, height)

    // Set the fill style to white (For the paddles and the ball)
    context.fillStyle = "#ffffff"

    // Draw the Player1
    context.fillRect(
        players.player1.x,
        players.player1.y,
        players.player1.width,
        players.player1.height
    )

    // Draw the Player2
    context.fillRect(
        players.player2.x,
        players.player2.y,
        players.player2.width,
        players.player2.height 
    )

    // Draw the Ball
    if (turnDelayIsOver(game)) {
        context.fillRect(
            ball.x,
            ball.y,
            ball.width,
            ball.height
        )
    }

    // Draw the net (Line in the middle)
    context.beginPath()
    context.setLineDash([7, 15])
    context.moveTo((width / 2), height - 140)
    context.lineTo((width / 2), 140)
    context.lineWidth = 10
    context.strokeStyle = '#ffffff'
    context.stroke()

    // Set the default canvas font and align it to the center
    context.font = '100px Courier New'
    context.textAlign = 'center'

    // Draw the player1 score (left)
    context.fillText(
        players.player1.score.toString(),
        (width / 2) - 300,
        200
    )

    // Draw the player2 score (right)
    context.fillText(
        players.player2.score.toString(),
        (width / 2) + 300,
        200
    )

    // Change the font size for the center score text
    context.font = '30px Courier New'

    // Draw the winning score (center)
    context.fillText(
        'Round ' + (pong.round + 1),
        (width / 2),
        35
    )

    // Change the font size for the center score value
    context.font = '40px Courier'

    // Draw the current round number
    context.fillText(
        pong.rounds[pong.round] ? pong.rounds[pong.round] : pong.rounds[pong.round - 1],
        (width / 2),
        100
    )
}

function renderMenu(context, game) {

    const { pong, screen } = game.state;
    const { width, height } = screen;
    
    // Change the canvas font size and color
    context.font = '50px Courier New'
    context.fillStyle = pong.color

    // Draw the rectangle behind the 'Press any key to begin' text.
    context.fillRect(
        width / 2 - 350,
        height / 2 - 48,
        700,
        100
    );

    // Change the canvas color;
    context.fillStyle = '#ffffff'

    // Draw the 'press any key to begin' text
    context.fillText('Press any key to begin',
        width / 2,
        height / 2 + 15
    )
}

// function endGameMenu(canvas, context, game, requestAnimationFrame, text) {
    
//     // Change the canvas font size and color
//     context.font = '45px Courier New';
//     context.fillStyle = game.state.pong.color;

//     // Draw the rectangle behind the 'Press any key to begin' text.
//     context.fillRect(
//         game.screen.width / 2 - 350,
//         game.screen.height / 2 - 48,
//         700,
//         100
//     );

//     // Change the canvas color;
//     context.fillStyle = '#ffffff';

//     // Draw the end game menu text ('Game Over' and 'Winner')
//     context.fillText(text,
//         game.screen.width / 2,
//         game.screen.height / 2 + 15
//     );

//     //opcao de comecar de novo?
//     setTimeout(() => {
//         restartGame(game)

//         //se quiser um novo jogo (colocar opcao de um botao, sei la)
//         renderScreen(canvas, game, requestAnimationFrame)
//     }, 3000);
// }