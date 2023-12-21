// funcao que vai renderizar as infos na tela
export default function renderScreen(canvas, game, requestAnimationFrame) {

    const context = canvas.getContext('2d')

    // update players state only if game is running
    if (game.state.pong.running) {
        updateState(canvas, context, game, requestAnimationFrame)
    }

    //draw objects on screen
    draw(context, game)
    
    // renderiza o menu se o jogo ainda nao começou
    if (game.state.pong.renderMenu) {
        renderMenu(context, game)
    }

    if (!game.state.pong.over) {
        requestAnimationFrame(() => {
            renderScreen(canvas, game, requestAnimationFrame)
        })
    }
}

// funcao que vai desenhar as infos na tela
function draw(context, game) {
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

    // Draw the net (Line in the middle)
    // context.beginPath();
    // context.setLineDash([7, 15]);
    // context.moveTo((game.screen.width / 2), game.screen.height - 140);
    // context.lineTo((game.screen.width / 2), 140);
    // context.lineWidth = 10;
    // context.strokeStyle = '#ffffff';
    // context.stroke();

    // Set the default canvas font and align it to the center
    context.font = '100px Courier New';
    context.textAlign = 'center';

    // Draw the player1 score (left)
    context.fillText(
        game.state.players.player1.score.toString(),
        (game.screen.width / 2) - 300,
        200
    );

    // Draw the player2 score (right)
    context.fillText(
        game.state.players.player2.score.toString(),
        (game.screen.width / 2) + 300,
        200
    );

    // Change the font size for the center score text
    context.font = '30px Courier New';

    // Draw the winning score (center)
    context.fillText(
        'Round ' + (game.state.pong.round + 1),
        (game.screen.width / 2),
        35
    );

    // Change the font size for the center score value
    context.font = '40px Courier';

    // Draw the current round number
    context.fillText(
        game.state.pong.rounds[game.state.pong.round] ? game.state.pong.rounds[game.state.pong.round] : game.state.pong.rounds[game.state.pong.round - 1],
        (game.screen.width / 2),
        100
    );
}

function updateState(canvas, context, game, requestAnimationFrame) {
    const player1 = game.state.players.player1
    const player2 = game.state.players.player2
    const ball = game.state.ball
    
    if (!game.state.pong.over) {
        
        // If the ball collides with the bound limits - correct the x and y coords.
        if (ball.x <= 0) {
            resetTurn(game, player2, player1)
        }
        
        if (ball.x >= game.screen.width - ball.width) {
            resetTurn(game, player1, player2)
        } 
        
        if (ball.y <= 0) {
            ball.moveY = game.DIRECTION.DOWN
        }
        
        if (ball.y >= game.screen.height - ball.height) {
            ball.moveY = game.DIRECTION.UP
        } 

        // Move player1 if they player1.move value was updated by a keyboard event
        if (player1.move === game.DIRECTION.UP) {
            player1.y -= player1.speed
        } else if (player1.move === game.DIRECTION.DOWN) {
            player1.y += player1.speed
        }

        // Move player2 if they player1.move value was updated by a keyboard event
        if (player2.move === game.DIRECTION.UP) {
            player2.y -= player2.speed
        } else if (player2.move === game.DIRECTION.DOWN) {
            player2.y += player2.speed
        }
        
        
        // On new serve (start of each turn) move the ball to the correct side
        // and randomize the direction to add some challenge.
        if (turnDelayIsOver(game) && game.state.pong.turn) {
            ball.moveX = game.state.pong.turn === player1 ? game.DIRECTION.LEFT : game.DIRECTION.RIGHT
            // ball.moveY = [game.DIRECTION.UP, game.DIRECTION.DOWN][Math.round(Math.random())]
            ball.moveY = game.DIRECTION.UP
            //ball.y = Math.floor(Math.random() * game.screen.height - 200) + 200
            ball.y = (game.screen.height - 200) + 200
            game.state.pong.turn = null
        }
        
        // If the player collides with the bound limits, update the x and y coords.
        if (player1.y <= 0) {
            player1.y = 0
        } else if (player1.y >= (game.screen.height - player1.height)) {
            player1.y = (game.screen.height - player1.height)
        }
        

        // Handle player2 wall collision
        if (player2.y >= game.screen.height - player2.height) {
            player2.y = game.screen.height - player2.height
        } else if (player2.y <= 0) {
            player2.y = 0
        }
        
        
        // Handle Player1-Ball collisions
        if (ball.x - ball.width <= player1.x && ball.x >= player1.x - player1.width) {
            if (ball.y <= player1.y + player1.height && ball.y + ball.height >= player1.y) {
                ball.x = (player1.x + ball.width);
                ball.moveX = game.DIRECTION.RIGHT;
                
            }
        }
        
        // Handle player2-ball collision
        if (ball.x - ball.width <= player2.x && ball.x >= player2.x - player2.width) {
            if (ball.y <= player2.y + player2.height && ball.y + ball.height >= player2.y) {
                ball.x = (player2.x - ball.width)
                ball.moveX = game.DIRECTION.LEFT
                
            }
        }

        // Handle Player1-Ball collisions
        if (isCollision(ball, player1)) {
            ball.x = player1.x + player1.width;
            ball.moveX = game.DIRECTION.RIGHT;
        }

        // Handle player2-ball collision
        if (isCollision(ball, player2)) {
            ball.x = player2.x - ball.width;
            ball.moveX = game.DIRECTION.LEFT;
        }

        // Move ball in intended direction based on moveY and moveX values
        if (ball.moveY === game.DIRECTION.UP) {
            ball.y -= (ball.speed / 1.5)
        } else if (ball.moveY === game.DIRECTION.DOWN) {
            ball.y += (ball.speed / 1.5)
        }
        if (ball.moveX === game.DIRECTION.LEFT) {
            ball.x -= ball.speed
        }
        else if (ball.moveX === game.DIRECTION.RIGHT) {
            ball.x += ball.speed;
        }
    }
    
    // Handle the end of round transition
    // Check to see if the player1 won the round.
    if (player1.score === game.state.pong.rounds[game.state.pong.round]) {
        // Check to see if there are any more rounds/levels left and display the victory screen if
        // there are not.
        if (!game.state.pong.rounds[game.state.pong.round + 1]) {
            game.state.pong.over = true;
            setTimeout(() => endGameMenu(canvas, context, game, requestAnimationFrame, 'Winner!'), 1000);
        } else {
            // If there is another round, reset all the values and increment the round number.
            game.state.pong.color = generateRoundColor(game);
            player1.score = player2.score = 0;
            player1.speed += 0.5;
            player2.speed += 1;
            ball.speed += 1;
            game.state.pong.round += 1;
        }
    }
    // Check to see if the player2 has won the round.
    else if (player2.score === game.state.pong.rounds[game.state.pong.round]) {
        game.state.pong.over = true;
        setTimeout(() => endGameMenu(canvas, context, game, requestAnimationFrame, 'Game Over!'), 1000);
    }
}

