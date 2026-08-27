const canvas =
    document.getElementById("map");

const ctx =
    canvas.getContext("2d");


const mapCanvas =
    document.createElement("canvas");

const mapCtx =
    mapCanvas.getContext("2d");


// ============================================================
// UI
// ============================================================

const editorMode =
    document.getElementById("editor-mode");


const territoryControls =
    document.getElementById(
        "territory-controls"
    );


const cityControls =
    document.getElementById(
        "city-controls"
    );


const armyControls =
    document.getElementById(
        "army-controls"
    );


const countrySelect =
    document.getElementById(
        "country-select"
    );


const saveButton =
    document.getElementById(
        "save-button"
    );


const downloadButton =
    document.getElementById(
        "download-button"
    );


const statusText =
    document.getElementById(
        "status"
    );


// ============================================================
// EDITOR MODE
// ============================================================

let currentEditorMode =
    "territory";


function updateEditorMode() {

    currentEditorMode =
        editorMode.value;


    // ========================================================
    // TERRITORY
    // ========================================================

    if (
        currentEditorMode ===
        "territory"
    ) {

        territoryControls.style.display =
            "block";

        cityControls.style.display =
            "none";

        armyControls.style.display =
            "none";

    }


    // ========================================================
    // CITY
    // ========================================================

    else if (
        currentEditorMode ===
        "city"
    ) {

        territoryControls.style.display =
            "none";

        cityControls.style.display =
            "block";

        armyControls.style.display =
            "none";

    }


    // ========================================================
    // ARMY
    // ========================================================

    else if (
        currentEditorMode ===
        "army"
    ) {

        territoryControls.style.display =
            "none";

        cityControls.style.display =
            "none";

        armyControls.style.display =
            "block";

    }


    // Make absolutely sure territory painting
    // is stopped when changing modes.

    painting = false;

}


if (editorMode) {

    editorMode.addEventListener(
        "change",
        updateEditorMode
    );

}


// ============================================================
// MAP
// ============================================================

let COLS = 100;
let ROWS = 60;


const HEX_SIZE = 14;


const HEX_WIDTH =
    Math.sqrt(3) *
    HEX_SIZE;


const HEX_VERTICAL_DISTANCE =
    HEX_SIZE *
    1.5;


// ============================================================
// FRAME
// ============================================================

const FRAME_OVERHANG =
    HEX_SIZE *
    0.5;


const FRAME_WIDTH = 7;


const FRAME_COLOR =
    "#252522";


// ============================================================
// MAP DIMENSIONS
// ============================================================

let MAP_WIDTH =
    COLS *
    HEX_WIDTH +
    HEX_WIDTH;


let MAP_HEIGHT =
    ROWS *
    HEX_VERTICAL_DISTANCE +
    HEX_SIZE;


function updateMapDimensions() {

    MAP_WIDTH =
        COLS *
        HEX_WIDTH +
        HEX_WIDTH;


    MAP_HEIGHT =
        ROWS *
        HEX_VERTICAL_DISTANCE +
        HEX_SIZE;

}


// ============================================================
// CAMERA
// ============================================================

let camera = {

    x: 0,

    y: 0,

    zoom: 0.55

};


let MIN_ZOOM = 0.55;


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
// HEX POSITION
// ============================================================

