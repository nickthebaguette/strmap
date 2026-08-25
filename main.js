const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const territoryName = document.getElementById("territory-name");
const territoryOwner = document.getElementById("territory-owner");


// ============================================================
// MAP
// ============================================================

const COLS = 150;
const ROWS = 90;

const HEX_SIZE = 14;

const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_VERTICAL_DISTANCE = HEX_SIZE * 1.5;

const MAP_WIDTH = COLS * HEX_WIDTH + HEX_WIDTH / 2;
const MAP_HEIGHT = ROWS * HEX_VERTICAL_DISTANCE + HEX_SIZE;


// ============================================================
// CAMERA
// ============================================================

let camera = {
    x: 0,
    y: 0,
    zoom: 0.8
};

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 3.0;

let isDragging = false;
let wasDragging = false;

let lastMouseX = 0;
let lastMouseY = 0;


// ============================================================
// COUNTRIES
// ============================================================

const countries = {

    ocean: {
        name: "Ocean",
        color: "#6f9eaf"
    },

    france: {
        name: "France",
        color: "#4d72ad"
    },

    spain: {
        name: "Spain",
        color: "#c18a45"
    },

    portugal: {
        name: "Portugal",
        color: "#6c9660"
    },

    britain: {
        name: "Great Britain",
        color: "#a85858"
    },

    netherlands: {
        name: "Batavian Republic",
        color: "#9b7182"
    },

    prussia: {
        name: "Prussia",
        color: "#667c99"
    },

    austria: {
        name: "Austria",
        color: "#c5a74e"
    },

    russia: {
        name: "Russian Empire",
        color: "#71975e"
    },

    sweden: {
        name: "Sweden",
        color: "#c6a84d"
    },

    denmark: {
        name: "Denmark-Norway",
        color: "#a45e68"
    },

    italy: {
        name: "Kingdom of Italy",
        color: "#6d949c"
    },

    ottoman: {
        name: "Ottoman Empire",
        color: "#9bb955"
    },

    switzerland: {
        name: "Switzerland",
        color: "#9d5959"
    },

    bavaria: {
        name: "Bavaria",
        color: "#718c69"
    },

    saxony: {
        name: "Saxony",
        color: "#aa8355"
    }
};


// ============================================================
// TILES
// ============================================================

const tiles = [];

function createTiles() {

    tiles.length = 0;

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            tiles.push({
                col,
                row,
                owner: "ocean"
            });
        }
    }
}


// ============================================================
// HEX POSITION
// ============================================================

function hexToWorld(col, row) {

    return {
        x:
            col * HEX_WIDTH +
            (row % 2) * HEX_WIDTH / 2,

        y:
            row * HEX_VERTICAL_DISTANCE
    };
}


// ============================================================
// WORLD → SCREEN
// ============================================================

function worldToScreen(x, y) {

    return {
        x: (x - camera.x) * camera.zoom,
        y: (y - camera.y) * camera.zoom
    };
}


// ============================================================
// SCREEN → WORLD
// ============================================================

function screenToWorld(x, y) {

    return {
        x: x / camera.zoom + camera.x,
        y: y / camera.zoom + camera.y
    };
}


// ============================================================
// GENERATE MAP
// ============================================================

