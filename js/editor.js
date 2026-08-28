// ============================================================
// EDITOR.JS
// ============================================================
//
// Main controller for the map editor.
//
// Shared systems:
//
//     map.js
//     renderer.js
//     camera.js
//     cities.js
//     armies.js
//     terrain.js
//
// The editor itself only controls:
//
//     • tools
//     • user interaction
//     • editing
//     • exporting
//
// ============================================================


import {

    tiles,
    countries,
    applyMapData,
    getTileAt,
    createMapJSON

} from "./shared/map.js";


import {

    rebuildMapCanvas,
    draw

} from "./shared/renderer.js";


import {

    cities,
    loadCities,
    addCity,
    createCitiesJSON

} from "./shared/cities.js";


import {

    armies,
    loadArmies,
    createArmiesJSON

} from "./shared/armies.js";


import {
    
    loadTerrain,
    getTerrain,
    setTerrain,
    createTerrainJSON
    
} from "./shared/terrain.js";

import {

    camera,
    resizeCamera,
    zoomCamera,
    panCamera

} from "./shared/camera.js";


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById(
        "editorCanvas"
    );


const ctx =
    canvas.getContext(
        "2d"
    );


// ============================================================
// UI
// ============================================================

const status =
    document.getElementById(
        "status"
    );


const countrySelect =
    document.getElementById(
        "country-select"
    );


const terrainSelect =
    document.getElementById(
        "terrain-select"
    );


const cityName =
    document.getElementById(
        "city-name"
    );


const cityCountry =
    document.getElementById(
        "city-country"
    );


const armyName =
    document.getElementById(
        "army-name"
    );


const armyCountry =
    document.getElementById(
        "army-country"
    );


const armyStrength =
    document.getElementById(
        "army-strength"
    );


const armyIcon =
    document.getElementById(
        "army-icon"
    );


const selectedTile =
    document.getElementById(
        "selected-tile"
    );


const selectedTerritory =
    document.getElementById(
        "selected-territory"
    );


const selectedTerrain =
    document.getElementById(
        "selected-terrain"
    );


const selectedEntity =
    document.getElementById(
        "selected-entity"
    );


// ============================================================
// TOOL STATE
// ============================================================

let currentTool =
    "select";


let selectedTileObject =
    null;


let selectedCity =
    null;


let selectedArmy =
    null;


// ============================================================
// INITIALIZATION
// ============================================================

async function startEditor() {

    status.textContent =
        "Loading map...";


    resizeCamera(
        canvas
    );


    // --------------------------------------------------------
    // LOAD MAP
    // --------------------------------------------------------

    try {

        const response =
            await fetch(
                "data/map.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        applyMapData(
            data
        );

    }

    catch (
        error
    ) {

        console.error(
            "Could not load map.json:",
            error
        );


        status.textContent =
            "Failed to load map.";

        return;

    }


    // --------------------------------------------------------
    // LOAD OTHER DATA
    // --------------------------------------------------------

    await loadTerrain();

    await loadCities();

    await loadArmies();


    // --------------------------------------------------------
    // CREATE COUNTRY LISTS
    // --------------------------------------------------------

    populateCountrySelect(
        countrySelect,
        true
    );


    populateCountrySelect(
        cityCountry,
        false
    );


    populateCountrySelect(
        armyCountry,
        false
    );


    // --------------------------------------------------------
    // BUILD MAP
    // --------------------------------------------------------

    rebuildMapCanvas();


    updateSelectionDisplay();


    status.textContent =
        `Map loaded: ${tiles.length} tiles`;


    requestAnimationFrame(
        render
    );

}


// ============================================================
// RENDER LOOP
// ============================================================

function render() {

    draw(
        ctx,
        canvas
    );


    requestAnimationFrame(
        render
    );

}


// ============================================================
// COUNTRY SELECT
// ============================================================

