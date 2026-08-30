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
// SOLDIER ICON CACHE
// ============================================================
//
// We load the base soldier PNG once, then create tinted
// versions for each country using canvas recoloring.
//
// This gives exact color matching instead of approximate
// CSS filters.
//
// ============================================================

const soldierIconCache = {};

let baseSoldierImage = null;


function loadBaseSoldierImage() {

    return new Promise(
        (resolve) => {

            const image =
                new Image();


            image.onload =
                () => {

                    baseSoldierImage =
                        image;

                    resolve();

                };


            image.onerror =
                () => {

                    console.warn(
                        "Could not load soldier icon."
                    );

                    resolve();

                };


            image.src =
                "icons/misc/strengthunit.png";

        }
    );

}


// ============================================================
// GET SOLDIER ICON FOR COUNTRY
// ============================================================
//
// Creates a tinted version of the soldier icon matching the
// country's color.
//
// The base image should be a black silhouette on a
// transparent background.
//
// ============================================================

function getSoldierIconForCountry(
    countryId
) {

    if (
        !baseSoldierImage ||
        !baseSoldierImage.complete
    ) {

        return null;

    }


    const country =
        countries[countryId];


    if (!country) {

        return null;

    }


    const cacheKey =
        countryId;


    if (
        soldierIconCache[cacheKey]
    ) {

        return soldierIconCache[cacheKey];

    }


    // --------------------------------------------------------
    // Create tinted version
    // --------------------------------------------------------

    const tintedCanvas =
        document.createElement("canvas");


    tintedCanvas.width =
        baseSoldierImage.naturalWidth;


    tintedCanvas.height =
        baseSoldierImage.naturalHeight;


    const tintedCtx =
        tintedCanvas.getContext("2d");


    // Draw the base silhouette

    tintedCtx.drawImage(
        baseSoldierImage,
        0,
        0
    );


    // Apply color tint using composite operation

    tintedCtx.globalCompositeOperation =
        "source-in";


    tintedCtx.fillStyle =
        country.color;


    tintedCtx.fillRect(
        0,
        0,
        tintedCanvas.width,
        tintedCanvas.height
    );


    // --------------------------------------------------------
    // Cache and return
    // --------------------------------------------------------

    soldierIconCache[cacheKey] =
        tintedCanvas;


    return tintedCanvas;

}


// ============================================================
// INITIALIZE
// ============================================================

async function start() {

    createTiles();

    resizeCamera(canvas);

    rebuildMapCanvas();

    draw(ctx, canvas);


    // --------------------------------------------------------
    // LOAD SOLDIER ICON
    // --------------------------------------------------------

    await loadBaseSoldierImage();


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


    const country =
        countries[
            army.country
        ];


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


            if (
                isFilled &&
                country
            ) {

                // ------------------------------------------------
                // Set to tinted canvas data URL
                // ------------------------------------------------

                const tintedCanvas =
                    getSoldierIconForCountry(
                        army.country
                    );


                if (
                    tintedCanvas
                ) {

                    icon.src =
                        tintedCanvas.toDataURL();

                }


                icon.style.opacity =
                    "1";

            }

            else {

                // ------------------------------------------------
                // Reset to base silhouette
                // ------------------------------------------------

                icon.src =
                    "icons/misc/strengthunit.png";


                icon.style.opacity =
                    "0.35";

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