function generateEurope() {

    for (const tile of tiles) {

        const p =
            hexToWorld(
                tile.col,
                tile.row
            );

        const x = p.x;
        const y = p.y;


        // ----------------------------------------------------
        // LAND MASS
        // ----------------------------------------------------

        let land = false;


        // Mainland Europe
        if (
            x > 250 &&
            x < 1500 &&
            y > 150 &&
            y < 850
        ) {
            land = true;
        }


        // Iberia
        if (
            x > 120 &&
            x < 500 &&
            y > 500 &&
            y < 820
        ) {
            land = true;
        }


        // Scandinavia
        if (
            x > 500 &&
            x < 1050 &&
            y > 0 &&
            y < 350
        ) {
            land = true;
        }


        // Italy
        if (
            x > 600 &&
            x < 900 &&
            y > 650 &&
            y < 1000
        ) {
            land = true;
        }


        // Balkans
        if (
            x > 850 &&
            x < 1400 &&
            y > 700 &&
            y < 950
        ) {
            land = true;
        }


        // Eastern Europe / Russia
        if (
            x > 1150 &&
            x < 2100 &&
            y > 100 &&
            y < 700
        ) {
            land = true;
        }


        // ----------------------------------------------------
        // OCEAN
        // ----------------------------------------------------

        if (!land) {

            tile.owner = "ocean";

            continue;
        }


        // ----------------------------------------------------
        // COUNTRIES
        // ----------------------------------------------------

        if (
            x > 170 &&
            x < 260 &&
            y > 520 &&
            y < 760
        ) {
            tile.owner = "portugal";
            continue;
        }


        if (
            x > 230 &&
            x < 500 &&
            y > 520 &&
            y < 780
        ) {
            tile.owner = "spain";
            continue;
        }


        if (
            x > 400 &&
            x < 570 &&
            y > 100 &&
            y < 400
        ) {
            tile.owner = "britain";
            continue;
        }


        if (
            x > 420 &&
            x < 750 &&
            y > 350 &&
            y < 620
        ) {
            tile.owner = "france";
            continue;
        }


        if (
            x > 650 &&
            x < 780 &&
            y > 270 &&
            y < 390
        ) {
            tile.owner = "netherlands";
            continue;
        }


        if (
            x > 700 &&
            x < 850 &&
            y > 100 &&
            y < 270
        ) {
            tile.owner = "denmark";
            continue;
        }


        if (
            x > 800 &&
            x < 1100 &&
            y > 300 &&
            y < 470
        ) {
            tile.owner = "prussia";
            continue;
        }


        if (
            x > 760 &&
            x < 900 &&
            y > 440 &&
            y < 530
        ) {
            tile.owner = "saxony";
            continue;
        }


        if (
            x > 650 &&
            x < 850 &&
            y > 500 &&
            y < 650
        ) {
            tile.owner = "bavaria";
            continue;
        }


        if (
            x > 540 &&
            x < 680 &&
            y > 570 &&
            y < 690
        ) {
            tile.owner = "switzerland";
            continue;
        }


        if (
            x > 820 &&
            x < 1120 &&
            y > 500 &&
            y < 700
        ) {
            tile.owner = "austria";
            continue;
        }


        if (
            x > 620 &&
            x < 880 &&
            y > 650 &&
            y < 900
        ) {
            tile.owner = "italy";
            continue;
        }


        if (
            x > 800 &&
            x < 1000 &&
            y > 20 &&
            y < 300
        ) {
            tile.owner = "sweden";
            continue;
        }


        if (
            x > 1080 &&
            x < 2050 &&
            y > 150 &&
            y < 650
        ) {
            tile.owner = "russia";
            continue;
        }


        if (
            x > 950 &&
            x < 1450 &&
            y > 700 &&
            y < 950
        ) {
            tile.owner = "ottoman";
            continue;
        }


        tile.owner = "austria";
    }
}


// ============================================================
// DRAW HEX
// ============================================================

function drawHex(
    x,
    y,
    size,
    fillColor,
    borderColor,
    borderWidth
) {

    ctx.beginPath();

    for (let i = 0; i < 6; i++) {

        const angle =
            Math.PI / 180 *
            (60 * i - 30);

        const px =
            x +
            size *
            Math.cos(angle);

        const py =
            y +
            size *
            Math.sin(angle);

        if (i === 0) {
            ctx.moveTo(px, py);
        }
        else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;

    ctx.stroke();
}


// ============================================================
// DRAW MAP
// ============================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------
    // MAP BACKGROUND
    // --------------------------------------------

    ctx.fillStyle = "#4f8194";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------
    // HEXES
    // --------------------------------------------

    for (const tile of tiles) {

        const world =
            hexToWorld(
                tile.col,
                tile.row
            );

        const screen =
            worldToScreen(
                world.x,
                world.y
            );

        const country =
            countries[tile.owner];


        drawHex(
            screen.x,
            screen.y,
            HEX_SIZE * camera.zoom,
            country.color,
            "#30302d",
            0.7
        );
    }
}


// ============================================================
// CAMERA LIMITS
// ============================================================

