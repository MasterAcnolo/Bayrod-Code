const Discord = require('discord.js');
const bot = new Discord.Client();
const moment = require('moment');
const status = ["Statut 1", "Statut 2"," Statut 3"];
const ytdl = require("ytdl-core");
const queue = new Map();





bot.on("ready", async ()=>{
    
    console.log('Bot on')
        let statuts = status
        setInterval(function() {
            let stats = statuts[Math.floor(Math.random()*statuts.length)];
            bot.user.setActivity(stats, {type: "PLAYING"})
    
            
        }, 10000) 
        
     
    
    
            
            
    });

    


//Musique
bot.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;

    const serverQueue = queue.get(message.guild.id);
    if (message.content.startsWith(`!play`)) {
      execute(message, serverQueue);
      return;
    } else if (message.content.startsWith(`!skip`)) {
      skip(message, serverQueue);
      return;
    } else if (message.content.startsWith(`!stop`)) {
      stop(message, serverQueue);
      return;
    } else if (message.content.startsWith(`!pause`)) {
      pause(message, serverQueue);
      return;
    } else {
      message.channel.send("Vous devez entrez une commande valide");
    }
  });



//Fonctions musique
async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "Vous devez dans un salon voc pour écoutez de la musique!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "Vous devez avoir la permision d'allez dans un salon voc pour ca!"
      );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
  
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} as bien été ajouté a la queue `);
    }
  }
  
  function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
  }
  
  function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  function pause(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
      if(serverQueue.connection.dispatcher.paused){
        serverQueue.connection.dispatcher.resume();
      }
      else{
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.pause();
      }
  }
  
  function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  };
  
  
bot.login('BOT TOKEN')
