"use strict";
let currentScreen;
let player;
let playerSpeed = 6;
let enemies = [];
let lasers = [];
let enemyLasers = [];
let enemyMissiles = [];
let enemyPlasmaBalls = [];
let isShooting = false;
let score = 0;
let lives = 3;
let shootInterval = 0.5;
let lastShootTime = 0;
let stars = [];
let planets = [];
let minSpawnInterval = 80;
let maxSpawnInterval = 600;
let lastSpawnTime = 0;
let enemy2SpawnCooldown = 4000;
let lastEnemy2SpawnTime = 0;
let enemy3ShootInterval = 3000;
let gameOver = false;
let nextPlanetSpawnFrame = 400;
let nextPowerupScore = 1000;
let powerupItems = [];
let powerupSpawned = false;
let powerupActive = false;
let powerupEndTime = 0;
let shieldActive = false;
let shieldEndTime = 0;
let shield;
let uiContainer;
let blinkInterval = 500;
let lastBlinkTime = 0;
let showText = true;
let playerName = '';
let underscores = '___';

// Gamepad variables
let gamepad = null;
let prevGamepadButtons = [];
let gamepadDeadzone = 0.2;

const LOADING = 0;
const MAIN_MENU = 1;
const PLAY = 2;
const GAME_OVER = 3;
const LEADERBOARD = 4;

let playerImage, playerLaserImage;
let playerLifeImage, trailImage, enemy1Image, enemy2Image, enemy3Image, enemy4Image;
let enemyLaserImage, enemyMissileImage, enemyPlasma1Image, enemyPlasma2Image, enemyDestroyed1Image, enemyDestroyed2Image, enemyDestroyed3Image;
let powerupItemImage, powerupIconImage, shieldImage, shieldItemImage, shieldIconImage;
let star1Image, star2Image;
let planet1Image, planet2Image, planet3Image, planet4Image, planet5Image;
let planet6Image, planet7Image, planet8Image, planet9Image, planet10Image;
let mainMenuImage;
let playerHitAni, enemyHitAni, explosionAni;

let menuMusic, gameMusic;
let playerLaserSound, enemyLaserSound, plasmaBallSound, explosionSound, missileSound;
let twoToneSound, loseSound, powerupActiveSound, powerupUnactiveSound;

let loadingVid;

let futureFont;

function preload() {
  playerImage = loadImage('sprites/player.png');
  playerLaserImage = loadImage('sprites/playerLaser.png');
  playerLifeImage = loadImage('sprites/playerLife.png');
  trailImage = loadImage('sprites/trail.png');
  enemy1Image = loadImage('sprites/enemy1.png');
  enemy2Image = loadImage('sprites/enemy2.png');
  enemy3Image = loadImage('sprites/enemy3.png');
  enemy4Image = loadImage('sprites/enemy4.png');
  enemyLaserImage = loadImage('sprites/enemyLaser.png');
  enemyMissileImage = loadImage('sprites/missile.png');
  enemyPlasma1Image = loadImage('sprites/plasma1.png');
  enemyPlasma2Image = loadImage('sprites/plasma2.png');
  enemyDestroyed1Image = loadImage('sprites/enemyDestroyed1.png');
  enemyDestroyed2Image = loadImage('sprites/enemyDestroyed2.png');
  enemyDestroyed3Image = loadImage('sprites/enemyDestroyed3.png');
  powerupItemImage = loadImage('sprites/powerupItem.png');
  powerupIconImage = loadImage('sprites/powerupIcon.png');
  shieldImage = loadImage('sprites/shield.png');
  shieldItemImage = loadImage('sprites/shieldItem.png');
  shieldIconImage = loadImage('sprites/shieldIcon.png');
  star1Image = loadImage('sprites/star1.png');
  star2Image = loadImage('sprites/star2.png');
  planet1Image = loadImage('sprites/planet1.png');
  planet2Image = loadImage('sprites/planet2.png');
  planet3Image = loadImage('sprites/planet3.png');
  planet4Image = loadImage('sprites/planet4.png');
  planet5Image = loadImage('sprites/planet5.png');
  planet6Image = loadImage('sprites/planet6.png');
  planet7Image = loadImage('sprites/planet7.png');
  planet8Image = loadImage('sprites/planet8.png');
  planet9Image = loadImage('sprites/planet9.png');
  planet10Image = loadImage('sprites/planet10.png');
  mainMenuImage = loadImage('images/mainMenu.png');

  menuMusic = loadSound('sound/menuMusic.ogg');
  gameMusic = loadSound('sound/gameMusic.ogg');
  menuMusic.setVolume(0.4);
  gameMusic.setVolume(0.4);

  playerLaserSound = loadSound('sound/sfx_playerLaser.ogg');
  playerLaserSound.setVolume(0.5);
  enemyLaserSound = loadSound('sound/sfx_enemyLaser.ogg');
  enemyLaserSound.setVolume(0.3);
  plasmaBallSound = loadSound('sound/sfx_plasmaBall.ogg');
  plasmaBallSound.setVolume(0.5);
  explosionSound = loadSound('sound/sfx_explosion.ogg');
  missileSound = loadSound('sound/sfx_missile.ogg');
  twoToneSound = loadSound('sound/sfx_twoTone.ogg');
  loseSound = loadSound('sound/sfx_lose.ogg');
  powerupActiveSound = loadSound('sound/sfx_shieldUp.ogg')
  powerupUnactiveSound = loadSound('sound/sfx_shieldDown.ogg')

  loadingVid = createVideo('videos/loading.mp4');

  futureFont = loadFont('fonts/kenvector_future.ttf');
}