function clampCamera() {

    const visibleWidth =
        canvas.width /
        camera.zoom;

    const visibleHeight =
        canvas.height /
        camera.zoom;


    // --------------------------------------------
    // Horizontal
    // --------------------------------------------

    const maxX =
        Math.max(
            0,
            MAP_WIDTH -
            visibleWidth
        );

    camera.x =
        Math.max(
            0,
            Math.min(
                camera.x,
                maxX
            )
        );


    // --------------------------------------------
    // Vertical
    // --------------------------------------------

    const maxY =
        Math.max(
            0,
            MAP_HEIGHT -
            visibleHeight
        );

    camera.y =
        Math.max(
            0,
            Math.min(
                camera.y,
                maxY
            )
        );
}


// ============================================================
// RESIZE
// ============================================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;

    clampCamera();

    draw();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================================
// FIND TILE
// ============================================================

function getTileAt(
    worldX,
    worldY
) {

    const approxCol =
        Math.round(
            worldX / HEX_WIDTH
        );

    const approxRow =
        Math.round(
            worldY /
            HEX_VERTICAL_DISTANCE
        );


    let closest = null;

    let closestDistance =
        HEX_SIZE;


    // Only inspect nearby hexes
    for (
        let row =
            approxRow - 2;

        row <=
        approxRow + 2;

        row++
    ) {

        for (
            let col =
                approxCol - 2;

            col <=
            approxCol + 2;

            col++
        ) {

            if (
                col < 0 ||
                col >= COLS ||
                row < 0 ||
                row >= ROWS
            ) {
                continue;
            }


            const p =
                hexToWorld(
                    col,
                    row
                );


            const dx =
                worldX - p.x;

            const dy =
                worldY - p.y;


            const d =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                d <
                closestDistance
            ) {

                closestDistance = d;

                closest =
                    tiles[
                        row * COLS +
                        col
                    ];
            }
        }
    }


    return closest;
}


// ============================================================
// CLICK
// ============================================================

canvas.addEventListener(
    "click",
    (event) => {

        if (wasDragging) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const screenX =
            event.clientX -
            rect.left;

        const screenY =
            event.clientY -
            rect.top;


        const world =
            screenToWorld(
                screenX,
                screenY
            );


        const tile =
            getTileAt(
                world.x,
                world.y
            );


        if (!tile) {
            return;
        }


        const country =
            countries[tile.owner];


        territoryName.textContent =
            country.name;


        territoryOwner.textContent =
            `Tile: ${tile.col}, ${tile.row}`;
    }
);


// ============================================================
// PAN
// ============================================================

canvas.addEventListener(
    "mousedown",
    (event) => {

        isDragging = true;
        wasDragging = false;

        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;
    }
);


canvas.addEventListener(
    "mousemove",
    (event) => {

        if (!isDragging) {
            return;
        }


        const dx =
            event.clientX -
            lastMouseX;

        const dy =
            event.clientY -
            lastMouseY;


        if (
            Math.abs(dx) > 2 ||
            Math.abs(dy) > 2
        ) {

            wasDragging = true;
        }


        camera.x -=
            dx /
            camera.zoom;

        camera.y -=
            dy /
            camera.zoom;


        clampCamera();


        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;


        draw();
    }
);


canvas.addEventListener(
    "mouseup",
    () => {

        isDragging = false;
    }
);


canvas.addEventListener(
    "mouseleave",
    () => {

        isDragging = false;
    }
);


// ============================================================
// ZOOM
// ============================================================

canvas.addEventListener(
    "wheel",
    (event) => {

        event.preventDefault();


        const rect =
            canvas.getBoundingClientRect();


        const mouseX =
            event.clientX -
            rect.left;

        const mouseY =
            event.clientY -
            rect.top;


        const before =
            screenToWorld(
                mouseX,
                mouseY
            );


        if (event.deltaY < 0) {

            camera.zoom *= 1.1;

        }
        else {

            camera.zoom *= 0.9;
        }


        camera.zoom =
            Math.max(
                MIN_ZOOM,
                Math.min(
                    MAX_ZOOM,
                    camera.zoom
                )
            );


        const after =
            screenToWorld(
                mouseX,
                mouseY
            );


        camera.x +=
            before.x -
            after.x;

        camera.y +=
            before.y -
            after.y;


        clampCamera();

        draw();
    }
);


// ============================================================
// START
// ============================================================

createTiles();

generateEurope();


// Start at top-left of the world
camera.x = 0;
camera.y = 0;
camera.zoom = MIN_ZOOM;

resizeCanvas();
