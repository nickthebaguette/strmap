// ============================================================
// CITIES.JS
// ============================================================

import {
    hexToWorld,
    HEX_SIZE
} from "./map.js";

import {
    camera
} from "./camera.js";


export const cities = [];

let nextCityId = 1;


const cityImage =
    new Image();

cityImage.src =
    "icons/cities/city.png";


// ============================================================
// CITY MARKER SIZE
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
//
// hoveredTile is optional. When provided, the city on that
// tile is drawn larger.
//
// ============================================================

export function drawCities(
    ctx,
    hoveredTile = null
) {

    for (
        const city of cities
    ) {

        const world =
            hexToWorld(
                city.col,
                city.row
            );


        const isHovered =

            hoveredTile !== null &&
            hoveredTile.col === city.col &&
            hoveredTile.row === city.row;


        const size =
            isHovered
                ? CITY_SIZE * 1.25
                : CITY_SIZE;


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


        if (
            cityImage.complete &&
            cityImage.naturalWidth > 0
        ) {

            drawImageContain(
                ctx,
                cityImage,
                world.x,
                world.y,
                size
            );

        }

        else {

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


        ctx.restore();


        // ----------------------------------------------------
        // CITY NAME
        // ----------------------------------------------------

        if (
            city.name &&
            city.name !== "Unnamed City"
        ) {

            ctx.save();


            ctx.font =
                `${12 / camera.zoom}px Georgia, serif`;


            ctx.fillStyle =
                "#d8c9a0";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "top";


            ctx.shadowColor =
                "rgba(0, 0, 0, 0.7)";


            ctx.shadowBlur =
                4;


            ctx.shadowOffsetX =
                0;


            ctx.shadowOffsetY =
                1;


            ctx.fillText(
                city.name,
                world.x,
                world.y + size / 2 + 4
            );


            ctx.restore();

        }

    }

}


// ============================================================
// DRAW IMAGE WITH CONTAIN BEHAVIOUR
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
