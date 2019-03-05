//Get canvas and context and set canvas size to full window
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");
var s = c.width = c.height = window.innerHeight;

//establish timing loop at 60 fps
setInterval(update, 1000 / 60);

//array of boolean values at keycode indexes
var keyDown = []

//Array of entities for drawing
var entities = [];

//Array of enemies for calling their functions
var enemies = [];

//Event listeners for keyboard input
onkeydown = function(e){
  keyDown[e.which] = true;
}
onkeyup = function(e){
  keyDown[e.which] = false;
}

//Create and intantiate a player
var p = new Player(0, 0, 3);

//Create update function
function update(){
  //Reset screen
  ctx.clearRect(0, 0, s, s);

  drawEntities();

  //move player
  p.move();

  callEnemyFunctions();
}

//draws entities in array
function drawEntities(){
  for(var i = 0; i < entities.length; i++){
    entities[i].draw();
  }
}

//Entity parent
function Entity(x, y, sides){
  this.x = x;
  this.y = y;
  this.sides = sides;
  entities[entities.length] = this;
  //Function to draw entity
  this.draw = function(){
    //ctx.fillRect((this.x * s / 100) - (p.x * s / 100) + (s / 2), (this.y * s / 100) - (p.y * s / 100) + (s / 2), s / 100, s / 100);
    drawPolygon(this.sides, 2, this.x, this.y);
  }
}

//Player class
function Player(x, y, sides){
  Entity.call(this, x, y, sides);
  this.move = function(){
    if(keyDown[65]){
      this.x -= 0.5;
    }
    if(keyDown[68]){
      this.x += 0.5;
    }
    if(keyDown[87]){
      this.y -= 0.5;
    }
    if(keyDown[83]){
      this.y += 0.5;
    }
  }
}

//Draw polygons
function drawPolygon(sides, r, x, y){
  r *= s / 100;
  var angleDif  = 180 - (((sides - 2) * 180) / sides);
  var angle = 0;
  var xOffset = ((x * (s / 100)) - (p.x * (s / 100)) + (s / 2));
  var yOffset = ((y * (s / 100)) - (p.y * (s / 100)) + (s / 2));
  for(var i = 0; i < sides; i++){

    //Declare and initialize needed values to draw a line
    var slope = Math.tan(angle * Math.PI / 180);
    var yMid = Math.sqrt((r * r) * (1 / ((slope * slope) + 1)));
    var xMid = Math.sqrt((r * r) * ((slope * slope) / ((slope * slope) + 1)));
    if(angle <= 90 && angle > 0){
      xMid *= -1;
    }
    if(angle <= 180 && angle > 90){
      xMid *= -1;
      yMid *= -1;
    }
    if(angle <= 270 && angle > 180){
      yMid *= -1;
    }
    var sideLength = 2 * r * Math.tan((180 / sides) * Math.PI / 180);
    //drawLineAtAngle(r, angle, xOffset, yOffset);
    drawLineAtAngle(sideLength / 2, angle + 90, xMid + xOffset, yMid + yOffset);
    drawLineAtAngle(sideLength / 2, angle - 90, xMid + xOffset, yMid + yOffset);
    angle += angleDif;
  }
}

//draws a line at an angle given distance, angle, and starting coordinates
function drawLineAtAngle(r, angle, xOffset, yOffset){
  if(angle > 360) angle -= 360;
  var slope = Math.tan(angle * Math.PI / 180);
  //draw the lines
  var yMid = Math.sqrt((r * r) * (1 / ((slope * slope) + 1)));
  var xMid = Math.sqrt((r * r) * ((slope * slope) / ((slope * slope) + 1)));
  if(angle <= 90 && angle > 0){
    xMid *= -1;
  }
  if(angle <= 180 && angle > 90){
    xMid *= -1;
    yMid *= -1;
  }
  if(angle <= 270 && angle > 180){
    yMid *= -1;
  }
  //console.log(Math.sqrt((r * r) * (1 / ((slope * slope) + 1))) + ", " + Math.sqrt((r * r) * ((slope * slope) / ((slope * slope) + 1))));
  //ctx.fillRect(xOffset + xMid - 5, yOffset + yMid - 5, 10, 10);
  ctx.beginPath();
  ctx.moveTo(xOffset, yOffset);
  ctx.lineTo(xOffset + xMid, yOffset + yMid);
  ctx.stroke();
  ctx.closePath();
}

function Enemy(x, y, sides){
  Entity.call(this, x, y, sides);
  enemies[enemies.length] = this;
  var timer = 0;
  var headingX = 0;
  var headingY = 0;
  this.wander = function(){
    timer++;
    if(timer > 60){
      headingX = (Math.random() - 0.5) / 4;
      headingY = (Math.random() - 0.5) / 4;
      timer = 0;
    }
    this.x += headingX;
    this.y += headingY;
  }
}

function callEnemyFunctions(){
  for(var i = 0; i < enemies.length; i++){
    enemies[i].wander();
  }
}
