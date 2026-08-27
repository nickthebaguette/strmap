const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const mapCanvas = document.createElement("canvas");
const mapCtx = mapCanvas.getContext("2d");

const territoryName =
    document.getElementById("territory-name");

const territoryOwner =
    document.getElementById("territory-owner");


// ============================================================
// MAP
// ============================================================

// These are now loaded from map.json.
// Defaults are only used if the JSON is missing them.

let COLS = 87;
let ROWS = 52;

const HEX_SIZE = 14;

const HEX_WIDTH =
    Math.sqrt(3) * HEX_SIZE;

const HEX_VERTICAL_DISTANCE =
    HEX_SIZE * 1.5;

let MAP_WIDTH = 0;
let MAP_HEIGHT = 0;


// ============================================================
// CAMERA
// ============================================================

let camera = {
    x: 0,
    y: 0,
    zoom: 0.55
};

const MIN_ZOOM = 0.55;
const MAX_ZOOM = 3.0;


// ============================================================
// COUNTRIES
// ============================================================

const countries = {

    ocean: {
        name: "Ocean",
        color: "#4f8194"
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
                col: col,
                row: row,
                owner: "ocean"
            });

        }
    }
}


// ============================================================
// MAP DIMENSIONS
// ============================================================

function updateMapDimensions() {

    MAP_WIDTH =
        COLS * HEX_WIDTH +
        HEX_WIDTH;

    MAP_HEIGHT =
        ROWS * HEX_VERTICAL_DISTANCE +
        HEX_SIZE;
}


// ============================================================
// HEX POSITION
// ============================================================

function hexToWorld(col, row) {

    return {

        x:
            col * HEX_WIDTH +
            (row % 2) *
            HEX_WIDTH / 2,

        y:
            row * HEX_VERTICAL_DISTANCE

    };
}


// ============================================================
// WORLD → SCREEN
// ============================================================

function worldToScreen(x, y) {

    return {

        x:
            (x - camera.x) *
            camera.zoom,

        y:
            (y - camera.y) *
            camera.zoom

    };
}


// ============================================================
// SCREEN → WORLD
// ============================================================

function screenToWorld(x, y) {

    return {

        x:
            x / camera.zoom +
            camera.x,

        y:
            y / camera.zoom +
            camera.y

    };
}


// ============================================================
// HEX DRAWING
// ============================================================

function drawHexOnContext(
    context,
    x,
    y,
    size,
    color
) {

    context.beginPath();

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

            context.moveTo(
                px,
                py
            );

        } else {

            context.lineTo(
                px,
                py
            );

        }
    }

    context.closePath();

    context.fillStyle =
        color;

    context.fill();

    context.strokeStyle =
        "#30302d";

    context.lineWidth =
        0.7;

    context.stroke();
}


// ============================================================
// BUILD MAP CACHE
// ============================================================
//
// This is the expensive operation.
// It only runs when the map changes.
//
// Camera movement does NOT rebuild the map.
//

function rebuildMapCanvas() {

    mapCanvas.width =
        MAP_WIDTH;

    mapCanvas.height =
        MAP_HEIGHT;

    mapCtx.clearRect(
        0,
        0,
        mapCanvas.width,
        mapCanvas.height
    );

    for (const tile of tiles) {

        const world =
            hexToWorld(
                tile.col,
                tile.row
            );

        const country =
            countries[
                tile.owner
            ];

        // Safety fallback if the JSON contains
        // an owner that doesn't exist in countries.

        const color =
            country
                ? country.color
                : countries.ocean.color;

        drawHexOnContext(

            mapCtx,

            world.x,
            world.y,

            HEX_SIZE,

            color

        );
    }
}


// ============================================================
// DRAW MAP
// ============================================================
//
// Extremely cheap.
//
// We simply move and scale the cached image.
//

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.save();

    ctx.scale(
        camera.zoom,
        camera.zoom
    );

    ctx.translate(
        -camera.x,
        -camera.y
    );

    ctx.drawImage(
        mapCanvas,
        0,
        0
    );

    ctx.restore();
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

    const maxX =
        Math.max(
            0,
            MAP_WIDTH -
            visibleWidth
        );

    const maxY =
        Math.max(
            0,
            MAP_HEIGHT -
            visibleHeight
        );

    camera.x =
        Math.max(
            0,
            Math.min(
                camera.x,
                maxX
            )
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
            worldX /
            HEX_WIDTH
        );

    const approxRow =
        Math.round(
            worldY /
            HEX_VERTICAL_DISTANCE
        );

    let closest = null;

    let closestDistance =
        HEX_SIZE;

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
                worldX -
                p.x;

            const dy =
                worldY -
                p.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <
                closestDistance
            ) {

                closest =
                    tiles[
                        row * COLS +
                        col
                    ];

                closestDistance =
                    distance;
            }
        }
    }

    return closest;
}


