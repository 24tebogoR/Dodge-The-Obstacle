// Game 11: DODGE OBSTACLES
// --- 1. Creating DOM ELEMENTS ---
// document.querySelector finds an element from given html by its ID 
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const saveBtn = document.querySelector("#saveBtn");
const loadBtn = document.querySelector("#loadBtn");
const resetBtn = document.querySelector("#resetBtn");
const backBtn = document.querySelector("#backBtn");

// Getting span/div elements to isnert live game data
// document.querySelector finds an element from given html by its ID 
const displayPlayer = document.querySelector("#displayPlayer");
const displayScore = document.querySelector("#displayScore");
const displayLives = document.querySelector("#displayLives");
const displayDodged = document.querySelector("#displayDodged");
const displayBonuses = document.querySelector("#displayBonuses");
const displayTimeLeft = document.querySelector("#displayTimeLeft");

// areas for text feedback, logs and the actual game container
// document.querySelector finds an element from given html by its ID 
const messageArea = document.querySelector("#messageArea");
const logArea = document.querySelector("#logArea");
const gameArea = document.querySelector("#gameArea");
const playerBox = document.querySelector("#player"); // The actual player "sprite"

// --- 2. Creating MAIN GAME STATE OBJECT ---
const game = {
  playerName: "Player",     // Default name
  playerLane: 1,           // Starts in the middle lane (0, 1, 2)
  score: 0,                // Current points
  lives: 3,                // Health points
  dodged: 0,               // Counter for passed obstacles
  bonusesCollected: 0,     // Counter for collected items
  timeLeft: 30,            // Countdown clock
  difficulty: "medium",    // Difficulty setting from launcher
  gameLength: 30,          // Total time allowed
  theme: "car",            // Visual theme (colors/borders)
  showShadow: true,        // Toggle for CSS shadow class
  enableBonus: true,       // Toggle for spawning bonuses
  doubleScore: false,      // Multiplier toggle
  isRunning: false,        // Is the game active?
  isPaused: false,         // Is the game temporarily frozen?
  loopInterval: null,      // Stores the setInterval for movement
  timerInterval: null,     // Stores the setInterval for the clock
  spawnCounter: 0,         // Internal tick counter for spawning items
  obstacles: [],           // Array to keep track all active obstacle objects
  bonuses: [],             // Array to keep track all active bonus objects
  bestScore: 0             // High score loaded from cookies
};

// --- 3 Create functions ---

// thsi fucntion determines calculations on where a lane is based on the game container width
function getLaneLeft(lane) {
  let areaWidth = gameArea.clientWidth;         // Get width of the playable area
  let laneWidth = areaWidth / 3;                // Divide by 3 to create 3 lanes for game
  let playerWidth = 54;                         // Width of the player element
  // Calculate center of the lane for the player to sit in
  let left = lane * laneWidth + (laneWidth - playerWidth) / 2;
  return left;
}

// this fucntion will update the CSS 'left' property of the playerBox
function updatePlayerPosition() {
  let left = getLaneLeft(game.playerLane);
  playerBox.style.left = left + "px";          
}

//  this function applies colors and shadows based on the settings from the launcher
function updatePlayerStyle() {
  if (game.theme === "car") {
    playerBox.style.background = "#2563eb";     // Blue theme
    playerBox.style.border = "3px solid #1e3a8a";
  } else if (game.theme === "space") {
    playerBox.style.background = "#7c3aed";     // Purple theme
    playerBox.style.border = "3px solid #4c1d95";
  } else {
    playerBox.style.background = "#f59e0b";     // Orange/Default theme
    playerBox.style.border = "3px solid #92400e";
  }

  // Add or remove the .shadow CSS class
  if (game.showShadow === true) {
    playerBox.classList.add("shadow");
  } else {
    playerBox.classList.remove("shadow");
  }
}

// this function Syncs the HTML text with the current variables in the game object
function updateStats() {
  displayPlayer.textContent = game.playerName;
  displayScore.textContent = game.score;
  displayLives.textContent = game.lives;
  displayDodged.textContent = game.dodged;
  displayBonuses.textContent = game.bonusesCollected;
  displayTimeLeft.textContent = game.timeLeft + " s";
}

// this function curates helper to update the central message text
function showMessage(text) {
  messageArea.textContent = text;
}

