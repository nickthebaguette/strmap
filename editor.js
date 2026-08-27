const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

const mapCanvas = document.createElement("canvas");
const mapCtx = mapCanvas.getContext("2d");


// ============================================================
// UI
// ============================================================

const layerSelect =
    document.getElementById("layer-select");

const territoryControls =
    document.getElementById("territory-controls");

const cityControls =
    document.getElementById("city-controls");

const armyControls =
    document.getElementById("army-controls");


const countrySelect =
    document.getElementById("country-select");

const cityNameInput =
    document.getElementById("city-name");

const armyNameInput =
    document.getElementById("army-name");

const armyCountrySelect =
    document.getElementById("army-country");

const armyStrengthInput =
    document.getElementById("army-strength");


const placeCityButton =
    document.getElementById("place-city-button");

const deleteCityButton =
    document.getElementById("delete-city-button");

const placeArmyButton =
    document.getElementById("place-army-button");

const deleteArmyButton =
    document.getElementById("delete-army-button");


const saveButton =
    document.getElementById("save-button");

const downloadMapButton =
    document.getElementById("download-map-button");

const downloadCitiesButton =
    document.getElementById("download-cities-button");

const downloadArmiesButton =
    document.getElementById("download-armies-button");


const statusText =
    document.getElementById("status");


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


let MAP_WIDTH = 0;
let MAP_HEIGHT = 0;


// ============================================================
// FRAME
// ============================================================

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
// CITIES / ARMIES
// ============================================================

let cities = [];
let armies = [];

let selectedCity = null;
let selectedArmy = null;

let placementMode = null;


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
// DRAW HEX
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
// REBUILD MAP CACHE
// ============================================================

