// ============================================================
// RENDERER.JS
// ============================================================

import {
    tiles,
    countries,
    hexToWorld,
    MAP_WIDTH,
    MAP_HEIGHT,
    COLS,
    ROWS
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

const parchmentTexture =
    new Image();

const waterTexture =
    new Image();


// ============================================================
// TERRAIN TEXTURES
// ============================================================

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
// HEX CORNERS
// ============================================================
//
// Returns the six corners in the same order used by
// createHexPath().
//
//        0 ----- 1
//       /         \
//      5           2
//       \         /
//        4 ----- 3
//
// ============================================================

function getHexCorners(
    x,
    y,
    size
) {

    const corners = [];


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const angle =
            Math.PI / 180 *
            (60 * i - 30);


        corners.push({

            x:
                x +
                size *
                Math.cos(angle),

            y:
                y +
                size *
                Math.sin(angle)

        });

    }


    return corners;

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
    // NORMAL HEX GRID LINE
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
// GET TILE
// ============================================================
//
// Safely gets a tile from the grid.
//
// ============================================================

function getTile(
    col,
    row
) {

    if (
        col < 0 ||
        col >= COLS ||
        row < 0 ||
        row >= ROWS
    ) {

        return null;

    }


    return tiles[
        row * COLS +
        col
    ] || null;

}


// ============================================================
// DRAW POLITICAL BORDERS
// ============================================================
//
// Country borders are drawn AFTER all tiles.
//
// This allows us to place the border exactly over the shared
// edge between two hexes.
//
// Country ↔ Country:
//
//     COUNTRY A
//          │
//          │
//     COUNTRY B
//
// produces two parallel colored lines.
//
// Country ↔ Ocean:
//
//     COUNTRY
//          │
//          │  faint dark line
//          │
//        OCEAN
//
// ============================================================

function drawPoliticalBorders() {

    mapCtx.save();


    // ========================================================
    // BORDER SETTINGS
    // ========================================================

    const countryBorderWidth =
        1.8;

    const countryBorderOffset =
        0.9;

    const oceanBorderWidth =
        1.1;

    const oceanBorderAlpha =
        0.45;


    // ========================================================
    // LOOP THROUGH TILES
    // ========================================================

    for (
        const tile
        of tiles
    ) {

        // ----------------------------------------------------
        // Ocean itself does not generate political borders.
        // ----------------------------------------------------

        if (
            tile.owner === "ocean"
        ) {

            continue;

        }


        const world =
            hexToWorld(
                tile.col,
                tile.row
            );


        const corners =
            getHexCorners(
                world.x,
                world.y,
                14
            );


        // ====================================================
        // SIX NEIGHBOURS
        // ====================================================
        //
        // Neighbor relationships:
        //
        // Even row:
        //
        //       NW   NE
        //        \   /
        //      W -- X -- E
        //        /   \
        //       SW   SE
        //
        // Odd rows are shifted.
        //
        // ====================================================

        const evenRow =
            tile.row % 2 === 0;


        const neighbours = evenRow
            ? [

                { col: tile.col - 1, row: tile.row - 1 },
                { col: tile.col,     row: tile.row - 1 },
                { col: tile.col - 1, row: tile.row     },
                { col: tile.col + 1, row: tile.row     },
                { col: tile.col - 1, row: tile.row + 1 },
                { col: tile.col,     row: tile.row + 1 }

            ]
            : [

                { col: tile.col,     row: tile.row - 1 },
                { col: tile.col + 1, row: tile.row - 1 },
                { col: tile.col - 1, row: tile.row     },
                { col: tile.col + 1, row: tile.row     },
                { col: tile.col,     row: tile.row + 1 },
                { col: tile.col + 1, row: tile.row + 1 }

            ];


        // ====================================================
        // PROCESS EDGES
        // ====================================================

        for (
            let side = 0;
            side < 6;
            side++
        ) {

            const neighbourPosition =
                neighbours[side];


            const neighbour =
                getTile(
                    neighbourPosition.col,
                    neighbourPosition.row
                );


            if (
                !neighbour
            ) {

                continue;

            }


            // ------------------------------------------------
            // Only process each shared edge once.
            // ------------------------------------------------

            const neighbourIndex =
                neighbour.row * COLS +
                neighbour.col;


            const currentIndex =
                tile.row * COLS +
                tile.col;


            if (
                neighbourIndex <=
                currentIndex
            ) {

                continue;

            }


            // =================================================
            // SAME COUNTRY
            // =================================================

            if (
                neighbour.owner ===
                tile.owner
            ) {

                continue;

            }


            // =================================================
            // EDGE CORNERS
            // =================================================

            const cornerA =
                corners[side];


            const cornerB =
                corners[
                    (side + 1) % 6
                ];


            // =================================================
            // OCEAN BORDER
            // =================================================

            if (
                neighbour.owner === "ocean"
            ) {

                drawBorderLine(

                    mapCtx,

                    cornerA,
                    cornerB,

                    "#252522",

                    oceanBorderWidth,

                    oceanBorderAlpha,

                    0

                );

                continue;

            }


            // =================================================
            // COUNTRY ↔ COUNTRY
            // =================================================

            const currentCountry =
                countries[
                    tile.owner
                ];


            const neighbourCountry =
                countries[
                    neighbour.owner
                ];


            if (
                !currentCountry ||
                !neighbourCountry
            ) {

                continue;

            }


            // -------------------------------------------------
            // Calculate the perpendicular direction from the
            // shared edge toward the centre of the current tile.
            // -------------------------------------------------

            const edgeMidX =
                (
                    cornerA.x +
                    cornerB.x
                ) / 2;


            const edgeMidY =
                (
                    cornerA.y +
                    cornerB.y
                ) / 2;


            const dx =
                world.x -
                edgeMidX;


            const dy =
                world.y -
                edgeMidY;


            const length =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                length === 0
            ) {

                continue;

            }


            const normalX =
                dx / length;


            const normalY =
                dy / length;


            // -------------------------------------------------
            // First line:
            //
            // Slightly inside CURRENT country's territory.
            // -------------------------------------------------

            drawBorderLine(

                mapCtx,

                cornerA,
                cornerB,

                currentCountry.color,

                countryBorderWidth,

                1,

                countryBorderOffset

            );


            // -------------------------------------------------
            // Second line:
            //
            // Slightly inside NEIGHBOUR country's territory.
            // -------------------------------------------------

            drawBorderLine(

                mapCtx,

                cornerA,
                cornerB,

                neighbourCountry.color,

                countryBorderWidth,

                1,

                -countryBorderOffset

            );

        }

    }


    mapCtx.restore();

}


