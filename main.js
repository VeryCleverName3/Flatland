//Get canvas and context and set canvas size to full window
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");
var s = c.width = c.height = window.innerHeight;

var insults = [["You're not looking very SHARP today.", -1], ["You're about to be poly-GONE!", -1], ["You're a poly-GONE-er!", -1], ["I'm poly-GONNA beat you up!", -1], ["Stop being so OBTUSE!", -1], ["You're so EDGY!", -1], ["Stop being so ACUTE!", -1]];
var learnableInsults = [["Are you all RIGHT?", 4], ["For a triangle, you're not very SHARP!", 3], ["You're about to be penta-GONE!", 5], ["You're about to be hexa-GONE", 6], ["You're about to be septa-GONE", 7], ["You're about to be octa-GONE", 8], ["Don't be so SQUARE!", 4], ["I'm poly-GONNA beat you up", -1], ["Don't be so OBTUSE", -1], ["You look like a piece of modern art", -1]];

//Set up textalign and format
ctx.textAlign = "center";
ctx.font = "20px comic sans ms";

//establish timing loop at 60 fps
var overLoop = setInterval(updateOverworld, 1000 / 60);

//array of boolean values at keycode indexes
var keyDown = []

//Current enemy insults
var currentEnemyInsult;

//move about to learn
var moveToLearn;

//Array of insults on levelup
var insultsToLearn = [0, 0, 0, 0];

//Array of entities for drawing
var entities = [];

//Array of enemies for calling their functions
var enemies = [];

//interval reference for battling
var battleLoop;

//Value to prevent player from insulting
var insulting = false;

//Index of current insult
var currentInsult;

//Temporary player coordinates
var tempPX;
var tempPY;

//Variable for enemy to fight
var enemyInBattle;

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
function updateOverworld(){
  //Reset screen
  ctx.clearRect(0, 0, s, s);

  drawEntities();

  //move player
  p.move();

  //manage insults
  p.insult();

  if(p.score >= p.scoreToNext){
    levelUp();
  }

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
  this.health = sides;
  entities[entities.length] = this;
  //Function to draw entity
  this.draw = function(){
    //ctx.fillRect((this.x * s / 100) - (p.x * s / 100) + (s / 2), (this.y * s / 100) - (p.y * s / 100) + (s / 2), s / 100, s / 100);
    drawPolygon(this.sides, 2, this.x, this.y);
  }
  this.changeSides = function(object, newSides){
    var loop = setInterval(function(){
      if(newSides > object.sides){
        object.sides += 0.01;
      } else if (newSides < object.sides){
        object.sides -= 0.01;
      }
      if(object.sides < newSides + 0.02 && object.sides > newSides - 0.02){
        object.sides = newSides;
        clearInterval(loop);
      }
    }, 1000 / 140);
  }
}

