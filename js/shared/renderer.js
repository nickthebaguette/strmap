// ============================================================
// RENDERER.JS
// ============================================================

import {
    tiles,
    countries,
    hexToWorld,
    MAP_WIDTH,
    MAP_HEIGHT
} from "./map.js";

import {
    FRAME_OVERHANG,
    FRAME_WIDTH,
    FRAME_COLOR,
    camera
} from "./camera.js";

import {
    drawCities
} from "./cities.js";

import {
    drawArmies
} from "./armies.js";

import {
    getTerrain
} from "./terrain.js";


// ============================================================
// CANVAS
// ============================================================

export const mapCanvas =
    document.createElement("canvas");

export const mapCtx =
    mapCanvas.getContext("2d");


// ============================================================
// TEXTURES
// ============================================================
//
// All visual textures are handled here.
//
// Political color
//      ↓
// parchment / water
//      ↓
// terrain symbols
//      ↓
// hex border
//
// Terrain textures are transparent PNG overlays.
// ============================================================


// ------------------------------------------------------------
// Base textures
// ------------------------------------------------------------

const parchmentTexture =
    new Image();

const waterTexture =
    new Image();


// ------------------------------------------------------------
// Terrain textures
// ------------------------------------------------------------

const terrainTextures = {

    plains:
        new Image(),

    forest:
        new Image(),

    hills:
        new Image(),

    mountains:
        new Image(),

    desert:
        new Image(),

    swamp:
        new Image()

};


// ============================================================
// TEXTURE LOADING STATE
// ============================================================

let parchmentLoaded =
    false;

let waterLoaded =
    false;


const terrainLoaded = {

    plains: false,

    forest: false,

    hills: false,

    mountains: false,

    desert: false,

    swamp: false

};


// ============================================================
// TEXTURE PATHS
// ============================================================

parchmentTexture.src =
    "assets/textures/parchment.png";

waterTexture.src =
    "assets/textures/water.png";


terrainTextures.plains.src =
    "assets/textures/terrain/plains.png";

terrainTextures.forest.src =
    "assets/textures/terrain/forest.png";

terrainTextures.hills.src =
    "assets/textures/terrain/hills.png";

terrainTextures.mountains.src =
    "assets/textures/terrain/mountains.png";

terrainTextures.desert.src =
    "assets/textures/terrain/desert.png";

terrainTextures.swamp.src =
    "assets/textures/terrain/swamp.png";


// ============================================================
// BASE TEXTURE EVENTS
// ============================================================

parchmentTexture.onload =
    () => {

        parchmentLoaded =
            true;

        rebuildMapCanvas();

    };


parchmentTexture.onerror =
    () => {

        console.warn(
            "Could not load parchment texture. Using flat colors."
        );

        parchmentLoaded =
            false;

    };


waterTexture.onload =
    () => {

        waterLoaded =
            true;

        rebuildMapCanvas();

    };


waterTexture.onerror =
    () => {

        console.warn(
            "Could not load water texture. Using flat colors."
        );

        waterLoaded =
            false;

    };


// ============================================================
// TERRAIN TEXTURE EVENTS
// ============================================================

for (
    const terrain
    of Object.keys(
        terrainTextures
    )
) {

    terrainTextures[terrain].onload =
        () => {

            terrainLoaded[terrain] =
                true;

            rebuildMapCanvas();

        };


    terrainTextures[terrain].onerror =
        () => {

            console.warn(
                `Could not load terrain texture: ${terrain}`
            );

            terrainLoaded[terrain] =
                false;

        };

}


// ============================================================
// HEX PATH
// ============================================================

function createHexPath(
    context,
    x,
    y,
    size
) {

    context.beginPath();


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const angle =
            Math.PI / 180 *
            (60 * i - 30);


        const px =
            x +
            size *
            Math.cos(angle);


        const py =
            y +
            size *
            Math.sin(angle);


        if (
            i === 0
        ) {

            context.moveTo(
                px,
                py
            );

        }

        else {

            context.lineTo(
                px,
                py
            );

        }

    }


    context.closePath();

}


// ============================================================
// DRAW HEX
// ============================================================

