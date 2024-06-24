const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const net = require('net')

if (process.argv.length < 4 || (process.argv.length - 4) % 3 !== 0) {
    console.log('Usage : node reconnector.js <host> <port> [<name1> <password1> <viewerPort1> ... <nameN> <passwordN> <viewerPortN>]')
    process.exit(1)
}

const host = process.argv[2]
const port = parseInt(process.argv[3])

const botConfigs = []
for (let i = 4; i < process.argv.length; i += 3) {
    botConfigs.push({
        username: process.argv[i],
        password: process.argv[i + 1],
        viewerPort: parseInt(process.argv[i + 2])
    })
}

function createBot(config) {
    return mineflayer.createBot({
        host: host,
        port: port,
        username: config.username,
        password: config.password
    })
}

function isPortAvailable(port, callback) {
    const server = net.createServer()
    server.once('error', err => {
        if (err.code === 'EADDRINUSE') {
            callback(false)
        } else {
            callback(true)
        }
    })
    server.once('listening', () => {
        server.close()
        callback(true)
    })
    server.listen(port)
}

function setupBot(config) {
    let bot = createBot(config)
    let connected = false
    let viewer = false
    let viewerServer = null

    bot.on('spawn', () => {
        console.log(`${config.username} SPAWNED`)
        if (!viewer) {
            console.log(`${config.username} no view`)
            const tryStartingViewer = (port) => {
                isPortAvailable(port, (available) => {
                    if (available) {
                        try {
                            viewerServer = mineflayerViewer(bot, { port: port, firstPerson: false })
                            bot.chat('/login chunkloaderk1')
                            bot.chat('/login chunkloaderk')
                            viewer = true
                            console.log(`${config.username} viewer started on port ${port}`)
                        } catch (err) {
                            console.log(`${config.username} Error starting viewer:`, err)
                        }
                    } else {
                        console.log(`${config.username} Port ${port} in use, trying next port`)
                        tryStartingViewer(port + 1)
                    }
                })
            }
            tryStartingViewer(config.viewerPort)
        }

        if (viewer) {
            bot.chat('/tp charonchikBaby')
            setInterval(() => {
                bot.chat('/login chunkloaderk')
                console.log(`${config.username} logIN `)
            }, 5000)

            bot.on("windowOpen", window => {
                if (connected) {
                    console.log(`${config.username} random_click`)
                    bot.clickWindow(3, 0, 0)
                    bot.clickWindow(2, 0, 0)
                }
                if (!connected) {
                    console.log(`${config.username} connect`)
                    bot.clickWindow(15, 0, 0)
                    connected = true
                }
            })
        }
    })

    bot.on('end', () => {
        console.log(`${config.username} Bot disconnected, reconnecting in 5 seconds...`)
        if (viewerServer) {
            viewerServer.close()
            viewerServer = null
        }
        setTimeout(() => {
            setupBot(config)
        }, 50000)
    })

    bot.on('error', err => {
        console.log(`${config.username} Error:`, err)
        console.log(`${config.username} Reconnecting in 5 seconds...`)
        if (viewerServer) {
            viewerServer.close()
            viewerServer = null
        }
        setTimeout(() => {
            setupBot(config)
        }, 50000)
    })
}

botConfigs.forEach(config => setupBot(config))