// ============================================================
// DRAW BORDER LINE
// ============================================================
//
// Draws a line between two hex corners.
//
// offset:
//
// Positive = toward the tile whose centre lies in the normal
// direction.
//
// Negative = opposite direction.
//
// ============================================================

function drawBorderLine(
    context,
    a,
    b,
    color,
    width,
    alpha,
    offset
) {

    const midX =
        (a.x + b.x) / 2;

    const midY =
        (a.y + b.y) / 2;


    const dx =
        b.x - a.x;

    const dy =
        b.y - a.y;


    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        length === 0
    ) {

        return;

    }


    // --------------------------------------------------------
    // Perpendicular vector.
    // --------------------------------------------------------

    let normalX =
        -dy / length;

    let normalY =
        dx / length;


    // --------------------------------------------------------
    // Apply offset.
    // --------------------------------------------------------

    const offsetX =
        normalX *
        offset;

    const offsetY =
        normalY *
        offset;


    const x1 =
        a.x +
        offsetX;

    const y1 =
        a.y +
        offsetY;


    const x2 =
        b.x +
        offsetX;

    const y2 =
        b.y +
        offsetY;


    context.save();


    context.globalAlpha =
        alpha;


    context.beginPath();


    context.moveTo(
        x1,
        y1
    );


    context.lineTo(
        x2,
        y2
    );


    context.strokeStyle =
        color;


    context.lineWidth =
        width;


    context.lineCap =
        "butt";


    context.stroke();


    context.restore();

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
        // TERRAIN
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
        // DRAW HEX
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


    // ========================================================
    // POLITICAL BORDERS
    // ========================================================
    //
    // Draw AFTER every tile has been painted.
    //
    // This ensures the borders sit cleanly above terrain,
    // parchment and country colors.
    //

    drawPoliticalBorders();


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
    // FRAME BORDER
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
