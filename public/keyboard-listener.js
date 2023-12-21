export default function createKeyboardListener(document) {

    const state = {
        observers: [],
        playerId: null,
        socketId: null
    }

    function registerPlayerId(playerId, socketId) {
        state.playerId = playerId
        state.socketId = socketId
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction)
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command)
        }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    function handleKeyDown(event) {

        const keyPressed = event.key.toLowerCase()

        const command = {
            type: "move-player",
            playerId: state.playerId,
            socketId: state.socketId,
            keyPressed: keyPressed
        }

        notifyAll(command)

        //game.movePlayer(command)
    }

    function handleKeyUp() {
        //console.log("soltou")
    }

    return {
        registerPlayerId,
        subscribe
    }
}