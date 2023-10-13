// ===================== Fall 2022 EECS 493 Assignment 3 =====================
// This starter code provides a structure and helper functions for implementing
// the game functionality. It is a suggestion meant to help you, and you are not
// required to use all parts of it. You can (and should) add additional functions
// as needed or change existing functions.

// ==================================================
// ============ Page Scoped Globals Here ============
// ==================================================

// Div Handlers
let game_window;
let game_screen;
let onScreenAsteroid;

// Difficulty Helpers
let astProjectileSpeed = 3;          // easy: 1, norm: 3, hard: 5

// Game Object Helpers
let currentAsteroid = 1;
let AST_OBJECT_REFRESH_RATE = 15;
let maxPersonPosX = 1218;
let maxPersonPosY = 658;
let PERSON_SPEED = 5;                // Speed of the person
let vaccineOccurrence = 20000;       // Vaccine spawns every 20 seconds
let vaccineGone = 5000;              // Vaccine disappears in 5 seconds
let maskOccurrence = 15000;          // Masks spawn every 15 seconds
let maskGone = 5000;                 // Mask disappears in 5 seconds

// Movement Helpers
var LEFT = false;
var RIGHT = false;
var UP = false;
var DOWN = false;
var touched = false;

// ==============================================
// ============ Functional Code Here ============
// ==============================================

// Main
$(document).ready(function () {
  // ====== Startup ====== 
  game_window = $('.game-window');
  game_screen = $("#actual_game");
  onScreenAsteroid = $('.curAstroid');

  // TODO: ADD MORE
  //spawn(); // Example: Spawn an asteroid that travels from one border to another
  game_screen.hide();
  var slider = document.getElementById("volume-slider");
  var slider_output = document.getElementById("volume-value");
  slider_output.innerHTML = slider.value;
  /*slider.oninput = function() {
    output.innerHTML = this.value;
  }*/
});

// TODO: ADD YOUR FUNCTIONS HERE

function setting_click() {
  var difficulty = window.frontend.getDifficulty();
  var difficulty_output = document.getElementById("button-medium");
  if (difficulty == Difficulty.Easy) {
    difficulty_output = document.getElementById("button-easy");
  } else if (difficulty == Difficulty.Medium) {
    difficulty_output = document.getElementById("button-medium");
  } else if (difficulty == Difficulty.Hard) {
    difficulty_output = document.getElementById("button-hard");
  }
  $('#settings-popup').show();
  difficulty_output.focus();
}

function setting_close() {
  $('#settings-popup').hide();
}

class RunGame {
  constructor(game) {
    this.loop = null;
    this.game = game;
  }

  init() {
    if (this.game) {
      this.game.init();
    }
  }

  start() {
    this.init();
    this.loop = setInterval(() => {
        this.update();
        this.render();
    }, AST_OBJECT_REFRESH_RATE); 
  }

  update() {
    if (this.game) {
      this.game.update();
    }
  }

  render() {
    if (this.game) {
      this.game.render();
    }
  }

  stop() {
    clearInterval(this.loop);
  }

  resize() {
    if ( this.game ) {
      this.game.resize();
    }
  }
}

const Difficulty = {
  Easy : 1,
  Medium : 2,
  Hard : 3,
}

class Settings {
  constructor(game) {
    this.init();
    this.game = game;
  }

  init() {
    this.max_volume = 100;
    this.current_volume = 50;
    this.difficulty =  Difficulty.Medium;
    this.game_level = 1;
    this.portal_spawn_timer_seconds = 20;
    this.portal_exit_timer_seconds = 5;
    this.shield_spawn_timer_seconds = 15;
    this.shield_exit_timer_seconds = 5;
    this.game_over_timer_seconds = 2;
    this.game_over = false;
    this.danger = 20;
    this.level_multiplier = 1;
  }

  clear() {
    this.init();
  }

  setGameOver() {
    this.game_over = true;
  }

  getGameOver() {
    return this.game_over;
  }

  setVolume(volume_in) {
    this.current_volume = volume_in;
  }

  getVolume() {
    var min_volume = 0;
    var max_volume = 100;
    
    var dom_min_volume = 0.0;
    var dom_max_volume = 1.0;

    var mapped_dom_volume = dom_min_volume +
                ((this.current_volume - min_volume) * (dom_max_volume - dom_min_volume)) / (max_volume - min_volume);

    return mapped_dom_volume;
  }

  setDifficultyToEasy() {
    this.difficulty = Difficulty.Easy;
  }

  setDifficultyToMedium() {
    this.difficulty = Difficulty.Medium;
  }