// this function adds new line to the log area and pushes old ones down
function addLog(text) {
  let entry = document.createElement("div");    // Create new div
  entry.className = "log-entry";                // Set class
  entry.textContent = text;                     // Set message
  logArea.prepend(entry);                       // Add to top of list
}

// --- 5. Create Cookies ---

// fuction Saves high score to browser memor
function setBestScoreCookie() {
  document.cookie = "bestScore=" + game.bestScore + ";path=/";
}

// Reads high score from browser memory
function getBestScoreCookie() {
  let cookieText = document.cookie;
  let cookieArray = cookieText.split(";");
  let i = 0;
  for (i = 0; i < cookieArray.length; i++) {
    let item = cookieArray[i].trim();
    if (item.indexOf("bestScore=") === 0) {
      return Number(item.substring(10));        // NB: Convert string to number
    }
  }
  return 0;                                     // Return 0 if no cookie found
}

// NB: this function gets settings saved by the launcher into the game
function loadLauncherSettings() {
  let savedPlayerName = sessionStorage.getItem("playerName");
  let savedDifficulty = sessionStorage.getItem("difficulty");
  let savedGameLength = sessionStorage.getItem("gameLength");
  let savedTheme = sessionStorage.getItem("theme");
  let savedShowShadow = sessionStorage.getItem("showShadow");
  let savedEnableBonus = sessionStorage.getItem("enableBonus");
  let savedDoubleScore = sessionStorage.getItem("doubleScore");

  // Apply settings only if they exist in storage
  if (savedPlayerName !== null && savedPlayerName !== "") {
    game.playerName = savedPlayerName;
  }
  if (savedDifficulty !== null) {
    game.difficulty = savedDifficulty;
  }
  if (savedGameLength !== null) {
    game.gameLength = Number(savedGameLength);
    game.timeLeft = Number(savedGameLength);
  }
  if (savedTheme !== null) {
    game.theme = savedTheme;
  }
  // Convert "true"/"false" strings back to real Booleans
  game.showShadow = savedShowShadow === "true";
  game.enableBonus = savedEnableBonus === "true";
  game.doubleScore = savedDoubleScore === "true";

  game.bestScore = getBestScoreCookie();        // Load high score from cookie
}

// Returns based on difficulty
function getSpeed() {
  if (game.difficulty === "easy") return 3;
  if (game.difficulty === "hard") return 10;
  return 6; // Medium
}

// Returns how many frames to wait before spawning a new obstacle
function getSpawnRate() {
  if (game.difficulty === "easy") return 26;
  if (game.difficulty === "hard") return 14;
  return 20; // Medium
}

// Cleans the screen of all current items (used for resets/reloads)
function clearItems() {
  let i = 0;
  for (i = 0; i < game.obstacles.length; i++) {
    game.obstacles[i].element.remove();         // Remove from HTML
  }
  for (i = 0; i < game.bonuses.length; i++) {
    game.bonuses[i].element.remove();           // Remove from HTML
  }
  game.obstacles = [];                          // Empty the arrays
  game.bonuses = [];
}

// Generates an obstacle object and adds it to the DOM
function createObstacle() {
  let lane = Math.floor(Math.random() * 3);     // Choose lane 0, 1, or 2
  let obstacle = {
    lane: lane,
    top: -90,                                   // Start above the screen
    speed: getSpeed(),
    element: document.createElement("div")      // Create the box
  };

  obstacle.element.className = "entity obstacle";
  obstacle.element.style.width = "54px";
  obstacle.element.style.height = "86px";
  obstacle.element.style.left = getLaneLeft(lane) + "px";
  obstacle.element.style.top = obstacle.top + "px";
  obstacle.element.textContent = "X";

  gameArea.appendChild(obstacle.element);
  game.obstacles.push(obstacle);                // Store in our tracking array
}

// this function generates a bonus object
function createBonus() {
  let lane = Math.floor(Math.random() * 3);
  let speed = getSpeed() - 1;                   // Bonuses move slightly slower
  if (speed < 3) speed = 3;

  let bonus = {
    lane: lane,
    top: -50,
    speed: speed,
    element: document.createElement("div")
  };

  bonus.element.className = "entity bonus";
  bonus.element.style.width = "42px";
  bonus.element.style.height = "42px";
  bonus.element.style.left = getLaneLeft(lane) + 6 + "px"; // Offset to center it
  bonus.element.style.top = bonus.top + "px";
  bonus.element.textContent = "+";

  gameArea.appendChild(bonus.element);
  game.bonuses.push(bonus);
}