function drawHexOnContext(
    context,
    x,
    y,
    size,
    color,
    baseTexture,
    terrainTexture
) {

    // ========================================================
    // BASE HEX
    // ========================================================

    createHexPath(
        context,
        x,
        y,
        size
    );


    context.fillStyle =
        color;

    context.fill();


    // ========================================================
    // BASE TEXTURE
    // ========================================================

    if (
        baseTexture
    ) {

        const pattern =
            context.createPattern(
                baseTexture,
                "repeat"
            );


        if (
            pattern
        ) {

            createHexPath(
                context,
                x,
                y,
                size
            );


            context.save();


            context.globalAlpha =
                0.55;


            context.fillStyle =
                pattern;


            context.fill();


            context.restore();

        }

    }


    // ========================================================
    // TERRAIN TEXTURE
    // ========================================================
    //
    // Terrain is intentionally weaker than the parchment.
    //
    // The political color should remain dominant.
    //

    if (
        terrainTexture
    ) {

        const pattern =
            context.createPattern(
                terrainTexture,
                "repeat"
            );


        if (
            pattern
        ) {

            createHexPath(
                context,
                x,
                y,
                size
            );


            context.save();


            context.globalAlpha =
                0.45;


            context.fillStyle =
                pattern;


            context.fill();


            context.restore();

        }

    }


    // ========================================================
    // HEX BORDER
    // ========================================================

    createHexPath(
        context,
        x,
        y,
        size
    );


    context.strokeStyle =
        "#30302d";

    context.lineWidth =
        0.7;

    context.stroke();

}


// ============================================================
// MAP CACHE
// ============================================================

export function rebuildMapCanvas() {

    mapCanvas.width =
        Math.ceil(
            MAP_WIDTH +
            FRAME_OVERHANG * 2
        );


    mapCanvas.height =
        Math.ceil(
            MAP_HEIGHT +
            FRAME_OVERHANG * 2
        );


    mapCtx.clearRect(
        0,
        0,
        mapCanvas.width,
        mapCanvas.height
    );


    mapCtx.save();


    mapCtx.translate(
        FRAME_OVERHANG,
        FRAME_OVERHANG
    );


    // ========================================================
    // DRAW TILES
    // ========================================================

    for (
        const tile
        of tiles
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


        if (
            !country
        ) {

            continue;

        }


        // ====================================================
        // DETERMINE TERRAIN
        // ====================================================

        const terrain =
            getTerrain(
                tile.col,
                tile.row,
                tile
            );


        // ====================================================
        // BASE TEXTURE
        // ====================================================

        let baseTexture =
            null;


        if (
            tile.owner === "ocean"
        ) {

            if (
                waterLoaded
            ) {

                baseTexture =
                    waterTexture;

            }

        }

        else {

            if (
                parchmentLoaded
            ) {

                baseTexture =
                    parchmentTexture;

            }

        }


        // ====================================================
        // TERRAIN TEXTURE
        // ====================================================
        //
        // Water does not receive a terrain overlay.
        //
        // Ocean is already handled by waterTexture.
        //

        let terrainTexture =
            null;


        if (
            terrain !== "water" &&
            terrainLoaded[terrain]
        ) {

            terrainTexture =
                terrainTextures[terrain];

        }


        // ====================================================
        // DRAW
        // ====================================================

        drawHexOnContext(

            mapCtx,

            world.x,

            world.y,

            14,

            country.color,

            baseTexture,

            terrainTexture

        );

    }


    mapCtx.restore();

}


// ============================================================
// DRAW
// ============================================================

export function draw(
    ctx,
    canvas
) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.save();


    // ========================================================
    // CAMERA
    // ========================================================

    ctx.translate(

        -camera.x *
        camera.zoom,

        -camera.y *
        camera.zoom

    );


    ctx.scale(
        camera.zoom,
        camera.zoom
    );


    // ========================================================
    // FRAME
    // ========================================================

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


    // ========================================================
    // MAP
    // ========================================================

    ctx.drawImage(

        mapCanvas,

        -FRAME_OVERHANG,

        -FRAME_OVERHANG

    );


    // ========================================================
    // CITIES
    // ========================================================

    drawCities(ctx);


    // ========================================================
    // ARMIES
    // ========================================================

    drawArmies(ctx);


    // ========================================================
    // BORDER
    // ========================================================

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
