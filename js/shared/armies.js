// ============================================================
// ARMIES.JS
// ============================================================

import {
    hexToWorld,
    HEX_SIZE
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
//
// Square flag markers should fit neatly inside a hex.
//
// HEX_SIZE is the radius of a hex from centre to vertex.
//
// A square slightly larger than the hex's inner radius works
// well visually without covering the entire hex.
//
// ============================================================

const ARMY_FLAG_SIZE =
    HEX_SIZE * 1.8;


// ============================================================
// FLAG CACHE
// ============================================================
//
// Cache flag images by country ID so we don't create a new
// Image object for every army on every frame.
//
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


    // Already loaded / loading.

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
//
// Draws the flag inside a square destination box while
// preserving the source image's aspect ratio.
//
// The flag is centred within the square.
//
// This is the canvas equivalent of:
//
//     object-fit: contain;
//     object-position: center;
//
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


    // --------------------------------------------------------
    // Calculate scale to fit inside the box.
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // Centre within the box.
    // --------------------------------------------------------

    const drawX =
        centerX -
        drawWidth / 2;


    const drawY =
        centerY -
        drawHeight / 2;


    // --------------------------------------------------------
    // Draw.
    // --------------------------------------------------------

    ctx.drawImage(

        image,

        drawX,
        drawY,

        drawWidth,
        drawHeight

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


            // ----------------------------------------------------
            // The old icon field is no longer used for rendering.
            //
            // It is still read here for backward compatibility
            // with existing armies.json files, but it will be
            // ignored by drawArmies().
            //
            // ----------------------------------------------------

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
//
// Produces the structure used by data/armies.json.
//
// The old icon field is deliberately omitted because the flag
// is now derived automatically from the country.
//
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
