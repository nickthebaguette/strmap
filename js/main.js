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
    loadCities
} from "./shared/cities.js";

import {
    loadArmies
} from "./shared/armies.js";

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
        // UPDATE TERRITORY NAME
        // ----------------------------------------------------

        territoryName.textContent =
            country.name;


        // ----------------------------------------------------
        // UPDATE TILE INFORMATION
        // ----------------------------------------------------

        territoryOwner.textContent =
            `Tile: ${tile.col}, ${tile.row}`;


        // ----------------------------------------------------
        // UPDATE COUNTRY FLAG
        // ----------------------------------------------------

        setCountryFlag(
            territoryFlag,
            tile.owner
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
