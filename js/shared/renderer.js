// ============================================================
// RENDERER.JS
// ============================================================

import {
    tiles,
    countries,
    hexToWorld,
    HEX_SIZE,
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

        parchmentLoaded = true;

        rebuildMapCanvas();

    };


parchmentTexture.onerror =
    () => {

        console.warn(
            "Could not load parchment texture. Using flat colors."
        );

    };


waterTexture.onload =
    () => {

        waterLoaded = true;

        rebuildMapCanvas();

    };


waterTexture.onerror =
    () => {

        console.warn(
            "Could not load water texture. Using flat colors."
        );

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

            terrainLoaded[terrain] = true;

            rebuildMapCanvas();

        };


    terrainTextures[terrain].onerror =
        () => {

            console.warn(
                `Could not load terrain texture: ${terrain}`
            );

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
    // BASE COLOR
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
    // PARCHMENT / WATER
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
    // TERRAIN
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
    // NORMAL HEX GRID
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
// GET NEIGHBOUR FOR EDGE
// ============================================================
//
// Hex vertices:
//
//       5 -------- 0
//      /            \
//     /              \
//    4                1
//     \              /
//      \            /
//       3 -------- 2
//
// Edge:
//
// 0 → 1 = RIGHT
// 1 → 2 = LOWER RIGHT
// 2 → 3 = LOWER LEFT
// 3 → 4 = LEFT
// 4 → 5 = UPPER LEFT
// 5 → 0 = UPPER RIGHT
//
// The row offset determines which column the diagonal
// neighbours occupy.
//
// ============================================================

function getNeighbourForEdge(
    tile,
    edge
) {

    const even =
        tile.row % 2 === 0;


    switch (
        edge
    ) {

        // ----------------------------------------------------
        // RIGHT
        // ----------------------------------------------------

        case 0:

            return getTile(
                tile.col + 1,
                tile.row
            );


        // ----------------------------------------------------
        // LOWER RIGHT
        // ----------------------------------------------------

        case 1:

            return even

                ? getTile(
                    tile.col,
                    tile.row + 1
                )

                : getTile(
                    tile.col + 1,
                    tile.row + 1
                );


        // ----------------------------------------------------
        // LOWER LEFT
        // ----------------------------------------------------

        case 2:

            return even

                ? getTile(
                    tile.col - 1,
                    tile.row + 1
                )

                : getTile(
                    tile.col,
                    tile.row + 1
                );


        // ----------------------------------------------------
        // LEFT
        // ----------------------------------------------------

        case 3:

            return getTile(
                tile.col - 1,
                tile.row
            );


        // ----------------------------------------------------
        // UPPER LEFT
        // ----------------------------------------------------

        case 4:

            return even

                ? getTile(
                    tile.col - 1,
                    tile.row - 1
                )

                : getTile(
                    tile.col,
                    tile.row - 1
                );


        // ----------------------------------------------------
        // UPPER RIGHT
        // ----------------------------------------------------

        case 5:

            return even

                ? getTile(
                    tile.col,
                    tile.row - 1
                )

                : getTile(
                    tile.col + 1,
                    tile.row - 1
                );

    }


    return null;

}


// ============================================================
// DRAW BORDER SEGMENT
// ============================================================

function drawBorderSegment(
    context,
    a,
    b,
    color,
    width,
    alpha
) {

    context.save();


    context.beginPath();


    context.moveTo(
        a.x,
        a.y
    );


    context.lineTo(
        b.x,
        b.y
    );


    context.strokeStyle =
        color;

    context.lineWidth =
        width;

    context.globalAlpha =
        alpha;

    context.lineCap =
        "butt";


    context.stroke();


    context.restore();

}


// ============================================================
// DRAW POLITICAL BORDERS
// ============================================================

function drawPoliticalBorders() {

    mapCtx.save();


    // ========================================================
    // SETTINGS
    // ========================================================


    // Country borders are two distinct lines.

    const COUNTRY_BORDER_WIDTH =
        1.5;


    const COUNTRY_BORDER_SEPARATION =
        1.7;


    // Ocean border is deliberately weaker.

    const OCEAN_BORDER_WIDTH =
        1.2;


    const OCEAN_BORDER_ALPHA =
        0.45;


    // ========================================================
    // PROCESS EVERY TILE
    // ========================================================

    for (
        const tile
        of tiles
    ) {

        // ----------------------------------------------------
        // Ocean doesn't generate its own political borders.
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
                HEX_SIZE
            );


        // ====================================================
        // SIX EDGES
        // ====================================================

        for (
            let edge = 0;
            edge < 6;
            edge++
        ) {

            const neighbour =
                getNeighbourForEdge(
                    tile,
                    edge
                );


            // ------------------------------------------------
            // No neighbour.
            //
            // The map frame handles the outside boundary.
            // ------------------------------------------------

            if (
                !neighbour
            ) {

                continue;

            }


            // ------------------------------------------------
            // Same owner.
            // ------------------------------------------------

            if (
                neighbour.owner ===
                tile.owner
            ) {

                continue;

            }


            const cornerA =
                corners[edge];


            const cornerB =
                corners[
                    (edge + 1) % 6
                ];


            // =================================================
            // LAND → OCEAN
            // =================================================

            if (
                neighbour.owner === "ocean"
            ) {

                drawBorderSegment(

                    mapCtx,

                    cornerA,
                    cornerB,

                    "#20201d",

                    OCEAN_BORDER_WIDTH,

                    OCEAN_BORDER_ALPHA

                );


                continue;

            }


            // =================================================
            // LAND → LAND
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
            // Edge direction.
            // -------------------------------------------------

            const dx =
                cornerB.x -
                cornerA.x;


            const dy =
                cornerB.y -
                cornerA.y;


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


            // -------------------------------------------------
            // Perpendicular unit vector.
            // -------------------------------------------------

            let normalX =
                -dy /
                length;


            let normalY =
                dx /
                length;


            // -------------------------------------------------
            // Determine which side of the edge the CURRENT
            // tile is on.
            //
            // This prevents the normal from accidentally
            // pointing toward the neighbour.
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


            const toCenterX =
                world.x -
                edgeMidX;


            const toCenterY =
                world.y -
                edgeMidY;


            const dot =
                normalX *
                toCenterX +
                normalY *
                toCenterY;


            if (
                dot < 0
            ) {

                normalX *= -1;
                normalY *= -1;

            }


            // =================================================
            // CURRENT COUNTRY LINE
            // =================================================

            drawOffsetBorder(

                mapCtx,

                cornerA,
                cornerB,

                normalX,
                normalY,

                COUNTRY_BORDER_SEPARATION / 2,

                currentCountry.color,

                COUNTRY_BORDER_WIDTH

            );


            // =================================================
            // NEIGHBOUR COUNTRY LINE
            // =================================================

            drawOffsetBorder(

                mapCtx,

                cornerA,
                cornerB,

                normalX,
                normalY,

                -COUNTRY_BORDER_SEPARATION / 2,

                neighbourCountry.color,

                COUNTRY_BORDER_WIDTH

            );

        }

    }


    mapCtx.restore();

}


// ============================================================
// DRAW OFFSET BORDER
// ============================================================

function drawOffsetBorder(
    context,
    a,
    b,
    normalX,
    normalY,
    offset,
    color,
    width
) {

    const offsetX =
        normalX *
        offset;


    const offsetY =
        normalY *
        offset;


    const newA = {

        x:
            a.x +
            offsetX,

        y:
            a.y +
            offsetY

    };


    const newB = {

        x:
            b.x +
            offsetX,

        y:
            b.y +
            offsetY

    };


    drawBorderSegment(

        context,

        newA,
        newB,

        color,

        width,

        1

    );

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
        // DRAW TILE
        // ====================================================

        drawHexOnContext(

            mapCtx,

            world.x,
            world.y,

            HEX_SIZE_LOCAL,

            country.color,

            baseTexture,

            terrainTexture

        );

    }


    // ========================================================
    // POLITICAL BORDERS
    // ========================================================

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
