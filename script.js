// initial game settings elements
const gameSettingsWindow = document.querySelector(".game-settings-overlay");
let settingGame = true;
const sides = document.querySelectorAll("#x, #o");
const diffs = document.querySelectorAll("#easy, #normal, #impossible");
const startButton = document.querySelector("#start-button");
// board elements
const boardContainer = document.querySelector(".board-container");
const cells = document.querySelectorAll("#board > div");
const cellSize = +getComputedStyle(document.body).getPropertyValue("--cell-size").slice(0, -2);
// match result elements
const resultSection = document.querySelector("#result-section");
const resultText = document.querySelector("#result-text");
const resetButton = document.querySelector("#reset-button");
// vars
let aiPlayer;
let canMove = true;
let gameOver = false;
let selectedSide = "";
let aiDiff = "";
let aiSide = "";
// setting the game settings window height to match page height
function startGameSettings() {
  $(".game-settings-overlay").css("top", "0px");
}

function removeGameSettings() {
  $(".game-settings-overlay").css("top", "-" + $("body").height() + "px");
}

$(document).ready(function () {
  setHeight();
  $(window).bind("resize", setHeight);

  function setHeight() {
    $(".game-settings-overlay").css("height", $("body").height() + "px");
    if (!settingGame) {
      $(".game-settings-overlay").css("top", "-" + $("body").height() + "px");
    }
  }
});

// ------------------------------------------- GAME SETTINGS ------------------------------------------- //

sides.forEach((e) => {
  e.addEventListener("click", function selectSide() {
    sides.forEach((e) => {
      const img = e.querySelector("img");
      img.classList.remove("selected-img");
      e.classList.remove("selected");
    });
    const img = e.querySelector("img");
    img.classList.add("selected-img");
    e.classList.add("selected");
  });
});

diffs.forEach((e) => {
  e.addEventListener("click", function selectDifficulty() {
    diffs.forEach((e) => {
      e.classList.remove("selected");
    });
    e.classList.add("selected");
  });
});

// starting the game after settings
startButton.addEventListener("click", function startGame() {
  canMove = true;
  sides.forEach((e) => {
    if (e.classList.contains("selected")) {
      selectedSide = e.id;
    }
  });
  diffs.forEach((e) => {
    if (e.classList.contains("selected")) {
      aiDiff = e.id;
    }
  });

  if (selectedSide === "" || aiDiff === "") {
    alert("Game settings are incomplete");
  } else {
    aiSide = selectedSide === "x" ? "o" : "x";
    settingGame = false;
    removeGameSettings();
    aiPlayer = new AI(aiSide, aiDiff);
    if (aiSide === "x") {
      canMove = false;
      setTimeout(() => aiMove(), 400);
    }
  }
});

// ------------------------------ GENERATING THE CROSSING LINES AND ANIMATING THEM ------------------------------ //

// generating all the lines that will mark the win
let linesHorizontal = [];
let linesVertical = [];
let linesDiagonal = document.querySelectorAll("#diagonal-line-left, #diagonal-line-right");

for (let i = 0; i < 3; i++) {
  const lineHorizonal = document.createElement("div");
  lineHorizonal.id = "straight-line";
  lineHorizonal.style = "position: absolute; width: 0px; border-top: 24px solid #9bc53d;";
  lineHorizonal.style.top = String(62 + i * cellSize + i * 2) + "px";

  const lineVertical = document.createElement("div");
  lineVertical.id = "straight-line";
  lineVertical.style =
    "position: absolute; top: 0px; height: 0px; border-left: 24px solid #9bc53d;";
  lineVertical.style.left = String(62 + i * cellSize + i * 2) + "px";

  linesHorizontal.push(lineHorizonal);
  linesVertical.push(lineVertical);
}

// animate the drawing of a line
function drawHorizontalLine(line) {
  boardContainer.append(line);
  setTimeout(() => {
    line.style.width = "calc(var(--cell-size) * 3)";
  }, 300);
}

function drawVerticalLine(line) {
  boardContainer.append(line);
  setTimeout(() => {
    line.style.height = "calc(var(--cell-size) * 3)";
  }, 300);
}

function drawDiagonalLine(line) {
  line.style.display = "block";
  setTimeout(() => {
    line.style.width = "calc(var(--cell-size) * 3 * 1.414 - 6px)";
  }, 300);
}

// ------------------------------------------- GAMEPLAY ------------------------------------------- //

// marking cells
function markCell(cell, side) {
  const sideSymbol = document.createElement("img");
  sideSymbol.src = "images/" + side + ".png";
  cell.append(sideSymbol);
  sideSymbol.classList.add("appear");
}

