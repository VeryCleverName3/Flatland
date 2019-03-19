//Get canvas and context and set canvas size to full window
var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");
var s = c.width = c.height = window.innerHeight;

//Enemy insult pool
var insults = [["You're not looking very SHARP today.", -1], ["You're about to be poly-GONE!", -1], ["You're a poly-GONE-er!", -1], ["I'm poly-GONNA beat you up!", -1], ["Stop being so OBTUSE!", -1], ["You're so EDGY!", -1], ["Stop being so ACUTE!", -1], ["You're so out of SHAPE!", -1], ["You're out of LINE!", -1]];

//Player insult pool
var learnableInsults = [["Are you all RIGHT?", 4], ["For a triangle, you're not very SHARP!", 3], ["You're about to be penta-GONE!", 5], ["You're about to be hexa-GONE", 6], ["You're about to be septa-GONE", 7], ["You're about to be octa-GONE", 8], ["Don't be so SQUARE!", 4], ["I'm poly-GONNA beat you up", -1], ["Don't be so OBTUSE", -1], ["You look like a piece of modern art", -1], ["You OCTA get outta here!", 8]];

//Set up textalign and format
ctx.textAlign = "center";
ctx.font = "20px comic sans ms";

//establish timing loop at 60 fps
var overLoop = setInterval(updateOverworld, 1000 / 60);

//boolean for if random spawns should be used
var randSpawns = false;

//array of boolean values at keycode indexes
var keyDown = [];

//Array of colors to be randomly assigned to enemies
var colors = ["red", "blue", "green", "purple", "pink", "yellow", "orange"];

//Array of npcs
var npcs = [];

//Objective points
var objectiveX;
var objectiveY;

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

//Mouse down event listener for link to code
onmousedown = function(e){
  if(e.clientY < 50){
    window.open("code.html");
  }
}

//Create and intantiate a player
var p = new Player(0, 0, 3);

//Makes the world
createWorld();