function setup() {
  createCanvas(600, 800);
  currentScreen = LOADING;

  playerHitAni = loadAni('sprites/playerHit1.png', 4);
  enemyHitAni = loadAni('sprites/enemyHit1.png', 4);
  explosionAni = loadAni('sprites/enemyDestroyed1.png', 3);

  playerHitAni.layer = 4;
  enemyHitAni.layer = 4;
  
  explosionAni.frameDelay = 8;
  explosionAni.scale = 2.5;
  explosionAni.layer = 4;

  loadingVid.hide();

  uiContainer = select('#uiContainer');
  uiContainer.style('position', 'absolute');
  uiContainer.style('pointer-events', 'none');
  uiContainer.style('z-index', '1');
  uiContainer.style('width', '600px');
  uiContainer.style('height', '800px');
}

function draw() {
  background('#121012');
  
  // Poll gamepad
  pollGamepad();

  switch (currentScreen) {
    case LOADING:
      drawLoadingScreen();
      break;
    case MAIN_MENU:
      drawMainMenuScreen();
      break;
    case PLAY:
      drawPlayScreen();
      break;
    case GAME_OVER:
      drawGameOverScreen();
      break;
    case LEADERBOARD:
      drawLeaderboardScreen();
      break;
  }
}

function drawLoadingScreen() {
  image(loadingVid, 0, 0, 600, 800);
  loadingVid.play();

  uiContainer.html(`
    <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; text-align: center;">
      Loading...
    </div>
  `);

  if (frameCount === 120) {
    currentScreen = MAIN_MENU;
    uiContainer.html(''); // Clear the uiContainer when transitioning to the main menu
  }
}

function drawMainMenuScreen() {
  image(mainMenuImage, 0, 0, width, height); // Display the main menu image

  if(!menuMusic.isPlaying()) {
    menuMusic.loop();
  }

  let currentTime = millis();
  if (currentTime - lastBlinkTime > blinkInterval) {
    lastBlinkTime = currentTime;
    showText = !showText;
  }

  if (showText) {
    uiContainer.html(`
      <div style="position: absolute; left: 50%; top: 80%; transform: translate(-50%, -50%); color: white; font-size: 28px; text-align: center;">
        Insert Coin
      </div>
    `);
  } else {
    uiContainer.html('');
  }
}

function keyPressed() {
  switch (currentScreen) {
    case MAIN_MENU:
      if (keyCode === ENTER) {
        startGame();
      }
      break;
    case PLAY:
      if (key === ' ') {
        isShooting = true;
      }
      break;
    case GAME_OVER:
      if (keyCode === ENTER && playerName.length === 3) {
        saveScore();
        currentScreen = LEADERBOARD;
      } else if (keyCode === BACKSPACE && playerName.length > 0) {
        playerName = playerName.slice(0, -1);
        underscores = playerName + '_'.repeat(3 - playerName.length);
      } else if (playerName.length < 3 && /^[a-zA-Z]$/.test(key)) {
        playerName += key.toUpperCase();
        underscores = playerName + '_'.repeat(3 - playerName.length);
      }
      break;  
    case LEADERBOARD:
      if (keyCode === ENTER) {
        resetGame();
        currentScreen = MAIN_MENU;
        uiContainer.html('');
      }
      break;
  }
}

function keyReleased() {
  if (currentScreen === PLAY && key === ' ') {
    isShooting = false;
  }
}

function startGame() {
  currentScreen = PLAY;
  gameOver = false;
  score = 0;
  lives = 3;
  enemies = [];
  lasers = [];
  enemyLasers = [];
  enemyMissiles = [];
  enemyPlasmaBalls = [];
  stars = [];
  planets = [];

  menuMusic.stop();
  gameMusic.loop();

  player = new Sprite(width / 2, height - 80);
  player.img = playerImage;
  player.removeColliders();
  player.layer = 3;
  player.scale = 0.7;

  for (let i = 0; i < 60; i++) {
    let star = new Sprite(random(width), random(height), 5, 5);
    star.img = random([star1Image, star2Image]);
    star.scale = 0.5;
    star.layer = 0;
    star.velocity.y = 2;
    star.collider = 'kinematic';
    stars.push(star);
  }


  let planetSize = random(0.05, 0.2);
  let planet = new Sprite(random(width), random(height), planetSize, planetSize);
  planet.img = random([planet1Image, planet2Image, planet3Image, planet4Image, planet5Image,
                          planet6Image, planet7Image, planet8Image, planet9Image, planet10Image]);
  planet.scale = planetSize;
  planet.collider = 'kinematic';
  planet.layer = 1;
  planet.velocity.y = 3;    
  planets.push(planet);

}