// ============================================================
// TILE CLICK
// ============================================================

let wasDragging = false;


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
            countries[
                tile.owner
            ];

        if (!country) {
            return;
        }

        territoryName.textContent =
            country.name;

        territoryOwner.textContent =
            `Tile: ${tile.col}, ${tile.row}`;
    }
);


// ============================================================
// PAN
// ============================================================
//
// Left drag = pan
//

let dragging = false;

let lastX = 0;
let lastY = 0;


canvas.addEventListener(
    "mousedown",
    (event) => {

        if (event.button !== 0) {
            return;
        }

        dragging = true;

        wasDragging = false;

        lastX =
            event.clientX;

        lastY =
            event.clientY;
    }
);


canvas.addEventListener(
    "mousemove",
    (event) => {

        if (!dragging) {
            return;
        }

        const dx =
            event.clientX -
            lastX;

        const dy =
            event.clientY -
            lastY;

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

        lastX =
            event.clientX;

        lastY =
            event.clientY;

        draw();
    }
);


window.addEventListener(
    "mouseup",
    () => {

        dragging = false;

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

        // World position underneath mouse
        // before zooming.

        const before =
            screenToWorld(
                mouseX,
                mouseY
            );

        if (
            event.deltaY < 0
        ) {

            camera.zoom *= 1.1;

        } else {

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

        // World position underneath mouse
        // after zooming.

        const after =
            screenToWorld(
                mouseX,
                mouseY
            );

        // Keep the mouse over the same map position.

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
// LOAD MAP
// ============================================================

async function loadMap() {

    try {

        // Cache-busting prevents GitHub Pages/browser
        // caching from giving us an old map.json.

        const response =
            await fetch(
                "data/map.json?version=" +
                Date.now()
            );

        if (!response.ok) {

            throw new Error(
                "Could not load map.json"
            );
        }

        const data =
            await response.json();


        // ----------------------------------------------------
        // READ GRID SIZE FROM JSON
        // ----------------------------------------------------

        if (
            Number.isInteger(data.cols) &&
            Number.isInteger(data.rows)
        ) {

            COLS =
                data.cols;

            ROWS =
                data.rows;

        } else {

            console.warn(
                "map.json has no valid cols/rows. Using defaults."
            );

        }


        // ----------------------------------------------------
        // UPDATE MAP SIZE
        // ----------------------------------------------------

        updateMapDimensions();


        // ----------------------------------------------------
        // CREATE EMPTY GRID
        // ----------------------------------------------------

        createTiles();


        // ----------------------------------------------------
        // LOAD OWNERSHIP
        // ----------------------------------------------------

        if (!Array.isArray(data.tiles)) {

            throw new Error(
                "map.json does not contain a 'tiles' array."
            );
        }


        let loadedTiles = 0;


        for (
            const savedTile
            of data.tiles
        ) {

            const col =
                Number(
                    savedTile.col
                );

            const row =
                Number(
                    savedTile.row
                );

            const owner =
                savedTile.owner;


            if (
                !Number.isInteger(col) ||
                !Number.isInteger(row)
            ) {

                continue;

            }


            if (
                col < 0 ||
                col >= COLS ||
                row < 0 ||
                row >= ROWS
            ) {

                continue;

            }


            if (
                !countries[owner]
            ) {

                console.warn(
                    "Unknown country:",
                    owner
                );

                continue;
            }


            const index =
                row * COLS +
                col;


            tiles[index].owner =
                owner;


            loadedTiles++;

        }


        // ----------------------------------------------------
        // BUILD MAP
        // ----------------------------------------------------

        rebuildMapCanvas();


        clampCamera();

        draw();


        console.log(
            `Map loaded: ${COLS} × ${ROWS}`
        );

        console.log(
            `Ownership tiles loaded: ${loadedTiles}`
        );

    }


    catch (error) {

        console.error(
            "Failed to load map:",
            error
        );


        // Still create a usable default map
        // if loading fails.

        updateMapDimensions();

        createTiles();

        rebuildMapCanvas();

        resizeCanvas();

    }
}


// ============================================================
// START
// ============================================================

loadMap();