  setDifficultyToHard() {
    this.difficulty = Difficulty.Hard;
  }

  getDifficulty() {
    return this.difficulty;
  }

  incrementGameLevel() {
    this.game_level++;
    this.danger = this.danger + 2;
    this.level_multiplier = this.game_level * 0.2;
  }

  getGameLevel() {
    return this.game_level;
  }

  getDanger() {
    return this.danger;
  }   

  getAsteroidSpeedMultiplier() {
    var speed_multipler = 1.0;
    if (this.difficulty == Difficulty.Easy) {
      speed_multipler = 1.0;
    } else if (this.difficulty == Difficulty.Medium) {
      speed_multipler = 3.0;
    } else {
      speed_multipler = 5.0;
    }
    return speed_multipler * this.level_multiplier;
  }

  getAsteroidSpawnRateTimerMs() {
    if (this.difficulty == Difficulty.Easy) {
      return 1000;
    } else if (this.difficulty == Difficulty.Medium) {
      return 800;
    } else if (this.difficulty == Difficulty.Hard) {
      return 600;
    }
  }

  getShieldSpawnTimerMs() {
    return this.shield_spawn_timer_seconds * 1000;
  }

  getShieldExitTimerMs() {
    return this.shield_exit_timer_seconds * 1000;
  }

  getPortalSpawnTimerMs() {
    return this.portal_spawn_timer_seconds * 1000;
  }

  getPortalExitTimerMs() {
    return this.portal_exit_timer_seconds * 1000;
  }

  getGameOverTimerMs() {
    return this.game_over_timer_seconds * 1000;
  }
}

class Graphics {
  constructor() {
    this.cnv = null;
    this.ctx = null;
  }

  init() {
    this.cnv = document.getElementById("start-game");
    this.ctx = this.cnv.getContext("2d");
  } 

  fillCanvas(color) {
    this.drawRect(0,0, this.cnv.width,this.cnv.height, color);
  }

  fillBackgroundImage(image_path) {
    const img = new Image();
    img.src = image_path;
    img.onload = () => {
        this.ctx.drawImage(img, 0, 0, this.cnv.width, this.cnv.height);
    };
  }

  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x,y, width,height);
    this.ctx.fill();
  }

  rotateAndDrawImage(image, atx, aty, angle) {
    if (image && this.ctx) {
        this.ctx.save();
        this.ctx.translate(atx+image.width/2, aty+image.height/2);
        this.ctx.rotate(angle);
        this.ctx.drawImage(image, -image.width/2,-image.height/2);
        this.ctx.restore();
    }
  }
}

class Game {
  constructor() {
    this.graphics = new Graphics();
    this.settings = new Settings(this);
    this.player = new Player(this.settings);
    this.asteroids = new AsteroidService(this.player, this.settings);
    this.shields = new ShieldsService(this.player, this.settings);
    this.portals = new PortalsService(this.player, this.settings);
  }

  init() {
    this.graphics.init();
    this.player.init();
    this.settings.init();
    this.asteroids.init();
    this.shields.init();
    this.portals.init();
  }

  clear() {
    this.player.clear();
    this.settings.clear();
    this.asteroids.clear();
    this.shields.clear();
    this.portals.clear();
  }

  gameLevelChanged() {
    // todo: asteroids
  }

  update() {
    this.player.update();
    this.asteroids.update();
    this.shields.update();
    this.portals.update();
  }

  render() {
    this.graphics.fillCanvas("#FFF");
    this.player.render();
    this.asteroids.render();
    this.shields.render();
    this.portals.render();
  }
}

class ShieldsService {
  constructor(player, settings) {
    this.collection = [];
    this.player = player;
    this.settings = settings;
  }

  init() {
    var spawnShield = () => {
      this.spawnShield();
    };

    this.shield_spawn_timer = setTimeout(spawnShield, this.settings.getShieldSpawnTimerMs());
  }

  clear() {
    this.collection.forEach(a => {
      a = null;
    })
    this.collection = [];
  }

  gameLevelChanged() {
    this.clear();
    this.init();
  }

  spawnShield() {
    clearTimeout(this.shield_spawn_timer);

    if (this.settings.getGameOver()) {
      return;
    }
    let shield = new Shield(1, this.settings);
    shield.init();
    this.collection.push(shield);

    var removeShield = () => {
      this.removeShield(shield);
    };

    shield.remove_shield_timer = setTimeout(removeShield, this.settings.getShieldExitTimerMs());
  }

