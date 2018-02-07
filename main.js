var Chroma = require('razerchroma');
const electron = require('electron');
const {Menu, Tray} = require('electron');
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;
const autoUpdater = require("electron-updater").autoUpdater;
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info"
const path = require('path');
var fs = require('fs');
const WindowsToaster = require('node-notifier').WindowsToaster;
var log = require('electron-log');
var shell = require('electron').shell;
const {ipcMain} = require('electron');
const {session} = require('electron');
const Discord = require('discord.js');
let client = null;


let authWindow = null;
let token = null;
let win = null;
let loginwin;
let tray = null;
var debugerror = 0;
var error1 = 0;
var warn1 = 0;
var urError = 0;
var ECONNRESET = 0;
var token1 = null;
var color_var = 16777215;


//initiate log.txt
log.transports.file.appName = 'DiscordChroma';
log.transports.file.level = 'info';
log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';
log.transports.file.maxSize = 5 * 1024 * 1024;
log.transports.file.file = __dirname + '/log.txt';
log.transports.file.streamConfig = { flags: 'w' };
log.transports.file.stream = fs.createWriteStream('log.txt');


//chroma app info
const application = {
    "title": "DiscordChroma (beta)",
    "description": "Discord integration for razer chroma keyboards",
    "author": {
        "name": "DELUUXE",
        "contact": "www.deluuxe.nl"
    },
    "device_supported": ["keyboard"],
    "category": "application"
};


// ------------------------------------ custom light fuctions ----------------------------------- \\

const no_effect = {
    "effect": "CHROMA_STATIC",
    "param": {
        "color": 0
    }
};

const static_white = {
    "effect": "CHROMA_STATIC",
    "param": {
        "color": 99999999
    }
};

// 16777215 white



// ------------------------------------ start program ----------------------------------- \\

//when the program is succesfully started
app.on('ready', function () {
    //force single instance
    var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
        // Someone tried to run a second instance.
    });
    if (shouldQuit) {
        let alreadyrunningwin = new BrowserWindow({width: 1000, height: 600, frame: false});
        alreadyrunningwin.loadURL(path.join('file://', __dirname, '/alreadyrunning.html'));
        log.info('DiscordChroma was already running.');
        setTimeout(function() {
            app.quit();
            return;
        }, 5000);
    } else {
        log.info("checking for updates");
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.on('update-downloaded', () => {
        let updatewin = new BrowserWindow({width: 1000, height: 600, frame: false});
        updatewin.loadURL(path.join('file://', __dirname, '/update.html'));
        log.info("updated downloaded");
        setTimeout(function() {
            log.info("restarting to install update");
            autoUpdater.quitAndInstall();
        }, 4000);
        });
        log.info("starting DiscordChroma");
        //show splash/loading screen
        win = new BrowserWindow({width: 1000, height: 600, frame: false});
        win.loadURL(path.join('file://', __dirname, '/main.html'));
        //makes tray icon for closing and managing the program
        tray = new Tray(path.join(__dirname, '/img/icon.ico'));
        const contextMenu = Menu.buildFromTemplate([
            {label: 'Close'},
        ]);
        tray.setToolTip('DiscordChroma (click to close)');
        //tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            let settingswin = new BrowserWindow({width: 1000, height: 600, frame: false, resizable: false});
            settingswin.loadURL(path.join('file://', __dirname, '/settings.html'));
        });
        //start login process
        
        setTimeout(function() {
            win.hide();
            authenticateDiscord();
        }, 6000);
    }
});