// logic to decide when to create new items
function spawnItems() {
  game.spawnCounter = game.spawnCounter + 1;

  // Spawn obstacle if the counter hits the rate limit
  if (game.spawnCounter >= getSpawnRate()) {
    createObstacle();
    game.spawnCounter = 0;
  }

  // Random chance to spawn a bonus (approx 1 in 40 frames)
  if (game.enableBonus === true) {
    if (Math.floor(Math.random() * 40) === 5) {
      createBonus();
    }
  }
}
// nb: moveObstacles()
 //Iterates backwards through the array to safely remove items while moving.
 
 function moveObstacles() {
  let i = 0;
  let playerTop = gameArea.clientHeight - 110;  // Threshold for collision

  for (i = game.obstacles.length - 1; i >= 0; i--) {
    game.obstacles[i].top = game.obstacles[i].top + game.obstacles[i].speed;
    game.obstacles[i].element.style.top = game.obstacles[i].top + "px";

    // nb; this checks if collision is hitting player
    if (game.obstacles[i].top >= playerTop && game.obstacles[i].lane === game.playerLane) {
      game.obstacles[i].element.remove();       // Delete from screen
      game.obstacles.splice(i, 1);              // Delete from array
      game.lives = game.lives - 1;              // player Lose health
      addLog("Obstacle hit. Lives left: " + game.lives);
      showMessage("You were hit!");

      if (game.lives <= 0) {
        endGame("Game over.");                  // End game if dead
        return;
      }
    } 
    // checks if player dodges
    else if (game.obstacles[i].top > gameArea.clientHeight) {
      game.obstacles[i].element.remove();
      game.obstacles.splice(i, 1);
      game.dodged = game.dodged + 1;
      // Add points based on settings
      game.score += (game.doubleScore) ? 2 : 1;
    }
  }
}

// this funtion Moves bonuses and checks if player "catches" 
function moveBonuses() {
  let i = 0;
  let playerTop = gameArea.clientHeight - 110;

  for (i = game.bonuses.length - 1; i >= 0; i--) {
    game.bonuses[i].top = game.bonuses[i].top + game.bonuses[i].speed;
    game.bonuses[i].element.style.top = game.bonuses[i].top + "px";

    // Did the player catch the bonus?
    if (game.bonuses[i].top >= playerTop && game.bonuses[i].lane === game.playerLane) {
      game.bonuses[i].element.remove();
      game.bonuses.splice(i, 1);
      game.bonusesCollected = game.bonusesCollected + 1;
      // Add bonus points
      game.score += (game.doubleScore) ? 20 : 10;
      addLog("Bonus collected.");
      showMessage("Bonus collected!");
    } 
    // Remove if it falls off screen
    else if (game.bonuses[i].top > gameArea.clientHeight) {
      game.bonuses[i].element.remove();
      game.bonuses.splice(i, 1);
    }
  }
}

function gameLoop() {
  if (game.isRunning === false || game.isPaused === true) return;

  spawnItems();      // Add new stuff
  moveObstacles();   // Move/Check hit obstacles
  moveBonuses();     // Move/Check hit bonuses
  updateStats();     // Refresh the UI
}

// fucntion to start timer
function startTimer() {
  game.timerInterval = setInterval(function () {
    if (game.isRunning === true && game.isPaused === false) {
      game.timeLeft = game.timeLeft - 1;
      updateStats();

      if (game.timeLeft <= 0) {
        endGame("Time is up.");                 // End game when time hits 0
      }
    }
  }, 1000);
}

// function to Reset variables and trigger the intervals
function startGame() {
  clearItems();                                 // Wipe old entities
  
  // NB; Initialize fresh game values
  game.score = 0;
  game.lives = 3;
  game.dodged = 0;
  game.bonusesCollected = 0;
  game.timeLeft = game.gameLength;
  game.spawnCounter = 0;
  game.playerLane = 1;
  game.isRunning = true;
  game.isPaused = false;

  updatePlayerPosition();
  updatePlayerStyle();
  updateStats();

  showMessage("Game started. Use Left and Right arrow keys.");
  addLog("Game started for " + game.playerName + ".");

  // Clear existing intervals to prevent "speeding up" bugs
  clearInterval(game.loopInterval);
  clearInterval(game.timerInterval);

  game.loopInterval = setInterval(gameLoop, 60); // Start movement loop
  startTimer();                                  // Start clock loop
}