function aiMove() {
  const oAndXIndices = getMarkedIndices();
  // ai's move
  const bestMoveIndex = aiPlayer.findBestMove(oAndXIndices);
  const aiSelectedCell = cells[bestMoveIndex];
  setTimeout(() => {
    markCell(aiSelectedCell, aiSide);
  }, 350);
  // let player move or end the game
  setTimeout(() => {
    const xAndOIndices = getMarkedIndices();
    const winner = checkForEndOfGame(xAndOIndices);
    if (winner !== "ongoing") {
      gameOver = true;
      displayResults(winner);
    } else {
      canMove = true;
    }
  }, 400);
}

cells.forEach((e) => {
  e.addEventListener("click", () => {
    if (!gameOver && e.innerHTML === "" && canMove) {
      canMove = false;
      markCell(e, selectedSide);
      const xAndOIndices = getMarkedIndices();
      const winner = checkForEndOfGame(xAndOIndices);
      if (winner !== "ongoing") {
        gameOver = true;
        displayResults(winner);
      }
      // ai's move
      if (!gameOver) {
        aiMove();
      }
    }
  });
});

// returning x and o indices or -1 if game ended
function getMarkedIndices() {
  let xIndices = [];
  let oIndices = [];
  cells.forEach((e, i) => {
    const cellImg = e.querySelector("img");
    if (cellImg) {
      if (/x.png/.test(cellImg.src)) {
        xIndices.push(i);
      } else if (/o.png/.test(cellImg.src)) {
        oIndices.push(i);
      }
    }
  });
  return [xIndices, oIndices];
}

function checkForEndOfGame([xIndices, oIndices]) {
  let winner = "";
  const bothPlayerIndices = [xIndices, oIndices];
  bothPlayerIndices.forEach((e, i) => {
    const eStr = e.join("");
    let won = true;
    if (/012/.test(eStr)) {
      drawHorizontalLine(linesHorizontal[0]);
    } else if (/345/.test(eStr)) {
      drawHorizontalLine(linesHorizontal[1]);
    } else if (/678/.test(eStr)) {
      drawHorizontalLine(linesHorizontal[2]);
    } else if (/.*0.*3.*6/.test(eStr)) {
      drawVerticalLine(linesVertical[0]);
    } else if (/.*1.*4.*7/.test(eStr)) {
      drawVerticalLine(linesVertical[1]);
    } else if (/.*2.*5.*8/.test(eStr)) {
      drawVerticalLine(linesVertical[2]);
    } else if (/.*0.*4.*8/.test(eStr)) {
      drawDiagonalLine(linesDiagonal[0]);
    } else if (/.*2.*4.*6/.test(eStr)) {
      drawDiagonalLine(linesDiagonal[1]);
    } else {
      won = false;
    }
    if (won) {
      winner = i == 0 ? "x" : "o";
    }
  });
  if (winner === "" && oIndices.length + xIndices.length == 9) {
    return "draw";
  } else if (winner !== "") {
    return winner;
  } else {
    return "ongoing";
  }
}

function displayResults(winner) {
  if (winner !== "draw") {
    if (winner === selectedSide) {
      resultText.innerText = "You won!";
    } else {
      resultText.innerText = "You lost!";
    }
    setTimeout(() => {
      resultSection.style.display = "block";
      resultSection.classList.remove("popout");
      resultSection.classList.add("popin");
    }, 700);
  } else {
    resultText.innerText = "It's a draw!";
    setTimeout(() => {
      resultSection.style.display = "block";
      resultSection.classList.remove("popout");
      resultSection.classList.add("popin");
    }, 700);
  }
}

// ------------------------------------------- RESTARTING THE GAME ------------------------------------------- //

resetButton.addEventListener("click", function resetGame() {
  // clearing cells
  cells.forEach((e) => {
    e.innerHTML = "";
  });
  // removing the result
  setTimeout(() => {
    resultSection.style.display = "block";
    resultSection.classList.remove("popin");
    resultSection.classList.add("popout");
  }, 1);
  setTimeout(() => {
    resultSection.style.display = "none";
  }, 400);
  // removing the crossing lines
  const straightLine = document.querySelector("#straight-line");
  if (straightLine) {
    straightLine.style.width = "0px";
    straightLine.style.height = "0px";
    straightLine.remove();
  }
  linesDiagonal.forEach((e) => {
    e.style.width = "0px";
    e.style.display = "none";
  });
  // bringing up the game settings window
  settingGame = true;
  startGameSettings();
  gameOver = false;
});
