// ============================================================
// ARMIES.JS
// ============================================================

import {
    hexToWorld
} from "./map.js";


// ============================================================
// ARMIES
// ============================================================

export const armies = [];


// ============================================================
// ARMY ICON CACHE
// ============================================================

const iconCache = {};


// ============================================================
// LOAD ICON
// ============================================================

function getArmyIcon(
    path
) {

    if (
        !path
    ) {

        return null;

    }


    // Already loaded / loading.

    if (
        iconCache[path]
    ) {

        return iconCache[path];

    }


    const image =
        new Image();

    image.src =
        path;


    iconCache[path] =
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


        const size =
            22;


        const icon =
            getArmyIcon(
                army.icon
            );


        // ----------------------------------------------------
        // ICON
        // ----------------------------------------------------

        if (
            icon &&
            icon.complete &&
            icon.naturalWidth > 0
        ) {

            ctx.drawImage(

                icon,

                world.x -
                size / 2,

                world.y -
                size / 2,

                size,

                size

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

                icon:
                    armyData.icon ||
                    "icons/armies/army.png",

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

                    icon:
                        army.icon,

                    col:
                        army.col,

                    row:
                        army.row

                })
            )

    };

}