  removeShield(shield) {
    clearTimeout(shield.remove_shield_timer);

    if (this.player.playerShielded) {
      this.player.removeShield();
    }

    //this.player.restoreImage();

    var spawnShield = () => {
      this.spawnShield();
    };

    this.shield_spawn_timer = setTimeout(spawnShield, this.settings.getShieldSpawnTimerMs());

    this.collection.forEach(a => {
      if (a == shield) {
        this.collection.pop(shield);
        return;
      }
    });
  }

  update() {
    this.collection.forEach(a => {
      a.update();
      a.checkForCollisionsWithPlayer(this.player);
    });
  }

  render() {
    this.collection.forEach(a => {
      a.render();
    });
  }
}

class Shield {
  constructor(size, settings) {
    this.size = size;
    this.graphics = new Graphics();
    this.img = null;
    this.active = false;
    this.remove_shield_timer = 0;
    this.assigned = false;
    this.settings = settings;
  }

  init() {
    this.graphics.init();
    this.setShieldImage();
    this.active = true;
    this.init_location();
  }

  init_location() {
    let x = getRandomNumber(0, window.innerWidth);
    let y = getRandomNumber(0, window.innerHeight);
    this.cur_x = x;
    this.cur_y = y
  }

  update() {

  }

  render() {
    if ( this.active ) {
      this.graphics.rotateAndDrawImage(this.img, this.cur_x,this.cur_y, this.rotation);
    }
  }

  hasCollidedWithEntity(entity) {
    if ( !this.active || !entity.active ) { 
      return false;
    }

    let aLeftOfB = ( entity.x + entity.size ) < ( this.cur_x );
    let aRightOfB = ( entity.x ) > ( this.cur_x + this.img.width );
    let aAboveB = ( entity.y ) > ( this.cur_y + this.img.height );
    let aBelowB = ( entity.y + entity.size ) < ( this.cur_y );

    return !( aLeftOfB || aRightOfB || aAboveB || aBelowB );
  }
  
  checkForCollisionsWithPlayer(player) {
    let active = ( player.state == player.alive ) ? true : false;
    let entity = {
      x: player.x,
      y: player.y,
      size: player.img.width,
      active: active,
    }

    if ( this.hasCollidedWithEntity(entity)) {
      this.active = false;
      this.assigned = true;

      player.setShield(window.frontend.getResource("player-shielded-img"));
    }
  }

  setShieldImage() {
    this.img = window.frontend.getResource("shield-img");
  }
}

class PortalsService {
  constructor(player, settings) {
    this.collection = [];
    this.player = player;
    this.settings = settings;
  }

  init() {
    var spawnPortal = () => {
      this.spawnPortal();
    };

    this.portal_spawn_timer = setTimeout(spawnPortal, this.settings.getPortalSpawnTimerMs());
  }

  clear() {
    this.collection.forEach(a => {
      a = null;
    })
    this.collection = [];
  }

  gameLevelChanged() {
    this.clear();
    this.init();
  }

  spawnPortal() {
    clearTimeout(this.portal_spawn_timer);

    if (this.settings.getGameOver()) {
      return;
    }

    let portal = new Portal(1, this.settings);
    portal.init();
    this.collection.push(portal);

    var removePortal = () => {
      this.removePortal(portal);
    };

    portal.remove_portal_timer = setTimeout(removePortal, this.settings.getPortalExitTimerMs());
  }

  removePortal(portal) {
    clearTimeout(portal.remove_portal_timer);

    if (this.player.playerPortaled) {
      this.player.removePortal();
    }

    var spawnPortal = () => {
      this.spawnPortal();
    };

    this.portal_spawn_timer = setTimeout(spawnPortal, this.settings.getPortalSpawnTimerMs());

    this.collection.forEach(a => {
      if (a == portal) {
        this.collection.pop(portal);
        return;
      }
    });
  }

  update() {
    this.collection.forEach(a => {
      a.update();
      a.checkForCollisionsWithPlayer(this.player);
    });
  }

  render() {
    this.collection.forEach(a => {
      a.render();
    });
  }
}

class Portal {
  constructor(size, settings) {
    this.size = size;
    this.graphics = new Graphics();
    this.img = null;
    this.active = false;
    this.remove_portal_timer = 0;
    this.assigned = false;
    this.settings = settings;
  }

  init() {
    this.graphics.init();
    this.setPortalImage();
    this.active = true;
    this.init_location();
  }

  init_location() {
      // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
      let x = getRandomNumber(0, window.innerWidth);
      let y = getRandomNumber(0, window.innerHeight);
      this.cur_x = x;
      this.cur_y = y
    }

    update() {

    }

    render() {
      if ( this.active ) {
        this.graphics.rotateAndDrawImage(this.img, this.cur_x,this.cur_y, this.rotation);
      }
    }

