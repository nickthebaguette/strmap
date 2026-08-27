const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const mapCanvas = document.createElement("canvas");
const mapCtx = mapCanvas.getContext("2d");

const territoryName =
    document.getElementById("territory-name");

const territoryOwner =
    document.getElementById("territory-owner");


// ============================================================
// MAP CONFIGURATION
// ============================================================
//
// Grid dimensions are loaded from map.json.
//
// HEX_SIZE controls the logical size of each hex.
// Larger = physically larger hexes.
//
// CACHE_SCALE controls the resolution of the off-screen map.
// 3 gives us a much sharper map when zooming in while
// retaining the performance advantage of cached rendering.
//

let COLS = 0;
let ROWS = 0;

const HEX_SIZE = 14;

const CACHE_SCALE = 3;


// ============================================================
// HEX GEOMETRY
// ============================================================
//
// These are FLAT-TOP hexagons.
//
// This is the same coordinate system used by the website
// before the converter was introduced.
//
// Rows are staggered horizontally:
//
//   ⬡   ⬡   ⬡
//     ⬡   ⬡   ⬡
//   ⬡   ⬡   ⬡
//
// This is important because the converter must use the
// exact same geometry.
//

const HEX_WIDTH =
    Math.sqrt(3) * HEX_SIZE;

const HEX_VERTICAL_DISTANCE =
    HEX_SIZE * 1.5;


// These are calculated after the map dimensions are loaded.

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

function calculateMapDimensions() {

    if (COLS <= 0 || ROWS <= 0) {
        return;
    }

    // We add a HEX_SIZE-sized margin around the map.
    //
    // This also means the first hex is no longer centered
    // directly on coordinate 0, which was one of the causes
    // of the awkward camera behaviour.

    MAP_WIDTH =
        COLS * HEX_WIDTH +
        HEX_WIDTH / 2 +
        HEX_SIZE * 2;

    MAP_HEIGHT =
        (ROWS - 1) *
        HEX_VERTICAL_DISTANCE +
        HEX_SIZE * 2 +
        HEX_SIZE * 2;
}


// ============================================================
// HEX POSITION
// ============================================================

function hexToWorld(col, row) {

    return {

        x:
            HEX_SIZE +
            HEX_WIDTH / 2 +
            col * HEX_WIDTH +
            (row % 2) *
            HEX_WIDTH / 2,

        y:
            HEX_SIZE +
            HEX_SIZE +
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
// The cache is rendered at CACHE_SCALE resolution.
//
// The logical map might be:
//
//     1000 × 700
//
// But the actual off-screen canvas becomes:
//
//     3000 × 2100
//
// This makes it much sharper when the user zooms in.
//

function rebuildMapCanvas() {

    if (COLS <= 0 || ROWS <= 0) {
        return;
    }

    mapCanvas.width =
        Math.ceil(
            MAP_WIDTH *
            CACHE_SCALE
        );

    mapCanvas.height =
        Math.ceil(
            MAP_HEIGHT *
            CACHE_SCALE
        );


    mapCtx.clearRect(
        0,
        0,
        mapCanvas.width,
        mapCanvas.height
    );


    mapCtx.save();

    mapCtx.scale(
        CACHE_SCALE,
        CACHE_SCALE
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


        // Safety fallback in case map.json
        // contains an unknown owner.

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


    mapCtx.restore();
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


    ctx.save();


    ctx.scale(
        camera.zoom,
        camera.zoom
    );


    ctx.translate(
        -camera.x,
        -camera.y
    );


    // The cached canvas is 3× larger than its logical size,
    // so tell drawImage to display it at its logical size.

    ctx.drawImage(
        mapCanvas,

        0,
        0,
        mapCanvas.width,
        mapCanvas.height,

        0,
        0,
        MAP_WIDTH,
        MAP_HEIGHT
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

    // Estimate the row first.

    const approxRow =
        Math.round(
            (
                worldY -
                HEX_SIZE -
                HEX_SIZE
            ) /
            HEX_VERTICAL_DISTANCE
        );


    // Estimate column taking the staggered row into account.

    const rowOffset =
        (
            approxRow % 2
        ) *
        HEX_WIDTH / 2;


    const approxCol =
        Math.round(
            (
                worldX -
                HEX_SIZE -
                HEX_WIDTH / 2 -
                rowOffset
            ) /
            HEX_WIDTH
        );


    let closest = null;

    let closestDistance =
        HEX_SIZE;


    // Check nearby hexes.

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
// LOAD MAP
// ============================================================

async function loadMap() {

    try {

        const response =
            await fetch(
                "data/map.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load map.json"
            );
        }


        const data =
            await response.json();


        // ----------------------------------------------------
        // READ GRID SIZE
        // ----------------------------------------------------

        if (
            !Number.isInteger(
                Number(data.cols)
            ) ||
            !Number.isInteger(
                Number(data.rows)
            )
        ) {

            throw new Error(
                "map.json does not contain valid cols/rows"
            );
        }


        COLS =
            Number(data.cols);

        ROWS =
            Number(data.rows);


        console.log(
            `Map grid: ${COLS} × ${ROWS}`
        );


        // ----------------------------------------------------
        // CALCULATE MAP SIZE
        // ----------------------------------------------------

        calculateMapDimensions();


        // ----------------------------------------------------
        // CREATE EMPTY TILES
        // ----------------------------------------------------

        createTiles();


        // ----------------------------------------------------
        // LOAD TILES
        // ----------------------------------------------------

        if (Array.isArray(data.tiles)) {

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
                    continue;
                }


                const index =
                    row * COLS +
                    col;


                tiles[index].owner =
                    owner;
            }
        }


        // ----------------------------------------------------
        // ALTERNATIVE FORMAT
        // ----------------------------------------------------

        else if (
            Array.isArray(data.owners)
        ) {

            for (
                let i = 0;

                i <
                data.owners.length &&
                i <
                tiles.length;

                i++
            ) {

                const owner =
                    data.owners[i];


                if (
                    countries[owner]
                ) {

                    tiles[i].owner =
                        owner;
                }
            }
        }


        // ----------------------------------------------------
        // ALTERNATIVE 2D FORMAT
        // ----------------------------------------------------

        else if (
            Array.isArray(data.map)
        ) {

            for (
                let row = 0;

                row <
                data.map.length &&
                row <
                ROWS;

                row++
            ) {

                const mapRow =
                    data.map[row];


                if (
                    !Array.isArray(mapRow)
                ) {
                    continue;
                }


                for (
                    let col = 0;

                    col <
                    mapRow.length &&
                    col <
                    COLS;

                    col++
                ) {

                    const owner =
                        mapRow[col];


                    if (
                        !countries[owner]
                    ) {
                        continue;
                    }


                    tiles[
                        row * COLS +
                        col
                    ].owner =
                        owner;
                }
            }
        }


        // ----------------------------------------------------
        // BUILD MAP
        // ----------------------------------------------------

        rebuildMapCanvas();

        resizeCanvas();


        console.log(
            "Map loaded successfully."
        );

    }


    catch (error) {

        console.error(
            "Failed to load map:",
            error
        );

    }
}


// ============================================================
// START
// ============================================================
//
// IMPORTANT:
// We DON'T create the tiles or build the map here anymore.
//
// map.json must be loaded first because it tells us
// the grid dimensions.
//

loadMap();
