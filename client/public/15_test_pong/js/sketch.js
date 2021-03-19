let socket = io();

let pause = false;
let myPlayerIndex = -1;
let gameState;


function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    textAlign(CENTER, CENTER);
    frameRate(20);
}

function draw() {
    if (pause) {
        background(128);
    } else if (gameState) {
        // update game
        let bp = gameState.ballPosition;
        let bv = gameState.ballVelocity;
         
        bp[0] += bv[0];
        bp[1] += bv[1];
        if (bp[0] < 0 || bp[0] > width) bv[0] = -bv[0];
        if (bp[1] < 0 || bp[1] > height) bv[1] = -bv[1];

        // send state to all others
        socket.emit('serverEvent', { type: "gameState", gameState: gameState });
    }
}

function mouseClicked() {
    socket.emit('serverEvent', { type: "playerMove", playerIndex: myPlayerIndex, position: [mouseX, mouseY] });
}

function keyPressed() {
    if (key == " ") {
        pause = !pause;
    }
}

// Incoming events --------------------------------------

socket.on('connected', function (msg) {
    console.log(msg);
});

socket.on('newUsersEvent', function (myID, myIndex, userList) {
    console.log("New users event: ");
    console.log("That's me: " + myID);
    console.log("My index in the list: " + myIndex);
    console.log("That's the new users: ");
    console.log(userList);

    // if myPlayerIndex is 0 -> I'm the master
    myPlayerIndex = myIndex;

    // init game
    if (myPlayerIndex == 0) {
        gameState = {
            ballPosition: [width / 2, height / 2],
            ballVelocity: [3, 5],
            playerPositions: [[0, -20], [0, -20], [0, -20], [0, -20]],
        }

    }
});

socket.on('serverEvent', function (msg) {

    if (msg.type == "playerMove" && myPlayerIndex == 0) {
        // update state only if I'm the master
        gameState.playerPositions[msg.playerIndex] = msg.position;
    }

    if (msg.type == "gameState") {
        let g = msg.gameState;

        // draw everything
        background(0);

        fill(255);
        text(myPlayerIndex, 20, 30);

        fill(255, 100, 0);
        text("Ball", g.ballPosition[0], g.ballPosition[1]);

        fill(0, 128, 255);
        for (let i = 0; i < g.playerPositions.length; i++) {
            const p = g.playerPositions[i];
            text("Player " + i, p[0], p[1]);

        }

    }

});


