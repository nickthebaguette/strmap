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

// Default values.
// These will be replaced by map.json if it contains
// "cols" and "rows".

let COLS = 100;
let ROWS = 60;

const HEX_SIZE = 14;

const HEX_WIDTH =
    Math.sqrt(3) * HEX_SIZE;

const HEX_VERTICAL_DISTANCE =
    HEX_SIZE * 1.5;


// These are recalculated after loading the map.

let MAP_WIDTH =
    COLS * HEX_WIDTH +
    HEX_WIDTH;

let MAP_HEIGHT =
    ROWS * HEX_VERTICAL_DISTANCE +
    HEX_SIZE;


// ============================================================
// FRAME
// ============================================================

// The frame extends half a hex beyond the map.
//
// This helps cover the small gaps around the outer edge.

const FRAME_OVERHANG =
    HEX_SIZE * 0.5;

const FRAME_WIDTH = 6;

const FRAME_COLOR =
    "#252522";


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

    batavia: {
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
    },

    naples: {
        name: "Naples",
        color: "#8fae9b"
    },

    papal: {
        name: "Papal States",
        color: "#b89488"
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

function hexToWorld(
    col,
    row
) {

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

function worldToScreen(
    x,
    y
) {

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

function screenToWorld(
    x,
    y
) {

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


    for (
        let i = 0;
        i < 6;
        i++
    ) {

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

function rebuildMapCanvas() {

    mapCanvas.width =
        Math.ceil(
            MAP_WIDTH +
            FRAME_OVERHANG * 2
        );

    mapCanvas.height =
        Math.ceil(
            MAP_HEIGHT +
            FRAME_OVERHANG * 2
        );


    mapCtx.clearRect(
        0,
        0,
        mapCanvas.width,
        mapCanvas.height
    );


    // The map itself still uses the original coordinate
    // system. The cache simply has a little extra room
    // around it for the frame.

    mapCtx.save();


    mapCtx.translate(
        FRAME_OVERHANG,
        FRAME_OVERHANG
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


        if (!country) {
            continue;
        }


        drawHexOnContext(

            mapCtx,

            world.x,

            world.y,

            HEX_SIZE,

            country.color

        );

    }


    mapCtx.restore();

}


// ============================================================
// DRAW
// ============================================================
//
// IMPORTANT:
//
// The camera still uses the exact same world coordinate
// system as before.
//
// The frame is purely visual.
//

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.save();


    // ========================================================
    // CAMERA
    // ========================================================

    ctx.translate(
        -camera.x *
        camera.zoom,

        -camera.y *
        camera.zoom
    );


    ctx.scale(
        camera.zoom,
        camera.zoom
    );


    // ========================================================
    // FRAME
    // ========================================================

    ctx.fillStyle =
        FRAME_COLOR;


    ctx.fillRect(

        -FRAME_OVERHANG,

        -FRAME_OVERHANG,

        MAP_WIDTH +
        FRAME_OVERHANG * 2,

        MAP_HEIGHT +
        FRAME_OVERHANG * 2

    );


    // ========================================================
    // MAP
    // ========================================================

    //
    // The cache contains the map shifted by FRAME_OVERHANG,
    // so compensate for that here.
    //

    ctx.drawImage(

        mapCanvas,

        -FRAME_OVERHANG,

        -FRAME_OVERHANG

    );


    // ========================================================
    // FRAME BORDER
    // ========================================================

    ctx.strokeStyle =
        FRAME_COLOR;

    ctx.lineWidth =
        FRAME_WIDTH /
        camera.zoom;


    ctx.strokeRect(

        -FRAME_OVERHANG,

        -FRAME_OVERHANG,

        MAP_WIDTH +
        FRAME_OVERHANG * 2,

        MAP_HEIGHT +
        FRAME_OVERHANG * 2

    );


    ctx.restore();

}


// ============================================================
// CAMERA LIMITS
// ============================================================
//
// Keep the original map limits.
//
// The frame is allowed to extend slightly beyond the map,
// but it does not change the actual camera coordinate system.
//

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

    // Approximate tile first.

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


    // Search nearby tiles.

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


        // World position before zoom.

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


        // World position after zoom.

        const after =
            screenToWorld(
                mouseX,
                mouseY
            );


        // Keep the mouse over the same world position.

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

        if (
            Number.isInteger(
                Number(data.cols)
            )
        ) {

            COLS =
                Number(
                    data.cols
                );

        }


        if (
            Number.isInteger(
                Number(data.rows)
            )
        ) {

            ROWS =
                Number(
                    data.rows
                );

        }


        updateMapDimensions();

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
                    !countries[
                        owner
                    ]
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
                    countries[
                        owner
                    ]
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
                        !countries[
                            owner
                        ]
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


        // ====================================================
        // BUILD
        // ====================================================

        rebuildMapCanvas();


        // Reset camera to a sensible starting position.

        camera.zoom =
            MIN_ZOOM;


        camera.x = 0;

        camera.y = 0;


        clampCamera();

        draw();


        console.log(
            `Map loaded successfully: ${COLS} × ${ROWS}`
        );

    }


    catch (error) {

        console.error(
            "Failed to load map:",
            error
        );


        updateMapDimensions();

        createTiles();

        rebuildMapCanvas();

        resizeCanvas();

    }

}


// ============================================================
// START
// ============================================================

createTiles();

updateMapDimensions();

rebuildMapCanvas();

resizeCanvas();

loadMap();
