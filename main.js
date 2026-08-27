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
// Grid dimensions are read from map.json.
//
// HEX_SIZE controls the logical size of each hex.
//
// CACHE_SCALE renders the cached map at higher resolution,
// making zooming look considerably sharper.
//

let COLS = 0;
let ROWS = 0;

const HEX_SIZE = 14;

const CACHE_SCALE = 3;


// ============================================================
// HEX GEOMETRY
// ============================================================
//
// Flat-top hexagons.
//
// Rows are staggered horizontally.
//
//   ⬡   ⬡   ⬡
//     ⬡   ⬡   ⬡
//   ⬡   ⬡   ⬡
//


const HEX_WIDTH =
    Math.sqrt(3) * HEX_SIZE;

const HEX_VERTICAL_DISTANCE =
    HEX_SIZE * 1.5;


// Actual outer dimensions of the hex field.

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

const MIN_ZOOM = 0.1;
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

    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < COLS;
            col++
        ) {

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
//
// These dimensions describe the ACTUAL outer boundary of
// the hexagonal field.
//
// The boundary cuts through the outside hexes instead of
// leaving empty space around them.
//

function calculateMapDimensions() {

    if (
        COLS <= 0 ||
        ROWS <= 0
    ) {
        return;
    }


    // Width of one flat-top hex.

    const hexWidth =
        HEX_WIDTH;


    // The final row may be horizontally offset.

    const finalRowOffset =
        (
            (ROWS - 1) % 2
        ) *
        hexWidth / 2;


    // Actual width of the hex field.

    MAP_WIDTH =
        COLS *
        hexWidth +
        hexWidth / 2 +
        finalRowOffset;


    // Actual height.

    MAP_HEIGHT =
        (ROWS - 1) *
        HEX_VERTICAL_DISTANCE +
        HEX_SIZE * 2;
}


// ============================================================
// HEX POSITION
// ============================================================

function hexToWorld(
    col,
    row
) {

    return {

        x:
            HEX_WIDTH / 2 +
            col * HEX_WIDTH +
            (
                row % 2
            ) *
            HEX_WIDTH / 2,

        y:
            HEX_SIZE +
            row *
            HEX_VERTICAL_DISTANCE

    };
}


// ============================================================
// WORLD → SCREEN
// ============================================================

function worldToScreen(
    x,
    y
) {

    return {

        x:
            (
                x -
                camera.x
            ) *
            camera.zoom,

        y:
            (
                y -
                camera.y
            ) *
            camera.zoom

    };
}


// ============================================================
// SCREEN → WORLD
// ============================================================

function screenToWorld(
    x,
    y
) {

    return {

        x:
            x /
            camera.zoom +
            camera.x,

        y:
            y /
            camera.zoom +
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


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const angle =
            Math.PI / 180 *
            (
                60 * i - 30
            );


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
// The map is rendered once into a high-resolution off-screen
// canvas.
//
// Camera movement does NOT rebuild this.
//

function rebuildMapCanvas() {

    if (
        COLS <= 0 ||
        ROWS <= 0
    ) {
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


    // --------------------------------------------------------
    // CLIP TO THE ACTUAL MAP BOUNDARY
    // --------------------------------------------------------

    mapCtx.beginPath();

    mapCtx.rect(
        0,
        0,
        MAP_WIDTH *
        CACHE_SCALE,
        MAP_HEIGHT *
        CACHE_SCALE
    );

    mapCtx.clip();


    // --------------------------------------------------------
    // HIGH-RESOLUTION RENDERING
    // --------------------------------------------------------

    mapCtx.scale(
        CACHE_SCALE,
        CACHE_SCALE
    );


    for (
        const tile of tiles
    ) {

        const world =
            hexToWorld(
                tile.col,
                tile.row
            );


        const country =
            countries[
                tile.owner
            ];


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


    // ========================================================
    // MAP
    // ========================================================

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


    // ========================================================
    // PICTURE FRAME
    // ========================================================

    // Outer dark frame.

    ctx.strokeStyle =
        "#252525";

    ctx.lineWidth =
        6 / camera.zoom;


    ctx.strokeRect(

        0,
        0,

        MAP_WIDTH,
        MAP_HEIGHT

    );


    // Inner lighter frame.

    ctx.strokeStyle =
        "#77736a";

    ctx.lineWidth =
        2 / camera.zoom;


    ctx.strokeRect(

        3 / camera.zoom,
        3 / camera.zoom,

        MAP_WIDTH -
        6 / camera.zoom,

        MAP_HEIGHT -
        6 / camera.zoom

    );


    ctx.restore();
}


// ============================================================
// MINIMUM ZOOM
// ============================================================
//
// Prevents the player from zooming out far enough to see
// empty space around the map.
//
// The map must always completely cover the viewport.
//

function getMinimumZoom() {

    if (
        MAP_WIDTH <= 0 ||
        MAP_HEIGHT <= 0 ||
        canvas.width <= 0 ||
        canvas.height <= 0
    ) {

        return 0.55;
    }


    const zoomX =
        canvas.width /
        MAP_WIDTH;


    const zoomY =
        canvas.height /
        MAP_HEIGHT;


    return Math.max(
        zoomX,
        zoomY
    );
}


// ============================================================
// CAMERA LIMITS
// ============================================================

function clampCamera() {

    const minimumZoom =
        Math.max(
            MIN_ZOOM,
            getMinimumZoom()
        );


    // Make sure zoom cannot go below
    // the map-covering minimum.

    if (
        camera.zoom <
        minimumZoom
    ) {

        camera.zoom =
            minimumZoom;
    }


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

    // Estimate row.

    const approxRow =
        Math.round(
            (
                worldY -
                HEX_SIZE
            ) /
            HEX_VERTICAL_DISTANCE
        );


    // Account for staggered row.

    const rowOffset =
        (
            approxRow % 2
        ) *
        HEX_WIDTH / 2;


    const approxCol =
        Math.round(
            (
                worldX -
                HEX_WIDTH / 2 -
                rowOffset
            ) /
            HEX_WIDTH
        );


    let closest = null;


    let closestDistance =
        HEX_SIZE;


    // Search nearby hexes.

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
                        row *
                        COLS +
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

        if (
            wasDragging
        ) {
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
// Left mouse drag = pan.
//

let dragging = false;

let lastX = 0;
let lastY = 0;


canvas.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.button !== 0
        ) {
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


        // World position underneath
        // the mouse before zooming.

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


        // Apply minimum and maximum zoom.

        const minimumZoom =
            Math.max(
                MIN_ZOOM,
                getMinimumZoom()
            );


        camera.zoom =
            Math.max(
                minimumZoom,
                Math.min(
                    MAX_ZOOM,
                    camera.zoom
                )
            );


        // World position underneath
        // mouse after zooming.

        const after =
            screenToWorld(
                mouseX,
                mouseY
            );


        // Keep the same world position
        // underneath the mouse.

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


        // ====================================================
        // READ GRID SIZE
        // ====================================================

        const loadedCols =
            Number(data.cols);


        const loadedRows =
            Number(data.rows);


        if (
            !Number.isInteger(
                loadedCols
            ) ||
            loadedCols <= 0 ||
            !Number.isInteger(
                loadedRows
            ) ||
            loadedRows <= 0
        ) {

            throw new Error(
                "map.json does not contain valid cols/rows"
            );
        }


        COLS =
            loadedCols;


        ROWS =
            loadedRows;


        console.log(
            `Map grid: ${COLS} × ${ROWS}`
        );


        // ====================================================
        // CALCULATE DIMENSIONS
        // ====================================================

        calculateMapDimensions();


        // ====================================================
        // CREATE EMPTY GRID
        // ====================================================

        createTiles();


        // ====================================================
        // FORMAT 1: TILES
        // ====================================================

        if (
            Array.isArray(
                data.tiles
            )
        ) {

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
                    !Number.isInteger(
                        col
                    ) ||
                    !Number.isInteger(
                        row
                    )
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
                    row *
                    COLS +
                    col;


                tiles[index].owner =
                    owner;
            }
        }


        // ====================================================
        // FORMAT 2: OWNERS
        // ====================================================

        else if (
            Array.isArray(
                data.owners
            )
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


        // ====================================================
        // FORMAT 3: 2D MAP
        // ====================================================

        else if (
            Array.isArray(
                data.map
            )
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
                    !Array.isArray(
                        mapRow
                    )
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
                        row *
                        COLS +
                        col
                    ].owner =
                        owner;
                }
            }
        }


        // ====================================================
        // BUILD MAP
        // ====================================================

        rebuildMapCanvas();


        // Reset camera so the newly loaded map
        // starts in a sensible position.

        camera.zoom =
            Math.max(
                MIN_ZOOM,
                getMinimumZoom()
            );


        camera.x = 0;
        camera.y = 0;


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
// map.json is loaded first because it determines
// the grid dimensions.
//

loadMap();