//Create update function
function updateOverworld(){
  //Reset screen
  ctx.clearRect(0, 0, s, s);

  ctx.fillText("Click here to see code", s / 2, 30);

  cleanEnemyArray();

  drawObjectiveLine();

  if(randSpawns) randomSpawns();

  cleanEnemyArray();

  drawEntities();

  cleanEnemyArray();

  //move player
  p.move();

  cleanEnemyArray();

  //manage insults
  p.insult();

  cleanEnemyArray();

  callEnemyFunctions();

  callNPCFunctions();

  cleanEnemyArray();

  if(p.score >= p.scoreToNext){
    levelUp();
  }
  cleanEnemyArray();
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
  this.color = "black";
  this.sides = sides;
  this.health = sides;
  this.id = entities.length;
  entities[entities.length] = this;
  //Function to draw entity
  this.draw = function(){
    //ctx.fillRect((this.x * s / 100) - (p.x * s / 100) + (s / 2), (this.y * s / 100) - (p.y * s / 100) + (s / 2), s / 100, s / 100);
    drawPolygon(this.sides, 2, this.x, this.y, this.color);
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
        object.health = newSides;
        if(this.sides < 3){
          entities.splice(object.id, 1);
          enemies.splice(object.enemyId, 1);
        }
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
    if(this.insultCooldown > 60){
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
function drawPolygon(sides, r, x, y, color){
  r *= s / 100;
  var angleDif  = 180 - (((sides - 2) * 180) / sides);
  var angle = 0;
  var xOffset = ((x * (s / 100)) - (p.x * (s / 100)) + (s / 2));
  var yOffset = ((y * (s / 100)) - (p.y * (s / 100)) + (s / 2));
  ctx.beginPath();
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
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
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
  ctx.moveTo(xOffset, yOffset);
  ctx.lineTo(xOffset + xMid, yOffset + yMid);

}

function Enemy(x, y, sides){
  Entity.call(this, x, y, sides);
  this.enemyId = enemies.length;
  enemies[enemies.length] = this;
  var timer = 0;
  var headingX = 0;
  var headingY = 0;
  var running = false;
  var runningTarget;
  this.insultTimer = 60;
  this.insultText = insults[Math.floor(Math.random() * insults.length)][0];
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
  this.collide = function(){
    for(var i = 0; i < enemies.length; i++){
      if(distance(enemies[i], this) < 5 && enemies[i].sides < this.sides && enemies.runningTarget != this){
        if(enemies[i].sides > 3) enemies[i].changeSides(enemies[i], Math.ceil(enemies[i].sides - 1));
        enemies[i].running = true;
        enemies[i].runningTarget = this;
        this.insultTimer = 0;
      }
    }
  }
  this.run = function(){
    if(this.running){
      if(distance(this.runningTarget, this) < 100){
        if(this.x < this.runningTarget.x){
          this.x -= 0.25;
        } else this.x += 0.25;
        if(this.y < this.runningTarget.y){
          this.y -= 0.25;
        } else this.y += 0.25;
      }
    }
  }
  this.sayInsult = function(){
    var xOffset = ((this.x * (s / 100)) - (p.x * (s / 100)) + (s / 2));
    var yOffset = ((this.y * (s / 100)) - (p.y * (s / 100)) + (s / 2));
    this.insultTimer++;
    if(this.insultTimer < 60) ctx.fillText(this.insultText, xOffset, yOffset - (s * (3 / 100)));
  }
}

function callEnemyFunctions(){
  for(var i = 0; i < enemies.length; i++){
    enemies[i].wander();
    enemies[i].collide();
    enemies[i].run();
    enemies[i].sayInsult();
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
  ctx.strokeStyle = p.color;
  drawPolygon(p.sides, 7, -25, 5);
  ctx.strokeStyle = enemyInBattle.color;
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
      enemyInBattle.x = NaN;
      entities.splice(entities.indexOf(enemyInBattle), 1);
      enemies.splice(enemies.indexOf(enemyInBattle), 1);
      delete enemyInBattle;
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
  ctx.strokeStyle = "black";
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

function randomSpawns(){
  var numEnemies = 0;
  for(var i = 0; i < enemies.length; i++){
    numEnemies++;
    if(enemies[i].y > p.y + 130 || enemies[i].y < p.y - 130){
      entities[entities.indexOf(enemies[i])] = undefined;
      enemies[i] = undefined;
      numEnemies--;
    } else if(enemies[i].x > p.x + 130 || enemies[i].x < p.x - 130){
      entities[entities.indexOf(enemies[i])] = undefined;
      enemies[i] = undefined;
      numEnemies--;
    }
  }
  if(numEnemies < 25){
    var x = Math.random() * 130 - 65;
    var y = Math.random() * 130 - 65;
    while(x > -50 && x < 50) x = Math.random() * 130 - 65;
    while(y > -50 && y < 50) y = Math.random() * 130 - 65;
    new Enemy(x + p.x, y + p.y, Math.floor(Math.random() * 8 + 3));
    enemies[enemies.length - 1].color = colors[Math.floor(Math.random() * colors.length)];
  }
}

function Line(x, y, sides){
  Entity.call(this, x, y, sides);
  this.insultText = "";
  this.insultTimer = 60;
  this.angle = 0;
  this.move = function(){
    this.slope = Math.tan(this.angle * (Math.PI / 180));
    console.log(this.slope + ", " + this.angle);
    if(this.angle > 90 && this.angle < 270) this.direction = -1;
    else this.direction = 1;
    if(keyDown[65]){
      this.angle -= 4;
    }
    if(keyDown[68]){
      this.angle += 4;
    }
    while(this.angle > 360) this.angle -= 360;
    while(this.angle < 0) this.angle += 360;
    if(keyDown[87]){
      this.x -= (this.slope / (Math.abs(this.slope) + 1)) * this.direction;
      this.y += (1 / (Math.abs(this.slope) + 1)) * this.direction;
    }
    if(keyDown[83]){
      this.x += (this.slope / (Math.abs(this.slope) + 1)) * this.direction;
      this.y -= (1 / (Math.abs(this.slope) + 1)) * this.direction;
    }
  }
  this.insult = function(){
    for(var i = 0; i < enemies.length; i++){
      if(distance(enemies[i], this) < 5 && enemies[i].runningTarget != this){
        enemies[i].sides = 1.7;
        enemies[i].changeSides(enemies[i], 1);
        enemies[i].running = true;
        enemies[i].runningTarget = this;
        this.insultTimer = 0;
        this.insultText = insults[Math.floor(Math.random() * insults.length)][0];
      }
    }
    if(this.insultTimer < 60){
      var xOffset = ((this.x * (s / 100)) - (p.x * (s / 100)) + (s / 2));
      var yOffset = ((this.y * (s / 100)) - (p.y * (s / 100)) + (s / 2));
      this.insultTimer++;
      ctx.fillText(this.insultText, xOffset, yOffset - (s * (3 / 100)));
    }
  }
  this.draw = function(){
    var xOffset = ((this.x * (s / 100)) - (p.x * (s / 100)) + (s / 2));
    var yOffset = ((this.y * (s / 100)) - (p.y * (s / 100)) + (s / 2));
    drawLineAtAngle(50, this.angle, xOffset, yOffset);
  }
}

function cleanEnemyArray(){
  for(var i = 0; i < entities.length; i++){
    if(entities[i] == undefined){
      entities.splice(i, 1);
    }
  }
  for(var i = 0; i < enemies.length; i++){
    if(enemies[i] == undefined){
      enemies.splice(i, 1);
    }
  }
}

//NPC constructor
function NPC(x, y, sides, text){
  Entity.call(this, x, y, sides);
  this.npcid = npcs.length;
  npcs.push(this);
  this.text = text;
  this.textTimerIndex = 0;
  this.action = function(){};
  this.xSpeed = 0;
  this.ySpeed = 0;
  this.completedAction = false;
  this.move = function(){
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }
  this.talk = function(){
    if(distance(p, this)  < 20){
      var xOffset = ((this.x * (s / 100)) - (p.x * (s / 100)) + (s / 2));
      var yOffset = ((this.y * (s / 100)) - (p.y * (s / 100)) + (s / 2));
      this.textTimerIndex++;
      if(this.textTimerIndex >= (this.text.length * 180)){
         this.textTimerIndex = 0;
         if(!this.completedAction) {
           this.action();
           this.completedAction = true;
         }
       }
      ctx.fillText(this.text[Math.floor(this.textTimerIndex / 180)], xOffset, yOffset - (s * (5 / 100)));
    }
  }
}

function  callNPCFunctions(){
  for(var i = 0; i < npcs.length; i++){
    npcs[i].talk();
    npcs[i].move();
  }
}

function drawObjectiveLine(){
  if(objectiveX != undefined){
    var coords = {
      x: objectiveX,
      y: objectiveY
    }
    if(distance(coords, p) > (Math.sqrt((50 * 50) + (50 * 50)))){
      var xOffset = ((objectiveX * (s / 100)) - (p.x * (s / 100)) + (s / 2));
      var yOffset = ((objectiveY * (s / 100)) - (p.y * (s / 100)) + (s / 2));
      ctx.beginPath();
      ctx.moveTo(s / 2, s / 2);
      ctx.lineTo(xOffset, yOffset);
      ctx.strokeStyle = "grey";
      ctx.stroke();
      ctx.closePath();
    }
  }
}
