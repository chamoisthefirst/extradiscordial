const socket = io();



//global variable setup

let notif = './notification sounds/pop.mp3';
let channel = {
    id:"1326613928230391809",
    name:"test-channel"
};

document.getElementById("channel").innerText=`# ${channel.name}`;

//funciton setup



function toggleSettings(){
    const settings = document.getElementById("settings");
    if(settings.classList.contains("hidden")){
        settings.classList.remove("hidden");
    }else{
        settings.classList.add("hidden");
    }
}

function changeSound(sound){
    notif=`../notification sounds/${sound}.mp3`;
    let audio = new Audio(notif);
    audio.play();
}

function send(message){

    let msg = {
        "content":message,
        "author":{username:"chamois",bot:false,id:"1089987702516088853"},
        "channel":channel.id,
        "timestamp":Date.now()
    }

    socket.emit("message",msg);
}

function readMessages(messages) {
    for(let i in messages){
        showMsg(messages[i]);
    }
    const end = document.createElement("div");
    end.id="end_of_loaded";
    document.getElementById("chat").appendChild(end);
    end.scrollIntoView();
}

function toTimestamp(ts) {
    ts=Date(ts);
    if(Date().substring(0,15) === ts.substring(0,15)){
        ts = `today at ${ts.substring(16,21)}`;
    }else{
        ts = ts.substring(0,15)+' at '+ts.substring(16,21);
    }

    return ts;
}


function showMsg(msg,scroll) {

    const span = document.createElement("div");
    span.classList.add("message_span");

    const message = document.createElement("p");
    message.classList.add("message_content");
    message.innerText = msg.content;

    // if(msg.embed.length){
    //     const embed = document.createElement("div");
    //     embed.classList.add("embed")

    //     const title = document.createElement("p");
    //     title.innerText=embed.title;
    //     const description = document.createElement("p");
    //     description.innerText=embed.description;
    //     const timestamp = document.createElement("p");
    //     timestamp.innerText = toTimestamp(embed.timestamp);
    // }

    const header = document.createElement("div");
    header.classList.add("message_header");

    const author = document.createElement("b");
    author.classList.add("message_author");
    author.innerText = msg.author.username;

    // let ts = 'today at '+Date(msg.timestamp).substring(16,21);
    let ts = toTimestamp(msg.timestamp);
    
    const timestamp = document.createElement("p");
    timestamp.classList.add("message_timestamp");
    timestamp.innerText = ` - ${ts}`;

    header.appendChild(author);
    header.appendChild(timestamp);

    const br = document.createElement("br");
    br.classList.add("message_br");

    span.appendChild(header);
    span.appendChild(message);
    span.append(br);

    document.getElementById("chat").appendChild(span);
    if(scroll === "smooth"){
        span.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    
}

//login stuff

// if(!sessionStorage[SERVERNAME]){
//     window.location.replace(LOGINPATH);
// }

// let user = JSON.parse(sessionStorage[SERVERNAME]);
// socket.emit("autologin?",user);

socket.emit("getMessages", {
    channel:channel.id,
    //user:user,
});

socket.on("getMessages", (data)=>{
    if(data.error)return;

    readMessages(data.messages);
})

socket.on(`${channel.id}`, (msg)=>{
    showMsg(msg,"smooth");

    let sound = new Audio(notif);
    sound.play();
})

let downKey;

document.getElementById("input").onkeydown = (e) => {
    downKey = e.key;
}

document.getElementById("input").onkeyup = (e) =>{
    if(e.key === "Enter" && downKey != "Shift"){
        send(document.getElementById("input").value);
        document.getElementById("input").value = "";
    }
}