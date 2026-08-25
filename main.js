const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const territoryName = document.getElementById("territory-name");
const territoryOwner = document.getElementById("territory-owner");


// ============================================================
// MAP SIZE
// ============================================================

const COLS = 100;
const ROWS = 60;

const HEX_SIZE = 14;

const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = HEX_SIZE * 2;


// ============================================================
// CAMERA
// ============================================================

let camera = {
    x: 0,
    y: 0,
    zoom: 1.0
};

let isDragging = false;

let lastMouseX = 0;
let lastMouseY = 0;

let wasDragging = false;


// ============================================================
// TILE DATA
// ============================================================

const tiles = [];


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
// CREATE TILES
// ============================================================

function createTiles() {

    for (let row = 0; row < ROWS; row++) {

        for (let col = 0; col < COLS; col++) {

            tiles.push({
                col: col,
                row: row,

                owner: "ocean"
            });
        }
    }
}


// ============================================================
// HEX POSITION
// ============================================================

function hexToWorld(col, row) {

    const x =
        col * HEX_WIDTH +
        (row % 2) * (HEX_WIDTH / 2);

    const y =
        row * HEX_SIZE * 1.5;

    return {
        x: x,
        y: y
    };
}


// ============================================================
// DISTANCE FROM POINT
// ============================================================

function distance(x1, y1, x2, y2) {

    const dx = x1 - x2;
    const dy = y1 - y2;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


// ============================================================
// MAKE COUNTRY SHAPE
// ============================================================
//
// This uses simple mathematical shapes to create the initial
// political map. Later we can replace this with actual
// historical GIS boundaries.
//

function generateEurope() {

    for (const tile of tiles) {

        const p = hexToWorld(
            tile.col,
            tile.row
        );

        const x = p.x;
        const y = p.y;


        // --------------------------------------------
        // LAND MASS
        // --------------------------------------------

        let land = false;


        // Main European landmass
        if (
            x > 250 &&
            x < 1350 &&
            y > 180 &&
            y < 780
        ) {
            land = true;
        }


        // Iberian peninsula
        if (
            x > 150 &&
            x < 480 &&
            y > 500 &&
            y < 760
        ) {
            land = true;
        }


        // Italy
        if (
            x > 600 &&
            x < 850 &&
            y > 600 &&
            y < 950
        ) {
            land = true;
        }


        // Scandinavia
        if (
            x > 600 &&
            x < 1000 &&
            y > 0 &&
            y < 330
        ) {
            land = true;
        }


        // Eastern Europe / Russia
        if (
            x > 1000 &&
            x < 1700 &&
            y > 100 &&
            y < 650
        ) {
            land = true;
        }


        // Balkans
        if (
            x > 850 &&
            x < 1300 &&
            y > 650 &&
            y < 900
        ) {
            land = true;
        }


        if (!land) {
            tile.owner = "ocean";
            continue;
        }


        // --------------------------------------------
        // COUNTRY ASSIGNMENT
        // --------------------------------------------


        // Portugal
        if (
            x > 180 &&
            x < 260 &&
            y > 540 &&
            y < 720
        ) {
            tile.owner = "portugal";
            continue;
        }


        // Spain
        if (
            x > 230 &&
            x < 500 &&
            y > 520 &&
            y < 750
        ) {
            tile.owner = "spain";
            continue;
        }


        // Great Britain
        if (
            x > 430 &&
            x < 560 &&
            y > 130 &&
            y < 400
        ) {
            tile.owner = "britain";
            continue;
        }


        // France
        if (
            x > 420 &&
            x < 720 &&
            y > 360 &&
            y < 610
        ) {
            tile.owner = "france";
            continue;
        }


        // Netherlands
        if (
            x > 650 &&
            x < 760 &&
            y > 270 &&
            y < 380
        ) {
            tile.owner = "netherlands";
            continue;
        }


        // Denmark
        if (
            x > 700 &&
            x < 850 &&
            y > 100 &&
            y < 260
        ) {
            tile.owner = "denmark";
            continue;
        }


        // Prussia
        if (
            x > 800 &&
            x < 1080 &&
            y > 300 &&
            y < 470
        ) {
            tile.owner = "prussia";
            continue;
        }


        // Saxony
        if (
            x > 760 &&
            x < 900 &&
            y > 440 &&
            y < 520
        ) {
            tile.owner = "saxony";
            continue;
        }


        // Bavaria
        if (
            x > 650 &&
            x < 850 &&
            y > 500 &&
            y < 650
        ) {
            tile.owner = "bavaria";
            continue;
        }


        // Switzerland
        if (
            x > 540 &&
            x < 670 &&
            y > 570 &&
            y < 680
        ) {
            tile.owner = "switzerland";
            continue;
        }


        // Austria
        if (
            x > 820 &&
            x < 1100 &&
            y > 500 &&
            y < 700
        ) {
            tile.owner = "austria";
            continue;
        }


        // Italy
        if (
            x > 620 &&
            x < 850 &&
            y > 650 &&
            y < 880
        ) {
            tile.owner = "italy";
            continue;
        }


        // Sweden
        if (
            x > 800 &&
            x < 980 &&
            y > 20 &&
            y < 280
        ) {
            tile.owner = "sweden";
            continue;
        }


        // Russia
        if (
            x > 1080 &&
            x < 1650 &&
            y > 150 &&
            y < 600
        ) {
            tile.owner = "russia";
            continue;
        }


        // Ottoman Empire
        if (
            x > 950 &&
            x < 1400 &&
            y > 700 &&
            y < 900
        ) {
            tile.owner = "ottoman";
            continue;
        }


        // Remaining land
        // becomes Austria by default
        tile.owner = "austria";
    }
}


// ============================================================
// RESIZE
// ============================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
}

window.addEventListener(
    "resize",
    resizeCanvas
);


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
// DRAW HEX
// ============================================================

function drawHex(
    x,
    y,
    size,
    fillColor,
    borderColor
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
    ctx.lineWidth = 0.7;

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
    // OCEAN
    // --------------------------------------------

    ctx.fillStyle = "#6f9eaf";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------
    // HEX TILES
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
            "#30302d"
        );
    }
}


// ============================================================
// FIND TILE
// ============================================================

function getTileAt(
    worldX,
    worldY
) {

    let closest = null;

    let closestDistance = Infinity;


    for (const tile of tiles) {

        const p =
            hexToWorld(
                tile.col,
                tile.row
            );

        const d =
            distance(
                worldX,
                worldY,
                p.x,
                p.y
            );

        if (
            d <
            HEX_SIZE &&
            d <
            closestDistance
        ) {

            closest = tile;
            closestDistance = d;
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
            `Hex: ${tile.col}, ${tile.row}`;


        // Temporary selection effect
        const p =
            hexToWorld(
                tile.col,
                tile.row
            );

        const screen =
            worldToScreen(
                p.x,
                p.y
            );


        drawHex(
            screen.x,
            screen.y,
            HEX_SIZE *
            camera.zoom,
            country.color,
            "#ffffff"
        );
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
            dx / camera.zoom;

        camera.y -=
            dy / camera.zoom;


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
                0.35,
                Math.min(
                    3.0,
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


        draw();
    }
);


// ============================================================
// START
// ============================================================

createTiles();

generateEurope();


// Start looking roughly at Europe
camera.x = 150;
camera.y = 50;
camera.zoom = 0.8;

resizeCanvas();
