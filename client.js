const net = require('net')
const readline = require('readline/promises')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const clearLine = (dir) => {
    return new Promise((resolve, reject) => {
        process.stdout.clearLine(dir, () => {
            resolve()
        })
    })
}
const moveCoursed = (dx, dy) => {
    return new Promise((r) => {
        process.stdout.moveCursor(dx, dy, () => r())
    })
}


const socket = net.createConnection({ port: 3000, host: "127.0.0.1" }, async () => {
    console.log("We are connected!")
    const ask = async () => {
        const message = await rl.question("Enter a message >  ");
        await moveCoursed(0, -1)
        await clearLine(0)
        socket.write(message)

    }
    ask()
    socket.on("data", async (data) => {
        console.log()
        await moveCoursed(0, -1)
        await clearLine(0)
        console.log(data.toString("utf-8"))

        ask()
    })


})


socket.on('close', () => {
    console.log("server is down")
})
socket.on('end', () => {
    console.log("server is down")
})