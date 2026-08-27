const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const mapCanvas = document.createElement("canvas");
const mapCtx = mapCanvas.getContext("2d");


// ============================================================
// UI
// ============================================================

const editorMode =
    document.getElementById("editor-mode");

const countrySelect =
    document.getElementById("country-select");

const saveButton =
    document.getElementById("save-button");

const downloadButton =
    document.getElementById("download-button");

const downloadCitiesButton =
    document.getElementById("download-cities-button");

const downloadArmiesButton =
    document.getElementById("download-armies-button");

const statusText =
    document.getElementById("status");


// City UI

const cityEditor =
    document.getElementById("city-editor");

const territoryEditor =
    document.getElementById("territory-editor");

const armyEditor =
    document.getElementById("army-editor");

const cityName =
    document.getElementById("city-name");

const cityCountry =
    document.getElementById("city-country");

const placeCityButton =
    document.getElementById("place-city-button");

const deleteCityButton =
    document.getElementById("delete-city-button");


// Army UI

const armyName =
    document.getElementById("army-name");

const armyCountry =
    document.getElementById("army-country");

const armyStrength =
    document.getElementById("army-strength");

const armyCommander =
    document.getElementById("army-commander");

const placeArmyButton =
    document.getElementById("place-army-button");

const deleteArmyButton =
    document.getElementById("delete-army-button");


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

let cities = [];


// ============================================================
// ARMIES
// ============================================================

let armies = [];


// ============================================================
// SELECTED TILE
// ============================================================

let selectedTile = null;


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
// DRAW CITY ICON
// ============================================================

function drawCity(
    city
) {

    const world =
        hexToWorld(
            city.col,
            city.row
        );


    ctx.save();


    ctx.translate(
        world.x,
        world.y
    );


    // Simple placeholder city marker.
    // We can replace this with city.png later.

    const size = 8;


    ctx.fillStyle =
        "#f1df9a";


    ctx.strokeStyle =
        "#252522";


    ctx.lineWidth =
        2;


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        size,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();


    ctx.restore();

}


// ============================================================
// DRAW ARMY ICON
// ============================================================

function drawArmy(
    army
) {

    const world =
        hexToWorld(
            army.col,
            army.row
        );


    ctx.save();


    ctx.translate(
        world.x,
        world.y
    );


    // Simple placeholder army marker.
    // We will replace this with the actual army
    // icon from icons/armies later.

    const size = 9;


    ctx.fillStyle =
        "#e8e8e8";


    ctx.strokeStyle =
        "#252522";


    ctx.lineWidth =
        2;


    ctx.beginPath();

    ctx.rect(
        -size,
        -size,
        size * 2,
        size * 2
    );

    ctx.fill();

    ctx.stroke();


    ctx.restore();

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

    for (
        const city of cities
    ) {

        drawCity(city);

    }


    // ========================================================
    // ARMIES
    // ========================================================

    for (
        const army of armies
    ) {

        drawArmy(army);

    }


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
// MODE SWITCHING
// ============================================================

function updateEditorMode() {

    const mode =
        editorMode.value;


    territoryEditor.style.display =
        mode === "territory"
            ? "block"
            : "none";


    cityEditor.style.display =
        mode === "city"
            ? "block"
            : "none";


    armyEditor.style.display =
        mode === "army"
            ? "block"
            : "none";


    selectedTile = null;

}


editorMode.addEventListener(
    "change",
    updateEditorMode
);


// ============================================================
// FIND CITY
// ============================================================

function getCityAtTile(
    tile
) {

    return cities.find(
        city =>
            city.col === tile.col &&
            city.row === tile.row
    );

}


// ============================================================
// FIND ARMY
// ============================================================

function getArmyAtTile(
    tile
) {

    return armies.find(
        army =>
            army.col === tile.col &&
            army.row === tile.row
    );

}


// ============================================================
// LOAD CITY INTO EDITOR
// ============================================================

function loadCityIntoEditor(
    city
) {

    if (!city) {

        cityName.value =
            "";

        return;

    }


    cityName.value =
        city.name || "";


    cityCountry.value =
        city.country || "france";

}


// ============================================================
// LOAD ARMY INTO EDITOR
// ============================================================

function loadArmyIntoEditor(
    army
) {

    if (!army) {

        armyName.value =
            "";

        armyStrength.value =
            10000;

        armyCommander.value =
            "";

        return;

    }


    armyName.value =
        army.name || "";


    armyCountry.value =
        army.country || "france";


    armyStrength.value =
        army.strength ?? 10000;


    armyCommander.value =
        army.commander || "";

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


        selectedTile =
            tile;


        const mode =
            editorMode.value;


        // ====================================================
        // TERRITORY
        // ====================================================

        if (
            mode === "territory"
        ) {

            tile.owner =
                countrySelect.value;


            statusText.textContent =
                `Changed tile ${tile.col}, ${tile.row}`;


            rebuildMapCanvas();

            draw();

            return;

        }


        // ====================================================
        // CITY
        // ====================================================

        if (
            mode === "city"
        ) {

            const city =
                getCityAtTile(
                    tile
                );


            loadCityIntoEditor(
                city
            );


            statusText.textContent =
                city
                    ? `Editing ${city.name}`
                    : `Ready to place city on ${tile.col}, ${tile.row}`;

            return;

        }


        // ====================================================
        // ARMY
        // ====================================================

        if (
            mode === "army"
        ) {

            const army =
                getArmyAtTile(
                    tile
                );


            loadArmyIntoEditor(
                army
            );


            statusText.textContent =
                army
                    ? `Editing ${army.name}`
                    : `Ready to place army on ${tile.col}, ${tile.row}`;

        }

    }
);


