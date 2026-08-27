// ============================================================
// CITIES.JS
// ============================================================

import {
    hexToWorld
} from "./map.js";


export const cities = [];

let nextCityId = 1;


const cityImage =
    new Image();

cityImage.src =
    "icons/cities/city.png";


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


        const size = 22;


        if (
            cityImage.complete &&
            cityImage.naturalWidth > 0
        ) {

            ctx.drawImage(

                cityImage,

                world.x - size / 2,

                world.y - size / 2,

                size,

                size

            );

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
                "#d8c9a0";

            ctx.fill();

        }

    }

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
