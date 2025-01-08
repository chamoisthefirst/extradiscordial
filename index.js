//including node modules
const fs = require('fs');
const express = require("express");
const storage = require("./data.json");








//socket io setup

//choose port, must not be in use by another program
const PORT = 3030;

//setting up local server
const app = express();
app.use(express.static("public"));
app.use(express.json({limit:"1mb"}));

//websocket setup (socket.io)
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);


//use this whenever you wanna save the storage object to the data.json file
function save() {
  fs.writeFileSync("./data.json",JSON.stringify(storage));
}

//funciton to save messages to database then send them to connected devices
function updateSocket(message) {
  //console log for debugging, should be commented out
  console.log(message);

  //getting rid of save location data that won't be needed after the message is saved
  let saveMessage = {
    author:message.author.id,
    attachments:message.attachments,
    content:message.content,
    mentions:{
      users:message.mentions.users,
      roles:message.mentions.roles
    },
    timestamp:message.timestamp,
    delete:function(){
      this.deleted=true;
    },
    edit:function(newText){
      this.editedTimstamp = Date.now();
      this.content=newText;
    },
    reply:function(){}
  }

  if(!storage.channels[message.channel]){
    storage.channels[message.channel] = {
      "messages":{}
    }
  }

  storage.channels[message.channel].messages[message.id]=saveMessage;
  save();

  let postMessage = {
    author:{username:message.author.username},
    attachments:message.attachments,
    content:message.content,
    mentions:{
      users:message.mentions.users,
      roles:message.mentions.roles
    },
    timestamp:message.timestamp
  }
  io.emit(message.channel,postMessage);
}



//web sockets

io.on("connection", (socket)=>{
  socket.on("message", (message)=>{
    if(!message)return;
    if(!message.channel)return;
    if(!storage.channels[message.channel])return;
    if(!message.author)return;
    io.emit(message.channel,message);
    if(!message.attachments){
      const embed = new EmbedBuilder()
        .setColor("DarkGold")
        .setTitle(message.author.username)
        .setDescription(message.content)
        .setTimestamp();
      client.channels.fetch(message.channel).then((channel)=>{
        channel.send({embeds: [embed]});
      }).catch((err)=>{
        console.log(err);
      });
        
    }else{
      //gonna add attachments eventually
      return;
    }

    
  })

  socket.on("getMessages",(data)=>{
    if(!storage.channels[data.channel]){
      socket.emit("getMessages",{messages:{},error:"channel does not exist"});
      return;
    }

    socket.emit("getMessages",{messages:storage.channels[data.channel].messages});
  })
})



//discord bot stuff

const { Client, 
    GatewayIntentBits,
    EmbedBuilder,
    PermissionsBitField,
    Permissions,
    Embed,
  } = require(`discord.js`);
  
  require("dotenv").config();
  const TOKEN = process.env.DISCORD_TOKEN;
  
  const prefix = "!";
    
  const client = new Client({
      intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      ],
  });


  client.on("ready",(status)=>{
    console.log("bot is online");
  })

  client.on("messageCreate",(message)=>{
    
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();


    //commands
    if(message.content.startsWith(prefix)){
      if(message.author.bot) return;

      return;
    }

    //saving messages and sending them to connected devices

    if(message.embeds.length) return;

    let messageChannel = `${message.channel}`;
    messageChannel = messageChannel.substring(2,messageChannel.length-1);

    client.channels.fetch(messageChannel).then((chan)=>{
      messageChannel = chan;
    }).catch((err)=>{
      console.log(err);
    })

    let messageGuild;

    client.guilds.fetch(message.guildID).then((guild)=>{
      messageGuild=guild;
    }).catch((err)=>{
      console.log(err);
    })

    //json data
    let socketMessage = {
      attachments:message.attachments,
      content:message.content,
      id:message.id,
      mentions:message.mentions,
      timestamp:message.timestamp,
      author:{
        username:message.author.globalName,
        bot:message.author.bot,
        id:message.author.id
      },
      channel:messageChannel,
      server:messageGuild
    };

    //sends message to connected divices after saving to database
    updateSocket(socketMessage);

  })
//final startup

//http server start up
server.listen(PORT, () => {console.log(`server running on http://localhost:${PORT}`);});

//discord bot start up
client.login(TOKEN).catch((err)=>{
  console.log(err);
});