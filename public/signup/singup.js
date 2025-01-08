const socket = io();

function showError(error){
    document.getElementById("error").innerText = error;
}

function createLogin(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let repeated = document.getElementById("repeated").value;

    if(!password || password.length < 8){
        showError("Password must be 8 characters or longer");
        return;
    }

    if(password != repeated){
        showError("Passwords do not match");
        return;
    }

    let user = {
        name:username,
        password:password
    }

    socket.emit("signup?", user)
}

socket.on("signup?", (user)=>{
    if(!user.passes){
        showError(user.error);
        console.log("hello world")
        return;
    }

    console.log("passes");

    sessionStorage[SERVERNAME] = JSON.stringify(user);
    window.location.replace(INDEX);
})