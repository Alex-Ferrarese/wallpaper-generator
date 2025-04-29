// Function to create a 2D array
function make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
        // Fill the array with 0
        for (let j = 0; j < arr[i].length; j++) {
            arr[i][j] = 0;
        }
    }
    return arr;
}

// Grid
let grid;
let velocityGrid;

// Size of each square
let w = 5;
let cols, rows;
let hueValue = 200;

let gravity = 0.1;

// Check if a column is within bounds
function withinCols(i) {
    return i >= 0 && i <= cols - 1;
}

// Check if a row is within bounds
function withinRows(j) {
    return j >= 0 && j <= rows - 1;
}

function setup() {
    // Create the canvas inside the canvas-wrapper div
    let canvas = createCanvas(300, 500);
    canvas.parent('canvas-wrapper');
    colorMode(HSB, 360, 255, 255);
    cols = width / w;
    rows = height / w;
    grid = make2DArray(cols, rows);
    velocityGrid = make2DArray(cols, rows, 1);

    // Add event listener for the download button
    document.getElementById('download-btn').addEventListener('click', downloadCanvas);
}

function mouseDragged() { }

function draw() {
    background(0);

    if (mouseIsPressed) {
        let mouseCol = floor(mouseX / w);
        let mouseRow = floor(mouseY / w);

        // Randomly add an area of sand particles
        let matrix = 5;
        let extent = floor(matrix / 2);
        for (let i = -extent; i <= extent; i++) {
            for (let j = -extent; j <= extent; j++) {
                if (random(1) < 0.75) {
                    let col = mouseCol + i;
                    let row = mouseRow + j;
                    if (withinCols(col) && withinRows(row)) {
                        grid[col][row] = hueValue;
                        velocityGrid[col][row] = 1;
                    }
                }
            }
        }
        // Change the sand color over time
        hueValue += 0.5;
        if (hueValue > 360) {
            hueValue = 1;
        }
    }

    // Draw the sand
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            noStroke();
            if (grid[i][j] > 0) {
                fill(grid[i][j], 255, 255);
                let x = i * w;
                let y = j * w;
                square(x, y, w);
            }
        }
    }

    // Create a 2D array for the next animation frame
    let nextGrid = make2DArray(cols, rows);
    let nextVelocityGrid = make2DArray(cols, rows);

    // Check each cell
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            // What is the state?
            let state = grid[i][j];
            let velocity = velocityGrid[i][j];
            let moved = false;
            if (state > 0) {
                let newPos = int(j + velocity);
                for (let y = newPos; y > j; y--) {
                    let below = grid[i][y];
                    let dir = 1;
                    if (random(1) < 0.5) {
                        dir *= -1;
                    }
                    let belowA = -1;
                    let belowB = -1;
                    if (withinCols(i + dir)) belowA = grid[i + dir][y];
                    if (withinCols(i - dir)) belowB = grid[i - dir][y];

                    if (below === 0) {
                        nextGrid[i][y] = state;
                        nextVelocityGrid[i][y] = velocity + gravity;
                        moved = true;
                        break;
                    } else if (belowA === 0) {
                        nextGrid[i + dir][y] = state;
                        nextVelocityGrid[i + dir][y] = velocity + gravity;
                        moved = true;
                        break;
                    } else if (belowB === 0) {
                        nextGrid[i - dir][y] = state;
                        nextVelocityGrid[i - dir][y] = velocity + gravity;
                        moved = true;
                        break;
                    }
                }
            }

            if (state > 0 && !moved) {
                nextGrid[i][j] = grid[i][j];
                nextVelocityGrid[i][j] = velocityGrid[i][j] + gravity;
            }
        }
    }
    grid = nextGrid;
    velocityGrid = nextVelocityGrid;
}

// Function to download the canvas as an image
function downloadCanvas() {
    // Create a temporary element for download
    let link = document.createElement('a');
    link.download = 'falling-sand-creation.png';

    // Convert the canvas to an image
    let canvas = document.querySelector('#canvas-wrapper canvas');
    link.href = canvas.toDataURL('image/png');

    // Simulate a click to start the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}