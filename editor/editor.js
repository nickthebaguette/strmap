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

const editorModeSelect =
    document.getElementById("editor-mode");

const countryEditor =
    document.getElementById("country-editor");

const cityEditor =
    document.getElementById("city-editor");

const armyEditor =
    document.getElementById("army-editor");


// ============================================================
// CITY / ARMY FORM FIELDS
// ============================================================

const cityNameInput =
    document.getElementById("city-name");

const cityCountryInput =
    document.getElementById("city-country");

const armyNameInput =
    document.getElementById("army-name");

const armyCountryInput =
    document.getElementById("army-country");

const armyStrengthInput =
    document.getElementById("army-strength");

const armyIconInput =
    document.getElementById("army-icon");


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
// CITIES
// ============================================================

const cities = [];

let nextCityId = 1;


// City:
//
// {
//     id: 1,
//     name: "Paris",
//     country: "france",
//     col: 20,
//     row: 25
// }


// ============================================================
// ARMIES
// ============================================================

const armies = [];

let nextArmyId = 1;


// Army:
//
// {
//     id: 1,
//     name: "Army of the Rhine",
//     country: "france",
//     strength: 50000,
//     icon: "icons/armies/army.png",
//     col: 20,
//     row: 25
// }


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


    // EXACT same camera transform as main.js.

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
    // CITIES
    // ========================================================

    drawCities();


    // ========================================================
    // ARMIES
    // ========================================================

    drawArmies();


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
// CITY ICON
// ============================================================

const cityImage =
    new Image();

cityImage.src =
    "icons/cities/city.png";


// ============================================================
// DRAW CITIES
// ============================================================

