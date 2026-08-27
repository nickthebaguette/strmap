// ============================================================
// BACKGROUND MUSIC
// ============================================================

const MUSIC_FILE = "theme.mp3";

// Volume: 0.0 = silent, 1.0 = maximum
const MUSIC_VOLUME = 0.25;

// Don't randomly start in the final 5 minutes.
const MINIMUM_REMAINING_TIME = 300;


// ============================================================
// AUDIO
// ============================================================

const backgroundMusic = new Audio();

backgroundMusic.src = MUSIC_FILE;

backgroundMusic.preload = "auto";

backgroundMusic.volume = MUSIC_VOLUME;


// ============================================================
// STATE
// ============================================================

let randomStartChosen = false;


// ============================================================
// CHOOSE RANDOM START
// ============================================================

function chooseRandomStart() {

    const duration =
        backgroundMusic.duration;


    if (
        !Number.isFinite(duration) ||
        duration <= 0
    ) {

        console.log(
            "Music duration not available yet."
        );

        return false;
    }


    const maximumStart =
        Math.max(
            0,
            duration -
            MINIMUM_REMAINING_TIME
        );


    const randomPosition =
        Math.random() *
        maximumStart;


    backgroundMusic.currentTime =
        randomPosition;


    randomStartChosen = true;


    console.log(
        "Music random start:",
        Math.floor(randomPosition),
        "seconds of",
        Math.floor(duration),
        "seconds"
    );


    return true;
}


// ============================================================
// START MUSIC
// ============================================================

async function startMusic() {

    console.log(
        "Attempting to start music..."
    );


    // If we haven't selected a starting position yet,
    // try to do so now.

    if (!randomStartChosen) {

        chooseRandomStart();

    }


    try {

        await backgroundMusic.play();


        console.log(
            "Music is playing!"
        );

    }

    catch (error) {

        console.log(
            "Browser blocked autoplay:",
            error
        );

    }

}


// ============================================================
// AUDIO LOADED
// ============================================================

backgroundMusic.addEventListener(
    "loadedmetadata",
    () => {

        console.log(
            "Music metadata loaded."
        );


        chooseRandomStart();


        // Try autoplay.

        startMusic();

    }
);


// ============================================================
// AUDIO CAN PLAY
// ============================================================

backgroundMusic.addEventListener(
    "canplay",
    () => {

        console.log(
            "Music can play."
        );

    }
);


// ============================================================
// AUDIO ERROR
// ============================================================

backgroundMusic.addEventListener(
    "error",
    () => {

        console.error(
            "Could not load music file:",
            MUSIC_FILE,
            backgroundMusic.error
        );

    }
);


// ============================================================
// MUSIC ENDS
// ============================================================
//
// When the long track reaches its end,
// choose another random position rather than
// restarting at 0:00.
//

backgroundMusic.addEventListener(
    "ended",
    () => {

        console.log(
            "Music ended. Choosing another random position."
        );


        randomStartChosen = false;


        chooseRandomStart();


        startMusic();

    }
);


// ============================================================
// USER INTERACTION
// ============================================================
//
// Browsers generally allow audio after the user
// interacts with the page.
//

function userInteracted() {

    console.log(
        "User interaction detected."
    );


    // At this point the audio element should be
    // allowed to play.

    if (!randomStartChosen) {

        chooseRandomStart();

    }


    startMusic();


    // We only need this once.

    document.removeEventListener(
        "click",
        userInteracted
    );

    document.removeEventListener(
        "keydown",
        userInteracted
    );

    document.removeEventListener(
        "pointerdown",
        userInteracted
    );

}


// ============================================================
// INTERACTION LISTENERS
// ============================================================

document.addEventListener(
    "click",
    userInteracted
);

document.addEventListener(
    "keydown",
    userInteracted
);

document.addEventListener(
    "pointerdown",
    userInteracted
);


// ============================================================
// INITIALIZE
// ============================================================

console.log(
    "Music system initialized."
);

console.log(
    "Loading:",
    MUSIC_FILE
);