function drawPlayScreen() {
  spawnStars();
  spawnPlanets();
  updateStars();
  updatePlanets();
  shootLaser();

  // Keyboard input
  let moveX = 0;
  let moveY = 0;
  
  if (kb.pressing('left')) {
    moveX = -playerSpeed;
  } else if (kb.pressing('right')) {
    moveX = playerSpeed;
  }
  
  if (kb.pressing('up')) {
    moveY = -playerSpeed;
  } else if (kb.pressing('down')) {
    moveY = playerSpeed;
  }
  
  // Gamepad input (left stick or D-pad)
  if (gamepad) {
    // Left stick
    let stickX = gamepad.axes[0];
    let stickY = gamepad.axes[1];
    
    if (Math.abs(stickX) > gamepadDeadzone) {
      moveX = stickX * playerSpeed;
    }
    if (Math.abs(stickY) > gamepadDeadzone) {
      moveY = stickY * playerSpeed;
    }
    
    // D-pad (buttons 12-15: up, down, left, right)
    if (gamepad.buttons[14] && gamepad.buttons[14].pressed) {
      moveX = -playerSpeed; // D-pad left
    } else if (gamepad.buttons[15] && gamepad.buttons[15].pressed) {
      moveX = playerSpeed; // D-pad right
    }
    if (gamepad.buttons[12] && gamepad.buttons[12].pressed) {
      moveY = -playerSpeed; // D-pad up
    } else if (gamepad.buttons[13] && gamepad.buttons[13].pressed) {
      moveY = playerSpeed; // D-pad down
    }
    
    // Shooting with A button (0), X button (2), or Right Trigger (7)
    if ((gamepad.buttons[0] && gamepad.buttons[0].pressed) ||
        (gamepad.buttons[2] && gamepad.buttons[2].pressed) ||
        (gamepad.buttons[7] && gamepad.buttons[7].value > 0.5)) {
      isShooting = true;
    } else if (!kb.pressing(' ')) {
      // Only stop shooting if keyboard space is also not pressed
      isShooting = false;
    }
  }
  
  player.velocity.x = moveX;
  player.velocity.y = moveY;
  
  player.position.x = constrain(player.position.x, 25, width - 25);
  player.position.y = constrain(player.position.y, height / 2, height - 25);

  spawnEnemies();
  updateEnemies();
  updatePowerupItems();
  updatePowerups();
  updateShield();
  updateLasers();
  updateEnemyLasers();
  updateEnemyMissiles();
  updateEnemyPlasmaBalls();
  checkCollisions();

  // Display the score on the top right
  uiContainer.html(`
  <div style="position: absolute; right: 40px; top: 30px; color: white; font-size: 24px; text-align: center;">
    Score<br>
    <span style="font-size: 32px;">${score}</span>
  </div>
`);

  // Display the lives on the top left
  let livesHtml = `
    <div style="position: absolute; left: 40px; top: 30px; color: white; font-size: 24px;">
      Lives
    </div>
  `;

  for (let i = 0; i < lives; i++) {
    livesHtml += `
      <img src="sprites/playerLife.png" style="position: absolute; left: ${40 + i * 30}px; top: 70px; width: 20px; height: 20px;">
    `;
  }

  uiContainer.html(uiContainer.html() + livesHtml);

  updateLivesDisplay();
  updatePowerupDisplay();

  if (lives <= 0) {
    loseSound.play();
    explosionSound.play();
    animation(explosionAni, player.position.x, player.position.y);
    player.remove();
    currentScreen = GAME_OVER;
    gameOver = true;

    if (shieldActive) {
      shield.remove();
    }
  }
}

function spawnStars() {
  if (frameCount % 15 === 0) {
    let star = new Sprite(random(width), 0, 5, 5);
    star.img = random([star1Image, star2Image]);
    star.scale = 0.5;
    star.collider = 'kinematic';
    star.layer = 0;
    star.velocity.y = 2;
    stars.push(star);
  }
}

function spawnPlanets() {
  if (frameCount >= nextPlanetSpawnFrame) {
    let planetSize = random(0.05, 0.2);
    let planet = new Sprite(random(width), 0 - 150, planetSize, planetSize);
    planet.img = random([planet1Image, planet2Image, planet3Image, planet4Image, planet5Image,
                            planet6Image, planet7Image, planet8Image, planet9Image, planet10Image]);
    planet.scale = planetSize;
    planet.collider = 'kinematic';
    planet.layer = 1;
    planet.velocity.y = 3;
    planets.push(planet);

    nextPlanetSpawnFrame = frameCount + random(150, 600);
  }
}

function updateStars() {
  for (let i = stars.length - 1; i >= 0; i--) {
    if (stars[i].position.y > height) {
      stars[i].remove();
      stars.splice(i, 1);
    }
  }
}

function updatePlanets() {
  for (let i = planets.length - 1; i >= 0; i--) {
    if (planets[i].position.y - 100 > height) {
      planets[i].remove();
      planets.splice(i, 1);
      console.log('planet removed');
    }
  }
}

