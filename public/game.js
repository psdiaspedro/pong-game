export default function createGame() {

    // colocar o state aqui dentro
    const DIRECTION = {
        IDLE: 0,
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    }

    const screen  = {
        width: 1400,
        height: 1000
    }
    
    const state = {
        pong: {
            running: false,
            over: false,
            renderMenu: true,
            renderEndGame: false,
            winner: null,
            looser: null,
            turn: {
                width: 18,
                height: 180,
                x: screen.width - 150,
                y: (screen.height / 2) - 35,
                score: 0,
                move: DIRECTION.IDLE,
                speed: 8
            },
            timer: 0,
            round: 0,
            rounds: [2],
            color: "#8c52ff",
            colors: ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6']
        },
        players: {
            "player1": {
                id: "player1",
                socketid: "",
                width: 18,
                height: 180,
                x: 150,
                y: (screen.height / 2) - 35,
                score: 0,
                move: DIRECTION.IDLE,
                speed: 8
            },
            "player2": {
                id: "player2",
                socketid: "",
                width: 18,
                height: 180,
                x: screen.width - 150,
                y: (screen.height / 2) - 35,
                score: 0,
                move: DIRECTION.IDLE,
                speed: 8
            }
        },
        ball: {
            width: 18,
            height: 18,
            x: (screen.width / 2) - 9,
            y: (screen.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: 7 
        },
        spectators: [
            {
                socketid: "spec1"

            }
        ]
    }

    const observers = []

    function subscribe(observerFunction) {
        observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command)
        }
    }

    function setState(newState) {
        Object.assign(state, newState)
    }

    function updateGameState() {
        const pong = state.pong
        const player1 = state.players.player1
        const player2 = state.players.player2
        const ball = state.ball
        
        if (!pong.over) {
            
            // Verifica se foi ponto
            if (ball.x <= 0) {
                resetTurn(player2, player1)
            }
            if (ball.x >= screen.width - ball.width) {
                resetTurn(player1, player2)
            } 
            
            if (ball.y <= 0) {
                ball.moveY = DIRECTION.DOWN
            }
            
            if (ball.y >= screen.height - ball.height) {
                ball.moveY = DIRECTION.UP
            }
          
            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (turnDelayIsOver() && pong.turn) {
                ball.moveX = pong.turn === player1 ? DIRECTION.LEFT : DIRECTION.RIGHT
                // ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())]
                //ball.y = Math.floor(Math.random() * screen.height - 200) + 200
                ball.moveY = DIRECTION.UP
                ball.y = (screen.height - 200) + 200
                pong.turn = null
            }
            
            // Handle Player1-Ball collisions
            if (isCollision(ball, player1)) {
                ball.x = player1.x + player1.width;
                ball.moveX = DIRECTION.RIGHT;
            }
    
            // Handle player2-ball collision
            if (isCollision(ball, player2)) {
                ball.x = player2.x - ball.width;
                ball.moveX = DIRECTION.LEFT;
            }
    
            // Move ball in intended direction based on moveY and moveX values
            if (ball.moveY === DIRECTION.UP) {
                ball.y -= (ball.speed / 1.5)
            } else if (ball.moveY === DIRECTION.DOWN) {
                ball.y += (ball.speed / 1.5)
            }
            if (ball.moveX === DIRECTION.LEFT) {
                ball.x -= ball.speed
            }
            else if (ball.moveX === DIRECTION.RIGHT) {
                ball.x += ball.speed;
            }
        }
        
        // Handle the end of round transition
        // Check to see if the player1 won the round.
        if (player1.score === pong.rounds[pong.round]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            if (!pong.rounds[pong.round + 1]) {
                pong.winner = "player1"
                pong.looser = "player2"
                
                restartGame()
            } else {
                // If there is another round, reset all the values and increment the round number.
                pong.color = generateRoundColor(game);
                player1.score = player2.score = 0;
                pong.round += 1
            }
        } else if (player2.score === pong.rounds[pong.round]) {
            if (!pong.rounds[pong.round + 1]) {
                pong.winner = "player2"
                pong.looser = "player1"
                
                restartGame()
            } else {
                // If there is another round, reset all the values and increment the round number.
                pong.color = generateRoundColor(game);
                player1.score = player2.score = 0;
                pong.round += 1
            }
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

    // Reset the ball location, the player turns and set a delay before the next round begins.
    function resetTurn(winner, looser) {
        state.ball = {
            width: 18,
            height: 18,
            x: (screen.width / 2) - 9,
            y: (screen.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: 7 
        }
        state.pong.turn = looser
        state.pong.timer = (new Date()).getTime()

        winner.score++
    }

    // Wait for a delay to have passed after each turn.
    function turnDelayIsOver() {
        return ((new Date()).getTime() - state.pong.timer >= 1000);
    }

    // Select a random color as the background of each level/round.
    function generateRoundColor (game) {
        const colors = state.pong.colors
        const currentColor = state.pong.color

        var newColor 
        do {
            newColor = colors[Math.floor(Math.random() * colors.length)];
        } while (newColor === currentColor)
        
        return newColor;
    }

    function restartGame() {
        state.pong.running = false
        state.pong.over = true
        state.pong.renderEndGame = true
        state.pong.turn = {
            width: 18,
            height: 180,
            x: screen.width - 150,
            y: (screen.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        }
        state.pong.timer = 0
        state.pong.round = 0

        //player1
        state.players.player1.x = 150
        state.players.player1.y = (screen.height / 2) - 35
        state.players.player1.score = 0
        state.players.player1.move = DIRECTION.IDLE

        //player1
        state.players.player2.x = screen.width - 150
        state.players.player2.y = (screen.height / 2) - 35
        state.players.player2.score = 0
        state.players.player2.move = DIRECTION.IDLE

        //ball
        state.ball.x = (screen.width / 2) - 9
        state.ball.y = (screen.height / 2) - 9
        state.ball.moveX = DIRECTION.IDLE
        state.ball.moveY = DIRECTION.IDLE
    }

    function addParticipant(socketid) {
        const players = state.players
        const spectators = state.spectators
        let participant = ""

        if (players.player1.socketid === "") {
            players.player1.socketid = socketid
            participant = "player1"
        } else if (players.player2.socketid === "") {
            players.player2.socketid = socketid
            participant = "player2"
        } else {
            spectators.push({socketid: socketid})
            participant = "spec"
        }

        notifyAll({
            type: "add-participant",
            participantType: participant,
            socketid: socketid
        })
    }

    function getParticipant(socketid) {
        const players = state.players
        
        if (players.player1.socketid === socketid) {
            return "player1"
        } else if (players.player2.socketid === socketid) {
            return "player2"
        } else {
            return "spec"
        }
    }

    function removeParticipant() {
        notifyAll({
            type: "remove-participant",
        })
    }

    function movePlayer(command) {
        notifyAll(command)

        const acceptedMoves = {
            arrowup(player) {
                move(player, DIRECTION.UP)
            },
            w(player) {
                move(player, DIRECTION.UP)
            },
            arrowdown(player){
                move(player, DIRECTION.DOWN)
            },
            s(player) {
                move(player, DIRECTION.DOWN)
            }
        }

        const keyPressed = command.keyPressed
        const player = state.players[command.playerId]
        const moveFunction = acceptedMoves[keyPressed]

        if (!state.pong.over) {
            moveFunction(player)
        }
        
        // player && moveFunction
        if (player && moveFunction) {
            // se o jogo ainda nao comecou, altera essas infos
            if (state.pong.running === false) {
                state.pong.running = true
                state.pong.renderMenu = false
            }

            moveFunction(player)
        }
    }

    function move(player, direction) {

        // Atualiza a posição vertical do jogador com base na direção e velocidade
        player.y += direction === DIRECTION.UP ? -player.speed : player.speed;

        // Garante que o jogador não ultrapasse os limites da tela
        player.y = Math.max(0, Math.min(screen.height - player.height, player.y));
    }

    return {
        DIRECTION,
        screen,
        state,
        subscribe,
        setState,
        updateGameState,
        addParticipant,
        getParticipant,
        movePlayer
    }
}