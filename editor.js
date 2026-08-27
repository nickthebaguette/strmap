const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const mapCanvas = document.createElement("canvas");
const mapCtx = mapCanvas.getContext("2d");


// ============================================================
// UI
// ============================================================

const countrySelect =
    document.getElementById("country-select");


// ============================================================
// MAP
// ============================================================

let COLS = 100;
let ROWS = 60;

const HEX_SIZE = 14;

const HEX_WIDTH =
    Math.sqrt(3) * HEX_SIZE;

const HEX_VERTICAL_DISTANCE =
    HEX_SIZE * 1.5;


// These are calculated after the map is loaded.

let MAP_WIDTH = 0;
let MAP_HEIGHT = 0;


// ============================================================
// FRAME
// ============================================================
//
// The frame extends half a hex beyond the map.
//
// This deliberately covers the little triangular gaps
// around the outer edge of the staggered hex grid.
//

const FRAME_OVERHANG =
    HEX_SIZE * 0.5;

const FRAME_WIDTH = 5;

const FRAME_COLOR = "#252522";


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

function calculateMapDimensions() {

    const finalRowOffset =
        ((ROWS - 1) % 2) *
        HEX_WIDTH / 2;


    MAP_WIDTH =
        COLS * HEX_WIDTH +
        HEX_WIDTH / 2 +
        finalRowOffset;


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
            (row % 2) *
            HEX_WIDTH / 2,

        y:
            HEX_SIZE +
            row *
            HEX_VERTICAL_DISTANCE

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
            (60 * i);


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
            MAP_WIDTH
        );

    mapCanvas.height =
        Math.ceil(
            MAP_HEIGHT
        );


    mapCtx.clearRect(
        0,
        0,
        mapCanvas.width,
        mapCanvas.height
    );


    for (
        const tile
        of tiles
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

}


// ============================================================
// DRAW
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


    // --------------------------------------------------------
    // MAP
    // --------------------------------------------------------

    ctx.drawImage(
        mapCanvas,
        0,
        0
    );


    // --------------------------------------------------------
    // FRAME
    // --------------------------------------------------------

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
            -FRAME_OVERHANG,
            Math.min(
                camera.x,
                maxX +
                FRAME_OVERHANG
            )
        );


    camera.y =
        Math.max(
            -FRAME_OVERHANG,
            Math.min(
                camera.y,
                maxY +
                FRAME_OVERHANG
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
// FIND TILE
// ============================================================

function getTileAt(
    worldX,
    worldY
) {

    const approxCol =
        Math.round(
            (
                worldX -
                HEX_WIDTH / 2
            ) /
            HEX_WIDTH
        );


    const approxRow =
        Math.round(
            (
                worldY -
                HEX_SIZE
            ) /
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
// PAINT TILE
// ============================================================

function paintTile(
    event
) {

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


    const selectedCountry =
        countrySelect.value;


    if (
        !countries[
            selectedCountry
        ]
    ) {
        return;
    }


    if (
        tile.owner ===
        selectedCountry
    ) {
        return;
    }


    tile.owner =
        selectedCountry;


    rebuildMapCanvas();

    draw();

}


// ============================================================
// MOUSE STATE
// ============================================================

let painting = false;

let panning = false;

let lastX = 0;

let lastY = 0;


// ============================================================
// MOUSE DOWN
// ============================================================
//
// Left = paint
// Right = pan
//

canvas.addEventListener(
    "mousedown",
    (event) => {

        // LEFT
        if (
            event.button === 0
        ) {

            painting = true;

            paintTile(
                event
            );

            return;
        }


        // RIGHT
        if (
            event.button === 2
        ) {

            panning = true;

            lastX =
                event.clientX;

            lastY =
                event.clientY;

        }

    }
);


// ============================================================
// MOUSE MOVE
// ============================================================

canvas.addEventListener(
    "mousemove",
    (event) => {

        // ----------------------------------------------------
        // PAINT
        // ----------------------------------------------------

        if (painting) {

            paintTile(
                event
            );

        }


        // ----------------------------------------------------
        // PAN
        // ----------------------------------------------------

        if (panning) {

            const dx =
                event.clientX -
                lastX;


            const dy =
                event.clientY -
                lastY;


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

    }
);


// ============================================================
// MOUSE UP
// ============================================================

window.addEventListener(
    "mouseup",
    (event) => {

        if (
            event.button === 0
        ) {

            painting = false;

        }


        if (
            event.button === 2
        ) {

            panning = false;

        }

    }
);


// ============================================================
// DISABLE RIGHT CLICK MENU
// ============================================================

canvas.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();

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
// EXPORT MAP
// ============================================================

function exportMap() {

    const output = {

        cols: COLS,

        rows: ROWS,

        tiles: tiles

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    output,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "map.json";


    link.click();


    URL.revokeObjectURL(
        url
    );

}


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


        calculateMapDimensions();

        createTiles();


        // ----------------------------------------------------
        // LOAD TILES
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // REBUILD
        // ----------------------------------------------------

        rebuildMapCanvas();

        clampCamera();

        draw();


        console.log(
            `Editor map loaded: ${COLS} × ${ROWS}`
        );

    }

    catch (error) {

        console.error(
            "Failed to load map:",
            error
        );


        calculateMapDimensions();

        createTiles();

        rebuildMapCanvas();

        resizeCanvas();

    }

}


// ============================================================
// EXPORT BUTTON
// ============================================================

const exportButton =
    document.getElementById(
        "export-map"
    );


if (exportButton) {

    exportButton.addEventListener(
        "click",
        exportMap
    );

}


// ============================================================
// START
// ============================================================

loadMap();

resizeCanvas();
