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
// COLORIZE ICON
// ============================================================
//
// Applies a CSS filter to colorize a PNG icon to match a
// target hex color.
//
// The icon should be a black silhouette on transparent
// background for best results.
//
// ============================================================

function colorizeIcon(
    icon,
    hexColor
) {

    // --------------------------------------------------------
    // Convert hex to RGB
    // --------------------------------------------------------

    const value =
        hexColor.replace(
            "#",
            ""
        );


    const r =
        parseInt(
            value.substring(0, 2),
            16
        );


    const g =
        parseInt(
            value.substring(2, 4),
            16
        );


    const b =
        parseInt(
            value.substring(4, 6),
            16
        );


    // --------------------------------------------------------
    // Apply filter to match target color
    // --------------------------------------------------------

    icon.style.filter =

        `brightness(0) ` +
        `saturate(100%) ` +
        `invert(${r / 255}) ` +
        `sepia(100%) ` +
        `saturate(200%) ` +
        `hue-rotate(${
            Math.round(
                (
                    (g / 255) * 360 +
                    (b / 255) * 360
                ) / 2
            )
        }deg) ` +
        `brightness(${
            Math.round(
                (r / 255) * 100
            ) / 100
        })`;

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

                colorizeIcon(
                    icon,
                    country.color
                );

            }

            else {

                icon.style.filter =
                    "brightness(0)";

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
        getArm
