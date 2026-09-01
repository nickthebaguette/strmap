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


// ============================================================
// CITIES ARRAY
// ============================================================

export const cities = [];

let nextCityId = 1;


// ============================================================
// MAJOR CITIES
// ============================================================
//
// Cities in this list are drawn with city.png and their
// names are always shown on the map.
//
// All other cities are treated as villages, drawn with
// village.png, and their names only show on hover/selection.
//
// Add or remove city names here to change which cities
// appear as major cities.
//
// ============================================================

export const MAJOR_CITIES = new Set([

    "Paris",
    "London",
    "Madrid",
    "Lisbon",
    "Berlin",
    "Vienna",
    "Moscow",
    "St. Petersburg",
    "Stockholm",
    "Copenhagen",
    "Rome",
    "Naples",
    "Constantinople",
    "Amsterdam",
    "Brussels",
    "Warsaw",
    "Munich",
    "Dresden",
    "Milan",
    "Venice"

]);


// ============================================================
// CITY IMAGES
// ============================================================

const cityImage =
    new Image();

cityImage.src =
    "icons/cities/city.png";


const villageImage =
    new Image();

villageImage.src =
    "icons/cities/village.png";


// ============================================================
// CITY SIZE
// ============================================================
//
// Different scaling for city vs village icons.
//
// ============================================================

const CITY_SIZE =
    HEX_SIZE * 1.4;


const VILLAGE_SIZE =
    HEX_SIZE * 1.0;


// ============================================================
// CHECK IF CITY IS MAJOR
// ============================================================

export function isMajorCity(
    city
) {

    return MAJOR_CITIES.has(
        city.name
    );

}


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
                    Number(city.row),

                major:
                    MAJOR_CITIES.has(
                        city.name ||
                        "Unnamed City"
                    )

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

        row,

        major:
            MAJOR_CITIES.has(name)

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
// selectedTile is optional. When provided, the city on that
// tile is drawn larger and its name is shown.
//
// ============================================================

export function drawCities(
    ctx,
    hoveredTile = null,
    selectedTile = null
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


        const isSelected =

            selectedTile !== null &&
            selectedTile.col === city.col &&
            selectedTile.row === city.row;


        const baseSize =
            city.major
                ? CITY_SIZE
                : VILLAGE_SIZE;


        const size =
            (isHovered || isSelected)
                ? baseSize * 1.25
                : baseSize;


        const image =
            city.major
                ? cityImage
                : villageImage;


        ctx.save();


        // ----------------------------------------------------
        // DROP SHADOW
        // ----------------------------------------------------

        ctx.shadowColor =
            "rgba(0, 0, 0, 0.55)";


        ctx.shadowBlur =
            (isHovered || isSelected) ? 12 : 8;


        ctx.shadowOffsetX =
            0;


        ctx.shadowOffsetY =
            3;


        if (
            image.complete &&
            image.naturalWidth > 0
        ) {

            drawImageContain(
                ctx,
                image,
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
        //
        // Major cities: always show name.
        // Villages: only show name when hovered or selected.
        //
        // ----------------------------------------------------

        const showName =

            city.major ||
            isHovered ||
            isSelected;


        if (
            showName &&
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