function populateCountrySelect(
    select,
    includeOcean
) {

    select.innerHTML =
        "";


    for (
        const [
            id,
            country
        ]
        of Object.entries(
            countries
        )
    ) {

        if (
            !includeOcean &&
            id === "ocean"
        ) {

            continue;

        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            id;

        option.textContent =
            country.name;


        select.appendChild(
            option
        );

    }

}


// ============================================================
// TOOL BUTTONS
// ============================================================

const toolButtons = {

    select:
        document.getElementById(
            "tool-select"
        ),

    territory:
        document.getElementById(
            "tool-territory"
        ),

    terrain:
        document.getElementById(
            "tool-terrain"
        ),

    city:
        document.getElementById(
            "tool-city"
        ),

    army:
        document.getElementById(
            "tool-army"
        )

};


for (
    const [
        tool,
        button
    ]
    of Object.entries(
        toolButtons
    )
) {

    button.addEventListener(
        "click",
        () => {

            setTool(
                tool
            );

        }
    );

}


// ============================================================
// SET TOOL
// ============================================================

function setTool(
    tool
) {

    currentTool =
        tool;


    for (
        const [
            name,
            button
        ]
        of Object.entries(
            toolButtons
        )
    ) {

        button.classList.toggle(
            "active",
            name === tool
        );

    }


    if (
        tool === "select"
    ) {

        canvas.style.cursor =
            "default";

    }

    else {

        canvas.style.cursor =
            "crosshair";

    }


    status.textContent =
        `Tool: ${tool}`;

}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        resizeCamera(
            canvas
        );

    }
);


// ============================================================
// MOUSE → WORLD
// ============================================================

function mouseToWorld(
    event
) {

    const rect =
        canvas.getBoundingClientRect();


    return {

        x:
            (
                event.clientX -
                rect.left
            ) /
            camera.zoom +
            camera.x,

        y:
            (
                event.clientY -
                rect.top
            ) /
            camera.zoom +
            camera.y

    };

}


// ============================================================
// FIND CITY
// ============================================================

function getCityAtTile(
    tile
) {

    if (
        !tile
    ) {

        return null;

    }


    return cities.find(
        city =>
            city.col === tile.col &&
            city.row === tile.row
    ) || null;

}


// ============================================================
// FIND ARMY
// ============================================================

function getArmyAtTile(
    tile
) {

    if (
        !tile
    ) {

        return null;

    }


    return armies.find(
        army =>
            army.col === tile.col &&
            army.row === tile.row
    ) || null;

}


// ============================================================
// SELECT TILE
// ============================================================

function selectTile(
    tile
) {

    selectedTileObject =
        tile;


    selectedCity =
        getCityAtTile(
            tile
        );


    selectedArmy =
        getArmyAtTile(
            tile
        );


    updateSelectionDisplay();

}


// ============================================================
// SELECTION DISPLAY
// ============================================================

function updateSelectionDisplay() {

    if (
        !selectedTileObject
    ) {

        selectedTile.textContent =
            "None";

        selectedTerritory.textContent =
            "Territory: None";

        selectedTerrain.textContent =
            "Terrain: None";

        selectedEntity.textContent =
            "Entity: None";

        return;

    }


    const tile =
        selectedTileObject;


    const country =
        countries[
            tile.owner
        ];


    selectedTile.textContent =
        `Position: ${tile.col}, ${tile.row}`;


    selectedTerritory.textContent =
        `Territory: ${
            country
                ? country.name
                : tile.owner
        }`;


    selectedTerrain.textContent =
        `Terrain: ${
            getTerrain(tile)
        }`;


    if (
        selectedCity
    ) {

        selectedEntity.textContent =
            `City: ${selectedCity.name}`;

    }

    else if (
        selectedArmy
    ) {

        selectedEntity.textContent =
            `Army: ${selectedArmy.name}`;

    }

    else {

        selectedEntity.textContent =
            "Entity: None";

    }

}


// ============================================================
// APPLY TERRITORY
// ============================================================

function paintTerritory(
    tile
) {

    if (
        !tile
    ) {

        return;

    }


    const owner =
        countrySelect.value;


    if (
        !countries[owner]
    ) {

        return;

    }


    tile.owner =
        owner;


    rebuildMapCanvas();


    selectTile(
        tile
    );

}


// ============================================================
// APPLY TERRAIN
// ============================================================

function paintTerrain(
    tile
) {

    if (
        !tile
    ) {

        return;

    }


    const terrain =
        terrainSelect.value;


    if (
        tile.owner === "ocean"
    ) {

        status.textContent =
            "Ocean tiles automatically use water terrain.";

        return;

    }


    const changed =
        setTerrain(
            tile,
            terrain
        );


    if (
        !changed
    ) {

        return;

    }


    rebuildMapCanvas();


    selectTile(
        tile
    );

}


// ============================================================
// PLACE CITY
// ============================================================

