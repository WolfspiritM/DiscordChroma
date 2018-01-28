const Discord = require('discord.js');
const client = new Discord.Client();
var Chroma = require('razerchroma');
const electron = require('electron');
const {Menu, Tray} = require('electron');
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;
const path = require('path');
var fs = require('fs');
let loginwin;
let tray = null;
var debugerror = 0;
var error1 = 0;
var warn1 = 0;

var color_var = 16777215;

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
        app.exit();
    });
    setTimeout(function() {
        //remove splashscreen
        win.hide();
        //show discord token/login screen
        let loginwin = new BrowserWindow({width: 1000, height: 600, frame: false});
        loginwin.loadURL(path.join('file://', __dirname, '/token.html'));
        loginwin.on('closed', function () {
            setTimeout(function() {
                //gets token from login.txt
                var token = fs.readFileSync('login.txt','utf8');
                //logging in to discord
                client.login(token.replace(/['"]+/g, ''));
                //deletes login.txt for more security
                fs.unlinkSync("login.txt");
            }, 1000);
        });
    }, 8000);
});

//after succesfully logged in to discord
client.on('ready', () => {
    console.log("succesfully logged in to discord");
    //show succesfully started window
    let succeswin = new BrowserWindow({width: 1000, height: 600, frame: false});
    succeswin.loadURL(path.join('file://', __dirname, '/succes.html'));
    setTimeout(function() {
        //remove succesfully started window
        succeswin.hide();
        console.log("Ready to receive messages");
    }, 6000);
});

//when you receive a message
client.on('message', message => {
    if(message.channel.type == "text"){
        if(message.guild.muted == false){
            if(message.author.id != client.user.id){
                //do only when it's a message from a non-muted server and not from yourself
                console.log('NEW MESSAGE, in ' + message.guild.name + ".");
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
    } else if(message.channel.type == "dm" || message.channel.type == "group"){
        if(message.author.id != client.user.id){
            //do only when it's a message from DM or GroupDM and if it't not from yourself
            console.log('NEW MESSAGE');
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
client.on('error', () => {
    error1 = error1 + 1;
    if (error1 == 1) {
        console.log("There has been an error!");
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
        console.log("There has been an error!");
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
process.on('unhandledRejection', () => {
    console.log("There has been an error!");
    //show succesfully started window
    let errorwin = new BrowserWindow({width: 1000, height: 600, frame: false});
    errorwin.loadURL(path.join('file://', __dirname, '/error.html'));
    errorwin.on('closed', function () {
        app.exit();
    });
});