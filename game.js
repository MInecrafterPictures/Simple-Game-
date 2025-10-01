// Game configuration
const gameConfig = {
  playerSpeed: 10,
  containerWidth: 800,
  containerHeight: 600,
  scaleFactor: 1, // Will be updated based on screen size
  levels: [
    {
      obstacles: [
        { x: 200, y: 100, width: 400, height: 30 },
        { x: 200, y: 400, width: 400, height: 30 }
      ],
      goalPosition: { x: 700, y: 500 },
      playerStart: { x: 50, y: 50 }
    },
    {
      obstacles: [
        { x: 100, y: 150, width: 30, height: 300 },
        { x: 300, y: 0, width: 30, height: 400 },
        { x: 500, y: 200, width: 30, height: 400 },
        { x: 650, y: 0, width: 30, height: 450 }
      ],
      goalPosition: { x: 700, y: 500 },
      playerStart: { x: 50, y: 50 }
    },
    {
      obstacles: [
        { x: 0, y: 150, width: 600, height: 30 },
        { x: 200, y: 300, width: 600, height: 30 },
        { x: 0, y: 450, width: 600, height: 30 }
      ],
      goalPosition: { x: 700, y: 500 },
      playerStart: { x: 50, y: 50 }
    }
  ]
};

// Game state
const gameState = {
  isPlaying: false,
  currentLevel: 0,
  score: 0,
  startTime: 0,
  currentTime: 0,
  obstacles: []
};

// Get references to the game elements
const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const goal = document.getElementById("goal");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const levelCompleteScreen = document.getElementById("level-complete");
const nextLevelButton = document.getElementById("next-level-button");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const levelStatsDisplay = document.getElementById("level-stats");

// Event listeners
startButton.addEventListener("click", startGame);
nextLevelButton.addEventListener("click", loadNextLevel);

// Initialize the game
function initGame() {
  // Hide game elements initially
  player.style.display = "none";
  goal.style.display = "none";
  
  // Set up event listeners for keyboard controls
  document.addEventListener("keydown", handleKeyPress);
  
  // Set up responsive scaling
  updateGameScale();
  window.addEventListener('resize', updateGameScale);
}

// Update game scale based on container size
function updateGameScale() {
  const containerRect = gameContainer.getBoundingClientRect();
  gameConfig.scaleFactor = Math.min(
    containerRect.width / gameConfig.containerWidth,
    containerRect.height / gameConfig.containerHeight
  );
  
  // Update player speed based on scale
  gameConfig.playerSpeed = Math.max(5, Math.round(10 * gameConfig.scaleFactor));
}

// Start the game
function startGame() {
  gameState.isPlaying = true;
  gameState.currentLevel = 0;
  gameState.score = 0;
  
  // Update HUD
  updateHUD();
  
  // Hide start screen
  startScreen.style.display = "none";
  
  // Load the first level
  loadLevel(gameState.currentLevel);
}

// Load a specific level
function loadLevel(levelIndex) {
  // Clear previous obstacles
  clearObstacles();
  
  // Get level data
  const level = gameConfig.levels[levelIndex];
  
  // Update scale factor before positioning elements
  updateGameScale();
  
  // Set player position with scaling
  const scaledPlayerX = level.playerStart.x * gameConfig.scaleFactor;
  const scaledPlayerY = level.playerStart.y * gameConfig.scaleFactor;
  player.style.left = scaledPlayerX + "px";
  player.style.top = scaledPlayerY + "px";
  player.style.display = "block";
  player.style.transform = `scale(${gameConfig.scaleFactor})`;
  
  // Set goal position with scaling
  const scaledGoalX = level.goalPosition.x * gameConfig.scaleFactor;
  const scaledGoalY = level.goalPosition.y * gameConfig.scaleFactor;
  goal.style.left = scaledGoalX + "px";
  goal.style.top = scaledGoalY + "px";
  goal.style.display = "block";
  goal.style.transform = `scale(${gameConfig.scaleFactor})`;
  
  // Create obstacles with scaling
  createObstacles(level.obstacles);
  
  // Update level display
  levelDisplay.textContent = levelIndex + 1;
  
  // Start timer
  gameState.startTime = Date.now();
  gameState.currentTime = 0;
  
  // Start game loop
  if (!gameState.gameLoopInterval) {
    gameState.gameLoopInterval = setInterval(gameLoop, 100);
  }
}

// Game loop
function gameLoop() {
  if (gameState.isPlaying) {
    // Update timer
    gameState.currentTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    timeDisplay.textContent = gameState.currentTime;
  }
}

// Create obstacles for the current level
function createObstacles(obstaclesData) {
  obstaclesData.forEach(data => {
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    obstacle.style.left = (data.x * gameConfig.scaleFactor) + "px";
    obstacle.style.top = (data.y * gameConfig.scaleFactor) + "px";
    obstacle.style.width = (data.width * gameConfig.scaleFactor) + "px";
    obstacle.style.height = (data.height * gameConfig.scaleFactor) + "px";
    gameContainer.appendChild(obstacle);
    gameState.obstacles.push(obstacle);
  });
}