function drawCities() {

    for (
        const city of cities
    ) {

        const world =
            hexToWorld(
                city.col,
                city.row
            );


        const size = 22;


        if (
            cityImage.complete &&
            cityImage.naturalWidth > 0
        ) {

            ctx.drawImage(

                cityImage,

                world.x - size / 2,

                world.y - size / 2,

                size,

                size

            );

        } else {

            ctx.beginPath();

            ctx.arc(
                world.x,
                world.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#d8c9a0";

            ctx.fill();

        }

    }

}


// ============================================================
// DRAW ARMIES
// ============================================================

function drawArmies() {

    for (
        const army of armies
    ) {

        const world =
            hexToWorld(
                army.col,
                army.row
            );


        const size = 22;


        if (
            army.iconImage &&
            army.iconImage.complete &&
            army.iconImage.naturalWidth > 0
        ) {

            ctx.drawImage(

                army.iconImage,

                world.x - size / 2,

                world.y - size / 2,

                size,

                size

            );

        } else {

            ctx.beginPath();

            ctx.arc(
                world.x,
                world.y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.fill();

        }

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


    // ========================================================
    // HORIZONTAL
    // ========================================================

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


    // ========================================================
    // VERTICAL
    // ========================================================

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
// EDITOR MODE
// ============================================================

let editorMode = "country";


function setEditorMode(
    mode
) {

    editorMode =
        mode;


    if (countryEditor) {

        countryEditor.style.display =
            "none";

    }


    if (cityEditor) {

        cityEditor.style.display =
            "none";

    }


    if (armyEditor) {

        armyEditor.style.display =
            "none";

    }


    if (
        mode === "country" &&
        countryEditor
    ) {

        countryEditor.style.display =
            "block";

    }


    if (
        mode === "city" &&
        cityEditor
    ) {

        cityEditor.style.display =
            "block";

    }


    if (
        mode === "army" &&
        armyEditor
    ) {

        armyEditor.style.display =
            "block";

    }

}


if (editorModeSelect) {

    editorModeSelect.addEventListener(
        "change",
        () => {

            setEditorMode(
                editorModeSelect.value
            );

        }
    );

}


// ============================================================
// CREATE CITY
// ============================================================

function createCity(tile) {

    if (!cityNameInput) {

        return;

    }


    const name =
        cityNameInput.value.trim();


    if (!name) {

        statusText.textContent =
            "Enter a city name first.";

        return;

    }


    const country =
        cityCountryInput
            ? cityCountryInput.value
            : tile.owner;


    // Remove existing city on this hex.

    for (
        let i = cities.length - 1;

        i >= 0;

        i--
    ) {

        if (
            cities[i].col === tile.col &&
            cities[i].row === tile.row
        ) {

            cities.splice(
                i,
                1
            );

        }

    }


    const city = {

        id:
            nextCityId++,

        name:
            name,

        country:
            country,

        col:
            tile.col,

        row:
            tile.row

    };


    cities.push(
        city
    );


    statusText.textContent =
        `Added city: ${name}`;


    draw();

}


// ============================================================
// CREATE ARMY
// ============================================================

function createArmy(tile) {

    if (!armyNameInput) {

        return;

    }


    const name =
        armyNameInput.value.trim();


    if (!name) {

        statusText.textContent =
            "Enter an army name first.";

        return;

    }


    const country =
        armyCountryInput
            ? armyCountryInput.value
            : tile.owner;


    const strength =
        armyStrengthInput
            ? Number(
                armyStrengthInput.value
            )
            : 0;


    const icon =
        armyIconInput
            ? armyIconInput.value.trim()
            : "icons/armies/army.png";


    const army = {

        id:
            nextArmyId++,

        name:
            name,

        country:
            country,

        strength:
            strength,

        icon:
            icon,

        col:
            tile.col,

        row:
            tile.row

    };


    army.iconImage =
        new Image();

    army.iconImage.src =
        icon;


    army.iconImage.onload =
        () => {

            draw();

        };


    armies.push(
        army
    );


    statusText.textContent =
        `Added army: ${name}`;


    draw();

}


// ============================================================
// COUNTRY PAINTING
// ============================================================

function paintCountry(tile) {

    if (!countrySelect) {

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
// LEFT CLICK EDITING
// ============================================================
//
// LEFT CLICK = EDIT
//
// RIGHT CLICK = PAN
//
// This intentionally matches the working editor behavior.
//

let mouseDownX = 0;
let mouseDownY = 0;
let mouseMoved = false;


canvas.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.button !== 0
        ) {

            return;

        }


        mouseDownX =
            event.clientX;

        mouseDownY =
            event.clientY;

        mouseMoved =
            false;

    }
);


canvas.addEventListener(
    "mousemove",
    (event) => {

        if (
            event.buttons !== 1
        ) {

            return;

        }


        const dx =
            event.clientX -
            mouseDownX;

        const dy =
            event.clientY -
            mouseDownY;


        if (
            Math.abs(dx) > 3 ||
            Math.abs(dy) > 3
        ) {

            mouseMoved =
                true;

        }

    }
);


canvas.addEventListener(
    "mouseup",
    (event) => {

        if (
            event.button !== 0
        ) {

            return;

        }


        if (
            mouseMoved
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


        // ----------------------------------------------------
        // COUNTRY
        // ----------------------------------------------------

        if (
            editorMode ===
            "country"
        ) {

            paintCountry(
                tile
            );

            return;

        }


        // ----------------------------------------------------
        // CITY
        // ----------------------------------------------------

        if (
            editorMode ===
            "city"
        ) {

            createCity(
                tile
            );

            return;

        }


        // ----------------------------------------------------
        // ARMY
        // ----------------------------------------------------

        if (
            editorMode ===
            "army"
        ) {

            createArmy(
                tile
            );

            return;

        }

    }
);


// ============================================================
// RIGHT CLICK = PAN
// ============================================================

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
// MAP JSON
// ============================================================

function createMapJSON() {

    return {

        cols:
            COLS,

        rows:
            ROWS,

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

                    country:
                        city.country,

                    col:
                        city.col,

                    row:
                        city.row

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

                    country:
                        army.country,

                    strength:
                        army.strength,

                    icon:
                        army.icon,

                    col:
                        army.col,

                    row:
                        army.row

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
// SAVE LOCALLY
// ============================================================

function saveMap() {

    localStorage.setItem(
        "strategy_map_editor_map",
        JSON.stringify(
            createMapJSON()
        )
    );


    localStorage.setItem(
        "strategy_map_editor_cities",
        JSON.stringify(
            createCitiesJSON()
        )
    );


    localStorage.setItem(
        "strategy_map_editor_armies",
        JSON.stringify(
            createArmiesJSON()
        )
    );


    statusText.textContent =
        "Saved locally.";

}


// ============================================================
// DOWNLOAD
// ============================================================
//
// One click downloads THREE independent files:
//
//     map.json
//     cities.json
//     armies.json
//
// ============================================================

function downloadMap() {

    downloadJSON(
        "map.json",
        createMapJSON()
    );


    downloadJSON(
        "cities.json",
        createCitiesJSON()
    );


    downloadJSON(
        "armies.json",
        createArmiesJSON()
    );


    statusText.textContent =
        "Downloaded map, cities and armies.";

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
                    !countries[
                        savedTile.owner
                    ]
                ) {

                    continue;

                }


                tiles[
                    row * COLS +
                    col
                ].owner =
                    savedTile.owner;

            }

        }


        rebuildMapCanvas();

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

            console.log(
                "No cities.json found."
            );

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
            const city
            of data.cities
        ) {

            const col =
                Number(
                    city.col
                );

            const row =
                Number(
                    city.row
                );


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


            cities.push({

                id:
                    Number(city.id),

                name:
                    city.name ||
                    "Unnamed City",

                country:
                    city.country ||
                    "ocean",

                col:
                    col,

                row:
                    row

            });

        }


        if (
            cities.length > 0
        ) {

            nextCityId =
                Math.max(
                    ...cities.map(
                        city =>
                            Number(city.id) || 0
                    )
                ) + 1;

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

            console.log(
                "No armies.json found."
            );

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
            const armyData
            of data.armies
        ) {

            const col =
                Number(
                    armyData.col
                );

            const row =
                Number(
                    armyData.row
                );


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


            const army = {

                id:
                    Number(
                        armyData.id
                    ),

                name:
                    armyData.name ||
                    "Unnamed Army",

                country:
                    armyData.country ||
                    "ocean",

                strength:
                    Number(
                        armyData.strength
                    ) || 0,

                icon:
                    armyData.icon ||
                    "icons/armies/army.png",

                col:
                    col,

                row:
                    row

            };


            army.iconImage =
                new Image();


            army.iconImage.src =
                army.icon;


            army.iconImage.onload =
                () => {

                    draw();

                };


            armies.push(
                army
            );

        }


        if (
            armies.length > 0
        ) {

            nextArmyId =
                Math.max(
                    ...armies.map(
                        army =>
                            Number(army.id) || 0
                    )
                ) + 1;

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

setEditorMode(
    "country"
);

loadMap();

loadCities();

loadArmies();