function spawnEnemies() {
  if (!gameOver && frameCount - lastSpawnTime > random(minSpawnInterval, maxSpawnInterval)) {
    lastSpawnTime = frameCount;
    let enemyType = 1;

    if (score >= 500) {
      enemyType = random([1, 2]);
      maxSpawnInterval = 400;
    }
    if (score >= 1000) {
      enemyType = random([1, 2, 3]);
      maxSpawnInterval = 200;
    }
    if (score >= 1500) {
      enemyType = random([1, 2, 3, 4]);
      maxSpawnInterval = 150;
    }

    if (enemyType === 1) {
      let enemy = new Sprite(random(45, width - 45), 0 - 30, 30, 30);
      enemy.img = enemy1Image;
      enemy.scale = 0.7;
      enemy.addSensor(0, 0, enemy.width + 35, enemy.height + 20);
      enemy.enemyType = enemyType;
      enemy.health = 1;
      enemy.removeColliders();
      enemy.layer = 3;
      enemy.lastShootTime = 0;
      enemies.push(enemy);
    } else if (enemyType === 2) {
      if (millis() - lastEnemy2SpawnTime > enemy2SpawnCooldown) {
        lastEnemy2SpawnTime = millis();
        let initialX = random(30, width - 30);
        let initialDirection = initialX < width / 2 ? 1 : -1;

        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            let enemy = new Sprite(initialX, 0 - 50, 30, 30);
            enemy.img = enemy2Image;
            enemy.scale = 0.6;
            enemy.addSensor(0, 0, enemy.width + 55, enemy.height + 20);
            enemy.enemyType = enemyType;
            enemy.health = 2;
            enemy.initialDirection = initialDirection;
            enemy.removeColliders();
            enemy.layer = 3;
            enemy.lastShootTime = 0;
            enemies.push(enemy);
          }, i * 600);
        }
      }
    } else if (enemyType === 3) {
      let enemy3Count = enemies.filter(enemy => enemy.enemyType === 3).length;
      let maxEnemy3Count = score >= 1500 ? 2 : 1;

      if (enemy3Count < maxEnemy3Count) {
        let availablePositions = [150, 300, 450];
        
        // Remove positions already occupied by enemy3
        enemies.forEach(enemy => {
          if (enemy.enemyType === 3) {
            let index = availablePositions.indexOf(enemy.position.x);
            if (index !== -1) {
              availablePositions.splice(index, 1);
            }
          }
        });

        if (availablePositions.length > 0) {
          let randomIndex = floor(random(availablePositions.length));
          let spawnX = availablePositions[randomIndex];

          let enemy = new Sprite(spawnX, 0, 30, 30);
          enemy.img = enemy3Image;
          enemy.enemyType = enemyType;
          enemy.health = 3;
          enemy.removeColliders();
          enemy.addSensor(0, 0, enemy.width + 40, enemy.height + 35);
          enemy.layer = 3;
          enemy.lastShootTime = 0;
          enemy.isRotating = false;
          enemy.rotationStartTime = 0;
          enemies.push(enemy);
        }
      }
    } else if (enemyType === 4) {
      let enemy4Count = enemies.filter(enemy => enemy.enemyType === 4).length;
    
      if (enemy4Count === 0) {
        let enemy = new Sprite(random(30, width - 30), random(30, 400), 30, 30);
        enemy.img = enemy4Image;
        enemy.enemyType = enemyType;
        enemy.health = 2;
        enemy.removeColliders();
        enemy.addSensor(0, 0, enemy.width + 40, enemy.height + 40);
        enemy.layer = 3;
        enemy.lastShootTime = 0;
        enemies.push(enemy);
      }
    }

    if (score >= nextPowerupScore && !powerupSpawned) {
      let powerupType = random() < 0.5 ? 'powerup' : 'shield';
      let powerupItem = new Sprite(random(30, width - 30), 0, 30, 30);
      powerupItem.removeColliders();
      powerupItem.velocity.y = 3;
      powerupItem.powerupType = powerupType;
      
      if (powerupType === 'powerup') {
        powerupItem.img = powerupItemImage;
      } else {
        powerupItem.img = shieldItemImage;
      }

      powerupItems.push(powerupItem);
      powerupSpawned = true;
      nextPowerupScore += 1000;
    } else if (score < nextPowerupScore) {
      powerupSpawned = false;
    }
  }  
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].position.y > height + 50 || enemies[i].position.x < 0 - 100 || enemies[i].position.x > width + 100) {
      enemies[i].remove();
      enemies.splice(i, 1);
      console.log('enemy removed');
    } else {
      switch (enemies[i].enemyType) {
        case 1:
          enemy1Movement(enemies[i]);
          enemy1Behaviour(enemies[i]);
          break;
        case 2:
          enemy2Movement(enemies[i]);
          enemy2Behaviour(enemies[i]);
          break;
        case 3:
          enemy3Movement(enemies[i]);
          enemy3Behaviour(enemies[i]);
          break;
        case 4:
          enemy4Movement(enemies[i]);
          enemy4Behaviour(enemies[i]);
          break;
      }
    }
  }
}

function updatePowerupItems() {
  for (let i = powerupItems.length - 1; i >= 0; i--) {
    if (powerupItems[i].position.y > height + 50) {
      powerupItems[i].remove();
      powerupItems.splice(i, 1);
    }
  }
}

function updatePowerups() {
  let currentTime = millis();

  if (powerupActive && currentTime > powerupEndTime) {
    powerupUnactiveSound.play();
    powerupActive = false;
  }

  if (shieldActive && currentTime > shieldEndTime) {
    powerupUnactiveSound.play();
    shieldActive = false;
    shield.remove();
  }
}

function updateShield() {
  if (shieldActive) {
    shield.position.x = player.position.x;
    shield.position.y = player.position.y;
  }
}

function enemy1Movement(enemy) {
  enemy.velocity.y = 4.5;
}

function enemy2Movement(enemy) {
  enemy.velocity.y = 2.5;
  enemy.velocity.x = enemy.initialDirection * 3;
}

function enemy3Movement(enemy) {
  if (gameOver) {
    enemy.velocity.y = -3; // Move enemy off screen when game is over

    if (enemy.position.y <= 0 - 50) {
      enemy.remove();
    }
  } else {
    if (enemy.position.y < 160) {
      enemy.velocity.y = 3;
    } else {
      enemy.velocity.y = 0;
      if (!enemy.isRotating) {
        enemy.isRotating = true;
        enemy.rotationStartTime = millis();
      }
      enemy.rotateTowards(player, 0.1, 270);
    }
  }
}

