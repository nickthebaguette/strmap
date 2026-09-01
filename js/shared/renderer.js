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
    OUTER_FRAME_OVERHANG,
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
// DEVICE PIXEL RATIO
// ============================================================

const DPR =
    window.devicePixelRatio || 1;


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

        };

}


// ============================================================
// SELECTION STATE
// ============================================================

export let selectedTileRef = null;

export function setSelectedTile(
    tile
) {

    selectedTileRef = tile;

}


// ============================================================
// HOVER STATE
// ============================================================

export let hoveredTileRef = null;

export function setHoveredTile(
    tile
) {

    hoveredTileRef = tile;

}


// ============================================================
// SATURATE COLOR
// ============================================================
//
// Boosts saturation and darkens lightness so countries pop
// while maintaining a moody, historical atmosphere.
//
// ============================================================

function saturateColor(
    hex,
    saturationBoost = 0.35,
    lightnessReduction = 0.18
) {

    const value =
        hex.replace(
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


    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;


    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);


    let lightness = (max + min) / 2;


    let saturation = 0;


    if (max !== min) {

        const delta = max - min;


        saturation =
            lightness > 0.5
                ? delta / (2 - max - min)
                : delta / (max + min);

    }


    saturation =
        Math.min(
            1,
            saturation * (1 + saturationBoost)
        );


    lightness =
        Math.max(
            0,
            lightness * (1 - lightnessReduction)
        );


    const hue =
        getHue(rNorm, gNorm, bNorm, max, min);


    const [newR, newG, newB] =
        hslToRgb(hue, saturation, lightness);


//  return `rgb(${newR}, ${newG}, ${newB})`; - REDUNDANT
    return hex

}


// ============================================================
// GET HUE
// ============================================================

function getHue(r, g, b, max, min) {

    if (max === min) {

        return 0;

    }


    const delta = max - min;


    let hue = 0;


    if (max === r) {

        hue =
            ((g - b) / delta) % 6;

    }

    else if (max === g) {

        hue =
            (b - r) / delta + 2;

    }

    else {

        hue =
            (r - g) / delta + 4;

    }


    hue *= 60;


    if (hue < 0) {

        hue += 360;

    }


    return hue;

}


// ============================================================
// HSL TO RGB
// ============================================================

function hslToRgb(h, s, l) {

    const c =
        (1 - Math.abs(2 * l - 1)) * s;


    const x =
        c * (1 - Math.abs((h / 60) % 2 - 1));


    const m =
        l - c / 2;


    let r = 0;
    let g = 0;
    let b = 0;


    if (h < 60) {
        r = c; g = x; b = 0;
    }

    else if (h < 120) {
        r = x; g = c; b = 0;
    }

    else if (h < 180) {
        r = 0; g = c; b = x;
    }

    else if (h < 240) {
        r = 0; g = x; b = c;
    }

    else if (h < 300) {
        r = x; g = 0; b = c;
    }

    else {
        r = c; g = 0; b = x;
    }


    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];

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
            Math.PI /
            180 *
            (
                60 * i -
                30
            );


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
            Math.PI /
            180 *
            (
                60 * i -
                30
            );


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
    terrainTexture,
    isOcean = false
) {

    createHexPath(
        context,
        x,
        y,
        size
    );


    const fillColor =
        isOcean
            ? color
            : saturateColor(color);


    context.fillStyle =
        fillColor;


    context.fill();


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
                0.45;


            context.fillStyle =
                pattern;


            context.fill();


            context.restore();

        }

    }


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
                0.35;


            context.fillStyle =
                pattern;


            context.fill();


            context.restore();

        }

    }


    createHexPath(
        context,
        x,
        y,
        size
    );


    context.strokeStyle =
        "#30302d";


    context.lineWidth =
        1.0;


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

