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
    draw,
    setSelectedTile,
    setHoveredTile
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
// HOVER TOOLTIP
// ============================================================

const hoverTooltip =
    document.getElementById(
        "hover-tooltip"
    );

const tooltipCountry =
    document.getElementById(
        "tooltip-country"
    );

const tooltipCity =
    document.getElementById(
        "tooltip-city"
    );

const tooltipArmy =
    document.getElementById(
        "tooltip-army"
    );

const tooltipManpower =
    document.getElementById(
        "tooltip-manpower"
    );


// ============================================================
// LOADING OVERLAY
// ============================================================

const loadingOverlay =
    document.getElementById(
        "loading-overlay"
    );

const dateDisplay =
    document.getElementById(
        "date-display"
    );

const compassRose =
    document.getElementById(
        "compass-rose"
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


    // --------------------------------------------------------
    // LOADING SEQUENCE
    // --------------------------------------------------------

    runLoadingSequence();

}


// ============================================================
// RUN LOADING SEQUENCE
// ============================================================

function runLoadingSequence() {

    dateDisplay.style.display =
        "block";


    dateDisplay.classList.add(
        "center"
    );


    setTimeout(
        () => {

            loadingOverlay.classList.add(
                "fade-out"
            );

        },
        300
    );


    setTimeout(
        () => {

            dateDisplay.classList.remove(
                "center"
            );


            dateDisplay.classList.add(
                "corner"
            );

        },
        1800
    );


    setTimeout(
        () => {

            compassRose.style.display =
                "block";

        },
        2200
    );


    setTimeout(
        () => {

            loadingOverlay.style.display =
                "none";

        },
        2200
    );

}


// ============================================================
// DRAW VIGNETTE
// ============================================================

function drawVignette() {

    const gradient =
        ctx.createRadialGradient(

            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.25,

            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.75

        );


    gradient.addColorStop(
        0,
        "rgba(0, 0, 0, 0)"
    );


    gradient.addColorStop(
        1,
        "rgba(0, 0, 0, 0.35)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


// ============================================================
// UPDATE MANPOWER DISPLAY
// ============================================================

function updateManpowerDisplay(
    army,
    container
) {

    const filledCount =
        getSoldierIconCount(
            army.strength
        );


    const soldierIcons =
        container.querySelectorAll(
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

                icon.style.backgroundColor =
                    country.color;

            }

            else {

                icon.style.backgroundColor =
                    "rgba(0, 0, 0, 0.5)";

            }

        }
    );

}


// ============================================================
// FIND CITY AT TILE
// ============================================================

function getCityAtTile(tile) {

    if (!tile) {

        return null;

    }


    return cities.find(
        city =>
            city.col === tile.col &&
            city.row === tile.row
    ) || null;

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

    territoryName.textContent =
        country.name;


    territoryOwner.textContent =
        `Tile: ${tile.col}, ${tile.row}`;


    setCountryFlag(
        territoryFlag,
        tile.owner
    );


    const army =
        getArmyAtTile(tile);


    if (army) {

        territoryArmy.style.display =
            "block";


        armyNameDisplay.textContent =
            army.name;


        armyStrengthDisplay.textContent =
            `${army.strength.toLocaleString()} men`;


        territoryManpower.style.display =
            "block";


        updateManpowerDisplay(
            army,
            manpowerIcons
        );

    }

    else {

        territoryArmy.style.display =
            "none";


        territoryManpower.style.display =
            "none";

    }

}


// ============================================================
// SHOW HOVER TOOLTIP
// ============================================================
//
// Only shows when there is a city or army on the tile.
//
// ============================================================

