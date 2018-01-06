const Discord = require('discord.js');
const client = new Discord.Client();
var Chroma = require('razerchroma');
var color_var = 16777215;

//chroma init
const application = {
    "title": "Razer Chroma Discord (beta)",
    "description": "This is a test application for discord integration",
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


//when the program is succesfully logged in to discord
client.on('ready', () => {
  console.log('Welcome to razer chroma discord - Made by DELUUXE');
});

//when you receive a message
client.on('message', message => {
    if(message.channel.type == "text"){
        if(message.guild.muted == false){
            if(message.author.id != client.user.id){
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

//your discord token, to login for receiving of discord notifications
client.login('YOUR DISCORD TOKEN');
