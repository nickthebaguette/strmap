// ============================================================
// COUNTRYFLAGS.JS
// ============================================================
//
// Handles country flag paths and flag loading.
//
// Flags are currently stored alongside army assets:
//
//     assets/icons/armies/france.png
//     assets/icons/armies/austria.png
//     assets/icons/armies/prussia.png
//
// The filename must match the country ID from map.js.
//
// ============================================================


// ============================================================
// FLAG DIRECTORY
// ============================================================

const FLAG_DIRECTORY =
    "assets/icons/armies/";


// ============================================================
// GET FLAG PATH
// ============================================================

export function getCountryFlagPath(
    countryId
) {

    if (
        !countryId ||
        countryId === "ocean"
    ) {

        return null;

    }


    return (
        FLAG_DIRECTORY +
        countryId.toLowerCase() +
        ".png"
    );

}


// ============================================================
// APPLY FLAG TO IMAGE
// ============================================================
//
// Sets the image source and handles missing flags.
//
// ============================================================

export function setCountryFlag(
    image,
    countryId
) {

    if (
        !image
    ) {

        return;

    }


    const path =
        getCountryFlagPath(
            countryId
        );


    if (
        !path
    ) {

        image.removeAttribute(
            "src"
        );

        image.style.display =
            "none";

        return;

    }


    image.onload =
        () => {

            image.style.display =
                "block";

        };


    image.onerror =
        () => {

            console.warn(
                `Could not load flag for country: ${countryId}`
            );

            image.removeAttribute(
                "src"
            );

            image.style.display =
                "none";

        };


    image.src =
        path;

}