function hexToWorld(
    col,
    row
) {

    return {

        x:
            col *
            HEX_WIDTH +

            (row % 2) *
            HEX_WIDTH / 2,

        y:
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
            Math.PI /
            180 *
            (
                60 *
                i -
                30
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

function rebuildMapCanvas() {

    mapCanvas.width =
        Math.ceil(
            MAP_WIDTH +
            FRAME_OVERHANG *
            2
        );


    mapCanvas.height =
        Math.ceil(
            MAP_HEIGHT +
            FRAME_OVERHANG *
            2
        );


    mapCtx.clearRect(
        0,
        0,
        mapCanvas.width,
        mapCanvas.height
    );


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
// MINIMUM ZOOM
// ============================================================

function updateMinimumZoom() {

    const frameWidth =
        MAP_WIDTH +
        FRAME_OVERHANG *
        2;


    const frameHeight =
        MAP_HEIGHT +
        FRAME_OVERHANG *
        2;


    const zoomX =
        canvas.width /
        frameWidth;


    const zoomY =
        canvas.height /
        frameHeight;


    MIN_ZOOM =
        Math.max(
            zoomX,
            zoomY
        );


    MIN_ZOOM =
        Math.min(
            MIN_ZOOM,
            MAX_ZOOM
        );

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
    // FRAME BACKGROUND
    // ========================================================

    ctx.fillStyle =
        FRAME_COLOR;


    ctx.fillRect(

        -FRAME_OVERHANG,

        -FRAME_OVERHANG,

        MAP_WIDTH +
        FRAME_OVERHANG *
        2,

        MAP_HEIGHT +
        FRAME_OVERHANG *
        2

    );


    // ========================================================
    // MAP
    // ========================================================

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
        FRAME_OVERHANG *
        2,

        MAP_HEIGHT +
        FRAME_OVERHANG *
        2

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


    const frameLeft =
        -FRAME_OVERHANG;


    const frameTop =
        -FRAME_OVERHANG;


    const frameRight =
        MAP_WIDTH +
        FRAME_OVERHANG;


    const frameBottom =
        MAP_HEIGHT +
        FRAME_OVERHANG;


    const frameWidth =
        frameRight -
        frameLeft;


    const frameHeight =
        frameBottom -
        frameTop;


    // ========================================================
    // HORIZONTAL
    // ========================================================

    if (
        visibleWidth >=
        frameWidth
    ) {

        camera.x =
            frameLeft -
            (
                visibleWidth -
                frameWidth
            ) / 2;

    } else {

        const minX =
            frameLeft;


        const maxX =
            frameRight -
            visibleWidth;


        camera.x =
            Math.max(

                minX,

                Math.min(
                    camera.x,
                    maxX
                )

            );

    }


    // ========================================================
    // VERTICAL
    // ========================================================

    if (
        visibleHeight >=
        frameHeight
    ) {

        camera.y =
            frameTop -
            (
                visibleHeight -
                frameHeight
            ) / 2;

    } else {

        const minY =
            frameTop;


        const maxY =
            frameBottom -
            visibleHeight;


        camera.y =
            Math.max(

                minY,

                Math.min(
                    camera.y,
                    maxY
                )

            );

    }

}


// ============================================================
// RESIZE
// ============================================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;


    canvas.height =
        window.innerHeight;


    updateMinimumZoom();


    camera.zoom =
        Math.max(
            camera.zoom,
            MIN_ZOOM
        );


    camera.zoom =
        Math.min(
            camera.zoom,
            MAX_ZOOM
        );


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
// WORLD POSITION FROM MOUSE
// ============================================================

function getTileFromMouse(
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


    return getTileAt(
        world.x,
        world.y
    );

}


// ============================================================
// TERRITORY PAINTING
// ============================================================

let painting = false;


function paintTile(event) {

    const tile =
        getTileFromMouse(
            event
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


    statusText.textContent =
        "Unsaved changes";


    rebuildMapCanvas();


    draw();

}


// ============================================================
// CITY CLICK
// ============================================================

function handleCityClick(
    event
) {

    const tile =
        getTileFromMouse(
            event
        );


    if (!tile) {

        return;

    }


    statusText.textContent =
        `City position: ${tile.col}, ${tile.row}`;


    console.log(
        "CITY:",
        tile.col,
        tile.row
    );

}


// ============================================================
// ARMY CLICK
// ============================================================

function handleArmyClick(
    event
) {

    const tile =
        getTileFromMouse(
            event
        );


    if (!tile) {

        return;

    }


    statusText.textContent =
        `Army position: ${tile.col}, ${tile.row}`;


    console.log(
        "ARMY:",
        tile.col,
        tile.row
    );

}


// ============================================================
// MOUSE DOWN
// ============================================================

canvas.addEventListener(
    "mousedown",
    (event) => {

        // ====================================================
        // TERRITORY
        // ====================================================

        if (
            currentEditorMode ===
            "territory"
        ) {

            if (
                event.button !== 0
            ) {

                return;

            }


            painting = true;


            paintTile(
                event
            );


            return;

        }


        // ====================================================
        // CITY
        // ====================================================

        if (
            currentEditorMode ===
            "city"
        ) {

            if (
                event.button !== 0
            ) {

                return;

            }


            handleCityClick(
                event
            );


            return;

        }


        // ====================================================
        // ARMY
        // ====================================================

        if (
            currentEditorMode ===
            "army"
        ) {

            if (
                event.button !== 0
            ) {

                return;

            }


            handleArmyClick(
                event
            );


            return;

        }

    }
);


// ============================================================
// MOUSE MOVE
// ============================================================

canvas.addEventListener(
    "mousemove",
    (event) => {

        if (
            painting &&
            currentEditorMode ===
            "territory"
        ) {

            paintTile(
                event
            );

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

    }
);


// ============================================================
// RIGHT CLICK MENU
// ============================================================

canvas.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();

    }
);


// ============================================================
// PAN
// ============================================================
//
// Right mouse button pans the map.
// This is kept separate from the editor modes.
//

let panning = false;


let lastX = 0;
let lastY = 0;


canvas.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.button !== 2
        ) {

            return;

        }


        panning = true;


        lastX =
            event.clientX;


        lastY =
            event.clientY;

    }
);


canvas.addEventListener(
    "mousemove",
    (event) => {

        if (
            !panning
        ) {

            return;

        }


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
);


window.addEventListener(
    "mouseup",
    (event) => {

        if (
            event.button === 2
        ) {

            panning = false;

        }

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

            camera.zoom *=
                1.1;

        } else {

            camera.zoom *=
                0.9;

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
// CREATE MAP JSON
// ============================================================

function createMapJSON() {

    return {

        cols: COLS,

        rows: ROWS,

        tiles:
            tiles.map(
                tile => ({

                    col:
                        tile.col,

                    row:
                        tile.row,

                    owner:
                        tile.owner

                })
            )

    };

}


// ============================================================
// SAVE LOCAL COPY
// ============================================================

function saveMap() {

    const data =
        createMapJSON();


    localStorage.setItem(

        "strategy_map_editor",

        JSON.stringify(
            data
        )

    );


    statusText.textContent =
        "Saved local copy";

}


// ============================================================
// DOWNLOAD JSON
// ============================================================

function downloadMap() {

    const data =
        createMapJSON();


    const blob =
        new Blob(

            [
                JSON.stringify(
                    data,
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


    link.href =
        url;


    link.download =
        "map.json";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    statusText.textContent =
        "Downloaded map.json";

}


// ============================================================
// BUTTONS
// ============================================================

if (saveButton) {

    saveButton.addEventListener(
        "click",
        saveMap
    );

}


if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        downloadMap
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


        // ====================================================
        // GRID SIZE
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
        // TILES
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
                    row *
                    COLS +
                    col
                ].owner =
                    owner;

            }

        }


        // ====================================================
        // BUILD
        // ====================================================

        rebuildMapCanvas();


        // ====================================================
        // CAMERA
        // ====================================================

        updateMinimumZoom();


        camera.zoom =
            Math.max(
                camera.zoom,
                MIN_ZOOM
            );


        camera.zoom =
            Math.min(
                camera.zoom,
                MAX_ZOOM
            );


        clampCamera();


        draw();


        statusText.textContent =
            `Loaded ${COLS} × ${ROWS} map`;


        console.log(
            `Editor loaded ${COLS} × ${ROWS}`
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


        statusText.textContent =
            "Failed to load map.json";

    }

}


// ============================================================
// START
// ============================================================

updateEditorMode();


createTiles();


updateMapDimensions();


rebuildMapCanvas();


resizeCanvas();


loadMap();
