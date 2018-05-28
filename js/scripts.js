/* eslint-env browser */
/* eslint no-bitwise: 0, max-len: 0 */

const canvas = document.getElementById('main-canvas');
const ctxMain = canvas.getContext('2d');

const bufferCells = document.createElement('canvas');
bufferCells.width = canvas.width;
bufferCells.height = canvas.height;
const ctxCells = bufferCells.getContext('2d');

const bufferWalls = document.createElement('canvas');
bufferWalls.width = canvas.width;
bufferWalls.height = canvas.height;
const ctxWalls = bufferWalls.getContext('2d');

const canvasPadding = 10;
ctxMain.translate(canvasPadding + 0.5, canvasPadding + 0.5);
ctxCells.translate(0.5, 0.5);
ctxWalls.translate(0.5, 0.5);

// On compte en nombre de cellule
const mazeWidth = 75;
const mazeHeight = 75;
const gridWidth = (2 * mazeWidth) + 1;
const gridHeight = (2 * mazeHeight) + 1;
const cellWidth = 5;
const cellHeight = 5;
const grid = new Uint8Array(gridWidth * gridHeight);

function line(ctx, ax, ay, bx, by, color) {
  ctx.strokeStyle = color;
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
}

function rectangle(ctx, x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
}

function clear(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initialize() {
  grid.fill(1);
}

function mazeToGridIndex(x, y) {
  return (2 * x) + gridWidth + (2 * y * gridWidth) + 1;
}

function drawCells() {
  const cellColorArray = ['#000', '#DDD', '#F0F', '#FFF'];
  ctxCells.beginPath();
  for (let y = 1; y < gridHeight; y += 2) {
    for (let x = 1, i = x + (y * gridWidth); x < gridWidth; x += 2, i = x + (y * gridWidth)) {
      if (grid[i] !== 0) rectangle(ctxCells, (x - 1) * cellWidth, (y - 1) * cellHeight, cellWidth * 2, cellHeight * 2, cellColorArray[grid[i]]);
    }
  }
  ctxMain.drawImage(bufferCells, 0, 0, canvas.width, canvas.height, 0.5, 0.5, canvas.width, canvas.height);
}

function drawWalls() {
  ctxWalls.beginPath();
  for (let y = 0; y < gridHeight; y += 2) {
    for (let x = 1, i = x + (y * gridWidth); x < gridWidth; x += 2, i = x + (y * gridWidth)) {
      if (grid[i] !== 0) line(ctxWalls, (x - 1) * cellWidth, y * cellHeight, (x + 1) * cellWidth, y * cellHeight, grid[i] === 1 ? '#666' : '#FFF');
    }
  }

  for (let y = 1; y < gridHeight; y += 2) {
    for (let x = 0, i = x + (y * gridWidth); x < gridWidth; x += 2, i = x + (y * gridWidth)) {
      if (grid[i] !== 0) line(ctxWalls, x * cellWidth, (y - 1) * cellHeight, x * cellWidth, (y + 1) * cellHeight, grid[i] === 1 ? '#666' : '#FFF');
    }
  }
  ctxWalls.stroke();
  ctxWalls.closePath();
  ctxMain.drawImage(bufferWalls, 0, 0, canvas.width, canvas.height, 0.5, 0.5, canvas.width, canvas.height);
}

function getNeighbours(index) {
  const x = ((index % gridWidth) - 1) / 2;
  const y = (((index / gridWidth) | 0) - 1) / 2;
  const res = [];

  if (x !== 0) res.push({ i: index - 2, w: index - 1 });
  if (y !== 0) res.push({ i: index - (gridWidth * 2), w: index - gridWidth });
  if (x !== mazeWidth - 1) res.push({ i: index + 2, w: index + 1 });
  if (y !== mazeHeight - 1) res.push({ i: index + (gridWidth * 2), w: index + gridWidth });

  return res;
}

const trackedCells = [];

function generateMaze() {
  const y = Math.floor(Math.random() * mazeWidth);
  const x = Math.floor(Math.random() * mazeHeight);
  const i = mazeToGridIndex(x, y);

  trackedCells.push(i);
  grid[i] = 2;
}

function mazeStep() {
  if (trackedCells.length !== 0) {
    const currentIndex = trackedCells[trackedCells.length - 1];
    const neighbours = getNeighbours(currentIndex).sort(() => 0.5 - Math.random());
    let unvisitedNeighbourFound = false;
    const baseRandomIndex = Math.round(Math.random() * (neighbours.length - 1));
    for (let j = 0, n = neighbours.length; j < n; j += 1) {
      const tempRandomIndex = (baseRandomIndex + j) % n;
      const neighbour = neighbours[tempRandomIndex].i;
      const wallBetween = neighbours[tempRandomIndex].w;
      if (grid[neighbour] < 2) {
        trackedCells.push(neighbour);
        grid[neighbour] = 2;
        grid[wallBetween] = 0;
        unvisitedNeighbourFound = true;
        break;
      }
    }
    if (!unvisitedNeighbourFound) {
      grid[trackedCells.pop()] = 3;
    }
  }
}

function draw() {
  clear(ctxCells);
  clear(ctxWalls);
  clear(ctxMain);
  for (let i = 0; i < 10; i += 1) {
    mazeStep();
  }
  drawCells();
  drawWalls();
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

initialize();
animate();
generateMaze();
