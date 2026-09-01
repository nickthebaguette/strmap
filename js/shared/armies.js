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

import {
    camera
} from "./camera.js";


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

export const MEN_PER_SOLDIER_ICON =
    25000;


export const MAX_SOLDIER_ICONS =
    4;


// ============================================================
// WAVING ANIMATION CONFIGURATION
// ============================================================

const WAVE_SLICES = 12;

const WAVE_AMPLITUDE = 0.08;

const WAVE_FREQUENCY = 2.5;

const WAVE_SPEED = 2.5;

const RIPPLE_SPEED = 1.8;

const ANIMATION_MIN_ZOOM = 1.2;


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
// GET SOLDIER ICON COUNT
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
// DRAW WAVING FLAG
// ============================================================
//
// Draws the flag with horizontal slice distortion to
// simulate a waving effect.
//
// Only used when zoomed in past ANIMATION_MIN_ZOOM.
//
// ============================================================

function drawWavingFlag(
    ctx,
    image,
    centerX,
    centerY,
    size,
    time
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
    // Calculate contain dimensions
    // --------------------------------------------------------

    const scale =
        Math.min(

            size / sourceWidth,
            size / sourceHeight

        );


    const drawWidth =
        sourceWidth * scale;


    const drawHeight =
        sourceHeight * scale;


    const drawX =
        centerX - drawWidth / 2;


    const drawY =
        centerY - drawHeight / 2;


    // --------------------------------------------------------
    // Draw flag in horizontal slices with wave offset
    // --------------------------------------------------------

    const sliceHeight =
        drawHeight / WAVE_SLICES;


    const amplitude =
        drawWidth * WAVE_AMPLITUDE;


    for (
        let i = 0;
        i < WAVE_SLICES;
        i++
    ) {

        const sourceY =
            (i / WAVE_SLICES) * sourceHeight;


        const sourceSliceHeight =
            sourceHeight / WAVE_SLICES;


        const destY =
            drawY + i * sliceHeight;


        // ----------------------------------------------------
        // Wave offset
        // ----------------------------------------------------

        const waveOffset =
            Math.sin(

                time * WAVE_SPEED +
                i * WAVE_FREQUENCY

            ) * amplitude;


        // ----------------------------------------------------
        // Ripple highlight (brightness variation)
        // ----------------------------------------------------

        const ripple =
            Math.sin(

                time * RIPPLE_SPEED +
                i * 1.8

            );


        ctx.save();


        // ----------------------------------------------------
        // Draw slice with slight brightness variation
        // ----------------------------------------------------

        ctx.drawImage(

            image,

            0,
            sourceY,
            sourceWidth,
            sourceSliceHeight,

            drawX + waveOffset,
            destY,
            drawWidth,
            sliceHeight + 1

        );


        // ----------------------------------------------------
        // Add highlight overlay on ripple peaks
        // ----------------------------------------------------

        if (
            ripple > 0.3
        ) {

            ctx.globalAlpha =
                ripple * 0.15;


            ctx.fillStyle =
                "#ffffff";


            ctx.fillRect(

                drawX + waveOffset,
                destY,
                drawWidth,
                sliceHeight

            );

        }


        ctx.restore();

    }

}


// ============================================================
// DRAW STATIC FLAG
// ============================================================

function drawStaticFlag(
    ctx,
    image,
    centerX,
    centerY,
    size
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

            size / sourceWidth,
            size / sourceHeight

        );


    const drawWidth =
        sourceWidth * scale;


    const drawHeight =
        sourceHeight * scale;


    const drawX =
        centerX - drawWidth / 2;


    const drawY =
        centerY - drawHeight / 2;


    ctx.drawImage(

        image,

        drawX,
        drawY,

        drawWidth,
        drawHeight

    );

}


// ============================================================
// DRAW STRENGTH RIBBONS
// ============================================================
//
// Draws 1-4 ribbons hanging from the flag based on army
// strength. Ribbons use the country color.
//
// ============================================================