function placeCity(
    tile
) {

    if (
        !tile
    ) {

        return;

    }


    const name =
        cityName.value.trim();


    if (
        !name
    ) {

        status.textContent =
            "Enter a city name first.";

        return;

    }


    const country =
        cityCountry.value;


    const existing =
        getCityAtTile(
            tile
        );


    // --------------------------------------------------------
    // UPDATE EXISTING
    // --------------------------------------------------------

    if (
        existing
    ) {

        existing.name =
            name;

        existing.country =
            country;


        selectedCity =
            existing;


        status.textContent =
            `Updated city: ${name}`;

    }

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    else {

        const city =
            addCity(
                name,
                country,
                tile.col,
                tile.row
            );


        selectedCity =
            city;


        status.textContent =
            `Placed city: ${name}`;

    }


    rebuildMapCanvas();


    selectTile(
        tile
    );

}


// ============================================================
// DELETE CITY
// ============================================================

function deleteCity() {

    if (
        !selectedCity
    ) {

        status.textContent =
            "No city selected.";

        return;

    }


    const index =
        cities.indexOf(
            selectedCity
        );


    if (
        index !== -1
    ) {

        const name =
            selectedCity.name;


        cities.splice(
            index,
            1
        );


        selectedCity =
            null;


        status.textContent =
            `Deleted city: ${name}`;


        rebuildMapCanvas();


        updateSelectionDisplay();

    }

}


// ============================================================
// PLACE ARMY
// ============================================================

function placeArmy(
    tile
) {

    if (
        !tile
    ) {

        return;

    }


    const name =
        armyName.value.trim();


    if (
        !name
    ) {

        status.textContent =
            "Enter an army name first.";

        return;

    }


    const country =
        armyCountry.value;


    const strength =
        Number(
            armyStrength.value
        ) || 0;


    const icon =
        armyIcon.value.trim() ||
        "icons/armies/army.png";


    const existing =
        getArmyAtTile(
            tile
        );


    // --------------------------------------------------------
    // UPDATE EXISTING
    // --------------------------------------------------------

    if (
        existing
    ) {

        existing.name =
            name;

        existing.country =
            country;

        existing.strength =
            strength;

        existing.icon =
            icon;


        selectedArmy =
            existing;


        status.textContent =
            `Updated army: ${name}`;

    }

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    else {

        const nextId =
            armies.reduce(
                (
                    maximum,
                    army
                ) =>
                    Math.max(
                        maximum,
                        Number(
                            army.id
                        ) || 0
                    ),
                0
            ) + 1;


        const army = {

            id:
                nextId,

            name,

            country,

            strength,

            icon,

            col:
                tile.col,

            row:
                tile.row

        };


        armies.push(
            army
        );


        selectedArmy =
            army;


        status.textContent =
            `Placed army: ${name}`;

    }


    rebuildMapCanvas();


    selectTile(
        tile
    );

}


// ============================================================
// DELETE ARMY
// ============================================================

function deleteArmy() {

    if (
        !selectedArmy
    ) {

        status.textContent =
            "No army selected.";

        return;

    }


    const index =
        armies.indexOf(
            selectedArmy
        );


    if (
        index !== -1
    ) {

        const name =
            selectedArmy.name;


        armies.splice(
            index,
            1
        );


        selectedArmy =
            null;


        status.textContent =
            `Deleted army: ${name}`;


        rebuildMapCanvas();


        updateSelectionDisplay();

    }

}


// ============================================================
// CITY BUTTON
// ============================================================

document
    .getElementById(
        "city-place"
    )
    .addEventListener(
        "click",
        () => {

            if (
                !selectedTileObject
            ) {

                status.textContent =
                    "Select a tile first.";

                return;

            }


            placeCity(
                selectedTileObject
            );

        }
    );


document
    .getElementById(
        "city-delete"
    )
    .addEventListener(
        "click",
        deleteCity
    );


// ============================================================
// ARMY BUTTON
// ============================================================

document
    .getElementById(
        "army-place"
    )
    .addEventListener(
        "click",
        () => {

            if (
                !selectedTileObject
            ) {

                status.textContent =
                    "Select a tile first.";

                return;

            }


            placeArmy(
                selectedTileObject
            );

        }
    );


document
    .getElementById(
        "army-delete"
    )
    .addEventListener(
        "click",
        deleteArmy
    );


// ============================================================
// LEFT CLICK
// ============================================================

