const socket = io();
const overlayContainer = document.querySelector('#overlay')
const continueButt = document.querySelector('.continue-name');
const nameField = document.querySelector('#name-field');
const chatRoom = document.querySelector('.chat-cont');
const sendButton = document.querySelector('.chat-send');
const messageField = document.querySelector('.chat-input');
const cutCall = document.querySelector('.cutcall');
let chatToggle = document.querySelector(".chatting");

//  Room id
const roomid = params.get("room");
// document.querySelector('.roomcode').innerHTML = `${roomid}`

//  name set
let username;

continueButt.addEventListener('click', () => {
    if (nameField.value == '') return;
    username = nameField.value;
    overlayContainer.style.visibility = 'hidden';
    document.querySelector("#myname").innerHTML = `${username} (You)`;
    socket.emit("join room", roomid, username);

})

nameField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        continueButt.click();
    }
});

//  Chat
sendButton.addEventListener('click', () => {
    const msg = messageField.value;
    messageField.value = '';
    socket.emit('message', msg, username, roomid);
})

messageField.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendButton.click();
    }
});

socket.on('message', (msg, sendername, time) => {
    chatRoom.scrollTop = chatRoom.scrollHeight;
    chatRoom.innerHTML += `<div class="message">
    <div class="info">
        <div class="username">${sendername}</div>
        <div class="time">${time}</div>
    </div>
    <div class="content">
        ${msg}
    </div>
</div>`
});

//  End Meet
cutCall.addEventListener('click', () => {
    location.href = '/';
})

//  Meet Clock
function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.querySelector('.meet-time').innerHTML = h + ":" + m + ":" + s;
    setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i
    }; // add zero in front of numbers < 10
    return i;
}

startTime();

//  Chat slide
let z = 0;

// function openNav() {
//     document.querySelector(".mySidenav").style.width = "250px";
//     document.querySelector("main").style.marginLeft = "250px";
// }

// function closeNav() {
//     document.getElementById("mySidenav").style.width = "0";
//     document.getElementById("main").style.marginLeft = "0";
// }

// chatToggle.addEventListener('click', () => {
//     if (z == 0) {
//         openNav();
//         z = 1;
//     } else {
//         closeNav();
//         z = 0;
//     }
// })

let chatContainer = document.querySelector(".right-cont");
chatToggle.addEventListener('click', () => {
    chatContainer.classList.toggle("hidden");
})