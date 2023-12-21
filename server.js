import express from "express"
import http from "http"
import { Server } from "socket.io"
import createGame from "./public/game.js"

const app = express()
const server = http.createServer(app)
const sockets = new Server(server)

app.use(express.static("public"))

const game = createGame()

game.subscribe((command) => {
    sockets.emit(command.type, command)
})

sockets.on("connection", (socket) => {
    const socketid = socket.id
    game.addParticipant(socketid)
    socket.emit("setup", game.state)

    socket.on("disconnect", () => {
        // o que fazer quando o participante desconectar?
    })

    socket.on("move-player", (command) => {
        //command.playerId = game.getParticipant(socketid)
        //command.type = "move-player"

        game.movePlayer(command)
    })
})

server.listen(3000, () => {
    console.log(`> Server listening on port: 3000`)
})