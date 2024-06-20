const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')

if (process.argv.length < 4 || process.argv.length > 6) {
    console.log('Usage : node reconnector.js <host> <port> [<name>] [<password>]')
    process.exit(1)
}

// Variable to store the view server instance
let viewerServer = null;
let viewerPort = 3007; // start port for viewer

function createBot() {
    const bot = mineflayer.createBot({
        host: process.argv[2],
        port: parseInt(process.argv[3]),
        username: process.argv[4] ? process.argv[4] : 'reconnector',
        password: process.argv[5]
    })

    return bot
}

function setupBot(bot) {
    let connected = false
    let viewer = false

    bot.on('spawn', () => {
        console.log("SPAWNED")
        if (!viewer) {
            console.log('noview')
            // Trying to create a view server
            try {
                viewerServer = mineflayerViewer(bot, { port: viewerPort, firstPerson: false }) // using viewerPort variable
                bot.chat('/speedrun')
                viewer = true
            } catch (err) {
                console.log('Error starting viewer:', err)
            }
        }

        if (viewer) {
            bot.chat('/tp charonchikBaby')
            setInterval(() => {
                bot.chat('/login chunkloaderk')
                console.log('logIN ')
            }, 50000)

            bot.on("windowOpen", window => {
                if (connected) {
                    console.log("random_click")
                    bot.clickWindow(3, 0, 0)
                    bot.clickWindow(2, 0, 0)
                }
                if (!connected) {
                    console.log("connect")
                    bot.clickWindow(15, 0, 0)
                    connected = true
                }

                //console.log(window)
            })
        }
    })

    // Bot disconnect event handler
    bot.on('end', () => {
        console.log('Bot disconnected, reconnecting in 5 seconds...')
        if (viewerServer) {
            // Closing the view server before reconnecting
            viewerServer.close()
            viewerServer = null
        }
        setTimeout(() => {
            // Increase the port by 1 to avoid conflict
            viewerPort += 1
            bot = createBot()
            setupBot(bot)
        }, 5000) // 5 seconds before reconnecting
    })

    // Bot error event handler
    bot.on('error', err => {
        console.log('Error:', err)
        console.log('Reconnecting in 5 seconds...')
        if (viewerServer) {
            // Closing the view server on error
            viewerServer.close()
            viewerServer = null
        }
        setTimeout(() => {
            // Increase the port by 1 to avoid conflict
            viewerPort += 1
            bot = createBot()
            setupBot(bot)
        }, 5000) // 5 seconds before reconnecting
    })
}

let bot = createBot()
setupBot(bot)