function isCollision(ball, player) {
    return (
        ball.x - ball.width <= player.x &&
        ball.x >= player.x - player.width &&
        ball.y <= player.y + player.height &&
        ball.y + ball.height >= player.y
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

// Reset the ball location, the player turns and set a delay before the next round begins.
function resetTurn(game, winner, looser) {
    game.state.ball = {
        width: 18,
        height: 18,
        x: (game.screen.width / 2) - 9,
        y: (game.screen.height / 2) - 9,
        moveX: game.DIRECTION.IDLE,
        moveY: game.DIRECTION.IDLE,
        speed: 7 
    };
    game.state.pong.turn = looser;
    game.state.pong.timer = (new Date()).getTime();

    winner.score++;
}

// Wait for a delay to have passed after each turn.
function turnDelayIsOver(game) {
    return ((new Date()).getTime() - game.state.pong.timer >= 1000);
}

// Select a random color as the background of each level/round.
function generateRoundColor (game) {
    const colors = game.state.pong.colors
    const currentColor = game.state.pong.color

    var newColor 
    do {
        newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (newColor === currentColor)
    
    return newColor;
}

function endGameMenu(canvas, context, game, requestAnimationFrame, text) {
    // Change the canvas font size and color
    context.font = '45px Courier New';
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

    // Draw the end game menu text ('Game Over' and 'Winner')
    context.fillText(text,
        game.screen.width / 2,
        game.screen.height / 2 + 15
    );

    //opcao de comecar de novo?
    setTimeout(() => {
        restartGame(game)

        //se quiser um novo jogo (colocar opcao de um botao, sei la)
        renderScreen(canvas, game, requestAnimationFrame)
    }, 3000);
}

function restartGame(game) {
    game.state.pong.running = false
    game.state.pong.over = false
    game.state.pong.renderMenu = true
    game.state.pong.turn = {
        width: 18,
        height: 180,
        x: screen.width - 150,
        y: (screen.height / 2) - 35,
        score: 0,
        move: game.DIRECTION.IDLE,
        speed: 8
    }
    game.state.pong.timer = 0
    game.state.pong.round = 0

    //player1
    game.state.players.player1.x = 150
    game.state.players.player1.y = (game.screen.height / 2) - 35
    game.state.players.player1.score = 0
    game.state.players.player1.move = game.DIRECTION.IDLE

    //player1
    game.state.players.player2.x = game.screen.width - 150
    game.state.players.player2.y = (game.screen.height / 2) - 35
    game.state.players.player2.score = 0
    game.state.players.player2.move = game.DIRECTION.IDLE

    //ball
    game.state.ball.x = (game.screen.width / 2) - 9
    game.state.ball.y = (game.screen.height / 2) - 9
    game.state.ball.moveX = game.DIRECTION.IDLE
    game.state.ball.moveY = game.DIRECTION.IDLE
}