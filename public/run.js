export default function runGame(context, game, requestAnimationFrame, socket) {

    if (game.state.pong.running) {
        game.updateGameState()
        socket.emit("update-state", game.state)
    }

    renderScreen(context, game)

    if (game.state.pong.renderMenu) {
        renderMenu(context, game)
    }

    // Se o jogo não acabou, renderiza a tela
    if (!game.state.pong.over) {
        requestAnimationFrame(() => {
            runGame(context, game, requestAnimationFrame, socket)
        })
    } else if (game.state.pong.renderEndGame) {
        setTimeout(() => renderEndGame(context, game), 1000);
        game.state.pong.renderEndGame = false
        game.state.pong.over = false
        game.state.pong.renderMenu = true
        setTimeout(() => runGame(context, game, requestAnimationFrame, socket), 2000)
    }
}

function renderScreen(context, game) {
    // Clear the Canvas
    context.clearRect(0, 0, game.screen.width, game.screen.width.height)

    // Set the fill style (for the background)
    context.fillStyle = game.state.pong.color

    // Draw the background
    context.fillRect(0, 0, game.screen.width, game.screen.height)

    // Set the fill style to white (For the paddles and the ball)
    context.fillStyle = "#ffffff"

    // Draw the Player1
    context.fillRect(
        game.state.players.player1.x,
        game.state.players.player1.y,
        game.state.players.player1.width,
        game.state.players.player1.height
    )

    // Draw the Player2
    context.fillRect(
        game.state.players.player2.x,
        game.state.players.player2.y,
        game.state.players.player2.width,
        game.state.players.player2.height 
    )

    // Draw the Ball
    if (turnDelayIsOver(game)) {
        context.fillRect(
            game.state.ball.x,
            game.state.ball.y,
            game.state.ball.width,
            game.state.ball.height
        )
    }

    //Draw the net (Line in the middle)
    context.beginPath()
    context.setLineDash([7, 15])
    context.moveTo((game.screen.width / 2), game.screen.height - 140)
    context.lineTo((game.screen.width / 2), 140)
    context.lineWidth = 10
    context.strokeStyle = '#ffffff'
    context.stroke()

    // Set the default canvas font and align it to the center
    context.font = '100px Courier New'
    context.textAlign = 'center'

    // Draw the player1 score (left)
    context.fillText(
        game.state.players.player1.score.toString(),
        (game.screen.width / 2) - 300,
        200
    )

    // Draw the player2 score (right)
    context.fillText(
        game.state.players.player2.score.toString(),
        (game.screen.width / 2) + 300,
        200
    )

    // Change the font size for the center score text
    context.font = '30px Courier New'

    // Draw the winning score (center)
    context.fillText(
        'Round ' + (game.state.pong.round + 1),
        (game.screen.width / 2),
        35
    )

    // Change the font size for the center score value
    context.font = '40px Courier'

    // Draw the current round number
    context.fillText(
        game.state.pong.rounds[game.state.pong.round] ? game.state.pong.rounds[game.state.pong.round] : game.state.pong.rounds[game.state.pong.round - 1],
        (game.screen.width / 2),
        100
    )
}

function renderMenu(context, game) {
    // Change the canvas font size and color
    context.font = '50px Courier New';
    context.fillStyle = game.state.pong.color;

    // Draw the rectangle behind the 'Press any key to begin' text.
    context.fillRect(
        game.screen.width / 2 - 350,
        game.screen.height / 2 - 48,
        700,
        100
    );

    // Change the canvas color;
    context.fillStyle = '#ffffff';

    // Draw the 'press any key to begin' text
    context.fillText('Press any key to begin',
        game.screen.width / 2,
        game.screen.height / 2 + 15
    );
}

function renderEndGame(context, game) {

    const text = game.state.pong.winner === "player1" ? "Player1 Has Won" : "Player2 Has Won"

    // Change the canvas font size and color
    context.font = '45px Courier New'
    context.fillStyle = game.state.pong.color

    // Draw the rectangle behind the 'Press any key to begin' text.
    context.fillRect(
        game.screen.width / 2 - 350,
        game.screen.height / 2 - 48,
        700,
        100
    )

    // Change the canvas color;
    context.fillStyle = '#ffffff'

    // Draw the end game menu text ('Game Over' and 'Winner')
    context.fillText(text,
        game.screen.width / 2,
        game.screen.height / 2 + 15
    )
}

function turnDelayIsOver(game) {
    return ((new Date()).getTime() - game.state.pong.timer >= 1000);
}