function enemy4Movement(enemy) {
  if (gameOver) {
    enemy.velocity.x = -12;

    if (enemy.position.x <= 0 - 50) {
      enemy.remove();
    }
  } else {
    if (!enemy.targetPosition) {
      // Set initial position offscreen
      enemy.position.x = random(0, 1) < 0.5 ? -enemy.width : width + enemy.width;
      enemy.position.y = random(30, 400);
      enemy.targetPosition = createVector(random(30, width - 30), random(30, 400));
    }

    if (dist(enemy.position.x, enemy.position.y, enemy.targetPosition.x, enemy.targetPosition.y) < 10) {
      if (!enemy.waitStartTime) {
        enemy.waitStartTime = millis();
        enemy.waitDuration = random(500, 1500);
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
      }

      if (millis() - enemy.waitStartTime > enemy.waitDuration) {
        enemy.targetPosition = createVector(random(30, width - 30), random(30, 400));
        enemy.waitStartTime = 0;
      }
    } else {
      let direction = p5.Vector.sub(enemy.targetPosition, enemy.position).normalize();
      enemy.velocity = direction.mult(random(10, 12));
    }

    enemy.position.x = constrain(enemy.position.x, -enemy.width, width + enemy.width);
    enemy.position.y = constrain(enemy.position.y, 30, 400);
  }
}

function enemy1Behaviour(enemy) {
  if (enemy.removed) {
    return;
  }

  let currentTime = millis();
  if (currentTime - enemy.lastShootTime > 500 && random() < 0.02) {
    enemy.lastShootTime = currentTime;
    enemyLaserSound.play();
    let laser = new Sprite(enemy.position.x, enemy.position.y, 5, 10);
    laser.img = enemyLaserImage;
    laser.removeColliders();
    laser.velocity.y = 10;
    laser.layer = 2;
    laser.life = height / 7;
    enemyLasers.push(laser);
  }
}

function enemy2Behaviour(enemy) {
  if (enemy.removed) {
    return;
  }
  
  let currentTime = millis();
  if (currentTime - enemy.lastShootTime > 500 && random() < 0.02) {
    enemy.lastShootTime = currentTime;
    enemyLaserSound.play();
    let laser1 = new Sprite(enemy.position.x - 15, enemy.position.y, 5, 10);
    laser1.img = enemyLaserImage;
    laser1.removeColliders();
    laser1.velocity.y = 10;
    laser1.layer = 2;
    laser1.life = height / 7;
    enemyLasers.push(laser1);

    let laser2 = new Sprite(enemy.position.x + 15, enemy.position.y, 5, 10);
    laser2.img = enemyLaserImage;
    laser2.removeColliders();
    laser2.velocity.y = 10;
    laser2.layer = 2;
    laser2.life = height / 7;
    enemyLasers.push(laser2);
  }
}

function enemy3Behaviour(enemy) {
  if (enemy.removed) {
    return;
  }
  
  if (enemy.position.y >= 160) {
    let currentTime = millis();
    if (enemy.isRotating && currentTime - enemy.rotationStartTime >= 1000) {
      if (currentTime - enemy.lastShootTime > enemy3ShootInterval) {
        enemy.lastShootTime = currentTime;
        missileSound.play();
        let missile = new Sprite(enemy.position.x, enemy.position.y, 10, 20);
        missile.img = enemyMissileImage;
        missile.layer = 2;
        missile.removeColliders();
        missile.scale = 1.2;
        
        // Calculate the angle towards the player
        let angle = atan2(player.position.y - enemy.position.y, player.position.x - enemy.position.x);
        missile.rotation = enemy.rotation + 180; // Set missile's initial rotation towards the player
        missile.rotationLock = true; // Lock the missile's rotation
        missile.addSensor(0, 0, missile.width, missile.height);

        // Calculate the missile's velocity based on the angle towards the player
        let speed = 10;
        missile.velocity.x = cos(angle) * speed;
        missile.velocity.y = sin(angle) * speed;

        missile.life = height / 3;
        enemyMissiles.push(missile);
      }
    }
  }
}

function enemy4Behaviour(enemy) {
  if (enemy.removed) {
    return;
  }
  
  if (!gameOver) {
    let currentTime = millis();
    if (currentTime - enemy.lastShootTime > 500 && random() < 0.02) {
      enemy.lastShootTime = currentTime;
      plasmaBallSound.play();
      let plasmaBall = new Sprite(enemy.position.x, enemy.position.y, 15, 15);
      plasmaBall.addAni('plasmaAni', 'sprites/plasma1.png', 2);
      plasmaBall.layer = 2;
      plasmaBall.scale = 1.5;
      plasmaBall.removeColliders();
      plasmaBall.moveTowards(player.position.x, player.position.y, 0.02); 
      plasmaBall.life = height;
      enemyPlasmaBalls.push(plasmaBall);
    }
  }
}