canvas.addEventListener(
    "click",
    event => {

        const world =
            mouseToWorld(
                event
            );


        const tile =
            getTileAt(
                world.x,
                world.y
            );


        if (
            !tile
        ) {

            return;

        }


        // ----------------------------------------------------
        // SELECT
        // ----------------------------------------------------

        if (
            currentTool === "select"
        ) {

            selectTile(
                tile
            );


            const country =
                countries[
                    tile.owner
                ];


            status.textContent =
                country
                    ? `${country.name} — ${tile.col}, ${tile.row}`
                    : `Tile ${tile.col}, ${tile.row}`;


            return;

        }


        // ----------------------------------------------------
        // TERRITORY
        // ----------------------------------------------------

        if (
            currentTool === "territory"
        ) {

            paintTerritory(
                tile
            );

            return;

        }


        // ----------------------------------------------------
        // TERRAIN
        // ----------------------------------------------------

        if (
            currentTool === "terrain"
        ) {

            paintTerrain(
                tile
            );

            return;

        }


        // ----------------------------------------------------
        // CITY
        // ----------------------------------------------------

        if (
            currentTool === "city"
        ) {

            selectTile(
                tile
            );


            status.textContent =
                `City position selected: ${tile.col}, ${tile.row}`;

            return;

        }


        // ----------------------------------------------------
        // ARMY
        // ----------------------------------------------------

        if (
            currentTool === "army"
        ) {

            selectTile(
                tile
            );


            status.textContent =
                `Army position selected: ${tile.col}, ${tile.row}`;

        }

    }
);


// ============================================================
// PAN
// ============================================================
//
// Select mode follows the exact same camera behaviour as
// main.js.
//
// In editing modes, clicking is reserved for editing.
//
// Hold SPACE + left mouse to pan while editing.
//
// ============================================================

let dragging =
    false;

let wasDragging =
    false;

let lastX =
    0;

let lastY =
    0;


canvas.addEventListener(
    "mousedown",
    event => {

        // ----------------------------------------------------
        // Normal camera dragging in SELECT mode
        // ----------------------------------------------------

        const canPan =
            currentTool === "select" ||
            event.shiftKey ||
            event.code === "Space";


        if (
            event.button !== 0 ||
            !canPan
        ) {

            return;

        }


        dragging =
            true;

        wasDragging =
            false;


        lastX =
            event.clientX;

        lastY =
            event.clientY;

    }
);


canvas.addEventListener(
    "mousemove",
    event => {

        if (
            !dragging
        ) {

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

            wasDragging =
                true;

        }


        panCamera(
            canvas,
            dx,
            dy
        );


        lastX =
            event.clientX;

        lastY =
            event.clientY;

    }
);


window.addEventListener(
    "mouseup",
    () => {

        dragging =
            false;

    }
);


window.addEventListener(
    "blur",
    () => {

        dragging =
            false;

    }
);


// ============================================================
// ZOOM
// ============================================================

canvas.addEventListener(
    "wheel",
    event => {

        event.preventDefault();


        zoomCamera(
            canvas,
            event
        );

    },
    {
        passive: false
    }
);


// ============================================================
// DOWNLOAD
// ============================================================

function downloadJSON(
    filename,
    data
) {

    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [
                json
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


    link.remove();


    URL.revokeObjectURL(
        url
    );


    status.textContent =
        `Downloaded ${filename}`;

}


// ------------------------------------------------------------
// MAP
// ------------------------------------------------------------

document
    .getElementById(
        "download-map"
    )
    .addEventListener(
        "click",
        () => {

            downloadJSON(
                "map.json",
                createMapJSON()
            );

        }
    );


// ------------------------------------------------------------
// TERRAIN
// ------------------------------------------------------------

document
    .getElementById(
        "download-terrain"
    )
    .addEventListener(
        "click",
        () => {

            downloadJSON(
                "terrain.json",
                createTerrainJSON()
            );

        }
    );

// ------------------------------------------------------------
// CITIES
// ------------------------------------------------------------

document
    .getElementById(
        "download-cities"
    )
    .addEventListener(
        "click",
        () => {

            downloadJSON(
                "cities.json",
                createCitiesJSON()
            );

        }
    );


// ------------------------------------------------------------
// ARMIES
// ------------------------------------------------------------

document
    .getElementById(
        "download-armies"
    )
    .addEventListener(
        "click",
        () => {

            downloadJSON(
                "armies.json",
                createArmiesJSON()
            );

        }
    );


// ============================================================
// START
// ============================================================

startEditor();