// Clear all obstacles
function clearObstacles() {
  gameState.obstacles.forEach(obstacle => {
    gameContainer.removeChild(obstacle);
  });
  gameState.obstacles = [];
}

// Handle keyboard input
function handleKeyPress(event) {
  if (!gameState.isPlaying) return;
  
  switch (event.key) {
    case "ArrowUp":
      movePlayer("up");
      break;
    case "ArrowDown":
      movePlayer("down");
      break;
    case "ArrowLeft":
      movePlayer("left");
      break;
    case "ArrowRight":
      movePlayer("right");
      break;
  }
}

// Move the player
function movePlayer(direction) {
  let currentLeft = parseInt(player.style.left);
  let currentTop = parseInt(player.style.top);
  let newLeft = currentLeft;
  let newTop = currentTop;
  
  switch (direction) {
    case "up":
      newTop = currentTop - gameConfig.playerSpeed;
      break;
    case "down":
      newTop = currentTop + gameConfig.playerSpeed;
      break;
    case "left":
      newLeft = currentLeft - gameConfig.playerSpeed;
      break;
    case "right":
      newLeft = currentLeft + gameConfig.playerSpeed;
      break;
  }
  
  // Check boundaries with scaling
  if (newLeft < 0) newLeft = 0;
  if (newTop < 0) newTop = 0;
  const scaledWidth = gameConfig.containerWidth * gameConfig.scaleFactor;
  const scaledHeight = gameConfig.containerHeight * gameConfig.scaleFactor;
  const scaledPlayerSize = 50 * gameConfig.scaleFactor;
  if (newLeft > scaledWidth - scaledPlayerSize) newLeft = scaledWidth - scaledPlayerSize;
  if (newTop > scaledHeight - scaledPlayerSize) newTop = scaledHeight - scaledPlayerSize;
  
  // Check collision with obstacles
  if (!checkCollision(newLeft, newTop)) {
    player.style.left = newLeft + "px";
    player.style.top = newTop + "px";
  }
  
  // Check if player reached the goal
  checkForWin();
}

// Check collision with obstacles
function checkCollision(playerX, playerY) {
  const playerWidth = 50 * gameConfig.scaleFactor;
  const playerHeight = 50 * gameConfig.scaleFactor;
  
  for (const obstacle of gameState.obstacles) {
    const obstacleX = parseInt(obstacle.style.left);
    const obstacleY = parseInt(obstacle.style.top);
    const obstacleWidth = parseInt(obstacle.style.width);
    const obstacleHeight = parseInt(obstacle.style.height);
    
    if (
      playerX < obstacleX + obstacleWidth &&
      playerX + playerWidth > obstacleX &&
      playerY < obstacleY + obstacleHeight &&
      playerY + playerHeight > obstacleY
    ) {
      return true; // Collision detected
    }
  }
  
  return false; // No collision
}

// Check if the player has reached the goal
function checkForWin() {
  let playerLeft = parseInt(player.style.left);
  let playerTop = parseInt(player.style.top);
  let goalLeft = parseInt(goal.style.left);
  let goalTop = parseInt(goal.style.top);
  
  // Allow for some overlap with scaling (not requiring exact position match)
  const winThreshold = 30 * gameConfig.scaleFactor;
  if (
    Math.abs(playerLeft - goalLeft) < winThreshold &&
    Math.abs(playerTop - goalTop) < winThreshold
  ) {
    levelComplete();
  }
}

// Handle level completion
function levelComplete() {
  // Stop the game temporarily
  gameState.isPlaying = false;
  
  // Calculate score for the level (based on time)
  const levelScore = Math.max(1000 - gameState.currentTime * 10, 100);
  gameState.score += levelScore;
  
  // Update score display
  scoreDisplay.textContent = gameState.score;
  
  // Show level complete screen
  levelStatsDisplay.textContent = `Score: ${levelScore} | Time: ${gameState.currentTime}s`;
  levelCompleteScreen.style.display = "flex";
}

// Load the next level
function loadNextLevel() {
  // Hide level complete screen
  levelCompleteScreen.style.display = "none";
  
  // Increment level
  gameState.currentLevel++;
  
  // Check if there are more levels
  if (gameState.currentLevel < gameConfig.levels.length) {
    // Load the next level
    loadLevel(gameState.currentLevel);
    gameState.isPlaying = true;
  } else {
    // Game completed
    gameComplete();
  }
}

// Handle game completion
function gameComplete() {
  // Show start screen with game complete message
  startScreen.style.display = "flex";
  startButton.textContent = "Play Again";
  
  // Add game complete message
  const gameCompleteMsg = document.createElement("p");
  gameCompleteMsg.textContent = `Congratulations! You completed all levels with a score of ${gameState.score}!`;
  gameCompleteMsg.style.color = "#ffd700";
  gameCompleteMsg.style.fontSize = "24px";
  startScreen.insertBefore(gameCompleteMsg, startButton);
}

// Update HUD elements
function updateHUD() {
  levelDisplay.textContent = gameState.currentLevel + 1;
  scoreDisplay.textContent = gameState.score;
  timeDisplay.textContent = gameState.currentTime;
}

// Initialize the game when the page loads
window.onload = initGame;