function shootLaser() {
  let currentTime = millis() / 1000;
  let laserSpeed = powerupActive ? shootInterval / 2 : shootInterval;
  
  if (isShooting && currentTime - lastShootTime > laserSpeed) {
    lastShootTime = currentTime;
    playerLaserSound.play();
    
    if (!powerupActive) {
      let laser1 = new Sprite(player.position.x, player.position.y - 25, 10, 20);
      laser1.img = playerLaserImage;
      laser1.removeColliders();
      laser1.velocity.y = -10;
      laser1.layer = 2;
      laser1.life = height / 10;
      lasers.push(laser1);
    } else {
      let laser1 = new Sprite(player.position.x - 10, player.position.y - 25, 10, 20);
      laser1.img = playerLaserImage;
      laser1.removeColliders();
      laser1.velocity.y = -10;
      laser1.layer = 2;
      laser1.life = height / 10;
      lasers.push(laser1);
      
      let laser2 = new Sprite(player.position.x + 10, player.position.y - 25, 10, 20);
      laser2.img = playerLaserImage;
      laser2.removeColliders();
      laser2.velocity.y = -10;
      laser2.layer = 2;
      laser2.life = height / 10;
      lasers.push(laser2);
    }
  }
}
function updateLasers() {
  for (let i = lasers.length - 1; i >= 0; i--) {
    if (lasers[i].position.y < 0) {
      lasers[i].remove();
      lasers.splice(i, 1);
    }
  }
 }
 
 function updateEnemyLasers() {
  for (let i = enemyLasers.length - 1; i >= 0; i--) {
    if (enemyLasers[i].position.y > height) {
      enemyLasers[i].remove();
      enemyLasers.splice(i, 1);
    }
  }
 }
 
 function updateEnemyMissiles() {
  for (let i = enemyMissiles.length - 1; i >= 0; i--) {    
    if (enemyMissiles[i].position.y > height) {
      enemyMissiles[i].remove();
      enemyMissiles.splice(i, 1);
    }
  }
 }
 
 function updateEnemyPlasmaBalls() {
  for (let i = enemyPlasmaBalls.length - 1; i >= 0; i--) {    
    if (enemyPlasmaBalls[i].position.y > height + 100) {
      enemyPlasmaBalls[i].remove();
      enemyPlasmaBalls.splice(i, 1);
    }
  }
 }
 
 function checkCollisions() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (shieldActive && shield.overlaps(enemies[i])) {
      explosionSound.play();
      animation(explosionAni, enemies[i].position.x, enemies[i].position.y);
      enemies[i].remove();
      enemies.splice(i, 1);
      score += 50;
    } else if (player.overlaps(enemies[i])) {
      explosionSound.play();
      animation(explosionAni, enemies[i].position.x, enemies[i].position.y);
      enemies[i].remove();
      enemies.splice(i, 1);
      lives--;
      updateLivesDisplay();
    }
  }

  for (let i = enemyLasers.length - 1; i >= 0; i--) {
    if (shieldActive && shield.overlaps(enemyLasers[i])) {
      animation(playerHitAni, enemyLasers[i].position.x, enemyLasers[i].position.y)
      enemyLasers[i].remove();
      enemyLasers.splice(i, 1);
    } else if (player.overlaps(enemyLasers[i])) {
      twoToneSound.play();
      let enemyLaserXPos = enemyLasers[i].position.x;
      let enemyLaserYPos = enemyLasers[i].position.y;
      animation(playerHitAni, enemyLaserXPos, enemyLaserYPos);
      enemyLasers[i].remove();
      enemyLasers.splice(i, 1);
      lives--;
      updateLivesDisplay();
    }
  }

  for (let i = enemyMissiles.length - 1; i >= 0; i--) {
    if (shieldActive && shield.overlaps(enemyMissiles[i])) {
      explosionSound.play();
      animation(explosionAni, enemyMissiles[i].position.x, enemyMissiles[i].position.y);
      enemyMissiles[i].remove();
      enemyMissiles.splice(i, 1);
    } else if (player.overlaps(enemyMissiles[i])) {
      explosionSound.play();
      animation(explosionAni, enemyMissiles[i].position.x, enemyMissiles[i].position.y);
      enemyMissiles[i].remove();
      enemyMissiles.splice(i, 1);
      lives--;
      updateLivesDisplay();
    }
  }

  for (let i = enemyPlasmaBalls.length - 1; i >= 0; i--) {
    if (shieldActive && shield.overlaps(enemyPlasmaBalls[i])) {
      explosionSound.play();
      animation(explosionAni, enemyPlasmaBalls[i].position.x, enemyPlasmaBalls[i].position.y)
      enemyPlasmaBalls[i].remove();
      enemyPlasmaBalls.splice(i, 1);
    } else if (player.overlaps(enemyPlasmaBalls[i])) {
      explosionSound.play();
      animation(explosionAni, enemyPlasmaBalls[i].position.x, enemyPlasmaBalls[i].position.y);
      enemyPlasmaBalls[i].remove();
      enemyPlasmaBalls.splice(i, 1);
      lives--;
      updateLivesDisplay();
    }
  }

  for (let i = lasers.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (lasers[i] && lasers[i].overlaps(enemies[j])) {
        let laserXPos = lasers[i].position.x;
        let laserYPos = lasers[i].position.y;
        lasers[i].remove();
        enemyHitAni.layer = 4;
        animation(enemyHitAni, laserXPos, laserYPos);
        lasers.splice(i, 1);

        enemies[j].health--;
        if (enemies[j].health <= 0) {
          explosionSound.play();
          animation(explosionAni, enemies[j].position.x, enemies[j].position.y);
          enemies[j].remove();
          enemies.splice(j, 1);
          score += 50;
        }

        break;
      }
    }

    for (let k = enemyMissiles.length - 1; k >= 0; k--) {
      if (lasers[i] && lasers[i].overlaps(enemyMissiles[k])) {
        let missileXPos = enemyMissiles[k].position.x;
        let missileYPos = enemyMissiles[k].position.y;
        enemyMissiles[k].remove();
        enemyMissiles.splice(k, 1);
        lasers[i].remove();
        lasers.splice(i, 1);

        explosionSound.play();
        animation(explosionAni, missileXPos, missileYPos);
        score += 25;

        break;
      }
    }

    for (let m = powerupItems.length - 1; m >= 0; m--) {
      if (lasers[i] && lasers[i].overlaps(powerupItems[m])) {
        if (powerupItems[m].powerupType === 'powerup') {
          powerupActive = true;
          powerupEndTime = millis() + 15000; // 15 seconds duration
        } else if (powerupItems[m].powerupType === 'shield') {
          shieldActive = true;
          shieldEndTime = millis() + 15000; // 15 seconds duration

          // Create a shield sprite
          shield = new Sprite(player.position.x, player.position.y, 50, 50);
          shield.img = shieldImage;
          shield.removeColliders();
          shield.layer = 2;
          shield.addSensor(0, 0, shield.width * 2, shield.height * 2);
        }
        
        animation(enemyHitAni, lasers[i].position.x, lasers[i].position.y);
        powerupActiveSound.play();
        powerupItems[m].remove();
        powerupItems.splice(m, 1);
        lasers[i].remove();
        lasers.splice(i, 1);

        break;
      }
    }
  }
}

