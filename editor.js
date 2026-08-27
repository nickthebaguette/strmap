const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const mapCanvas = document.createElement("canvas");
const mapCtx = mapCanvas.getContext("2d");


// ============================================================
// UI
// ============================================================

const countrySelect =
    document.getElementById("country-select");

const saveButton =
    document.getElementById("save-button");

const downloadButton =
    document.getElementById("download-button");

const statusText =
    document.getElementById("status");


// ============================================================
// EDITOR UI
// ============================================================

let editorMode = "territory";

let armyIconPath =
    "icons/armies/army.png";


// Create editor controls dynamically.
// This means your existing editor.html does NOT need
// to be replaced.

const editorPanel =
    document.getElementById("editor-panel");


const modeSection =
    document.createElement("div");

modeSection.className =
    "editor-section";


modeSection.innerHTML = `
    <strong>Editor Mode</strong>

    <select id="editor-mode">

        <option value="territory">
            Territory
        </option>

        <option value="city">
            City
        </option>

        <option value="army">
            Army
        </option>

    </select>
`;


if (editorPanel) {

    editorPanel.insertBefore(
        modeSection,
        editorPanel.children[1]
    );

}


const modeSelect =
    document.getElementById("editor-mode");


// ============================================================
// CITY CONTROLS
// ============================================================

const citySection =
    document.createElement("div");

citySection.className =
    "editor-section";


citySection.innerHTML = `
    <strong>City</strong>

    <p>
        Select City mode, then click a hex
        to place a city.
    </p>
`;


if (editorPanel) {

    editorPanel.appendChild(
        citySection
    );

}


// ============================================================
// ARMY CONTROLS
// ============================================================

const armySection =
    document.createElement("div");

armySection.className =
    "editor-section";


armySection.innerHTML = `
    <strong>Army</strong>

    <label>
        Icon path
    </label>

    <input
        id="army-icon-path"
        type="text"
        value="icons/armies/army.png"
        style="width: 100%; box-sizing: border-box;"
    >

    <p>
        Select Army mode, then click a hex
        to place an army.
    </p>
`;


if (editorPanel) {

    editorPanel.appendChild(
        armySection
    );

}


const armyIconInput =
    document.getElementById(
        "army-icon-path"
    );


// ============================================================
// DATA
// ============================================================

const cities = [];

const armies = [];


// ============================================================
// CITY IMAGE
// ============================================================

const cityImage =
    new Image();

cityImage.src =
    "icons/cities/city.png";


// ============================================================
// ARMY IMAGE CACHE
// ============================================================

const armyImages = {};


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


// ============================================================
// FRAME
// ============================================================

const FRAME_OVERHANG =
    HEX_SIZE * 0.5;

const FRAME_WIDTH = 7;

const FRAME_COLOR =
    "#252522";


// ============================================================
// MAP DIMENSIONS
// ============================================================

let MAP_WIDTH =
    COLS * HEX_WIDTH +
    HEX_WIDTH;

let MAP_HEIGHT =
    ROWS * HEX_VERTICAL_DISTANCE +
    HEX_SIZE;


