/*
SINGLE SOURCE OF TRUTH
- Varios clients vao poder se conectar no servidor
- Mas Apenas o servidor contém as infos VERDADEIRAS
    - Ou seja, tudo relacionado ao jogo vai estar no servidor
        - Jogo inteiro
        - Posicoes
        - Chamadas pro database e etc
*/

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
        game.movePlayer(command)
    })

    socket.on("update-state", (state) => {
        game.setState(state)
    })
})

server.listen(3000, () => {
    console.log(`> Server listening on port: 3000`)
})