function updateLivesDisplay() {
  let livesImages = uiContainer.elt.querySelectorAll('img[src="sprites/playerLife.png"]');
  if (livesImages.length > lives && livesImages.length > 0) {
    livesImages[livesImages.length - 1].remove();
  }
}

function updatePowerupDisplay() {
  let powerupHtml = '';

  if (powerupActive) {
    let remainingTime = Math.ceil((powerupEndTime - millis()) / 1000);
    powerupHtml = `
      <div style="position: absolute; left: 50%; transform: translateX(-50%); top: 30px; color: white; font-size: 24px; text-align: center;">
        <img src="sprites/powerupIcon.png" style="width: 35px; height: 35px;"><br>
        <span style="font-size: 20px;">${remainingTime}</span>
      </div>
    `;
  }

  if (shieldActive) {
    let remainingTime = Math.ceil((shieldEndTime - millis()) / 1000);
    powerupHtml += `
      <div style="position: absolute; left: 50%; transform: translateX(-50%); top: ${powerupActive ? '80px' : '30px'}; color: white; font-size: 24px; text-align: center;">
        <img src="sprites/shieldIcon.png" style="width: 35px; height: 35px;"><br>
        <span style="font-size: 20px;">${remainingTime}</span>
      </div>
    `;
  }

  uiContainer.html(uiContainer.html() + powerupHtml);
}
 
 function drawGameOverScreen() {
  gameMusic.stop();
  
  spawnStars();
  spawnPlanets();
  updateStars();
  updatePlanets();
  updateEnemies();

  uiContainer.html(`
    <div style="position: absolute; left: 50%; top: 25%; transform: translateX(-50%); color: white; font-size: 38px; text-align: center;">
      Game Over!
    </div>
    <div style="position: absolute; left: 50%; top: 50%; transform: translateX(-50%); color: white; font-size: 24px; text-align: center;">
      Enter your name:
    </div>
    <div style="position: absolute; left: 50%; top: 60%; transform: translateX(-50%); color: white; font-size: 32px; text-align: center;">
      ${underscores}
    </div>
  `);
}

function drawLeaderboardScreen() {
  spawnStars();
  spawnPlanets();
  updateStars();
  updatePlanets();
  updateEnemies();

  // Load leaderboard data from leaderboard.json
  fetch('leaderboard.json')
    .then(response => response.json())
    .then(data => {
      let leaderboard = data || []; // Use an empty array if data is null or undefined
      let leaderboardEntries = '';

      // Generate HTML for each leaderboard entry
      for (let i = 0; i < leaderboard.length; i++) {
        let entry = leaderboard[i];
        leaderboardEntries += `<div style="margin-bottom: 20px">${i + 1}. ${entry.name} - ${entry.score}</div>`;
      }

      // Update the leaderboard entries in the UI
      uiContainer.html(`
        <div style="position: absolute; left: 50%; top: 60px; transform: translateX(-50%); color: white; font-size: 32px; text-align: center;">
          Leaderboard
        </div>
        <div style="position: absolute; left: 50%; top: 51%; transform: translate(-50%, -50%); color: white; font-size: 26px; text-align: left;">
          ${leaderboardEntries}
        </div>
        <div style="position: absolute; left: 50%; bottom: 40px; transform: translateX(-50%); color: white; font-size: 18px; text-align: center;">
          Press Enter to return to the main menu
        </div>
      `);
    })
    .catch(error => {
      console.error('Error loading leaderboard.json:', error);
      uiContainer.html(`
        <div style="position: absolute; left: 50%; top: 60px; transform: translateX(-50%); color: white; font-size: 32px; text-align: center;">
          Leaderboard
        </div>
        <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; text-align: center;">
          No leaderboard entries found.
        </div>
        <div style="position: absolute; left: 50%; bottom: 40px; transform: translateX(-50%); color: white; font-size: 18px; text-align: center;">
          Press Enter to return to the main menu
        </div>
      `);
    });
}