function updateMapDimensions() {

    MAP_WIDTH =
        COLS * HEX_WIDTH +
        HEX_WIDTH;

    MAP_HEIGHT =
        ROWS * HEX_VERTICAL_DISTANCE +
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
            col * HEX_WIDTH +
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
        FRAME_OVERHANG * 2;


    const frameHeight =
        MAP_HEIGHT +
        FRAME_OVERHANG * 2;


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
// DRAW CITY
// ============================================================

function drawCity(
    city
) {

    const world =
        hexToWorld(
            city.col,
            city.row
        );


    const screen =
        worldToScreen(
            world.x,
            world.y
        );


    const size =
        18 *
        camera.zoom;


    if (
        cityImage.complete &&
        cityImage.naturalWidth > 0
    ) {

        ctx.drawImage(

            cityImage,

            screen.x - size / 2,

            screen.y - size / 2,

            size,

            size

        );

    }

}


// ============================================================
// DRAW ARMY
// ============================================================

function drawArmy(
    army
) {

    const world =
        hexToWorld(
            army.col,
            army.row
        );


    const screen =
        worldToScreen(
            world.x,
            world.y
        );


    const size =
        20 *
        camera.zoom;


    if (
        !armyImages[
            army.icon
        ]
    ) {

        const image =
            new Image();

        image.src =
            army.icon;

        armyImages[
            army.icon
        ] = image;

    }


    const image =
        armyImages[
            army.icon
        ];


    if (
        image.complete &&
        image.naturalWidth > 0
    ) {

        ctx.drawImage(

            image,

            screen.x - size / 2,

            screen.y - size / 2,

            size,

            size

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


    // ========================================================
    // ICONS
    // ========================================================
    //
    // Icons are drawn in screen space so their size remains
    // visually consistent while zooming.
    //

    for (
        const city of cities
    ) {

        drawCity(
            city
        );

    }


    for (
        const army of armies
    ) {

        drawArmy(
            army
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


    if (
        visibleWidth >= frameWidth
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


    if (
        visibleHeight >= frameHeight
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
// PLACE CITY
// ============================================================

function placeCity(
    tile
) {

    // Don't place duplicate cities.

    const existing =
        cities.find(
            city =>
                city.col === tile.col &&
                city.row === tile.row
        );


    if (existing) {

        return;

    }


    cities.push({

        id:
            `city_${Date.now()}`,

        name:
            "Unnamed City",

        col:
            tile.col,

        row:
            tile.row,

        owner:
            tile.owner

    });


    statusText.textContent =
        `Placed city at ${tile.col}, ${tile.row}`;


    draw();

}


// ============================================================
// PLACE ARMY
// ============================================================

function placeArmy(
    tile
) {

    const icon =
        armyIconInput
            ? armyIconInput.value.trim()
            : armyIconPath;


    if (!icon) {

        return;

    }


    armies.push({

        id:
            `army_${Date.now()}`,

        name:
            "Unnamed Army",

        col:
            tile.col,

        row:
            tile.row,

        owner:
            tile.owner,

        strength:
            0,

        icon:
            icon

    });


    statusText.textContent =
        `Placed army at ${tile.col}, ${tile.row}`;


    draw();

}


// ============================================================
// PAINT TERRITORY
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


    // ========================================================
    // CITY MODE
    // ========================================================

    if (
        editorMode === "city"
    ) {

        placeCity(
            tile
        );

        return;

    }


    // ========================================================
    // ARMY MODE
    // ========================================================

    if (
        editorMode === "army"
    ) {

        placeArmy(
            tile
        );

        return;

    }


    // ========================================================
    // TERRITORY MODE
    // ========================================================

    const selectedCountry =
        countrySelect.value;


    if (
        !countries[
            selectedCountry
        ]
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
// MOUSE STATE
// ============================================================

let painting = false;

let panning = false;

let wasDragging = false;

let lastX = 0;

let lastY = 0;


// ============================================================
// MOUSE DOWN
// ============================================================

canvas.addEventListener(
    "mousedown",
    (event) => {

        // ----------------------------------------------------
        // LEFT
        // ----------------------------------------------------

        if (
            event.button === 0
        ) {

            painting = true;

            wasDragging = false;

            lastX =
                event.clientX;

            lastY =
                event.clientY;


            paintTile(
                event
            );

            return;

        }


        // ----------------------------------------------------
        // RIGHT
        // ----------------------------------------------------

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


            // Only continuously paint territory.
            //
            // Cities and armies are single-click placement.

            if (
                editorMode === "territory"
            ) {

                paintTile(
                    event
                );

            }

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


            wasDragging = true;


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
// RIGHT CLICK
// ============================================================

canvas.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();

    }
);


// ============================================================
// MODE CHANGE
// ============================================================

if (modeSelect) {

    modeSelect.addEventListener(
        "change",
        () => {

            editorMode =
                modeSelect.value;


            statusText.textContent =
                `Mode: ${editorMode}`;

        }
    );

}


// ============================================================
// ARMY ICON CHANGE
// ============================================================

if (armyIconInput) {

    armyIconInput.addEventListener(
        "change",
        () => {

            armyIconPath =
                armyIconInput.value.trim();

        }
    );

}


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
// MAP JSON
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
// CITY JSON
// ============================================================

function createCitiesJSON() {

    return {

        cities:
            cities.map(
                city => ({

                    id:
                        city.id,

                    name:
                        city.name,

                    col:
                        city.col,

                    row:
                        city.row,

                    owner:
                        city.owner

                })
            )

    };

}


// ============================================================
// ARMY JSON
// ============================================================

function createArmiesJSON() {

    return {

        armies:
            armies.map(
                army => ({

                    id:
                        army.id,

                    name:
                        army.name,

                    col:
                        army.col,

                    row:
                        army.row,

                    owner:
                        army.owner,

                    strength:
                        army.strength,

                    icon:
                        army.icon

                })
            )

    };

}


// ============================================================
// DOWNLOAD JSON HELPER
// ============================================================

function downloadJSON(
    filename,
    data
) {

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
        filename;


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

}


// ============================================================
// SAVE
// ============================================================

function saveMap() {

    localStorage.setItem(

        "strategy_map_editor",

        JSON.stringify(
            createMapJSON()
        )

    );


    localStorage.setItem(

        "strategy_cities_editor",

        JSON.stringify(
            createCitiesJSON()
        )

    );


    localStorage.setItem(

        "strategy_armies_editor",

        JSON.stringify(
            createArmiesJSON()
        )

    );


    statusText.textContent =
        "Saved locally";

}


// ============================================================
// DOWNLOAD MAP
// ============================================================

function downloadMap() {

    downloadJSON(
        "map.json",
        createMapJSON()
    );


    statusText.textContent =
        "Downloaded map.json";

}


// ============================================================
// EXTRA DOWNLOAD BUTTONS
// ============================================================

const downloadCitiesButton =
    document.createElement("button");

downloadCitiesButton.textContent =
    "Download Cities JSON";


downloadCitiesButton.addEventListener(
    "click",
    () => {

        downloadJSON(
            "cities.json",
            createCitiesJSON()
        );


        statusText.textContent =
            "Downloaded cities.json";

    }
);


const downloadArmiesButton =
    document.createElement("button");

downloadArmiesButton.textContent =
    "Download Armies JSON";


downloadArmiesButton.addEventListener(
    "click",
    () => {

        downloadJSON(
            "armies.json",
            createArmiesJSON()
        );


        statusText.textContent =
            "Downloaded armies.json";

    }
);


if (editorPanel) {

    const downloadSection =
        document.createElement("div");

    downloadSection.className =
        "editor-section";


    downloadSection.appendChild(
        downloadCitiesButton
    );


    downloadSection.appendChild(
        downloadArmiesButton
    );


    editorPanel.appendChild(
        downloadSection
    );

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
        // LOAD TILES
        // ====================================================

        if (
            Array.isArray(
                data.tiles
            )
        ) {

            for (
                const savedTile of data.tiles
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


                tiles[
                    row * COLS +
                    col
                ].owner =
                    owner;

            }

        }


        // ====================================================
        // BUILD MAP
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
// LOAD CITIES
// ============================================================

async function loadCities() {

    try {

        const response =
            await fetch(
                "data/cities.json"
            );


        if (!response.ok) {

            return;

        }


        const data =
            await response.json();


        if (
            !Array.isArray(
                data.cities
            )
        ) {

            return;

        }


        cities.length = 0;


        for (
            const city of data.cities
        ) {

            if (
                !Number.isInteger(
                    Number(city.col)
                ) ||
                !Number.isInteger(
                    Number(city.row)
                )
            ) {

                continue;

            }


            cities.push({

                id:
                    city.id ||
                    `city_${Date.now()}`,

                name:
                    city.name ||
                    "Unnamed City",

                col:
                    Number(city.col),

                row:
                    Number(city.row),

                owner:
                    city.owner ||
                    "ocean"

            });

        }


        draw();

    }

    catch (error) {

        console.log(
            "No cities.json found."
        );

    }

}


// ============================================================
// LOAD ARMIES
// ============================================================

async function loadArmies() {

    try {

        const response =
            await fetch(
                "data/armies.json"
            );


        if (!response.ok) {

            return;

        }


        const data =
            await response.json();


        if (
            !Array.isArray(
                data.armies
            )
        ) {

            return;

        }


        armies.length = 0;


        for (
            const army of data.armies
        ) {

            if (
                !Number.isInteger(
                    Number(army.col)
                ) ||
                !Number.isInteger(
                    Number(army.row)
                )
            ) {

                continue;

            }


            armies.push({

                id:
                    army.id ||
                    `army_${Date.now()}`,

                name:
                    army.name ||
                    "Unnamed Army",

                col:
                    Number(army.col),

                row:
                    Number(army.row),

                owner:
                    army.owner ||
                    "ocean",

                strength:
                    Number(
                        army.strength || 0
                    ),

                icon:
                    army.icon ||
                    "icons/armies/army.png"

            });

        }


        draw();

    }

    catch (error) {

        console.log(
            "No armies.json found."
        );

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

loadCities();

loadArmies();