//Player class
function Player(x, y, sides){
  Entity.call(this, x, y, sides);
  this.score = 0;
  this.scoreToNext = 1;
  this.learnedInsults = [["Don't be so SQUARE!", 4], ["I'm poly-GONNA beat you up", -1], ["Don't be so OBTUSE", -1], ["You look like a piece of modern art", -1]];
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
  this.insultCooldown = 0;
  this.insult = function(){
    this.insultCooldown++;
    if(keyDown[32] && this.insultCooldown > 60){
      this.insultCooldown = 0;
      var inBattle = false;
      for(var i = 0; i < enemies.length; i++){
        if(distance(this, enemies[i]) < 10 && !inBattle){
          inBattle = true;
          tempPX = p.x;
          tempPY = p.y;
          enemyInBattle = enemies[i];
          clearInterval(overLoop);
          battleLoop = setInterval(battle, 1000 / 60);
        }
      }
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

function distance(a, b){
  return Math.hypot((a.y - b.y), (a.x - b.x));
}

function battle(){
  //Clean canvas
  ctx.clearRect(0, 0, s, s);

  //reset camera
  p.x = 0;
  p.y = 0;

  drawObjectsInBattle();

  battleUI();
  
  manageInsults();
}

function drawObjectsInBattle(){
  drawPolygon(p.sides, 7, -25, 5);
  drawPolygon(enemyInBattle.sides, 4, 25, -25);
}

function battleUI(){
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.moveTo(0, s * (5.5 / 8));
  ctx.lineTo(s, s * (5.5 / 8));
  ctx.moveTo(s / 2, s * (5.5 / 8));
  ctx.lineTo(s / 2, s);
  ctx.moveTo(0, s * (5.5 / 8) + (0.5 * s * (2.5 / 8)));
  ctx.lineTo(s, s * (5.5 / 8) + (0.5 * s * (2.5 / 8)));
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.strokeStyle = "green";
  ctx.lineWidth = 10;
  ctx.moveTo(0, s * (5.5 / 8) - 5);
  ctx.lineTo(s * ((p.health - 2) / (p.sides - 2)), s * (5.5 / 8) - 5);
  ctx.stroke();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.closePath();
  ctx.fillText(p.learnedInsults[0][0], s * (1 / 4), (s * (5.5 / 8)) + ((1 / 4) * (s * (2.5 / 8))));
  ctx.fillText(p.learnedInsults[1][0], s * (3 / 4), (s * (5.5 / 8)) + ((1 / 4) * (s * (2.5 / 8))));
  ctx.fillText(p.learnedInsults[2][0], s * (1 / 4), (s * (5.5 / 8)) + ((3 / 4) * (s * (2.5 / 8))));
  ctx.fillText(p.learnedInsults[3][0], s * (3 / 4), (s * (5.5 / 8)) + ((3 / 4) * (s * (2.5 / 8))));
  ctx.fillText("1", s * (0.25 / 4), (s * (5.5 / 8)) + ((0.4 / 4) * (s * (2.5 / 8))));
  ctx.fillText("2", s * (2.25 / 4), (s * (5.5 / 8)) + ((0.4 / 4) * (s * (2.5 / 8))));
  ctx.fillText("3", s * (0.25 / 4), (s * (5.5 / 8)) + ((2.4 / 4) * (s * (2.5 / 8))));
  ctx.fillText("4", s * (2.25 / 4), (s * (5.5 / 8)) + ((2.4 / 4) * (s * (2.5 / 8))));
}

function manageInsults(){
  //keycodes for 1, 2, 3, 4 are 49, 50, 51, 52
  if(keyDown[49] && !insulting){
    useInsult(0);
  }
  if(keyDown[50] && !insulting){
    useInsult(1);
  }
  if(keyDown[51] && !insulting){
    useInsult(2);
  }
  if(keyDown[52] && !insulting){
    useInsult(3);
  }
  if(insulting){
    drawInsult();
  }
}

function useInsult(insult){
  insulting = true;
  currentInsult = insult;
  currentEnemyInsult = Math.floor(Math.random() * insults.length)
  setTimeout(function(){insulting = false;}, 1000);
  if(p.learnedInsults[insult][1] == -1) enemyInBattle.health--;
  p.health -= 2;
  if(p.learnedInsults[insult][1] == enemyInBattle.sides){
    enemyInBattle.health -= 2;
  }
  enemyInBattle.changeSides(enemyInBattle, enemyInBattle.health);
  if(enemyInBattle.health <= 2){
    for(var i = 0; i < 4; i++){
      var randInsult = learnableInsults[Math.floor(Math.random() * learnableInsults.length)];
      while(insultsToLearn.includes(randInsult) || p.learnedInsults.includes(randInsult)) randInsult = learnableInsults[Math.floor(Math.random() * learnableInsults.length)];
      insultsToLearn[i] = randInsult;
    }
    setTimeout(function(){
      p.score++;
      p.health = p.sides;
      enemyInBattle.x = undefined;
      clearInterval(battleLoop);
      overLoop = setInterval(updateOverworld, 1000 / 60);
      p.x = tempPX;
      p.y = tempPY;
    }, 1000);
  } else if(p.health <= 2){
    setTimeout(
      function(){
        ctx.clearRect(0, 0, s, s);
        clearInterval(battleLoop);
        ctx.fillText("You Died. In a game about shapes.", s / 2, s / 2);
    }, 1000);
  }
}

function drawInsult(){
  ctx.fillText(p.learnedInsults[currentInsult][0], (s / 4), s * (1.25 / 4));
  ctx.fillText(insults[currentEnemyInsult][0], s * (3 / 4), s * (0.5 / 4))
}

function levelUp(){
  ctx.fillStyle = "white";
  ctx.fillRect(s * (2.25 / 4), 0, s / 2, s);
  ctx.strokeRect(s * (2.25 / 4), 0, s * (1.75 / 4), s);
  ctx.beginPath();
  ctx.moveTo(s * (2.25 / 4), s * (1 / 4));
  ctx.lineTo(s, s * (1 / 4));
  ctx.moveTo(s * (2.25 / 4), s * (2 / 4));
  ctx.lineTo(s, s * (2 / 4));
  ctx.moveTo(s * (2.25 / 4), s * (3 / 4));
  ctx.lineTo(s, s * (3 / 4));
  ctx.stroke();
  ctx.closePath();
  ctx.fillStyle = "black";
  for(var i = 0; i < 4; i++){
    ctx.fillText(i + 1, (s * (3.125 / 4)), (s * ((i) / 4)) + 20);
    ctx.fillText(insultsToLearn[i][0], s * 3.125 / 4, s * i / 4 + (s * (1 / 8)));
  }
  if(keyDown[49]){
    p.score -= p.scoreToNext;
    p.scoreToNext *= 1.5;
    p.sides++;
    p.health++;
    moveToLearn = 0;
    promptLearn();
  } else if(keyDown[50]){
    p.score -= p.scoreToNext;
    p.scoreToNext *= 1.5;
    p.sides++;
    p.health++;
    moveToLearn = 1;
    promptLearn();
  } else if(keyDown[51]){
    p.score -= p.scoreToNext;
    p.scoreToNext *= 1.5;
    p.sides++;
    p.health++;
    moveToLearn = 2;
    promptLearn();
  } else if(keyDown[52]){
    p.score -= p.scoreToNext;
    p.scoreToNext *= 1.5;
    p.sides++;
    p.health++;
    moveToLearn = 3;
    promptLearn();
  }
}

function promptLearn(){
  clearInterval(overLoop);
  ctx.clearRect(0, 0, s, s);
  ctx.fillText("Press Space to learn this move, or X to cancel the move learning process.", s / 2, s / 2);
  ctx.fillText(insultsToLearn[moveToLearn][0], s / 2, s / 2 + 50);
  if(keyDown[32]){
    pickToReplace();
  } else if(keyDown[88]){
    overLoop = setInterval(updateOverworld, 1000 / 60);
  } else setTimeout(promptLearn, 1000 / 60);
}

function pickToReplace(){
  ctx.clearRect(0, 0, s, s);
  ctx.fillText("Which move would you like to replace?", s / 2, 20);
  for(var i = 0; i < 4; i++){
    ctx.fillText((i + 1) + ": " + p.learnedInsults[i][0], s * (1 / 4), ((s / 2) * (i / 4)) + (s / 4));
  }
  if(keyDown[49]){
    p.learnedInsults[0] = insultsToLearn[moveToLearn];
    overLoop = setInterval(updateOverworld, 1000 / 60);
  } else if(keyDown[50]){
    p.learnedInsults[1] = insultsToLearn[moveToLearn];
    overLoop = setInterval(updateOverworld, 1000 / 60);
  } else if(keyDown[51]){
    p.learnedInsults[2] = insultsToLearn[moveToLearn];
    overLoop = setInterval(updateOverworld, 1000 / 60);
  } else if(keyDown[52]){
    p.learnedInsults[3] = insultsToLearn[moveToLearn];
    overLoop = setInterval(updateOverworld, 1000 / 60);
  } else setTimeout(pickToReplace, 1000 / 60);
}
