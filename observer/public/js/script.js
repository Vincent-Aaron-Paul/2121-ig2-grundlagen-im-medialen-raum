// Connecting to server. Don't touch this :-) 
let socket = io();
socket.on('connected', function (msg) {
    console.log(msg);
});


// Your script starts here ------------------------------------------------------

let myUserID;
let myUserIndex;
let users = {};

let content = document.getElementById("content");


// Incoming events 
socket.on('serverEvent', function () {
   // console.log("Incoming event: ", arguments);
    let id = arguments[0];
    let arr = [...arguments];
    arr.shift();
    //arguments.shift();
    users[id].lastMessage = JSON.stringify(arr);
    users[id].lastMessageTime = Date.now();
    
    displayUsers();
});

socket.on('newUsersEvent', function (myID, myIndex, userList) {
    // console.log("New users event: ");
    // console.log("That's the new users: ");
    // console.log(userList);

    // add new users
    let newUsers = {};
    for (let i = 0; i < userList.length; i++) {
        let id = userList[i].id;
        if (!users[id]) {
            newUsers[id] = {since:userList[i].since, topic:userList[i].topic, lastMessage:undefined, lastMessageTime:0};   
        } else {
            newUsers[id] = users[id];   
        } 
    }
    users = newUsers;
    myUserID = myID;
    myUserIndex = myIndex;
    displayUsers();
});

function displayUsers() {
    let htmlText = "<h3>That's me: " + myUserID + "</h3>";

    userList = Object.entries(users);

    userList.sort((a, b) => a[1].topic > b[1].topic);

    if (userList.length > 0) {
        for (var i = 0; i < userList.length; i++) {
            let color = textToColor(userList[i][1].topic.slice(-7));

            let connectionDate = new Date(userList[i][1].since);
            htmlText += "<div class='user'>";
            htmlText += "<div class='info' style='color:" + color + "'>" + userList[i][0] + " | " + connectionDate.toLocaleString() + " | " + userList[i][1].topic + "</div>";
            if (userList[i][1].lastMessage) {
                let time = new Date(userList[i][1].lastMessageTime);
                let timeDelta = Date.now() - userList[i][1].lastMessageTime;
                let opacity = Math.max(1 - timeDelta / 60000, 0.3);
                htmlText += "<div class='message' style='opacity:" + opacity + "'>" + time.toLocaleTimeString() + " | " + userList[i][1].lastMessage + "</div>";
            }
            htmlText += "</div>";
        }
    
    } else {
        htmlText += "Nobody else is here :-("
    }

    content.innerHTML = htmlText;


}


function textToColor(text) {
    // Remove all letters that are not 0-9, a-z or A-Z
    text = text.replaceAll(/[^0-9a-zA-Z]/g, "");
    // Parse the string as a number to base 36
    let val = parseInt(text, 36);
    // Calculate hue as a number from 0 to 359
    let hue = val % 360;
    // Use the LCH color model which tries to produce equally bright colors for every hue value
    let color = chroma.lch(70, 90, hue).hex();
    
    return color;
}