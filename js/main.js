// ============================================================
// MAIN.JS
// ============================================================

import {
    createTiles,
    applyMapData,
    getTileAt,
    countries
} from "./shared/map.js";

import {
    camera,
    resizeCamera,
    panCamera,
    zoomCamera
} from "./shared/camera.js";

import {
    cities
} from "./shared/cities.js";

import {
    armies,
    loadArmies,
    getSoldierIconCount
} from "./shared/armies.js";

import {
    loadCities
} from "./shared/cities.js";

import {
    rebuildMapCanvas,
    draw
} from "./shared/renderer.js";

import {
    setCountryFlag
} from "./shared/countryFlags.js";


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("map");

const ctx =
    canvas.getContext("2d");


// ============================================================
// TERRITORY PANEL
// ============================================================

const territoryName =
    document.getElementById(
        "territory-name"
    );

const territoryOwner =
    document.getElementById(
        "territory-owner"
    );

const territoryFlag =
    document.getElementById(
        "territory-flag"
    );

const territoryManpower =
    document.getElementById(
        "territory-manpower"
    );

const manpowerIcons =
    document.getElementById(
        "manpower-icons"
    );

const territoryArmy =
    document.getElementById(
        "territory-army"
    );

const armyNameDisplay =
    document.getElementById(
        "army-name-display"
    );

const armyStrengthDisplay =
    document.getElementById(
        "army-strength-display"
    );


// ============================================================
// INITIALIZE
// ============================================================

async function start() {

    createTiles();

    resizeCamera(canvas);

    rebuildMapCanvas();

    draw(ctx, canvas);


    // --------------------------------------------------------
    // LOAD MAP
    // --------------------------------------------------------

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


        applyMapData(data);


        rebuildMapCanvas();


        resizeCamera(canvas);

        draw(ctx, canvas);


        console.log(
            `Map loaded successfully: ${data.cols} × ${data.rows}`
        );

    }

    catch (error) {

        console.error(
            "Failed to load map:",
            error
        );

    }


    // --------------------------------------------------------
    // LOAD CITIES
    // --------------------------------------------------------

    await loadCities();


    // --------------------------------------------------------
    // LOAD ARMIES
    // --------------------------------------------------------

    await loadArmies();


    draw(ctx, canvas);

}


// ============================================================
// UPDATE MANPOWER DISPLAY
// ============================================================
//
// Updates the soldier silhouette icons based on army strength.
//
// ============================================================

function updateManpowerDisplay(
    army
) {

    const filledCount =
        getSoldierIconCount(
            army.strength
        );


    const soldierIcons =
        manpowerIcons.querySelectorAll(
            ".soldier-icon"
        );


    soldierIcons.forEach(
        (
            icon,
            index
        ) => {

            const isFilled =
                index < filledCount;


            icon.classList.toggle(
                "filled",
                isFilled
            );


            // ------------------------------------------------
            // Use country color for filled icons.
            // ------------------------------------------------

            const country =
                countries[
                    army.country
                ];


            if (
                isFilled &&
                country
            ) {

                icon.style.color =
                    country.color;

            }

            else {

                icon.style.color =
                    "";

            }

        }
    );

}


// ============================================================
// FIND ARMY AT TILE
// ============================================================

function getArmyAtTile(tile) {

    if (!tile) {

        return null;

    }


    return armies.find(
        army =>
            army.col === tile.col &&
            army.row === tile.row
    ) || null;

}


// ============================================================
// UPDATE TERRITORY PANEL
// ============================================================

function updateTerritoryPanel(
    tile,
    country
) {

    // --------------------------------------------------------
    // Territory name
    // --------------------------------------------------------

    territoryName.textContent =
        country.name;


    // --------------------------------------------------------
    // Tile coordinates
    // --------------------------------------------------------

    territoryOwner.textContent =
        `Tile: ${tile.col}, ${tile.row}`;


    // --------------------------------------------------------
    // Country flag
    // --------------------------------------------------------

    setCountryFlag(
        territoryFlag,
        tile.owner
    );


    // --------------------------------------------------------
    // Find army on this tile
    // --------------------------------------------------------

    const army =
        getArmyAtTile(tile);


    if (army) {

        // ----------------------------------------------------
        // Show army information
        // ----------------------------------------------------

        territoryArmy.style.display =
            "block";


        armyNameDisplay.textContent =
            army.name;


        armyStrengthDisplay.textContent =
            `${army.strength.toLocaleString()} men`;


        // ----------------------------------------------------
        // Show manpower
        // ----------------------------------------------------

        territoryManpower.style.display =
            "block";


        updateManpowerDisplay(
            army
        );

    }

    else {

        // ----------------------------------------------------
        // Hide army information
        // ----------------------------------------------------

        territoryArmy.style.display =
            "none";


        territoryManpower.style.display =
            "none";

    }

}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        resizeCamera(canvas);

        draw(ctx, canvas);

    }
);


// ============================================================
// CLICK
// ============================================================

let wasDragging = false;


canvas.addEventListener(
    "click",
    event => {

        // ----------------------------------------------------
        // Ignore click after dragging
        // ----------------------------------------------------

        if (wasDragging) {

            wasDragging = false;

            return;

        }


        // ----------------------------------------------------
        // SCREEN → WORLD
        // ----------------------------------------------------

        const rect =
            canvas.getBoundingClientRect();


        const world = {

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


        // ----------------------------------------------------
        // FIND TILE
        // ----------------------------------------------------

        const tile =
            getTileAt(
                world.x,
                world.y
            );


        if (!tile) {

            return;

        }


        // ----------------------------------------------------
        // FIND COUNTRY
        // ----------------------------------------------------

        const country =
            countries[
                tile.owner
            ];


        if (!country) {

            return;

        }


        // ----------------------------------------------------
        // UPDATE TERRITORY PANEL
        // ----------------------------------------------------

        updateTerritoryPanel(
            tile,
            country
        );

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
    event => {

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
    event => {

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


        panCamera(
            canvas,
            dx,
            dy
        );


        lastX =
            event.clientX;

        lastY =
            event.clientY;


        draw(
            ctx,
            canvas
        );

    }
);


// ============================================================
// STOP DRAGGING
// ============================================================

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
    event => {

        event.preventDefault();


        zoomCamera(
            canvas,
            event
        );


        draw(
            ctx,
            canvas
        );

    }
);


// ============================================================
// START
// ============================================================

start();
