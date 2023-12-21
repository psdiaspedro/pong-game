export default function createGame() {

    // colocar o state aqui dentro
    const DIRECTION = {
        IDLE: 0,
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4
    };

    const screen  = {
        width: 1400,
        height: 1000
    }
    
    const state = {
        pong: {
            running: false,
            over: false,
            renderMenu: true,
            turn: {
                width: 18,
                height: 180,
                x: screen.width - 150,
                y: (screen.height / 2) - 35,
                score: 0,
                move: DIRECTION.IDLE,
                speed: 6
            },
            timer: 0,
            round: 0,
            rounds: [10],
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
                speed: 6
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
                speed: 6
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
                player.move = DIRECTION.UP
            },
            w(player) {
                acceptedMoves.arrowup(player)
            },
            arrowdown(player){
                player.move = DIRECTION.DOWN
            },
            s(player) {
                acceptedMoves.arrowdown(player)
            }
        }

        const keyPressed = command.keyPressed
        const player = state.players[command.playerId]
        const moveFunction = acceptedMoves[keyPressed]
        
        // player && moveFunction
        if (player && moveFunction) {
            // se o jogo ainda nao comecou, altera essas infos
            if (state.pong.running === false) {
                state.pong.running = true;
                state.pong.renderMenu = false;
            }

            moveFunction(player)
        }
    }

    return {
        DIRECTION,
        screen,
        state,
        subscribe,
        setState,
        addParticipant,
        getParticipant,
        movePlayer
    }
}