// function Toggles the pause state
function pauseOrResumeGame() {
  if (game.isRunning === false) {
    alert("Start the game first.");
    return;
  }

  if (game.isPaused === true) {
    game.isPaused = false;
    showMessage("Game resumed.");
    addLog("Game resumed.");
  } else {
    game.isPaused = true;
    showMessage("Game paused.");
    addLog("Game paused.");
  }
}

// --- Create SESSION storages ---

// Captures current progress and saves it to session
function saveGame() {
  sessionStorage.setItem("savedScore", game.score);
  sessionStorage.setItem("savedLives", game.lives);
  sessionStorage.setItem("savedDodged", game.dodged);
  sessionStorage.setItem("savedBonusesCollected", game.bonusesCollected);
  sessionStorage.setItem("savedTimeLeft", game.timeLeft);
  sessionStorage.setItem("savedPlayerLane", game.playerLane);

  alert("Game session saved.");
  addLog("Game session saved.");
}

// Restores progress from session storage
function loadGame() {
  let savedScore = sessionStorage.getItem("savedScore");
  if (savedScore === null) {
    alert("No saved game found.");
    return;
  }

  clearItems();
  clearInterval(game.loopInterval);
  clearInterval(game.timerInterval);

  // Restore values and convert strings to Numbers
  game.score = Number(savedScore);
  game.lives = Number(sessionStorage.getItem("savedLives"));
  game.dodged = Number(sessionStorage.getItem("savedDodged"));
  game.bonusesCollected = Number(sessionStorage.getItem("savedBonusesCollected"));
  game.timeLeft = Number(sessionStorage.getItem("savedTimeLeft"));
  game.playerLane = Number(sessionStorage.getItem("savedPlayerLane"));
  game.isRunning = true;
  game.isPaused = true; // Load as paused so user can get ready

  updatePlayerPosition();
  updatePlayerStyle();
  updateStats();

  showMessage("Saved game loaded. Click Pause / Resume to continue.");
  addLog("Saved game loaded.");

  game.loopInterval = setInterval(gameLoop, 60);
  startTimer();
}

// Completely resets the game state
function resetGame() {
  if (!confirm("Do you want to reset the game?")) return;

  clearInterval(game.loopInterval);
  clearInterval(game.timerInterval);
  clearItems();

  game.score = 0;
  game.lives = 3;
  game.isRunning = false;
  game.isPaused = false;

  updatePlayerPosition();
  updateStats();
  showMessage("Game reset. Click Start Game when ready.");
  addLog("Game reset.");
}

// function Stops all loops and checks for new high scores
function endGame(text) {
  clearInterval(game.loopInterval);
  clearInterval(game.timerInterval);

  game.isRunning = false;
  game.isPaused = false;

  // High score logic
  if (game.score > game.bestScore) {
    game.bestScore = game.score;
    setBestScoreCookie();                       //Nb: Save new high score
    addLog("New best score: " + game.bestScore);
  }

  updateStats();
  showMessage(text + " Final score: " + game.score);
  alert(text + " Final score: " + game.score);
}

//: input handling 
//  this func Listens for Arrow keys and moves the player lane
function movePlayer(event) {
  if (game.isRunning === false || game.isPaused === true) return;

  if (event.key === "ArrowLeft" && game.playerLane > 0) {
    game.playerLane--;
    updatePlayerPosition();
  }
  if (event.key === "ArrowRight" && game.playerLane < 2) {
    game.playerLane++;
    updatePlayerPosition();
  }
}

// Returns user to the launcher Settings page
function goBack() {
  window.location.href = "index.html"; 
}

// ---Create EVENT LISTENERS ---
// Keyboard events
window.addEventListener("keydown", movePlayer);
// Re-calculate positions if the user resizes their browser window
window.addEventListener("resize", updatePlayerPosition);

// Button click events
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseOrResumeGame);
saveBtn.addEventListener("click", saveGame);
loadBtn.addEventListener("click", loadGame);
resetBtn.addEventListener("click", resetGame);
backBtn.addEventListener("click", goBack);

// this will Run once when the page finishes loading
window.addEventListener("load", function () {
  loadLauncherSettings();                       // fetch settings from launcher
  updatePlayerStyle();                          // Apply theme
  updatePlayerPosition();                       // Place player in lane
  updateStats();                                // Show initial stats
  showMessage("Click Start Game when ready.");
  addLog("Best score: " + game.bestScore);
});