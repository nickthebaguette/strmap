// ============================================================
// CITIES.JS
// ============================================================

import {
    hexToWorld,
    HEX_SIZE
} from "./map.js";


export const cities = [];

let nextCityId = 1;


const cityImage =
    new Image();

cityImage.src =
    "icons/cities/city.png";


// ============================================================
// CITY MARKER SIZE
// ============================================================
//
// Cities should feel substantial but not overwhelm the hex.
//
// A city marker slightly smaller than the full hex width
// reads as a major settlement without hiding the terrain
// underneath.
//
// ============================================================

const CITY_SIZE =
    HEX_SIZE * 1.6;


// ============================================================
// LOAD
// ============================================================

export async function loadCities() {

    try {

        const response =
            await fetch(
                "data/cities.json"
            );


        if (!response.ok) {

            return;

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data.cities)
        ) {

            return;

        }


        cities.length = 0;


        for (
            const city of data.cities
        ) {

            if (
                !Number.isInteger(
                    Number(city.col)
                ) ||
                !Number.isInteger(
                    Number(city.row)
                )
            ) {

                continue;

            }


            cities.push({

                id:
                    Number(city.id),

                name:
                    city.name ||
                    "Unnamed City",

                country:
                    city.country ||
                    "ocean",

                col:
                    Number(city.col),

                row:
                    Number(city.row)

            });

        }


        if (
            cities.length > 0
        ) {

            nextCityId =
                Math.max(
                    ...cities.map(
                        city => city.id
                    )
                ) + 1;

        }

    }

    catch (error) {

        console.log(
            "No cities.json found."
        );

    }

}


// ============================================================
// ADD
// ============================================================

export function addCity(
    name,
    country,
    col,
    row
) {

    const city = {

        id: nextCityId++,

        name,

        country,

        col,

        row

    };


    cities.push(city);

    return city;

}


// ============================================================
// DRAW
// ============================================================

export function drawCities(
    ctx
) {

    for (
        const city of cities
    ) {

        const world =
            hexToWorld(
                city.col,
                city.row
            );


        const size =
            CITY_SIZE;


        if (
            cityImage.complete &&
            cityImage.naturalWidth > 0
        ) {

            // ----------------------------------------------------
            // Draw city image with contain behaviour.
            //
            // This prevents stretching if the source image is
            // not perfectly square.
            //
            // ----------------------------------------------------

            drawImageContain(
                ctx,
                cityImage,
                world.x,
                world.y,
                size
            );

        }

        else {

            // ----------------------------------------------------
            // Fallback: simple circle marker
            // ----------------------------------------------------

            ctx.beginPath();

            ctx.arc(
                world.x,
                world.y,
                size * 0.25,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#d8c9a0";

            ctx.fill();

        }

    }

}


// ============================================================
// DRAW IMAGE WITH CONTAIN BEHAVIOUR
// ============================================================
//
// Draws an image inside a square box while preserving its
// aspect ratio. The image is centred within the box.
//
// This is the canvas equivalent of:
//
//     object-fit: contain;
//     object-position: center;
//
// ============================================================

function drawImageContain(
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
// JSON
// ============================================================

export function createCitiesJSON() {

    return {

        cities:
            cities.map(city => ({

                id: city.id,

                name: city.name,

                country: city.country,

                col: city.col,

                row: city.row

            }))

    };

}
