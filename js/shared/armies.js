// ============================================================
// ARMIES.JS
// ============================================================

import {
    hexToWorld
} from "./map.js";


export const armies = [];

let nextArmyId = 1;


// ============================================================
// LOAD
// ============================================================

export async function loadArmies() {

    try {

        const response =
            await fetch(
                "data/armies.json"
            );


        if (!response.ok) {

            return;

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data.armies)
        ) {

            return;

        }


        armies.length = 0;


        for (
            const armyData of data.armies
        ) {

            if (
                !Number.isInteger(
                    Number(armyData.col)
                ) ||
                !Number.isInteger(
                    Number(armyData.row)
                )
            ) {

                continue;

            }


            const army = {

                id:
                    Number(armyData.id),

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
                    Number(
                        armyData.col
                    ),

                row:
                    Number(
                        armyData.row
                    )

            };


            army.iconImage =
                new Image();

            army.iconImage.src =
                army.icon;


            armies.push(army);

        }


        if (
            armies.length > 0
        ) {

            nextArmyId =
                Math.max(
                    ...armies.map(
                        army => army.id
                    )
                ) + 1;

        }

    }

    catch (error) {

        console.log(
            "No armies.json found."
        );

    }

}


// ============================================================
// ADD
// ============================================================

export function addArmy(
    name,
    country,
    strength,
    icon,
    col,
    row
) {

    const army = {

        id: nextArmyId++,

        name,

        country,

        strength,

        icon,

        col,

        row

    };


    army.iconImage =
        new Image();

    army.iconImage.src =
        icon;


    armies.push(army);

    return army;

}


// ============================================================
// DRAW
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


        const size = 22;


        if (
            army.iconImage &&
            army.iconImage.complete &&
            army.iconImage.naturalWidth > 0
        ) {

            ctx.drawImage(

                army.iconImage,

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
                "#ffffff";

            ctx.fill();

        }

    }

}


// ============================================================
// JSON
// ============================================================

export function createArmiesJSON() {

    return {

        armies:
            armies.map(army => ({

                id: army.id,

                name: army.name,

                country: army.country,

                strength: army.strength,

                icon: army.icon,

                col: army.col,

                row: army.row

            }))

    };

}