    hasCollidedWithEntity(entity) {
      if ( !this.active || !entity.active ) { 
        return false;
      }

      let aLeftOfB = ( entity.x + entity.size ) < ( this.cur_x );
      let aRightOfB = ( entity.x ) > ( this.cur_x + this.img.width );
      let aAboveB = ( entity.y ) > ( this.cur_y + this.img.height );
      let aBelowB = ( entity.y + entity.size ) < ( this.cur_y );

      return !( aLeftOfB || aRightOfB || aAboveB || aBelowB );
    }
    
    checkForCollisionsWithPlayer(player) {
      let active = ( player.state == player.alive ) ? true : false;
      let entity = {
        x: player.x,
        y: player.y,
        size: player.img.width,
        active: active,
      }

      if ( this.hasCollidedWithEntity(entity)) {
        this.active = false;
        this.assigned = true;

        player.setPortal();
        this.settings.incrementGameLevel();
      }
    }

    setPortalImage() {
      this.img = window.frontend.getResource("portal-img");
    }
  }

  class Player {
    constructor(settings) {
      this.graphics = new Graphics();
      // this.keyboardHandler = new KeyboardHandler();
      this.settings = settings;
      this.img = null;
      this.pewAudio = null;
      this.killAudio = null;
  
      this.turnSpeed = 5.0;
      this.acceleration = 5;
      this.friction = 0.99;
  
      this.x = 0;
      this.y = 0;
      this.thrust = { x:0, y:0 };
      this.angle = this.degreestoradians(270);
      this.rotation = 0;
      this.reload = 10;
      this.frames = 0;
  
      this.alive = 1;
      this.dying = 2;
      this.dead = 3;
      this.game_over = 4;
      this.state = this.alive;
      this.dyingTime = 240;
      this.score = 0;
      this.playerShielded = false;
      this.playerPortaled = false;
    }
  
    degreestoradians(degrees) {
      return Math.PI * degrees / 180;
    }
  
    init() {
      this.graphics.init();
      // this.keyboardHandler.init();
      this.img = window.frontend.getResource("player-img");
      // this.laserSound = window.frontend.getResource("laser-audio");
      this.pewAudio = window.frontend.getResource("pew-audio");
      this.killAudio = window.frontend.getResource("kill-audio");
  
      this.x = this.graphics.cnv.width/2 - this.img.width/2;
      this.y = this.graphics.cnv.height/2 - this.img.height/2;
  
      // https://www.rocketshipgames.com/blogs/tjkopena/2015/03/asteroids-moving-objects/
      this.thrust = { x:0, y:0 };
      
      // https://www.rocketshipgames.com/blogs/tjkopena/2015/02/asteroids-drawing-objects/
      /* Essentially all modern computer displays and most software use a slightly different 
         coordinate system from what’s typically used in mathematics: The origin is at the top 
         left of the screen, and the y axis increases going down the screen, not up. Note 
         that this means the 90 degree angle is actually facing down and 270 degrees points straight up.
  
          A wide variety of ways to work with these facts can be applied, but the easiest is just to model
          the polygon facing to the right and to keep that coordinate scheme in mind. 
      */
      this.angle = this.degreestoradians(270);
      this.rotation = 0;
      this.reload = 10;
      this.frames = 0;
  
      this.state = this.alive;
      this.dyingTime = 240;
      this.playerShielded = false;
      this.score = 0;
    }
  
    clear() {
      this.init();
    }
  
    playGame() {
      var updateScore = () => {
        this.updateScore();
      };
      this.update_score_id = setTimeout(updateScore, 500);
    }
  
    stopGame() {
      clearTimeout(this.update_score_id);
      this.state = this.game_over;
    }
  
    update() {
      if ( this.state == this.dead ) {
        window.frontend.stopGame();
        return;
      }
      if ( false && this.state == this.dying ) {
        this.dyingTime--;
        this.state = ( this.dyingTime > 0 ) ? this.dying : this.dead;
        return;
      }
  
      // https://www.rocketshipgames.com/blogs/tjkopena/2015/03/asteroids-moving-objects/
      // https://www.rocketshipgames.com/blogs/tjkopena/2015/02/asteroids-drawing-objects/
      this.frames++;
      this.rotation = 0;
      this.thrust.x = this.thrust.x * this.friction;
      this.thrust.y = this.thrust.y * this.friction;
  
      // out of bounds checks.
      if ( this.x > this.graphics.cnv.width ) {
        this.x = this.graphics.cnv.width - this.img.width/2;
      }
      if ( this.x + this.img.width < 0 ) {
        this.x = this.img.width / 2;
      }
      if ( this.y > this.graphics.cnv.height ) {
        this.y = this.graphics.cnv.height - this.img.height /2;
      }
      if ( this.y + this.img.height < 0 ) {
        this.y = this.img.height / 2;
      }
  
      if (this.state == this.alive) {
        var key_pressed = false;
        if ( UP == true) {
          this.thrust.x = this.acceleration * Math.cos(this.angle);
          this.thrust.y = this.acceleration * Math.sin(this.angle);
          if (this.playerShielded) {
            this.img = window.frontend.getResource("player-shielded-up-img");
          } else {
            this.img = window.frontend.getResource("player-up-img");
          }
          key_pressed = true;
        }
  
  
        if (DOWN == true) {
          this.thrust.x = -1 * this.acceleration * Math.cos(this.angle);
          this.thrust.y = -1 * this.acceleration * Math.sin(this.angle);
          if (this.playerShielded) {
            this.img = window.frontend.getResource("player-shielded-down-img");
          } else {
            this.img = window.frontend.getResource("player-down-img");
          }
          key_pressed = true;
        }
  
        if ( LEFT == true) {
          this.rotation = (-this.turnSpeed / 180) * Math.PI;
          if (this.playerShielded) {
            this.img = window.frontend.getResource("player-shielded-left-img");
          } else {
            this.img = window.frontend.getResource("player-left-img");
          }
          key_pressed = true;
        }
        if ( RIGHT == true) {
          this.rotation = (this.turnSpeed / 180) * Math.PI;
          if (this.playerShielded) {
            this.img = window.frontend.getResource("player-shielded-right-img");
          } else {
            this.img = window.frontend.getResource("player-right-img");
          }
          key_pressed = true;
        }
     
        if (!key_pressed) {
          if (this.playerShielded) {
            this.img = window.frontend.getResource("player-shielded-img");
          } else {
            this.img = window.frontend.getResource("player-img");
          }
        }
     
        this.angle += this.rotation;
        this.x += this.thrust.x;
        this.y += this.thrust.y;
      }
    }
  
    render() {
      if ( this.state != this.dead ) {
        this.graphics.rotateAndDrawImage(this.img, this.x,this.y, this.angle);
      }
      var score_element = document.getElementById("score");
      console.log("updating score to %d", this.score);
      score_element.innerHTML = this.score.toString(); 
    }
  
    kill() {
      this.state = this.dying;
      this.settings.setGameOver();
  
      var img = window.frontend.getResource("player-touched-img");
      this.img = img;
      this.killAudio.volume = this.settings.getVolume();
  
      this.killAudio.pause();
      this.killAudio.currentTime = 0;
      this.killAudio.play();
  
      var killHandler = () => {
        this.killHandler();
      };
  
      setTimeout(killHandler, this.settings.getGameOverTimerMs());
    }
  
    killHandler() {
      this.state = this.dead;
    }
  
    setShield(image) {
      this.img = image;
      this.playerShielded = true;
      this.pewAudio.volume = this.settings.getVolume();
  
      this.pewAudio.pause();
      this.pewAudio.currentTime = 0;
      this.pewAudio.play();
    }
  
    removeShield() {
      this.img = window.frontend.getResource("player-img");
      this.playerShielded = false;       
    }
  
    setPortal(image = null) {
      if (image != null) {
        this.img = image;
      }
      this.playerPortaled = true;
      this.pewAudio.volume = this.settings.getVolume();
      this.pewAudio.pause();
      this.pewAudio.currentTime = 0;
      this.pewAudio.play();
    }
  
    removePortal() {
      this.playerPortaled = false;
      this.img = window.frontend.getResource("player-img");        
    }
  
    restoreImage() {
      this.img = window.frontend.getResource("player-img");
      this.playerShielded = false;
  
    }
  
    updateScore() {
      if (this.state == this.alive) {
        this.score += 40;
        clearTimeout(this.update_score_id);
        var updateScore = () => {
          this.updateScore();
        };
        this.update_score_id = setTimeout(updateScore, 500);
      }
    }
  }

