let cnx, ctx, loop
let fps = 1000/60
let paddle
let brickWidth, brickHeight, brickGap
let bricks, liveBricks, brickCols, brickRows, brickColor
let ball
let bounceAngle = 0.2

window.onload = function() {
    cnv = document.getElementById('canvas')
    ctx = cnv.getContext('2d')
    addEventListener('mousemove', mouseMoved);
    init()
    loop = setInterval(() => {
        update()
        render()
    }, fps)
}

function init(){
    // initialize our paddle and set it's values and position
    paddle = {
        width:100,
        height:20,
        x:0,
        y:0,
        color:"#fff"
    }
    paddle.x = ( cnv.width/2 - paddle.width/2 )
    paddle.y = ( cnv.height - paddle.height*2 )

    // initialize our bricks
    brickWidth = 100;
    brickHeight = 20;
    brickGap = 2;
    brickColor = "#fff";
    brickCols = 8;
    brickRows = 8;
    liveBricks = 0;
    bricks = Array(brickCols * brickRows)
    for(let i = 0; i < brickCols * brickRows; i++){
        bricks[i] = true;
        liveBricks++;
    }

    // initialize our ball
    ball = {
        x:0,
        y:0,
        xv:0,
        yv:0,
        size:8,
        color:"#fff"
    }
    ball.x = cnv.width/2 - ball.size/2
    ball.y = cnv.height/2 - ball.size/2
    ball.yv = 10
}

// update assets
function update(){
    checkForCollisionsWith(paddle)
    checkForBrickCollisions()
    moveBall()
    if (isBrickCountZero()){
        init()
    }
}

// draw assets to canvas
function render(){
    drawRect(0, 0, cnv.width, cnv.height, "#000")
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color)
    drawBricks()
    drawCircle(ball.x, ball.y, ball.size, ball.color)
}

function mouseMoved() {
    let rect = cnv.getBoundingClientRect()
    let root = document.documentElement
    let mouseX = event.clientX - rect.left - root.scrollLeft
    paddle.x = mouseX - paddle.width/2
}

function drawRect(x, y, width, height, color){
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)
    ctx.fill()
}

function drawCircle(x, y, size, color){
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x, y, size, 0, 2 * Math.PI)
    ctx.fill()
}

function drawBricks(){
    for (let row=0; row < brickRows; row++) {
        for (let col=0; col < brickCols; col++) {
            let index = (col + brickCols * row)
            if (bricks[index]){
                drawRect(
                    brickWidth * col + brickGap,
                    brickHeight * row + brickGap,
                    brickWidth - brickGap*2,
                    brickHeight - brickGap*2,
                    brickColor);
            }
        }
    }
}

function resetBall(){
    ball.x = cnv.width/2 - ball.size/2
    ball.y = cnv.height/2 - ball.size/2
    ball.yv = 8
    ball.xv = 0
}

function moveBall(){
    ball.y += ball.yv;
    ball.x += ball.xv;
    if (ball.x > cnv.width || ball.x < 0){
        ball.xv = -ball.xv;
    }
    if (ball.y > cnv.height){
        resetBall();
    }
    if (ball.y < 0){
        ball.yv = -ball.yv;
    }
}

function checkForCollisions(a, b){

    let aLeftOfB = (a.x + a.width) < (b.x)
    let aRightOfB = (a.x ) > (b.x + b.size)
    let aAboveB = (a.y) > (b.y + b.size)
    let aBelowB = (a.y + a.height) < (b.y)

    return !(aLeftOfB || aRightOfB || aAboveB || aBelowB)
}

function checkForCollisionsWith(paddle){
    if (checkForCollisions(paddle, ball)){
        ball.yv *= -1
        let centerOfPaddleX = paddle.x + paddle.width/2
        let ballDistFromPaddleCenterX = ball.x - centerOfPaddleX
        ball.xv = ballDistFromPaddleCenterX * bounceAngle
    }
}

function rowColToArrayIndex(col, row) {
    return col + brickCols * row
}

function isBrickAtColRow(col, row) {
    if ( col >= 0 && col < brickCols && row >= 0 && row < brickRows){
        let brickIndexUnderCoord = rowColToArrayIndex(col, row)
        return bricks[brickIndexUnderCoord]
    }
    return false
}

function checkForBrickCollisions(){
    
    let ballBrickCol = Math.floor((ball.x + ball.size/2)/brickWidth)
    let ballBrickRow = Math.floor((ball.y + ball.size/2)/brickHeight)
    let brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow)

    if (ballBrickCol >= 0
        && ballBrickCol < brickCols
        && ballBrickRow >= 0
        && ballBrickRow < brickRows){
            if ( isBrickAtColRow(ballBrickCol, ballBrickRow) ){
                bricks[brickIndexUnderBall] = false
                liveBricks--

                let prevBallX = ball.x - ball.xv
                let prevBallY = ball.y - ball.yv
                let prevBrickCol = Math.floor(prevBallX / brickWidth)
                let prevBrickRow = Math.floor(prevBallY / brickHeight)
                let bothTestsFailed = true;

                if (prevBrickCol != ballBrickCol){
                    if (isBrickAtColRow(prevBrickCol, ballBrickRow) == false){
                        ball.xv = -ball.xv
                        bothTestsFailed = false;
                    }
                }
                if (prevBrickRow != ballBrickRow){
                    if (isBrickAtColRow(ballBrickCol, prevBrickRow) == false){
                        ball.yv = -ball.yv
                        bothTestsFailed = false;
                    }
                }
                if (bothTestsFailed){
                    ball.yv = -ball.yv
                }
            }
        }
}

function isBrickCountZero(){
    return liveBricks ==0
}