// ============================================================
// PLACE CITY
// ============================================================

placeCityButton.addEventListener(
    "click",
    () => {

        if (!selectedTile) {

            statusText.textContent =
                "Select a hex first.";

            return;

        }


        const name =
            cityName.value.trim();


        if (!name) {

            statusText.textContent =
                "Enter a city name.";

            return;

        }


        const existing =
            getCityAtTile(
                selectedTile
            );


        if (existing) {

            existing.name =
                name;

            existing.country =
                cityCountry.value;

        } else {

            cities.push({

                col:
                    selectedTile.col,

                row:
                    selectedTile.row,

                name:
                    name,

                country:
                    cityCountry.value

            });

        }


        statusText.textContent =
            `City "${name}" placed.`;


        draw();

    }
);


// ============================================================
// DELETE CITY
// ============================================================

deleteCityButton.addEventListener(
    "click",
    () => {

        if (!selectedTile) {

            statusText.textContent =
                "Select a city first.";

            return;

        }


        const index =
            cities.findIndex(
                city =>
                    city.col === selectedTile.col &&
                    city.row === selectedTile.row
            );


        if (index === -1) {

            statusText.textContent =
                "No city on this tile.";

            return;

        }


        const removed =
            cities[index];


        cities.splice(
            index,
            1
        );


        cityName.value =
            "";


        statusText.textContent =
            `Deleted ${removed.name}.`;


        draw();

    }
);


// ============================================================
// PLACE ARMY
// ============================================================

placeArmyButton.addEventListener(
    "click",
    () => {

        if (!selectedTile) {

            statusText.textContent =
                "Select a hex first.";

            return;

        }


        const name =
            armyName.value.trim();


        if (!name) {

            statusText.textContent =
                "Enter an army name.";

            return;

        }


        const strength =
            Number(
                armyStrength.value
            );


        const existing =
            getArmyAtTile(
                selectedTile
            );


        if (existing) {

            existing.name =
                name;

            existing.country =
                armyCountry.value;

            existing.strength =
                strength;

            existing.commander =
                armyCommander.value.trim();

        } else {

            armies.push({

                col:
                    selectedTile.col,

                row:
                    selectedTile.row,

                name:
                    name,

                country:
                    armyCountry.value,

                strength:
                    strength,

                commander:
                    armyCommander.value.trim()

            });

        }


        statusText.textContent =
            `Army "${name}" placed.`;


        draw();

    }
);