function showHoverTooltip(
    tile,
    mouseX,
    mouseY
) {

    const country =
        countries[
            tile.owner
        ];


    const city =
        getCityAtTile(tile);


    const army =
        getArmyAtTile(tile);


    // --------------------------------------------------------
    // If no city or army, don't show tooltip
    // --------------------------------------------------------

    if (
        !city &&
        !army
    ) {

        hideHoverTooltip();

        return;

    }


    // --------------------------------------------------------
    // Country
    // --------------------------------------------------------

    if (country) {

        tooltipCountry.textContent =
            country.name;


        tooltipCountry.style.display =
            "block";

    }

    else {

        tooltipCountry.style.display =
            "none";

    }


    // --------------------------------------------------------
    // City
    // --------------------------------------------------------

    if (city) {

        tooltipCity.textContent =
            city.name;


        tooltipCity.style.display =
            "block";

    }

    else {

        tooltipCity.style.display =
            "none";

    }


    // --------------------------------------------------------
    // Army
    // --------------------------------------------------------

    if (army) {

        tooltipArmy.textContent =
            army.name;


        tooltipArmy.style.display =
            "block";


        tooltipManpower.innerHTML =
            "";


        tooltipManpower.style.display =
            "flex";


        const filledCount =
            getSoldierIconCount(
                army.strength
            );


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const icon =
                document.createElement("div");


            icon.classList.add(
                "soldier-icon"
            );


            if (
                i < filledCount &&
                country
            ) {

                icon.classList.add(
                    "filled"
                );


                icon.style.backgroundColor =
                    country.color;

            }

            else {

                icon.style.backgroundColor =
                    "rgba(0, 0, 0, 0.5)";

            }


            tooltipManpower.appendChild(
                icon
            );

        }


        const strengthText =
            document.createElement("div");


        strengthText.classList.add(
            "tooltip-strength"
        );


        strengthText.textContent =
            `${army.strength.toLocaleString()} men`;


        tooltipManpower.appendChild(
            strengthText
        );

    }

    else {

        tooltipArmy.style.display =
            "none";


        tooltipManpower.style.display =
            "none";

    }


    // --------------------------------------------------------
    // Position tooltip
    // --------------------------------------------------------

    hoverTooltip.style.display =
        "block";


    const offsetX =
        15;


    const offsetY =
        15;


    let tooltipX =
        mouseX + offsetX;


    let tooltipY =
        mouseY + offsetY;


    const tooltipRect =
        hoverTooltip.getBoundingClientRect();


    if (
        tooltipX + tooltipRect.width >
        window.innerWidth - 10
    ) {

        tooltipX =
            mouseX - tooltipRect.width - offsetX;

    }


    if (
        tooltipY + tooltipRect.height >
        window.innerHeight - 10
    ) {

        tooltipY =
            mouseY - tooltipRect.height - offsetY;

    }


    hoverTooltip.style.left =
        tooltipX + "px";


    hoverTooltip.style.top =
        tooltipY + "px";

}


// ============================================================
// HIDE HOVER TOOLTIP
// ============================================================

function hideHoverTooltip() {

    hoverTooltip.style.display =
        "none";

}


// ============================================================
// REDRAW WITH VIGNETTE
// ============================================================

function redraw() {

    draw(
        ctx,
        canvas
    );


    drawVignette();

}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        resizeCamera(canvas);

        redraw();

    }
);


// ============================================================
// CLICK
// ============================================================

let wasDragging = false;


canvas.addEventListener(
    "click",
    event => {

        if (wasDragging) {

            wasDragging = false;

            return;

        }


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


        const tile =
            getTileAt(
                world.x,
                world.y
            );


        if (!tile) {

            setSelectedTile(null);

            redraw();

            return;

        }


        const country =
            countries[
                tile.owner
            ];


        if (!country) {

            return;

        }


        // ----------------------------------------------------
        // Set selected tile
        // ----------------------------------------------------

        setSelectedTile(
            tile
        );


        // ----------------------------------------------------
        // Update panel
        // ----------------------------------------------------

        updateTerritoryPanel(
            tile,
            country
        );


        // ----------------------------------------------------
        // Redraw
        // ----------------------------------------------------

        redraw();

    }
);


// ============================================================
// HOVER
// ============================================================

canvas.addEventListener(
    "mousemove",
    event => {

        if (dragging) {

            setHoveredTile(null);

            hideHoverTooltip();

            redraw();

            return;

        }


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


        const tile =
            getTileAt(
                world.x,
                world.y
            );


        if (!tile) {

            setHoveredTile(null);

            hideHoverTooltip();

            redraw();

            return;

        }


        // ----------------------------------------------------
        // Check for city or army
        // ----------------------------------------------------

        const city =
            getCityAtTile(tile);


        const army =
            getArmyAtTile(tile);


        if (
            city ||
            army
        ) {

            setHoveredTile(tile);

            showHoverTooltip(
                tile,
                event.clientX,
                event.clientY
            );

        }

        else {

            setHoveredTile(null);

            hideHoverTooltip();

        }


        // ----------------------------------------------------
        // Redraw
        // ----------------------------------------------------

        redraw();

    }
);


// ============================================================
// HIDE TOOLTIP WHEN MOUSE LEAVES
// ============================================================

canvas.addEventListener(
    "mouseleave",
    () => {

        setHoveredTile(null);

        hideHoverTooltip();

        redraw();

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


        setHoveredTile(null);

        hideHoverTooltip();


        redraw();

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


        setHoveredTile(null);

        hideHoverTooltip();


        redraw();

    }
);


// ============================================================
// START
// ============================================================

start();
