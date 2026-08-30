// ============================================================
// ARMIES.JS
// ============================================================

import {
    hexToWorld,
    HEX_SIZE,
    countries
} from "./map.js";

import {
    getCountryFlagPath
} from "./countryFlags.js";


// ============================================================
// ARMIES
// ============================================================

export const armies = [];


// ============================================================
// ARMY FLAG SIZE
// ============================================================

const ARMY_FLAG_SIZE =
    HEX_SIZE * 1.4;


// ============================================================
// SOLDIER ICON CONFIGURATION
// ============================================================
//
// Each soldier icon represents 25,000 men.
//
// The maximum displayed is 4 icons (100,000 men).
//
// Future expansion to 5 icons (125,000 men) is possible by
// simply changing MAX_SOLDIER_ICONS.
//
// ============================================================

export const MEN_PER_SOLDIER_ICON =
    25000;


export const MAX_SOLDIER_ICONS =
    4;


// ============================================================
// FLAG CACHE
// ============================================================

const flagCache = {};


// ============================================================
// GET COUNTRY FLAG IMAGE
// ============================================================

function getCountryFlagImage(
    countryId
) {

    const path =
        getCountryFlagPath(
            countryId
        );


    if (!path) {

        return null;

    }


    if (
        flagCache[path]
    ) {

        return flagCache[path];

    }


    const image =
        new Image();


    image.src =
        path;


    flagCache[path] =
        image;


    return image;

}


// ============================================================
// DRAW ARMIES
// ============================================================

export function drawArmies(
    ctx
) {

    for (
        const army of armies
    ) {

        const world =
            hexToWorld(
                army.col,
                army.row
            );


        const flag =
            getCountryFlagImage(
                army.country
            );


        // ----------------------------------------------------
        // FLAG
        // ----------------------------------------------------

        if (
            flag &&
            flag.complete &&
            flag.naturalWidth > 0
        ) {

            drawFlagContain(
                ctx,
                flag,
                world.x,
                world.y,
                ARMY_FLAG_SIZE
            );

        }

        // ----------------------------------------------------
        // FALLBACK
        // ----------------------------------------------------

        else {

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
// DRAW FLAG WITH CONTAIN BEHAVIOUR
// ============================================================

function drawFlagContain(
    ctx,
    image,
    centerX,
    centerY,
    boxSize
) {

    const sourceWidth =
        image.naturalWidth;


    const sourceHeight =
        image.naturalHeight;


    if (
        sourceWidth <= 0 ||
        sourceHeight <= 0
    ) {

        return;

    }


    const scale =
        Math.min(

            boxSize /
            sourceWidth,

            boxSize /
            sourceHeight

        );


    const drawWidth =
        sourceWidth *
        scale;


    const drawHeight =
        sourceHeight *
        scale;


    const drawX =
        centerX -
        drawWidth / 2;


    const drawY =
        centerY -
        drawHeight / 2;


    ctx.drawImage(

        image,

        drawX,
        drawY,

        drawWidth,
        drawHeight

    );

}


// ============================================================
// GET SOLDIER ICON COUNT
// ============================================================
//
// Derives how many soldier icons should be filled based on
// army strength.
//
// Example:
//
//     25000  → 1 icon
//     50000  → 2 icons
//     75000  → 3 icons
//     100000 → 4 icons
//
// ============================================================

export function getSoldierIconCount(
    strength
) {

    const count =
        Math.floor(
            strength /
            MEN_PER_SOLDIER_ICON
        );


    return Math.max(
        0,
        Math.min(
            count,
            MAX_SOLDIER_ICONS
        )
    );

}


// ============================================================
// LOAD ARMIES FROM JSON
// ============================================================

export async function loadArmies() {

    try {

        const response =
            await fetch(
                "data/armies.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Could not load armies.json"
            );

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


            armies.push({

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

                col:
                    col,

                row:
                    row

            });

        }


    }

    catch (error) {

        console.warn(
            "Could not load armies.json:",
            error
        );

    }

}


// ============================================================
// CREATE ARMIES JSON
// ============================================================

export function createArmiesJSON() {

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

                    col:
                        army.col,

                    row:
                        army.row

                })
            )

    };

}