class Frontend {
  constructor(game) {
    this.start_game_cnv = null;
    this.start_game_ctx = null;
    this.resources = null;
    this.resourcesToLoad = 0;
    this.run_game = new RunGame(game);
    this.firstTime = true;
  }

  resize() {
    if (this.start_game_cnv) {
      this.start_game_cnv.width = window.innerWidth;
      this.start_game_cnv.height = window.innerHeight;
    }
  }

  clear() {
    this.run_game.game.clear();
  }

  prepareCanvas(canvas_id) {
    this.start_game_cnv = document.getElementById(canvas_id);
    this.start_game_ctx = this.start_game_cnv.getContext("2d");                        
    document.body.style.margin = 0;
    document.body.style.padding = 0;
    this.resize();
  }

  toggleScreen(id, toggle) {
    let element = document.getElementById(id);
    let display = ( toggle ) ? "block" : "none";
    element.style.display = display;
  }

  showScreen(id) {
    this.toggleScreen(id, true);
  }

  hideScreen(id) {
    this.toggleScreen(id, false);
  }

  showHowToPlayScreen() {
    this.showScreen("start-game");
    this.toggleScreen("outer-container-id", false);
    this.toggleScreen("how-to-play-page", true);
  }

  playGameClick() {
    this.toggleScreen("outer-container-id", false);
    this.toggleScreen("game-options", false);
    this.prepareCanvas("start-game");
    if (this.firstTime) {
      this.showHowToPlayScreen();
    } else {
      this.startGameClick();
    }
  }