function rebuildMapCanvas() {

    mapCanvas.width =
        Math.ceil(MAP_WIDTH);

    mapCanvas.height =
        Math.ceil(MAP_HEIGHT);


    mapCtx.clearRect(
        0,
        0,
        mapCanvas.width,
        mapCanvas.height
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

}


// ============================================================
// DRAW ICON
// ============================================================

const cityIcon =
    new Image();

cityIcon.src =
    "icons/cities/city.png";


const armyIcon =
    new Image();

armyIcon.src =
    "icons/armies/army.png";


let iconsLoaded = false;


function checkIconsLoaded() {

    if (
        cityIcon.complete &&
        armyIcon.complete
    ) {

        iconsLoaded = true;

        draw();

    }

}


cityIcon.onload =
    checkIconsLoaded;

armyIcon.onload =
    checkIconsLoaded;


// ============================================================
// DRAW OBJECTS
// ============================================================

function drawObjects() {

    // --------------------------------------------------------
    // CITIES
    // --------------------------------------------------------

    for (
        const city of cities
    ) {

        const world =
            hexToWorld(
                city.col,
                city.row
            );


        const iconSize = 18;


        if (
            cityIcon.complete
        ) {

            ctx.drawImage(

                cityIcon,

                world.x - iconSize / 2,

                world.y - iconSize / 2,

                iconSize,

                iconSize

            );

        }


        // Selection outline

        if (
            selectedCity === city
        ) {

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth =
                2 /
                camera.zoom;


            ctx.beginPath();

            ctx.arc(
                world.x,
                world.y,
                12,
                0,
                Math.PI * 2
            );

            ctx.stroke();

        }

    }


    // --------------------------------------------------------
    // ARMIES
    // --------------------------------------------------------

    for (
        const army of armies
    ) {

        const world =
            hexToWorld(
                army.col,
                army.row
            );


        const iconSize = 20;


        if (
            armyIcon.complete
        ) {

            ctx.drawImage(

                armyIcon,

                world.x - iconSize / 2,

                world.y - iconSize / 2,

                iconSize,

                iconSize

            );

        }


        // Selection outline

        if (
            selectedArmy === army
        ) {

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth =
                2 /
                camera.zoom;


            ctx.beginPath();

            ctx.arc(
                world.x,
                world.y,
                13,
                0,
                Math.PI * 2
            );

            ctx.stroke();

        }

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
    // FRAME
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // MAP
    // --------------------------------------------------------

    ctx.drawImage(
        mapCanvas,
        0,
        0
    );


    // --------------------------------------------------------
    // OBJECTS
    // --------------------------------------------------------

    drawObjects();


    // --------------------------------------------------------
    // FRAME BORDER
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


    const frameWidth =
        MAP_WIDTH +
        FRAME_OVERHANG * 2;

    const frameHeight =
        MAP_HEIGHT +
        FRAME_OVERHANG * 2;


    const minX =
        -FRAME_OVERHANG;

    const minY =
        -FRAME_OVERHANG;


    const maxX =
        Math.max(
            minX,
            frameWidth -
            visibleWidth -
            FRAME_OVERHANG
        );


    const maxY =
        Math.max(
            minY,
            frameHeight -
            visibleHeight -
            FRAME_OVERHANG
        );


    camera.x =
        Math.max(
            minX,
            Math.min(
                camera.x,
                maxX
            )
        );


    camera.y =
        Math.max(
            minY,
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
// SCREEN → WORLD
// ============================================================

function screenToWorld(
    screenX,
    screenY
) {

    return {

        x:
            screenX /
            camera.zoom +
            camera.x,

        y:
            screenY /
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


            const center =
                hexToWorld(
                    col,
                    row
                );


            const dx =
                worldX -
                center.x;


            const dy =
                worldY -
                center.y;


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
// FIND OBJECT
// ============================================================

function findCityAtTile(
    tile
) {

    return cities.find(
        city =>
            city.col === tile.col &&
            city.row === tile.row
    );

}


function findArmyAtTile(
    tile
) {

    return armies.find(
        army =>
            army.col === tile.col &&
            army.row === tile.row
    );

}


// ============================================================
// PAINT TILE
// ============================================================

function paintTile(event) {

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


    statusText.textContent =
        "Unsaved changes";


    rebuildMapCanvas();

    draw();

}


// ============================================================
// PLACE CITY
// ============================================================

function placeCity() {

    placementMode =
        "city";


    selectedCity =
        null;

    selectedArmy =
        null;


    statusText.textContent =
        "Click a hex to place the city.";

}


// ============================================================
// PLACE ARMY
// ============================================================

function placeArmy() {

    placementMode =
        "army";


    selectedCity =
        null;

    selectedArmy =
        null;


    statusText.textContent =
        "Click a hex to place the army.";

}


// ============================================================
// HANDLE OBJECT CLICK
// ============================================================

function handleObjectPlacement(
    tile
) {

    // --------------------------------------------------------
    // CITY
    // --------------------------------------------------------

    if (
        placementMode ===
        "city"
    ) {

        const name =
            cityNameInput.value.trim();


        if (!name) {

            statusText.textContent =
                "Enter a city name first.";

            return true;

        }


        const existing =
            findCityAtTile(
                tile
            );


        if (existing) {

            statusText.textContent =
                "There is already a city here.";

            return true;

        }


        const country =
            tile.owner;


        const city = {

            id:
                name
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        "_"
                    ),

            name:
                name,

            col:
                tile.col,

            row:
                tile.row,

            owner:
                country,

            type:
                "city"

        };


        cities.push(
            city
        );


        selectedCity =
            city;


        placementMode =
            null;


        statusText.textContent =
            `Placed ${name}.`;


        draw();


        return true;

    }


    // --------------------------------------------------------
    // ARMY
    // --------------------------------------------------------

    if (
        placementMode ===
        "army"
    ) {

        const name =
            armyNameInput.value.trim();


        if (!name) {

            statusText.textContent =
                "Enter an army name first.";

            return true;

        }


        const strength =
            Number(
                armyStrengthInput.value
            ) || 0;


        const existing =
            findArmyAtTile(
                tile
            );


        if (existing) {

            statusText.textContent =
                "There is already an army here.";

            return true;

        }


        const army = {

            id:
                name
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        "_"
                    ),

            name:
                name,

            col:
                tile.col,

            row:
                tile.row,

            owner:
                armyCountrySelect.value,

            strength:
                strength

        };


        armies.push(
            army
        );


        selectedArmy =
            army;


        placementMode =
            null;


        statusText.textContent =
            `Placed ${name}.`;


        draw();


        return true;

    }


    return false;

}


// ============================================================
// SELECT OBJECT
// ============================================================

function selectObject(
    tile
) {

    const city =
        findCityAtTile(
            tile
        );


    const army =
        findArmyAtTile(
            tile
        );


    if (city) {

        selectedCity =
            city;

        selectedArmy =
            null;


        cityNameInput.value =
            city.name;


        statusText.textContent =
            `Selected city: ${city.name}`;


        draw();


        return true;

    }


    if (army) {

        selectedArmy =
            army;

        selectedCity =
            null;


        armyNameInput.value =
            army.name;


        armyCountrySelect.value =
            army.owner;


        armyStrengthInput.value =
            army.strength;


        statusText.textContent =
            `Selected army: ${army.name}`;


        draw();


        return true;

    }


    return false;

}


// ============================================================
// DELETE CITY
// ============================================================

function deleteSelectedCity() {

    if (!selectedCity) {

        statusText.textContent =
            "No city selected.";

        return;

    }


    const name =
        selectedCity.name;


    cities =
        cities.filter(
            city =>
                city !==
                selectedCity
        );


    selectedCity =
        null;


    statusText.textContent =
        `Deleted ${name}.`;


    draw();

}


// ============================================================
// DELETE ARMY
// ============================================================

function deleteSelectedArmy() {

    if (!selectedArmy) {

        statusText.textContent =
            "No army selected.";

        return;

    }


    const name =
        selectedArmy.name;


    armies =
        armies.filter(
            army =>
                army !==
                selectedArmy
        );


    selectedArmy =
        null;


    statusText.textContent =
        `Deleted ${name}.`;


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

canvas.addEventListener(
    "mousedown",
    (event) => {

        // ----------------------------------------------------
        // LEFT
        // ----------------------------------------------------

        if (
            event.button === 0
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


            // Objects / placement take priority.

            if (
                layerSelect.value !==
                "territory"
            ) {

                if (
                    handleObjectPlacement(
                        tile
                    )
                ) {

                    return;

                }


                if (
                    selectObject(
                        tile
                    )
                ) {

                    return;

                }

            }


            // Territory painting.

            if (
                layerSelect.value ===
                "territory"
            ) {

                painting = true;

                paintTile(
                    event
                );

            }


            return;

        }


        // ----------------------------------------------------
        // RIGHT = PAN
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

        if (
            painting &&
            layerSelect.value ===
            "territory"
        ) {

            paintTile(
                event
            );

        }


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
// RIGHT CLICK MENU
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
// LAYER SWITCHING
// ============================================================

layerSelect.addEventListener(
    "change",
    () => {

        placementMode =
            null;

        selectedCity =
            null;

        selectedArmy =
            null;


        territoryControls.style.display =
            "none";

        cityControls.style.display =
            "none";

        armyControls.style.display =
            "none";


        if (
            layerSelect.value ===
            "territory"
        ) {

            territoryControls.style.display =
                "block";

        }


        if (
            layerSelect.value ===
            "cities"
        ) {

            cityControls.style.display =
                "block";

        }


        if (
            layerSelect.value ===
            "armies"
        ) {

            armyControls.style.display =
                "block";

        }


        draw();

    }
);


// ============================================================
// BUTTONS
// ============================================================

placeCityButton.addEventListener(
    "click",
    placeCity
);


deleteCityButton.addEventListener(
    "click",
    deleteSelectedCity
);


placeArmyButton.addEventListener(
    "click",
    placeArmy
);


deleteArmyButton.addEventListener(
    "click",
    deleteSelectedArmy
);


// ============================================================
// JSON
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


function createCitiesJSON() {

    return {

        cities:
            cities

    };

}


function createArmiesJSON() {

    return {

        armies:
            armies

    };

}


// ============================================================
// DOWNLOAD
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
// DOWNLOAD BUTTONS
// ============================================================

downloadMapButton.addEventListener(
    "click",
    () => {

        downloadJSON(
            createMapJSON(),
            "map.json"
        );


        statusText.textContent =
            "Downloaded map.json";

    }
);


downloadCitiesButton.addEventListener(
    "click",
    () => {

        downloadJSON(
            createCitiesJSON(),
            "cities.json"
        );


        statusText.textContent =
            "Downloaded cities.json";

    }
);


downloadArmiesButton.addEventListener(
    "click",
    () => {

        downloadJSON(
            createArmiesJSON(),
            "armies.json"
        );


        statusText.textContent =
            "Downloaded armies.json";

    }
);


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
        "Saved locally";

}


saveButton.addEventListener(
    "click",
    saveMap
);


// ============================================================
// LOAD MAP
// ============================================================

async function loadMap() {

    try {

        // ----------------------------------------------------
        // MAP
        // ----------------------------------------------------

        const mapResponse =
            await fetch(
                "data/map.json"
            );


        if (!mapResponse.ok) {

            throw new Error(
                "Could not load map.json"
            );

        }


        const mapData =
            await mapResponse.json();


        // ----------------------------------------------------
        // GRID SIZE
        // ----------------------------------------------------

        if (
            Number.isInteger(
                Number(
                    mapData.cols
                )
            )
        ) {

            COLS =
                Number(
                    mapData.cols
                );

        }


        if (
            Number.isInteger(
                Number(
                    mapData.rows
                )
            )
        ) {

            ROWS =
                Number(
                    mapData.rows
                );

        }


        calculateMapDimensions();

        createTiles();


        // ----------------------------------------------------
        // TILE DATA
        // ----------------------------------------------------

        if (
            Array.isArray(
                mapData.tiles
            )
        ) {

            for (
                const savedTile
                of mapData.tiles
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
        // CITIES
        // ----------------------------------------------------

        try {

            const cityResponse =
                await fetch(
                    "data/cities.json"
                );


            if (
                cityResponse.ok
            ) {

                const cityData =
                    await cityResponse.json();


                if (
                    Array.isArray(
                        cityData.cities
                    )
                ) {

                    cities =
                        cityData.cities;

                }

            }

        }

        catch (error) {

            console.warn(
                "Could not load cities.json",
                error
            );

        }


        // ----------------------------------------------------
        // ARMIES
        // ----------------------------------------------------

        try {

            const armyResponse =
                await fetch(
                    "data/armies.json"
                );


            if (
                armyResponse.ok
            ) {

                const armyData =
                    await armyResponse.json();


                if (
                    Array.isArray(
                        armyData.armies
                    )
                ) {

                    armies =
                        armyData.armies;

                }

            }

        }

        catch (error) {

            console.warn(
                "Could not load armies.json",
                error
            );

        }


        // ----------------------------------------------------
        // BUILD
        // ----------------------------------------------------

        rebuildMapCanvas();


        // Center map.

        camera.x =
            Math.max(
                0,
                (
                    MAP_WIDTH -
                    canvas.width /
                    camera.zoom
                ) / 2
            );


        camera.y =
            Math.max(
                0,
                (
                    MAP_HEIGHT -
                    canvas.height /
                    camera.zoom
                ) / 2
            );


        clampCamera();

        draw();


        statusText.textContent =
            `Loaded ${COLS} × ${ROWS} map | ${cities.length} cities | ${armies.length} armies`;


        console.log(
            `Editor loaded ${COLS} × ${ROWS}`
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


        statusText.textContent =
            "Failed to load map.json";

    }

}


// ============================================================
// START
// ============================================================

calculateMapDimensions();

createTiles();

resizeCanvas();

loadMap();
