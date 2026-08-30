// ============================================================
// COUNTRYFLAGS.JS
// ============================================================
//
// Handles country flag paths.
//
// Flags currently use the army icon directory:
//
//     assets/icons/armies/france.png
//     assets/icons/armies/austria.png
//     assets/icons/armies/prussia.png
//
// The filename must match the country ID used by map.js.
//
// ============================================================

// ============================================================
// FLAG DIRECTORY
// ============================================================

const FLAG_DIRECTORY =
"icons/armies/";

// ============================================================
// GET COUNTRY FLAG PATH
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
// SET COUNTRY FLAG
// ============================================================
//
// Updates an <img> element with the appropriate country flag.
//
// If the flag doesn't exist, the image is hidden instead of
// showing a broken-image icon.
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


// --------------------------------------------------------
// No flag
// --------------------------------------------------------

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


// --------------------------------------------------------
// Loading
// --------------------------------------------------------

image.onload =
    () => {

        image.style.display =
            "block";

    };


// --------------------------------------------------------
// Failed loading
// --------------------------------------------------------

image.onerror =
    () => {

        console.warn(
            `Could not load country flag: ${path}`
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