  startGameClick() {
    this.hideScreen("start-game");
    this.toggleScreen("how-to-play-page", false);
    this.toggleScreen("get-ready-page", true);
    var getting_ready_screen_done = (() => { 
      const get_ready = document.getElementById("get-ready-page");
      get_ready.style.display = 'none';
      this.onGettingReadyDone();
    });
    setTimeout(getting_ready_screen_done, 3000);
  }

  startOverClick() {
    this.firstTime = false;
    this.hideScreen("game-over-page");
    this.clear();
    this.toggleScreen("game-options", true);
    this.toggleScreen("outer-container-id", true);
    this.prepareCanvas("start-game");
  }

  onGettingReadyDone() {
    this.prepareCanvas("start-game");
    this.playGame();
  }

  playGame() {
    this.toggleScreen("score-board", true)
    this.showScreen("start-game");
    this.run_game.start();
    this.run_game.game.player.playGame();
  }

  stopGame() {
    this.run_game.game.player.stopGame();
    this.run_game.stop();
    this.hideScreen("start-game");
    this.toggleScreen("score-board", false);
    this.showScreen("game-over-page");
  }

  getResource(id) {
    return this.resources.filter(r => r.id === id)[0].var;
  }

  load(resources) {
    if ( !resources || resources.length == 0 ) {
        this.prepareCanvas("start-game");
        return;
    }
    this.resources = resources;
    this.resourcesToLoad = this.resources.length;
    for (let i = 0; i < this.resources.length; i++) {
      if ( this.resources[i].var != undefined ) {
        if ( this.resources[i].var.nodeName == "IMG" ) {
          this.beginLoadingImage(this.resources[i].var, this.resources[i].file); 
        }
        if (this.resources[i].var.nodeName == "AUDIO") {
          this.beginLoadingAudio(this.resources[i].var, this.resources[i].file);
        }
      }
    }
  }

  beginLoadingImage(imgVar, fileName) {
    imgVar.onload = () => this.launchIfReady();
    imgVar.src = fileName;
  }

  beginLoadingAudio(audioVar, fileName) {
    audioVar.src = fileName;
    audioVar.addEventListener("canplay", () => this.launchIfReady());
  } 

  setVolume() {
    //this.current_volume;
    var slider = document.getElementById("volume-slider");
    var output = document.getElementById("volume-value");
    output.innerHTML = slider.value;
    this.run_game.game.settings.setVolume(slider.value);
  }

  setDifficultyToEasy() {
    this.run_game.game.settings.setDifficultyToEasy();
  }

  setDifficultyToMedium() {
    this.run_game.game.settings.setDifficultyToMedium();
  }

  setDifficultyToHard() {
    this.run_game.game.settings.setDifficultyToHard();
  }

  getDifficulty() {
    return this.run_game.game.settings.getDifficulty();
  }

  launchIfReady() {
    // todo: fixme
  }
}

class AsteroidService {
  constructor(player, settings) {
    this.player = player;
    this.settings = settings;
    this.total_asteroids = 0;
    this.collection = [];
  }

  init(total) {
    this.spawnAsteroidHelper();
  }

  clear() {
    this.collection.forEach(a => {
      a = null;
    })
    this.collection = [];
  }

  gameLevelChanged() {
    this.clear();
    this.init(0);
  }

  spawnAsteroidHelper() {
    var spawnAsteroid = () => {
      this.spawnAsteroid();
    };
    this.spawn_asteroid_timer = setTimeout(spawnAsteroid, this.settings.getAsteroidSpawnRateTimerMs());
  }