function saveScore() {
  let data = {
    playerName: playerName,
    score: score
  };

  fetch('save_score.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data)
  })
  .then(response => response.text())
  .then(result => {
    console.log(result);
    // Reset player name and underscores
    playerName = '';
    underscores = '___';
  })
  .catch(error => {
    console.error('Error saving score:', error);
  });
}

function resetGame() {
  // Remove all sprites
  for (let enemy of enemies) {
    enemy.remove();
  }
  for (let laser of lasers) {
    laser.remove();
  }
  for (let enemyLaser of enemyLasers) {
    enemyLaser.remove();
  }
  for (let enemyMissile of enemyMissiles) {
    enemyMissile.remove();
  }
  for (let enemyPlasmaBall of enemyPlasmaBalls) {
    enemyPlasmaBall.remove();
  }
  for (let star of stars) {
    star.remove();
  }
  for (let planet of planets) {
    planet.remove();
  }

  // Reset game variables
  enemies = [];
  lasers = [];
  enemyLasers = [];
  enemyMissiles = [];
  enemyPlasmaBalls = [];
  isShooting = false;
  stars = [];
  planets = [];
  gameOver = false;
  score = 0;
  lives = 3;
  lastSpawnTime = 0;
  lastEnemy2SpawnTime = 0;
  powerupItems = [];
  powerupSpawned = false;
  nextPowerupScore = 1000;
  powerupActive = false;
  shieldActive = false;
}

// ==================== GAMEPAD SUPPORT ====================

let gamepadButtonStates = [];

function pollGamepad() {
  let gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  
  // Find the first connected gamepad
  gamepad = null;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      gamepad = gamepads[i];
      break;
    }
  }
  
  if (!gamepad) return;
  
  // Get current button states
  let currentStates = gamepad.buttons.map(b => b.pressed);
  
  // Handle gamepad input for different screens
  handleGamepadMenuInput(currentStates);
  
  // Store current states as previous for next frame
  gamepadButtonStates = currentStates;
}

// Check if a gamepad button was just pressed (edge detection)
function gamepadButtonJustPressed(buttonIndex, currentStates) {
  if (!gamepad || buttonIndex >= currentStates.length) return false;
  
  let currentPressed = currentStates[buttonIndex];
  let prevPressed = gamepadButtonStates[buttonIndex] || false;
  
  return currentPressed && !prevPressed;
}

// Handle gamepad input for menu screens
function handleGamepadMenuInput(currentStates) {
  switch (currentScreen) {
    case MAIN_MENU:
      // A button or Start button to start game
      if (gamepadButtonJustPressed(0, currentStates) || gamepadButtonJustPressed(9, currentStates)) {
        startGame();
      }
      break;
    case GAME_OVER:
      // D-pad or left stick for letter selection
      handleGameOverGamepadInput(currentStates);
      break;
    case LEADERBOARD:
      // A button or Start to return to main menu
      if (gamepadButtonJustPressed(0, currentStates) || gamepadButtonJustPressed(9, currentStates)) {
        resetGame();
        currentScreen = MAIN_MENU;
        uiContainer.html('');
      }
      break;
  }
}

// Handle gamepad input for the game over name entry screen
let gamepadLetterIndex = 0;
let gamepadLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let lastAxisX = 0;

function handleGameOverGamepadInput(currentStates) {
  // Navigate letters with D-pad left/right
  if (gamepadButtonJustPressed(15, currentStates)) { // D-pad right
    gamepadLetterIndex = (gamepadLetterIndex + 1) % 26;
  }
  if (gamepadButtonJustPressed(14, currentStates)) { // D-pad left
    gamepadLetterIndex = (gamepadLetterIndex - 1 + 26) % 26;
  }
  
  // Left stick navigation with edge detection
  let currentAxisX = gamepad.axes[0];
  if (currentAxisX > 0.7 && lastAxisX <= 0.7) {
    gamepadLetterIndex = (gamepadLetterIndex + 1) % 26;
  }
  if (currentAxisX < -0.7 && lastAxisX >= -0.7) {
    gamepadLetterIndex = (gamepadLetterIndex - 1 + 26) % 26;
  }
  lastAxisX = currentAxisX;
  
  // A button to add letter
  if (gamepadButtonJustPressed(0, currentStates) && playerName.length < 3) {
    playerName += gamepadLetters[gamepadLetterIndex];
    underscores = playerName + '_'.repeat(3 - playerName.length);
  }
  
  // B button to delete letter
  if (gamepadButtonJustPressed(1, currentStates) && playerName.length > 0) {
    playerName = playerName.slice(0, -1);
    underscores = playerName + '_'.repeat(3 - playerName.length);
  }
  
  // Start button to confirm (when 3 letters entered)
  if (gamepadButtonJustPressed(9, currentStates) && playerName.length === 3) {
    saveScore();
    currentScreen = LEADERBOARD;
  }
}

// Gamepad connection events
window.addEventListener('gamepadconnected', function(e) {
  console.log('Gamepad connected:', e.gamepad.id);
});

window.addEventListener('gamepaddisconnected', function(e) {
  console.log('Gamepad disconnected:', e.gamepad.id);
  if (gamepad && gamepad.index === e.gamepad.index) {
    gamepad = null;
  }
});