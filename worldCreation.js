function createWorld(){
  new NPC(10, 0,  3, ["Hello, and welcome to Flatland!"]);
  new NPC(30, 20, 3, ["This is a world of adventure, 2 dimensions, and a lazy developer."]);
  new NPC(50, 40, 3, ["The NPC's can't even move!"]);
  new NPC(30, 60, 3, ["Or say more than one thing!", "Or so you thought!", "The repeating text is a feature."]);
  new NPC(30, 80, 3, ["If you're ready to set off on your adventure, go and talk to Professor Pentagon.", "He's working on his new invention, color, south of me."]);
  new NPC(30, 150, 5, ["Hello!", "It's good to see you, [Name Here]!", "...", "You're not going to say anything?", "Do you notice... anything different?", "I made color!", "I've named this one purple.", "Here, you can have some.", "It's called 'clear'", "Anyway, could you go and try to tell the nobles about it for me?", "They're the ones with lots of sides.", "You can find them further south."]);
  npcs[5].color = "red";
  var badGuy0 = new NPC(30, 200, 20, ["What's this!?", "You seem... different, somehow.", "A different hue, has Professor Pentagon colored you clear?", "This new invention is useless.", "I'm sorry, but I'll have to call guards to fight you now."]);
  badGuy0.action = function(){
    for(var i = 0; i < 4; i ++){
      new Enemy(p.x + Math.random() * 50 - 25, p.y + Math.random() * 50 - 25, p.sides + 1);
      this.xSpeed = 1;
      setTimeout(function(){
        badGuy0 = undefined;
        npcs[5].textTimerIndex = 0;
        npcs[5].text = ["I guess we'll have to be alone in this quest.", "No, I promise, you did agree.", "Anyway, I've left a color-inator to bring you out of the tutorial.", "You can follow this objective line."];
        npcs[5].action = function(){
          objectiveX = 200;
          objectiveY = 0;
          new NPC(200, 0, 4, ["Hello- I'm the professor's color inator.", "I'm a convenient plot device, designed to bring you somewhere else.", "And make you pink. Good luck!"]).color = "pink";
          npcs[npcs.length - 1].action = function(){
            p.color = "purple";
            entities.splice(1, entities.length - 1);
            npcs.splice(0, npcs.length);
            enemies.splice(0, enemies.length);
            objectiveX = undefined;
            enemies = [];
            p.x = 0;
            p.y = 0;
            stageTwo();
          }
        }
      }, 10000);
    }
  }
}

function stageTwo(){
  randSpawns = true;
  var checkLoop = setInterval(function(){
    if(p.sides > 10){
      p.x = 0;
      p.y = 0;
      randSpawns = false;
      clearInterval(checkLoop);
      new NPC(30, 30, 5, ["You finished the game!", "I'm glad you decided to waste your time."]);
      npcs[npcs.length - 1].color = red;
      npcs[npcs.length - 1].action = function(){
      }
    }
  }, 1000);
}