// ============================================================
// DELETE ARMY
// ============================================================

deleteArmyButton.addEventListener(
    "click",
    () => {

        if (!selectedTile) {

            statusText.textContent =
                "Select an army first.";

            return;

        }


        const index =
            armies.findIndex(
                army =>
                    army.col === selectedTile.col &&
                    army.row === selectedTile.row
            );


        if (index === -1) {

            statusText.textContent =
                "No army on this tile.";

            return;

        }


        const removed =
            armies[index];


        armies.splice(
            index,
            1
        );


        loadArmyIntoEditor(
            null
        );


        statusText.textContent =
            `Deleted ${removed.name}.`;


        draw();

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
// CREATE CITIES JSON
// ============================================================

function createCitiesJSON() {

    return {

        cities:
            cities.map(
                city => ({

                    col:
                        city.col,

                    row:
                        city.row,

                    name:
                        city.name,

                    country:
                        city.country

                })
            )

    };

}


// ============================================================
// CREATE ARMIES JSON
// ============================================================

function createArmiesJSON() {

    return {

        armies:
            armies.map(
                army => ({

                    col:
                        army.col,

                    row:
                        army.row,

                    name:
                        army.name,

                    country:
                        army.country,

                    strength:
                        army.strength,

                    commander:
                        army.commander

                })
            )

    };

}


// ============================================================
// DOWNLOAD FILE
// ============================================================

function downloadJSON(
    data,
    filename
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
        "Saved map, cities and armies locally.";

}


// ============================================================
// DOWNLOAD MAP
// ============================================================

function downloadMap() {

    downloadJSON(
        createMapJSON(),
        "map.json"
    );


    statusText.textContent =
        "Downloaded map.json";

}


// ============================================================
// DOWNLOAD CITIES
// ============================================================

function downloadCities() {

    downloadJSON(
        createCitiesJSON(),
        "cities.json"
    );


    statusText.textContent =
        "Downloaded cities.json";

}


// ============================================================
// DOWNLOAD ARMIES
// ============================================================

function downloadArmies() {

    downloadJSON(
        createArmiesJSON(),
        "armies.json"
    );


    statusText.textContent =
        "Downloaded armies.json";

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


if (downloadCitiesButton) {

    downloadCitiesButton.addEventListener(
        "click",
        downloadCities
    );

}


if (downloadArmiesButton) {

    downloadArmiesButton.addEventListener(
        "click",
        downloadArmies
    );

}


// ============================================================
// LOAD JSON
// ============================================================

async function loadJSON(
    path
) {

    const response =
        await fetch(
            path
        );


    if (!response.ok) {

        throw new Error(
            `Could not load ${path}`
        );

    }


    return await response.json();

}


// ============================================================
// LOAD MAP
// ============================================================

async function loadMap() {

    try {

        const data =
            await loadJSON(
                "data/map.json"
            );


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
                    row * COLS + col
                ].owner =
                    owner;

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
            `Map loaded: ${COLS} × ${ROWS}`;

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

        const data =
            await loadJSON(
                "data/cities.json"
            );


        if (
            Array.isArray(
                data.cities
            )
        ) {

            cities =
                data.cities;

        }


        console.log(
            `Loaded ${cities.length} cities.`
        );

        draw();

    }

    catch (error) {

        console.warn(
            "No cities.json found yet."
        );

        cities = [];

    }

}


// ============================================================
// LOAD ARMIES
// ============================================================

async function loadArmies() {

    try {

        const data =
            await loadJSON(
                "data/armies.json"
            );


        if (
            Array.isArray(
                data.armies
            )
        ) {

            armies =
                data.armies;

        }


        console.log(
            `Loaded ${armies.length} armies.`
        );

        draw();

    }

    catch (error) {

        console.warn(
            "No armies.json found yet."
        );

        armies = [];

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