function getNeighbourForEdge(
    tile,
    edge
) {

    const even =
        tile.row % 2 === 0;


    switch (
        edge
    ) {

        case 0:

            return getTile(
                tile.col + 1,
                tile.row
            );


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


        case 3:

            return getTile(
                tile.col - 1,
                tile.row
            );


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
// DARKEN COLOR
// ============================================================

function darkenColor(
    hex,
    amount = 0.3
) {

    const value =
        hex.replace(
            "#",
            ""
        );


    const r =
        parseInt(
            value.substring(
                0,
                2
            ),
            16
        );


    const g =
        parseInt(
            value.substring(
                2,
                4
            ),
            16
        );


    const b =
        parseInt(
            value.substring(
                4,
                6
            ),
            16
        );


    return `rgb(
        ${Math.max(
            0,
            Math.round(
                r *
                (1 - amount)
            )
        )},
        ${Math.max(
            0,
            Math.round(
                g *
                (1 - amount)
            )
        )},
        ${Math.max(
            0,
            Math.round(
                b *
                (1 - amount)
            )
        )}
    )`;

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
    alpha = 1
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
// DRAW OFFSET BORDER
// ============================================================
//
// Uses stronger darkening (0.60) so light-colored countries
// have visible borders.
//
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

        darkenColor(
            color,
            0.60
        ),

        width,

        1

    );

}


// ============================================================
// POLITICAL BORDERS WITH DOUBLE-LINE SYSTEM
// ============================================================
//
// Country borders now use a double-line system:
//
//     1. Colored glow (country color, subtle)
//     2. Dark outline (near black, strong)
//     3. Darkened country color lines (visible for all colors)
//
// ============================================================

function drawPoliticalBorders() {

    mapCtx.save();


    const COUNTRY_BORDER_WIDTH =
        3.0;


    const COUNTRY_BORDER_SEPARATION =
        3.2;


    const DARK_OUTLINE_WIDTH =
        4.0;


    const DARK_OUTLINE_ALPHA =
        0.55;


    const OCEAN_BORDER_WIDTH =
        4.0;


    const OCEAN_BORDER_ALPHA =
        0.70;


    const OCEAN_BORDER_COLOR =
        "#151512";


    const GLOW_ALPHA =
        0.35;


    const GLOW_WIDTH =
        6.0;


    for (
        const tile
        of tiles
    ) {

        if (
            tile.owner ===
            "ocean"
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


            if (
                !neighbour
            ) {

                continue;

            }


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


            if (
                neighbour.owner ===
                "ocean"
            ) {

                drawBorderSegment(

                    mapCtx,

                    cornerA,
                    cornerB,

                    OCEAN_BORDER_COLOR,

                    OCEAN_BORDER_WIDTH,

                    OCEAN_BORDER_ALPHA

                );


                continue;

            }


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


            let normalX =
                -dy /
                length;


            let normalY =
                dx /
                length;


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


            // -------------------------------------------------
            // COUNTRY GLOW (subtle, behind everything)
            // -------------------------------------------------

            drawBorderSegment(

                mapCtx,

                cornerA,
                cornerB,

                currentCountry.color,

                GLOW_WIDTH,

                GLOW_ALPHA

            );


            drawBorderSegment(

                mapCtx,

                cornerA,
                cornerB,

                neighbourCountry.color,

                GLOW_WIDTH,

                GLOW_ALPHA

            );


            // -------------------------------------------------
            // DARK OUTLINE (center line, strongest)
            // -------------------------------------------------

            drawBorderSegment(

                mapCtx,

                cornerA,
                cornerB,

                "#151512",

                DARK_OUTLINE_WIDTH,

                DARK_OUTLINE_ALPHA

            );


            // -------------------------------------------------
            // CURRENT COUNTRY COLORED LINE (darkened)
            // -------------------------------------------------

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


            // -------------------------------------------------
            // NEIGHBOUR COUNTRY COLORED LINE (darkened)
            // -------------------------------------------------

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
// MAP CACHE
// ============================================================

export function rebuildMapCanvas() {

    const DPR =
        window.devicePixelRatio || 1;


    const logicalWidth =
        MAP_WIDTH +
        FRAME_OVERHANG * 2;


    const logicalHeight =
        MAP_HEIGHT +
        FRAME_OVERHANG * 2;


    mapCanvas.width =
        Math.ceil(
            logicalWidth * DPR
        );


    mapCanvas.height =
        Math.ceil(
            logicalHeight * DPR
        );


    mapCtx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
    );


    mapCtx.clearRect(
        0,
        0,
        logicalWidth,
        logicalHeight
    );


    mapCtx.save();


    mapCtx.translate(
        FRAME_OVERHANG,
        FRAME_OVERHANG
    );


    // ========================================================
    // TILES
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


        const terrain =
            getTerrain(
                tile
            );


        const isOcean =
            tile.owner === "ocean";


        let baseTexture =
            null;


        if (
            isOcean
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


        let terrainTexture =
            null;


        if (
            terrain !== "water" &&
            terrainLoaded[terrain]
        ) {

            terrainTexture =
                terrainTextures[
                    terrain
                ];

        }


        drawHexOnContext(

            mapCtx,

            world.x,
            world.y,

            HEX_SIZE,

            country.color,

            baseTexture,

            terrainTexture,

            isOcean

        );

    }


    // ========================================================
    // POLITICAL BORDERS
    // ========================================================

    drawPoliticalBorders();


    mapCtx.restore();

}


// ============================================================
// DRAW HEX HIGHLIGHT
// ============================================================

function drawHexHighlight(
    ctx,
    tile,
    color,
    alpha = 0.6,
    lineWidth = 2.5
) {

    if (!tile) {

        return;

    }


    const world =
        hexToWorld(
            tile.col,
            tile.row
        );


    const size =
        HEX_SIZE +
        1;


    ctx.save();


    createHexPath(
        ctx,
        world.x,
        world.y,
        size
    );


    ctx.strokeStyle =
        color;


    ctx.lineWidth =
        lineWidth;


    ctx.globalAlpha =
        alpha;


    ctx.shadowColor =
        color;


    ctx.shadowBlur =
        12;


    ctx.stroke();


    ctx.shadowBlur =
        0;


    createHexPath(
        ctx,
        world.x,
        world.y,
        size
    );


    ctx.strokeStyle =
        color;


    ctx.lineWidth =
        lineWidth * 0.6;


    ctx.globalAlpha =
        alpha * 0.8;


    ctx.stroke();


    ctx.restore();

}


// ============================================================
// DRAW OUTER FRAME
// ============================================================

function drawOuterFrame(ctx) {

    const frameX = -OUTER_FRAME_OVERHANG;

    const frameY = -OUTER_FRAME_OVERHANG;

    const frameWidth =
        MAP_WIDTH +
        OUTER_FRAME_OVERHANG * 2;

    const frameHeight =
        MAP_HEIGHT +
        OUTER_FRAME_OVERHANG * 2;


    ctx.fillStyle =
        FRAME_COLOR;

    ctx.fillRect(
        frameX,
        frameY,
        frameWidth,
        frameHeight
    );


    ctx.strokeStyle =
        "rgba(216, 201, 160, 0.3)";


    ctx.lineWidth =
        1.5;


    ctx.strokeRect(
        frameX + 2,
        frameY + 2,
        frameWidth - 4,
        frameHeight - 4
    );


    ctx.strokeStyle =
        "rgba(216, 201, 160, 0.15)";


    ctx.lineWidth =
        1;


    ctx.strokeRect(
        frameX + 5,
        frameY + 5,
        frameWidth - 10,
        frameHeight - 10
    );

}


// ============================================================
// DRAW
// ============================================================

export function draw(
    ctx,
    canvas
) {

    const DPR =
        window.devicePixelRatio || 1;


    ctx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    ctx.save();


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
    // OUTER FRAME
    // ========================================================

    drawOuterFrame(
        ctx
    );


    // ========================================================
    // MAP
    // ========================================================

    ctx.drawImage(

        mapCanvas,

        -FRAME_OVERHANG,
        -FRAME_OVERHANG,

        MAP_WIDTH + FRAME_OVERHANG * 2,
        MAP_HEIGHT + FRAME_OVERHANG * 2

    );


    // ========================================================
    // HOVER HIGHLIGHT
    // ========================================================

    if (
        hoveredTileRef
    ) {

        drawHexHighlight(
            ctx,
            hoveredTileRef,
            "#f5efe0",
            0.45,
            2.0
        );

    }


    // ========================================================
    // SELECTION HIGHLIGHT
    // ========================================================

    if (
        selectedTileRef
    ) {

        drawHexHighlight(
            ctx,
            selectedTileRef,
            "#f5c542",
            0.8,
            2.8
        );

    }

    // ========================================================
    // CITIES
    // ========================================================

    drawCities(
        ctx,
        hoveredTileRef
    );


    // ========================================================
    // ARMIES
    // ========================================================

    drawArmies(
        ctx,
        hoveredTileRef,
        performance.now() / 1000
    );


    // ========================================================
    // INNER FRAME BORDER
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


    // ========================================================
    // OUTER FRAME BORDER
    // ========================================================

    ctx.strokeStyle =
        FRAME_COLOR;


    ctx.lineWidth =
        FRAME_WIDTH /
        camera.zoom;


    ctx.strokeRect(

        -OUTER_FRAME_OVERHANG,

        -OUTER_FRAME_OVERHANG,

        MAP_WIDTH +
        OUTER_FRAME_OVERHANG * 2,

        MAP_HEIGHT +
        OUTER_FRAME_OVERHANG * 2

    );


    ctx.restore();

}