function login() {
    if(client) client.destroy();
    client = new Discord.Client();

    client.on('ready', () => {
        log.info(`Logged in as ` + client.user.tag);
        var notifier = new WindowsToaster({
            withFallback: false, // Fallback to Growl or Balloons?
        });
        notifier.notify(
            {
                title: 'DiscordChroma is running in the background',
                message: 'To open the main menu click here or on the tray icon in the taskbar',
                icon: "https://i.imgur.com/fRpCwBf.png",
                sound: true, // Bool | String (as defined by http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx)
                wait: true, // Bool. Wait for User Action against Notification or times out
                appID: "com.deluuxe.DiscordChroma",
            },
            function(error, response) {
                log.info(response);
                if (response == "the user clicked on the toast.") {
                    let settingswin = new BrowserWindow({width: 1000, height: 600, frame: false, resizable: false});
                    settingswin.loadURL(path.join('file://', __dirname, '/settings.html'));
                }
            }
        );  
    });

    //when you receive a message
    client.on('message', message => {
        if(message.channel.type == "text"){
            if(message.guild.muted == false){
                if(message.channel.muted == false){
                    if(message.author.id != client.user.id){
                        //do only when it's a message from a non-muted server and not from yourself
                        log.info('NEW MESSAGE, in ' + message.guild.name + ".");
                        let chroma;
                        Chroma.initialize(application)
                        .then(config =>{
                            chroma = new Chroma(config)
                        })
                        .then(() => chroma.set({
                            device: 'keyboard',
                            body: static_white
                        }))
                        .then(() => setTimeout(function() {
                            chroma.set({
                                device: 'keyboard',
                                body: no_effect
                            });
                            setTimeout(function() {
                                chroma.set({
                                    device: 'keyboard',
                                    body: static_white
                                });
                                setTimeout(function() {
                                    chroma.cleanup();
                                }, 150);
                            }, 150);
                        }, 150));
                    }
                }
            }
        } else if(message.channel.type == "dm" || message.channel.type == "group"){
            if(message.author.id != client.user.id){
                //do only when it's a message from DM or GroupDM and if it's not from yourself
                log.info('NEW MESSAGE');
                let chroma;
                Chroma.initialize(application)
                .then(config =>{
                    chroma = new Chroma(config)
                })
                .then(() => chroma.set({
                    device: 'keyboard',
                    body: static_white
                }))
                .then(() => setTimeout(function() {
                    chroma.set({
                        device: 'keyboard',
                        body: no_effect
                    });
                    setTimeout(function() {
                        chroma.set({
                            device: 'keyboard',
                            body: static_white
                        });
                        setTimeout(function() {
                            chroma.cleanup();
                        }, 150);
                    }, 150);
                }, 150));
            }
        }
    });

        // ---------------------------------- discord.js ERROR section --------------------------------- \\
    client.on('error', err => {
        error1 = error1 + 1;
        if (error1 == 1) {
            log.info("There has been an error!");
            log.error(err);
            //show succesfully started window
            let errorwin = new BrowserWindow({width: 1000, height: 600, frame: false});
            errorwin.loadURL(path.join('file://', __dirname, '/error.html'));
            errorwin.on('closed', function () {
                app.exit();
            });
        }
    });


    client.on('warn', () => {
        warn1 = warn1 + 1;
        if (warn1 == 1) {
            log.warn("There has been a warning/error!");
            //show succesfully started window
            let errorwin = new BrowserWindow({width: 1000, height: 600, frame: false});
            errorwin.loadURL(path.join('file://', __dirname, '/error.html'));
            errorwin.on('closed', function () {
                app.exit();
            });
        }
    });
    // ---------------------------------------- END discord.js ERROR section -------------------------------- \\

    client.login(token);
}


function authenticateDiscord() {

    const filter = {
      urls: ['https://discordapp.com/api/*']
    }
    authWindow = new BrowserWindow({width: 1000, height: 600, frame:false, show: false, webPreferences: { nodeIntegration: false }})
    authWindow.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      //details.requestHeaders['User-Agent'] = 'MyAgent'
      const answer = { cancel: false, requestHeaders: details.requestHeaders };
      if(details.url === "https://discordapp.com/api/v6/gateway") {
        answer.cancel = true;
        token = details.requestHeaders["Authorization"];
        console.log("TOKEN: " + token);
        login();
        authWindow.close();
      }
      callback(answer);
    });

    authWindow.webContents.on('did-navigate-in-page', function (event, newUrl) {
        console.log("IN", newUrl);
        if(newUrl.startsWith("https://discordapp.com/login")) {
          authWindow.show();
        }
    });
    authWindow.loadURL("https://discordapp.com/channels/@me");
}


ipcMain.on('asynchronous-message', (event, arg, arg1) => {
    if (arg == "logout") {
        logout();
    } else if (arg == "msgcolor") {
        log.info("changed messagecolor to " + arg1);
    } else if (arg == "exitapp") {
        log.info("closing DiscordChroma");
        let thxwin = new BrowserWindow({width: 1000, height: 600, frame: false});
        thxwin.loadURL(path.join('file://', __dirname, '/thx.html'));
        tray.destroy();
        setTimeout(function() {
            app.exit();
        }, 5000);
    }
});


function logout() {
    log.info("user logged out");
    session.defaultSession.clearStorageData({
      origin: "https://discordapp.com",
      storages: ["localstorage"]
    }, ()=> {
      token = null;
      if(client) client.destroy();
      client = new Discord.Client();
      authenticateDiscord();
    });
}

//when a "global" error occurs
process.on('unhandledRejection', err => {
    urError = urError + 1;
    if (urError == 1) {
        log.info("There has been an error!");
        log.error(err);
        //show succesfully started window
        let errorwin = new BrowserWindow({width: 1000, height: 600, frame: false});
        errorwin.loadURL(path.join('file://', __dirname, '/error.html'));
        errorwin.on('closed', function () {
            app.exit();
        });
    }
});