  spawnAsteroid() {
    clearTimeout(this.spawn_asteroid_timer);
    if (this.settings.getGameOver()) {
      return;
    }
    this.total_asteroids++;
    let asteroid = new Asteroid(1, this.settings);
    asteroid.init();
    this.collection.push(asteroid);
    this.spawnAsteroidHelper();
  }

  update() {
    this.collection.forEach(a => {
      a.update();
      a.checkForCollisionsWithPlayer(this.player);
    });
  }

  render() {
    this.collection.forEach(a => {
      a.render();
    });
  }
}

class Asteroid {
  constructor(size, settings) {
    this.graphics = new Graphics();
    this.settings = settings;
    this.img = null;
    this.killAudio = null;
    this.active = false;
  }

  init() {
    this.graphics.init();
    this.setAsteroidImg();
    this.killAudio = window.frontend.getResource("kill-audio");
    this.active = true;
    this.init_location();
  }

  init_location() {
    // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
    let x = getRandomNumber(0, 1280);
    let y = getRandomNumber(0, 720);
    let floor = 784;
    let ceiling = -64;
    let left = 1344;
    let right = -64;
    let major_axis = Math.floor(getRandomNumber(0, 2));
    let minor_aix =  Math.floor(getRandomNumber(0, 2));
    let num_ticks;

    if(major_axis == 0 && minor_aix == 0){
      this.cur_y = floor;
      this.cur_x = x;
      let bottomOfScreen = window.innerHeight;
      num_ticks = Math.floor((bottomOfScreen + 64) / this.settings.getAsteroidSpeedMultiplier());

      this.x_dest = (window.innerWidth - x);
      this.x_dest = (this.x_dest - x)/num_ticks + getRandomNumber(-.5,.5);
      this.y_dest = -this.settings.getAsteroidSpeedMultiplier() - getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if(major_axis == 0 && minor_aix == 1){
      this.cur_y = ceiling;
      this.cur_x = x;
      let bottomOfScreen = window.innerHeight;
      num_ticks = Math.floor((bottomOfScreen + 64) / this.settings.getAsteroidSpeedMultiplier());

      this.x_dest = (window.innerWidth - x);
      this.x_dest = (this.x_dest - x)/num_ticks + getRandomNumber(-.5,.5);
      this.y_dest = this.settings.getAsteroidSpeedMultiplier() + getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = 784;
      this.sign_of_switch = 'pos';
    }
    if(major_axis == 1 && minor_aix == 0) {
      this.cur_y = y;
      this.cur_x = left;
      let bottomOfScreen = window.innerWidth;
      num_ticks = Math.floor((bottomOfScreen + 64) / this.settings.getAsteroidSpeedMultiplier());

      this.x_dest = -this.settings.getAsteroidSpeedMultiplier() - getRandomNumber(0, .5);
      this.y_dest = (window.innerHeight - y);
      this.y_dest = (this.y_dest - y)/num_ticks + getRandomNumber(-.5,.5);
      this.hide_axis = 'x';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if(major_axis == 1 && minor_aix == 1){
      this.cur_y = y;
      this.cur_x = right;
      let bottomOfScreen = window.innerWidth;
      num_ticks = Math.floor((bottomOfScreen + 64) / this.settings.getAsteroidSpeedMultiplier());

      this.x_dest = this.settings.getAsteroidSpeedMultiplier() + getRandomNumber(0, .5);
      this.y_dest = (window.innerHeight - y);
      this.y_dest = (this.y_dest - y)/num_ticks + getRandomNumber(-.5,.5);
      this.hide_axis = 'x';
      this.hide_after = 1344;
      this.sign_of_switch = 'pos';
    }
    // show this Asteroid's initial position on screen
    // this.id.css("top", this.cur_y);
    // this.id.css("right", this.cur_x);
    // normalize the speed s.t. all Asteroids travel at the same speed
    let speed = Math.sqrt((this.x_dest)*(this.x_dest) + (this.y_dest)*(this.y_dest));
    this.x_dest = this.x_dest / speed;
    this.y_dest = this.y_dest / speed;
  }

  update() {
    if ( this.active && !this.settings.getGameOver()) {
      // ensures all asteroids travel at current level's speed
      this.cur_y += this.y_dest * this.settings.getAsteroidSpeedMultiplier();
      this.cur_x += this.x_dest * this.settings.getAsteroidSpeedMultiplier();
      if (this.hasReachedEnd()) {
        this.active = false;
        return;
      }
    }
  }

  // Requires: called by the user
  // Modifies:
  // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
  //          return false otherwise
  hasReachedEnd() {
    if(this.hide_axis == 'x'){
      if(this.sign_of_switch == 'pos'){
        if(this.cur_x > this.hide_after){
          return true;
        }                    
      } else {
        if(this.cur_x < this.hide_after){
          return true;
        }          
      }
    } else {
      if(this.sign_of_switch == 'pos'){
        if(this.cur_y > this.hide_after){
          return true;
        }                    
      } else {
        if(this.cur_y < this.hide_after){
          return true;
        }          
      }
    }
    return false;
  }

  render() {
    if ( this.active) {
      this.graphics.rotateAndDrawImage(this.img, this.cur_x,this.cur_y, this.rotation);
    }
  }

  collisionDetected() {
    this.active = false;
    this.killAudio.volume = this.settings.getVolume();
    this.killAudio.pause();
    this.killAudio.currentTime = 0;
    this.killAudio.play();
  }

  hasCollidedWithEntity(entity) {
    if ( !this.active || !entity.active ) { return false; }

    let aLeftOfB = ( entity.x + entity.size ) < ( this.cur_x );
    let aRightOfB = ( entity.x ) > ( this.cur_x + this.img.width );
    let aAboveB = ( entity.y ) > ( this.cur_y + this.img.height );
    let aBelowB = ( entity.y + entity.size ) < ( this.cur_y );

    return !( aLeftOfB || aRightOfB || aAboveB || aBelowB );
  }

  checkForCollisionsWithPlayer(player) {
    let active = ( player.state == player.alive ) ? true : false;
    let entity = {
      x: player.x,
      y: player.y,
      size: player.img.width,
      active: active,
    }

    if ( active && this.hasCollidedWithEntity(entity)) {
      if (!player.playerShielded) {
        player.kill();
      } else {
        player.removeShield();
      }
    }
  } 

  setAsteroidImg() {
    this.img = window.frontend.getResource("asteroid-img");
  }
}

// Game initialization 
let game = new Game();
window.frontend = new Frontend(game);

window.onload = function() {
	window.frontend.load([
		{ id: "player-img", var: playerImg = document.createElement("img"), file: "./src/player/player.png" },
		{ id: "player-left-img", var: playerLeftImg = document.createElement("img"), file: "./src/player/player_left.png" },
		{ id: "player-right-img", var: playerRightImg = document.createElement("img"), file: "./src/player/player_right.png" },
		{ id: "player-up-img", var: playerUpImg = document.createElement("img"), file: "./src//player/player_up.png" },
		{ id: "player-down-img", var: playerDownImg = document.createElement("img"), file: "./src/player/player_down.png" },
		{ id: "player-right-img", var: playerRightImg = document.createElement("img"), file: "./src/player/player_right.png" },
		{ id: "player-shielded-img", var: playerShieldImg = document.createElement("img"), file: "./src/player/player_shielded.png" },
    { id: "player-shielded-up-img", var: playerShieldUpImg = document.createElement("img"), file: "./src/player/player_shielded_up.png" },
    { id: "player-shielded-down-img", var: playerShieldDownImg = document.createElement("img"), file: "./src/player/player_shielded_down.png" },
    { id: "player-shielded-left-img", var: playerShieldLeftImg = document.createElement("img"), file: "./src/player/player_shielded_left.png" },
    { id: "player-shielded-right-img", var: playerShieldRightImg = document.createElement("img"), file: "./src/player/player_shielded_right.png" },
    { id: "player-touched-img", var: playerTouchedImg = document.createElement("img"), file: "./src/player/player_touched.gif" },
		{ id: "asteroid-img", var: asteroidImg = document.createElement("img"), file: "./src/asteroid.png" },
		{ id: "shield-img", var: shieldImg = document.createElement("img"), file: "./src/shield.gif" },
		{ id: "portal-img", var: portalImg = document.createElement("img"), file: "./src/port.gif" },
		{ id: "kill-audio", var: killAudio = document.createElement("audio"), file: "./src/audio/die.mp3" },
		{ id: "pew-audio", var: pewAudio = document.createElement("audio"), file: "./src/audio/pew.mp3" },
		]);
}

window.onresize = function() {
    window.frontend.resize();
}


// Keydown event handler
document.onkeydown = function (e) {
  if (e.key == 'ArrowLeft') LEFT = true;
  if (e.key == 'ArrowRight') RIGHT = true;
  if (e.key == 'ArrowUp') UP = true;
  if (e.key == 'ArrowDown') DOWN = true;
}

// Keyup event handler
document.onkeyup = function (e) {
  if (e.key == 'ArrowLeft') LEFT = false;
  if (e.key == 'ArrowRight') RIGHT = false;
  if (e.key == 'ArrowUp') UP = false;
  if (e.key == 'ArrowDown') DOWN = false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}