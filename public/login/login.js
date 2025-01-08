const socket = io();

let autoLogin = true;
if(!localStorage[SERVERNAME]){
    autoLogin = false;
}

if(autoLogin){
    let user = JSON.parse(localStorage[SERVERNAME]);

    socket.emit("autologin?",user);
}

function login(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const user = {
        name:username,
        password:password,
        timestamp:Date.now(),
        URL:window.location
    }

    socket.emit("login?",user);
}

socket.on("login?",(user)=>{
    console.log(user);
    if(!user.passes){
        if(user.error === "refused to connect"){
            console.error("ERR: server refused to connect");
        }else{
            console.warn(`server: ${user.error}`);
        }
        return;
    }
    
    sessionStorage[SERVERNAME] = JSON.stringify(user);
    if(autoLogin){
        localStorage[SERVERNAME] = sessionStorage[SERVERNAME];
    }
    window.location.replace(INDEX);
})

