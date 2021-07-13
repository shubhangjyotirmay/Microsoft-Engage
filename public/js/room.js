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
document.querySelector('.roomcode').innerHTML = `${roomid}`

//  name set
let username;
let vidCon;

continueButt.addEventListener('click', () => {
    if (nameField.value == '') return;
    username = nameField.value;
    overlayContainer.classList.add("hidden");
    //overlayContainer.style.visibility = 'hidden';
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
let chatContainer = document.querySelector(".right-cont");
chatToggle.addEventListener('click', () => {
    chatContainer.classList.toggle("hidden");
});

///  Full Screen
function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
    }
}


function allFullScreen() {
    //console.log("count is " + count);
    let fullBut = document.querySelectorAll(`.full-screen`);
    for (let i = 0; i < fullBut.length; i++) {
        //console.log("here + " + i + i);
        fullBut[i].addEventListener('click', () => {
            let fullVideo = fullBut[i].parentNode;
            openFullscreen(fullVideo);
        })
    }
    setTimeout(allFullScreen, 1);
}

allFullScreen();