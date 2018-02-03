const Discord = require('discord.js');
const client = new Discord.Client();
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
//const notifier = require('node-notifier');
const WindowsToaster = require('node-notifier').WindowsToaster;
var log = require('electron-log');
let loginwin;
let tray = null;
var debugerror = 0;
var error1 = 0;
var warn1 = 0;
var urError = 0;
var ECONNRESET = 0;
var token1 = null;

var color_var = 16777215;

log.transports.file.appName = 'DiscordChroma';
log.transports.file.level = 'info';
log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';
log.transports.file.maxSize = 5 * 1024 * 1024;
log.transports.file.file = __dirname + '/log.txt';
log.transports.file.streamConfig = { flags: 'w' };
log.transports.file.stream = fs.createWriteStream('log.txt');


//chroma init
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



const notification_wave = {
    
};


const some_rad_light_pattern = {
    "effect":"CHROMA_CUSTOM",
    "param":[
        [ 255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255 ],
        [ 65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280,65280 ],
        [ 16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680,16711680 ],
        [ 65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535,65535 ],
        [ 16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960,16776960 ],
        [ 16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935,16711935 ]
    ]
};

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
        log.info("starting DiscordChroma");
        //show splash/loading screen
        let win = new BrowserWindow({width: 1000, height: 600, frame: false});
        win.loadURL(path.join('file://', __dirname, '/main.html'));
        //makes tray icon for closing and managing the program
        tray = new Tray(path.join(__dirname, '/img/icon.ico'));
        const contextMenu = Menu.buildFromTemplate([
            {label: 'Close'},
        ]);
        tray.setToolTip('DiscordChroma (click to close)');
        //tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            log.info("closing DiscordChroma");
            let thxwin = new BrowserWindow({width: 1000, height: 600, frame: false});
            thxwin.loadURL(path.join('file://', __dirname, '/thx.html'));
            tray.destroy();
            var date = new Date();
            fs.createReadStream('log.txt').pipe(fs.createWriteStream("latestlog.txt"));
            setTimeout(function() {
                app.exit();
            }, 5000);
        });
        setTimeout(function() {
            if (fs.existsSync("autologin.deluuxe")) {
                fs.renameSync("autologin.deluuxe", "autologin.txt");
                setTimeout(function() {
                    //gets token from login.txt
                    var token = fs.readFileSync('autologin.txt','utf8');
                    //remover quotation markers
                    token1 = token.replace(/['"]+/g, '');
                    //logging in to discord
                    client.login(token1);
                    //remove splashscreen
                    win.hide();
                    fs.renameSync("autologin.txt", "autologin.deluuxe");
                }, 1000);
            } else {
                //remove splashscreen
                win.hide();
                //show discord token/login screen
                let loginwin = new BrowserWindow({width: 1000, height: 600, frame: false});
                loginwin.loadURL(path.join('file://', __dirname, '/token.html'));
                loginwin.on('closed', function () {
                    setTimeout(function() {
                        //gets token from login.txt
                        var token = fs.readFileSync('login.txt','utf8');
                        //deletes login.txt for more security
                        fs.unlinkSync("login.txt");
                        //remover quotation markers
                        token1 = token.replace(/['"]+/g, '');
                        //logging in to discord
                        client.login(token1);
                    }, 1000);
                });
            }
        }, 6000);
    }
});

//after succesfully logged in to discord
client.on('ready', () => {
    if (ECONNRESET == 0) {
        log.info("succesfully logged in to discord");
        //saving token for next use
        fs.writeFile("autologin.txt", token1, function(err) {}); 
        setTimeout(function() {
            fs.renameSync("autologin.txt", "autologin.deluuxe");
        }, 1000);
        //show notification that DC is running in the background
        /*notifier.notify({
            title: 'DiscordChroma',
            message: 'Is running in the background',
            icon: path.join(__dirname, 'notify.jpg'),
            sound: true,
            wait: true,
            appID: "com.deluuxe.discord.chroma",
        });*/
        console.log(__dirname + "\\img\\logo.png");
        var notifier = new WindowsToaster({
            withFallback: false, // Fallback to Growl or Balloons?
        });
        notifier.notify(
            {
                title: 'DiscordChroma is running in the background',
                message: 'To close click on the tray icon in the taskbar',
                icon: __dirname + "\\img\\logo.png",
                sound: true, // Bool | String (as defined by http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx)
                wait: true, // Bool. Wait for User Action against Notification or times out
                appID: "com.deluuxe.DiscordChroma",
            },
            function(error, response) {
                log.info(response);
            }
        );  
    }
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
    if (err.message == "read ECONNRESET") {
        ECONNRESET = 1;
        log.error(err);
        if (fs.existsSync("autologin.deluuxe")) {
            fs.renameSync("autologin.deluuxe", "autologin.txt");
            setTimeout(function() {
                //gets token from autologin.txt
                var token = fs.readFileSync('autologin.txt','utf8');
                //remover quotation markers
                token1 = token.replace(/['"]+/g, '');
                //re-logging in to discord
                client.destroy().then(() => client.login(token1));
                fs.renameSync("autologin.txt", "autologin.deluuxe");
            }, 1000);
        } else {
            log.info("There has been an error and we cant login automaticaly!");
            log.error(err);
            //remover autologin in-case token changed
            if (fs.existsSync("autologin.deluuxe")) {
                fs.unlinkSync("autologin.deluuxe");
            }
            //copy log to latestlog - to prevent multiple instance log override
            var date = new Date();
            fs.createReadStream('log.txt').pipe(fs.createWriteStream("latestlog.txt"));
            //show succesfully started window
            let errorwin = new BrowserWindow({width: 1000, height: 600, frame: false});
            errorwin.loadURL(path.join('file://', __dirname, '/error.html'));
            errorwin.on('closed', function () {
                app.exit();
            });
        }
    } else {
        error1 = error1 + 1;
        if (error1 == 1) {
            log.info("There has been an error!");
            log.error(err);
            //remover autologin in-case token changed
            if (fs.existsSync("autologin.deluuxe")) {
                fs.unlinkSync("autologin.deluuxe");
            }
            //copy log to latestlog - to prevent multiple instance log override
            var date = new Date();
            fs.createReadStream('log.txt').pipe(fs.createWriteStream("latestlog.txt"));
            //show succesfully started window
            let errorwin = new BrowserWindow({width: 1000, height: 600, frame: false});
            errorwin.loadURL(path.join('file://', __dirname, '/error.html'));
            errorwin.on('closed', function () {
                app.exit();
            });
        }
    }
});

client.on('warn', () => {
    warn1 = warn1 + 1;
    if (warn1 == 1) {
        log.warn("There has been a warning/error!");
        //remover autologin in-case token changed
        if (fs.existsSync("autologin.deluuxe")) {
            fs.unlinkSync("autologin.deluuxe");
        }
        //copy log to latestlog - to prevent multiple instance log override
        var date = new Date();
        fs.createReadStream('log.txt').pipe(fs.createWriteStream("latestlog.txt"));
        //show succesfully started window
        let errorwin = new BrowserWindow({width: 1000, height: 600, frame: false});
        errorwin.loadURL(path.join('file://', __dirname, '/error.html'));
        
        errorwin.on('closed', function () {
            app.exit();
        });
    }
});
// ---------------------------------------- END discord.js ERROR section -------------------------------- \\


//when a "global" error occurs
process.on('unhandledRejection', err => {
    urError = urError + 1;
    if (urError == 1) {
        log.info("There has been an error!");
        log.error(err);
        //remover autologin in-case token changed
        if (fs.existsSync("autologin.deluuxe")) {
        fs.unlinkSync("autologin.deluuxe");
        }
        //copy log to latestlog - to prevent multiple instance log override
        var date = new Date();
        fs.createReadStream('log.txt').pipe(fs.createWriteStream("latestlog.txt"));
        //show succesfully started window
        let errorwin = new BrowserWindow({width: 1000, height: 600, frame: false});
        errorwin.loadURL(path.join('file://', __dirname, '/error.html'));
        errorwin.on('closed', function () {
            app.exit();
        });
    }
});