function drawStrengthRibbons(
    ctx,
    army,
    centerX,
    centerY,
    flagSize
) {

    const ribbonCount =
        getSoldierIconCount(
            army.strength
        );


    if (
        ribbonCount === 0
    ) {

        return;

    }


    const country =
        countries[
            army.country
        ];


    if (
        !country
    ) {

        return;

    }


    // --------------------------------------------------------
    // Ribbon dimensions
    // --------------------------------------------------------

    const ribbonWidth =
        flagSize * 0.12;


    const ribbonHeight =
        flagSize * 0.45;


    const ribbonGap =
        flagSize * 0.08;


    const totalRibbonsWidth =

        ribbonCount * ribbonWidth +
        (ribbonCount - 1) * ribbonGap;


    const startX =
        centerX - totalRibbonsWidth / 2;


    const ribbonY =
        centerY + flagSize * 0.35;


    // --------------------------------------------------------
    // Draw ribbons
    // --------------------------------------------------------

    for (
        let i = 0;
        i < ribbonCount;
        i++
    ) {

        const ribbonX =
            startX +
            i * (ribbonWidth + ribbonGap);


        ctx.save();


        // ----------------------------------------------------
        // Ribbon shadow
        // ----------------------------------------------------

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.4)";


        ctx.fillRect(
            ribbonX + 1,
            ribbonY + 1,
            ribbonWidth,
            ribbonHeight
        );


        // ----------------------------------------------------
        // Ribbon body (country color)
        // ----------------------------------------------------

        ctx.fillStyle =
            country.color;


        ctx.fillRect(
            ribbonX,
            ribbonY,
            ribbonWidth,
            ribbonHeight
        );


        // ----------------------------------------------------
        // Ribbon highlight (left edge)
        // ----------------------------------------------------

        ctx.fillStyle =
            "rgba(255, 255, 255, 0.25)";


        ctx.fillRect(
            ribbonX,
            ribbonY,
            ribbonWidth * 0.3,
            ribbonHeight
        );


        // ----------------------------------------------------
        // Ribbon bottom notch (V shape)
        // ----------------------------------------------------

        ctx.beginPath();


        ctx.moveTo(
            ribbonX,
            ribbonY + ribbonHeight
        );


        ctx.lineTo(
            ribbonX + ribbonWidth / 2,
            ribbonY + ribbonHeight - ribbonWidth * 0.4
        );


        ctx.lineTo(
            ribbonX + ribbonWidth,
            ribbonY + ribbonHeight
        );


        ctx.closePath();


        ctx.fillStyle =
            country.color;


        ctx.fill();


        ctx.restore();

    }

}


// ============================================================
// DRAW ARMIES
// ============================================================

export function drawArmies(
    ctx,
    hoveredTile = null,
    time = 0
) {

    const isZoomedIn =
        camera.zoom >= ANIMATION_MIN_ZOOM;


    for (
        const army of armies
    ) {

        const world =
            hexToWorld(
                army.col,
                army.row
            );


        const isHovered =

            hoveredTile !== null &&
            hoveredTile.col === army.col &&
            hoveredTile.row === army.row;


        const size =

            isHovered
                ? ARMY_FLAG_SIZE * 1.25
                : ARMY_FLAG_SIZE;


        const flag =
            getCountryFlagImage(
                army.country
            );


        ctx.save();


        // ----------------------------------------------------
        // DROP SHADOW
        // ----------------------------------------------------

        ctx.shadowColor =
            "rgba(0, 0, 0, 0.55)";


        ctx.shadowBlur =
            isHovered ? 12 : 8;


        ctx.shadowOffsetX =
            0;


        ctx.shadowOffsetY =
            3;


        // ----------------------------------------------------
        // FLAG
        // ----------------------------------------------------

        if (
            flag &&
            flag.complete &&
            flag.naturalWidth > 0
        ) {

            if (
                isZoomedIn
            ) {

                drawWavingFlag(
                    ctx,
                    flag,
                    world.x,
                    world.y,
                    size,
                    time
                );

            }

            else {

                drawStaticFlag(
                    ctx,
                    flag,
                    world.x,
                    world.y,
                    size
                );

            }

        }

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


        ctx.restore();


        // ----------------------------------------------------
        // STRENGTH RIBBONS (no shadow, drawn after)
        // ----------------------------------------------------

        drawStrengthRibbons(
            ctx,
            army,
            world.x,
            world.y,
            size
        );

    }

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
