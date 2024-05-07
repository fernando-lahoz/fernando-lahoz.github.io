const MAIN_TITLE = document.createElement("div");
MAIN_TITLE.classList.add("title-container");

const TITLE = document.createElement("p");
TITLE.classList.add("animated-bloxorz-title");
TITLE.innerText = "BLOXORZ";

MAIN_TITLE.appendChild(TITLE);

const CONGRATS_TITLE = document.createElement("div");
CONGRATS_TITLE.classList.add("title-container");

const CONGRATS = document.createElement("p");
CONGRATS.classList.add("animated-bloxorz-title");
CONGRATS.innerText = "CONGRATULATIONS !!";

CONGRATS_TITLE.appendChild(CONGRATS);

const MAIN_MENU = document.createElement("div");
MAIN_MENU.classList.add("option-container");
MAIN_MENU.style = "position : absolute; top: 62%; left:33%;";

const CREDITS_MENU = MAIN_MENU.cloneNode(true);

const START_NEW_GAME_BUTTON = document.createElement("button");
START_NEW_GAME_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
START_NEW_GAME_BUTTON.innerText = "Start New Game";
START_NEW_GAME_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.main_menu.start_new_game); };
START_NEW_GAME_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
START_NEW_GAME_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }


const LOAD_STAGE_BUTTON = document.createElement("button");
LOAD_STAGE_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
LOAD_STAGE_BUTTON.innerText = "Continue Saved Game";
LOAD_STAGE_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.main_menu.continue); };
LOAD_STAGE_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
LOAD_STAGE_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }

const TOGGLE_SOUND_BUTTON = document.createElement("button");
TOGGLE_SOUND_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
TOGGLE_SOUND_BUTTON.innerText = "Toggle Sound";
TOGGLE_SOUND_BUTTON.onclick = toggle_sound;
TOGGLE_SOUND_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
TOGGLE_SOUND_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }

const CREDITS_BUTTON = document.createElement("button");
CREDITS_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
CREDITS_BUTTON.innerText = "Credits";
CREDITS_BUTTON.onclick = toggle_credits;
CREDITS_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
CREDITS_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }

CREDITS_BUTTON_RETURN = CREDITS_BUTTON.cloneNode(true);
CREDITS_BUTTON_RETURN.innerText = "Return";
CREDITS_BUTTON_RETURN.onclick = toggle_credits;
CREDITS_BUTTON_RETURN.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
CREDITS_BUTTON_RETURN.onmousedown = () => { play_sound(SOUNDS.menu_click); }

const CREDITS = document.createElement("div");
CREDITS.classList.add("bloxorz-text", "credits-content");
CREDITS.innerText = `All audio, puzzles and fonts in Bloxorz created by Damien Clarke, DX Interactive, 21st June 2007, graphics and textures are inspired by the original game.`;

MAIN_MENU.appendChild(START_NEW_GAME_BUTTON);
//MAIN_MENU.appendChild(LOAD_STAGE_BUTTON);
MAIN_MENU.appendChild(TOGGLE_SOUND_BUTTON);
MAIN_MENU.appendChild(CREDITS_BUTTON);

CREDITS_MENU.appendChild(CREDITS_BUTTON_RETURN);

const SELECTOR_COLUMN_CONTAINER = document.createElement("div");
SELECTOR_COLUMN_CONTAINER.classList.add("selector-column-container");
SELECTOR_COLUMN_CONTAINER.style = "position:absolute; bottom : 5%; right : 5%";

const SELECTOR_ROW_CONTAINER = document.createElement("div");
SELECTOR_ROW_CONTAINER.classList.add("selector-row-container");

const NEXT_BUTTON = document.createElement("button");
NEXT_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
NEXT_BUTTON.innerText = "Next >";
const next_button_onclick = () => { event_queue.push(GAME_EVENTS.instructions.next); };

const PREV_BUTTON = document.createElement("button");
PREV_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click", "options-padding");
PREV_BUTTON.innerText = "< Prev";
const prev_button_onclick = () => { event_queue.push(GAME_EVENTS.instructions.prev); };

const SKIP_INSTRUCTIONS_BUTTON = document.createElement("button");
SKIP_INSTRUCTIONS_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click", "left-padding");
SKIP_INSTRUCTIONS_BUTTON.innerText = "Skip Instructions >";

const BACK_TO_MENU_BUTTON = document.createElement("button");
BACK_TO_MENU_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click", "options-padding");
BACK_TO_MENU_BUTTON.innerText = "< Back to Menu";
const back_to_menu_onclick = () => { event_queue.push(GAME_EVENTS.instructions.back_to_menu); };

const START_BUTTON = document.createElement("button");
START_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
START_BUTTON.innerText = "Start >";
const start_button_onclick = () => { event_queue.push(GAME_EVENTS.instructions.start); };

const TUTORIAL_FIRST_PAGE = SELECTOR_COLUMN_CONTAINER.cloneNode(true);
const TUTORIAL_FIRST_PAGE_R1 = SELECTOR_ROW_CONTAINER.cloneNode(true);
const TUTORIAL_FIRST_PAGE_R2 = SELECTOR_ROW_CONTAINER.cloneNode(true);
const NEXT_BUTTON2 = TUTORIAL_FIRST_PAGE_R1.appendChild(NEXT_BUTTON.cloneNode(true));
NEXT_BUTTON2.onclick = next_button_onclick;
NEXT_BUTTON2.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
NEXT_BUTTON2.onmousedown = () => { play_sound(SOUNDS.menu_click); }
const BACK_TO_MENU_BUTTON2 = TUTORIAL_FIRST_PAGE_R2.appendChild(BACK_TO_MENU_BUTTON.cloneNode(true));
BACK_TO_MENU_BUTTON2.onclick = back_to_menu_onclick;
BACK_TO_MENU_BUTTON2.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
BACK_TO_MENU_BUTTON2.onmousedown = () => { play_sound(SOUNDS.menu_click); }
const SKIP_INSTRUCTIONS_BUTTON2 = TUTORIAL_FIRST_PAGE_R2.appendChild(SKIP_INSTRUCTIONS_BUTTON.cloneNode(true));
SKIP_INSTRUCTIONS_BUTTON2.onclick = start_button_onclick;
SKIP_INSTRUCTIONS_BUTTON2.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
SKIP_INSTRUCTIONS_BUTTON2.onmousedown = () => { play_sound(SOUNDS.menu_click); }
TUTORIAL_FIRST_PAGE.appendChild(TUTORIAL_FIRST_PAGE_R1);
TUTORIAL_FIRST_PAGE.appendChild(TUTORIAL_FIRST_PAGE_R2);

const TUTORIAL_PAGE = SELECTOR_COLUMN_CONTAINER.cloneNode(true);
const TUTORIAL_PAGE_R1 = SELECTOR_ROW_CONTAINER.cloneNode(true);
const PREV_BUTTON3 = TUTORIAL_PAGE_R1.appendChild(PREV_BUTTON.cloneNode(true));
PREV_BUTTON3.onclick = prev_button_onclick;
PREV_BUTTON3.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
PREV_BUTTON3.onmousedown = () => { play_sound(SOUNDS.menu_click); }
const NEXT_BUTTON3 = TUTORIAL_PAGE_R1.appendChild(NEXT_BUTTON.cloneNode(true));
NEXT_BUTTON3.onclick = next_button_onclick;
NEXT_BUTTON3.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
NEXT_BUTTON3.onmousedown = () => { play_sound(SOUNDS.menu_click); }
TUTORIAL_PAGE.appendChild(TUTORIAL_PAGE_R1);

const TUTORIAL_LAST_PAGE = SELECTOR_COLUMN_CONTAINER.cloneNode(true);
const TUTORIAL_LAST_PAGE_R1 = SELECTOR_ROW_CONTAINER.cloneNode(true);
const PREV_BUTTON4 = TUTORIAL_LAST_PAGE_R1.appendChild(PREV_BUTTON.cloneNode(true));
PREV_BUTTON4.onclick = prev_button_onclick;
PREV_BUTTON4.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
PREV_BUTTON4.onmousedown = () => { play_sound(SOUNDS.menu_click); }
const START_BUTTON4 = TUTORIAL_LAST_PAGE_R1.appendChild(START_BUTTON.cloneNode(true));
START_BUTTON4.onclick = start_button_onclick;
START_BUTTON4.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
START_BUTTON4.onmousedown = () => { play_sound(SOUNDS.menu_click); }
TUTORIAL_LAST_PAGE.appendChild(TUTORIAL_LAST_PAGE_R1);

const TUTORIAL_LAST_PAGE_INGAME = SELECTOR_COLUMN_CONTAINER.cloneNode(true);
const TUTORIAL_LAST_PAGE_INGAME_R1 = SELECTOR_ROW_CONTAINER.cloneNode(true);
const PREV_BUTTON5 = TUTORIAL_LAST_PAGE_INGAME_R1.appendChild(PREV_BUTTON.cloneNode(true));
PREV_BUTTON5.onclick = prev_button_onclick;
PREV_BUTTON5.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
PREV_BUTTON5.onmousedown = () => { play_sound(SOUNDS.menu_click); }
const RESUME_BUTTON = TUTORIAL_LAST_PAGE_INGAME_R1.appendChild(START_BUTTON.cloneNode(true));
RESUME_BUTTON.textContent = "Back to Game >";
RESUME_BUTTON.onclick = start_button_onclick;
RESUME_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
RESUME_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }
TUTORIAL_LAST_PAGE_INGAME.appendChild(TUTORIAL_LAST_PAGE_INGAME_R1);

const MENU_BUTTON = document.createElement("button");
MENU_BUTTON.classList.add("guid-bloxorz-text", "guid-bloxorz-option", "guid-bloxorz-click");
MENU_BUTTON.style = "position:absolute; top : 5%; left : 5%";
MENU_BUTTON.innerHTML = "Menu";
MENU_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.playing.show_menu); };
MENU_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
MENU_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }

const RETURN_TO_GAME_BUTTON = document.createElement("button");
RETURN_TO_GAME_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
RETURN_TO_GAME_BUTTON.innerText = "Return to Game";
RETURN_TO_GAME_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.ingame_menu.return_to_game); };
RETURN_TO_GAME_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
RETURN_TO_GAME_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }

const QUIT_TO_MENU_BUTTON = document.createElement("button");
QUIT_TO_MENU_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
QUIT_TO_MENU_BUTTON.innerText = "Quit to Menu";
QUIT_TO_MENU_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.ingame_menu.quit_to_menu); };
QUIT_TO_MENU_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
QUIT_TO_MENU_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }

const SHOW_INSTRUCTIONS_BUTTON = document.createElement("button");
SHOW_INSTRUCTIONS_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
SHOW_INSTRUCTIONS_BUTTON.innerText = "Show Instructions";
SHOW_INSTRUCTIONS_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.ingame_menu.show_instructions); };
SHOW_INSTRUCTIONS_BUTTON.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
SHOW_INSTRUCTIONS_BUTTON.onmousedown = () => { play_sound(SOUNDS.menu_click); }

const GUID_MENU = document.createElement("div");
GUID_MENU.classList.add("guid-container");

GUID_MENU.appendChild(RETURN_TO_GAME_BUTTON);
const TOGGLE_SOUND_BUTTON2 = GUID_MENU.appendChild(TOGGLE_SOUND_BUTTON.cloneNode(true));
TOGGLE_SOUND_BUTTON2.onclick = toggle_sound;
TOGGLE_SOUND_BUTTON2.onmouseover = () => { play_sound(SOUNDS.menu_hover); }
TOGGLE_SOUND_BUTTON2.onmousedown = () => { play_sound(SOUNDS.menu_click); }
GUID_MENU.appendChild(SHOW_INSTRUCTIONS_BUTTON);
GUID_MENU.appendChild(QUIT_TO_MENU_BUTTON);

const STAGE_TITLE = document.createElement("div");
STAGE_TITLE.classList.add("title-container");
const STAGE = document.createElement("p");
STAGE.classList.add("animated-bloxorz-title", "options-padding");
STAGE.innerText = "STAGE";
const NUMBER = document.createElement("p");
NUMBER.classList.add("bloxorz-title");
NUMBER.innerText = "01";

STAGE_TITLE.appendChild(STAGE);
STAGE_TITLE.appendChild(NUMBER);

const INFORMATION_PANEL = document.createElement("div");
INFORMATION_PANEL.classList.add("info-container");
INFORMATION_PANEL.style = "position: absolute; top: 5%; right: 5%";

const INFO_TEXT = document.createElement("Button");
INFO_TEXT.classList.add("guid-bloxorz-text");
INFO_TEXT.style = "line-height: 90%";

const INFORMATION_PANEL_C1 = document.createElement("div");
INFORMATION_PANEL_C1.classList.add("info-container-column", "options-padding");
const INFO_TITLE_TIME = INFO_TEXT.cloneNode(true);
INFO_TITLE_TIME.innerText = "Time:"
const INFO_TITLE_MOVES = INFO_TEXT.cloneNode(true);
INFO_TITLE_MOVES.innerText = "Moves:"
const INFO_TITLE_ATTEMPTS = INFO_TEXT.cloneNode(true);
INFO_TITLE_ATTEMPTS.innerText = "Attempts:"

INFORMATION_PANEL_C1.appendChild(INFO_TITLE_TIME);
INFORMATION_PANEL_C1.appendChild(INFO_TITLE_MOVES);
INFORMATION_PANEL_C1.appendChild(INFO_TITLE_ATTEMPTS);

const INFORMATION_PANEL_C2 = document.createElement("div");
INFORMATION_PANEL_C2.classList.add("info-container-column");

const CONTAINER = document.createElement("div");
CONTAINER.classList.add("container");

const DIGIT_CONTAINER = document.createElement("button");
DIGIT_CONTAINER.classList.add("guid-bloxorz-text", "digit-container");
DIGIT_CONTAINER.style="line-height: 90%";
DIGIT_CONTAINER.innerHTML = " ";

const INFO_TIME = CONTAINER.cloneNode(true);

const H2 = DIGIT_CONTAINER.cloneNode(true);
const H1 = DIGIT_CONTAINER.cloneNode(true);
const SEP1 = DIGIT_CONTAINER.cloneNode(true);
SEP1.innerHTML = ":";
const M2 = DIGIT_CONTAINER.cloneNode(true);
const M1 = DIGIT_CONTAINER.cloneNode(true);
const SEP2 = DIGIT_CONTAINER.cloneNode(true);
SEP2.innerHTML = ":";
const S2 = DIGIT_CONTAINER.cloneNode(true);
const S1 = DIGIT_CONTAINER.cloneNode(true);

INFO_TIME.appendChild(H2);
INFO_TIME.appendChild(H1);
INFO_TIME.appendChild(SEP1);
INFO_TIME.appendChild(M2);
INFO_TIME.appendChild(M1);
INFO_TIME.appendChild(SEP2);
INFO_TIME.appendChild(S2);
INFO_TIME.appendChild(S1);

const INFO_MOVES = CONTAINER.cloneNode(true);

const MOV7 = DIGIT_CONTAINER.cloneNode(true);
const MOV6 = DIGIT_CONTAINER.cloneNode(true);
const MOV5 = DIGIT_CONTAINER.cloneNode(true);
const MOV4 = DIGIT_CONTAINER.cloneNode(true);
const MOV3 = DIGIT_CONTAINER.cloneNode(true);
const MOV2 = DIGIT_CONTAINER.cloneNode(true);
const MOV1 = DIGIT_CONTAINER.cloneNode(true);
const MOV0 = DIGIT_CONTAINER.cloneNode(true);

INFO_MOVES.appendChild(MOV7);
INFO_MOVES.appendChild(MOV6);
INFO_MOVES.appendChild(MOV5);
INFO_MOVES.appendChild(MOV4);
INFO_MOVES.appendChild(MOV3);
INFO_MOVES.appendChild(MOV2);
INFO_MOVES.appendChild(MOV1);
INFO_MOVES.appendChild(MOV0);

const MOV_ARRAY = [MOV0, MOV1, MOV2, MOV3, MOV4, MOV5, MOV6, MOV7];

const INFO_ATTEMPTS = CONTAINER.cloneNode(true);

const ATTMP7 = DIGIT_CONTAINER.cloneNode(true);
const ATTMP6 = DIGIT_CONTAINER.cloneNode(true);
const ATTMP5 = DIGIT_CONTAINER.cloneNode(true);
const ATTMP4 = DIGIT_CONTAINER.cloneNode(true);
const ATTMP3 = DIGIT_CONTAINER.cloneNode(true);
const ATTMP2 = DIGIT_CONTAINER.cloneNode(true);
const ATTMP1 = DIGIT_CONTAINER.cloneNode(true);
const ATTMP0 = DIGIT_CONTAINER.cloneNode(true);

INFO_ATTEMPTS.appendChild(ATTMP7);
INFO_ATTEMPTS.appendChild(ATTMP6);
INFO_ATTEMPTS.appendChild(ATTMP5);
INFO_ATTEMPTS.appendChild(ATTMP4);
INFO_ATTEMPTS.appendChild(ATTMP3);
INFO_ATTEMPTS.appendChild(ATTMP2);
INFO_ATTEMPTS.appendChild(ATTMP1);
INFO_ATTEMPTS.appendChild(ATTMP0);

const ATTMP_ARRAY = [ATTMP0, ATTMP1, ATTMP2, ATTMP3, ATTMP4, ATTMP5, ATTMP6, ATTMP7];

INFORMATION_PANEL_C2.appendChild(INFO_TIME);
INFORMATION_PANEL_C2.appendChild(INFO_MOVES);
INFORMATION_PANEL_C2.appendChild(INFO_ATTEMPTS);

INFORMATION_PANEL.appendChild(INFORMATION_PANEL_C1);
INFORMATION_PANEL.appendChild(INFORMATION_PANEL_C2);

const STAGE_INFO_PANEL = document.createElement("div");
STAGE_INFO_PANEL.classList.add("info-container");
STAGE_INFO_PANEL.style = "position: absolute; bottom: 5%; right: 5%";

const STAGE_INFO_PANEL_C1 = document.createElement("div");
STAGE_INFO_PANEL_C1.classList.add("info-container-column", "options-padding");

const INFO_TITLE_STAGE = INFO_TEXT.cloneNode(true);
INFO_TITLE_STAGE.innerText = "Stage:";

STAGE_INFO_PANEL_C1.appendChild(INFO_TITLE_STAGE);

const STAGE_INFO_PANEL_C2 = document.createElement("div");
STAGE_INFO_PANEL_C2.classList.add("info-container-column");

const INFO_STAGE = CONTAINER.cloneNode(true);
const STG1 = DIGIT_CONTAINER.cloneNode(true);
const STG0 = DIGIT_CONTAINER.cloneNode(true);

INFO_STAGE.appendChild(STG1);
INFO_STAGE.appendChild(STG0);

STAGE_INFO_PANEL_C2.appendChild(INFO_STAGE);

STAGE_INFO_PANEL.appendChild(STAGE_INFO_PANEL_C1);
STAGE_INFO_PANEL.appendChild(STAGE_INFO_PANEL_C2);

const TUTORIAL_INFO = document.createElement("div");
TUTORIAL_INFO.classList.add("tutorial-container");
const TUTORIAL_TEXT = document.createElement("p");
TUTORIAL_TEXT.classList.add("bloxorz-text", "left-padding");
TUTORIAL_TEXT.style = "width:65%";


const TUTORIAL_IMAGE = document.createElement("img");
//TUTORIAL_IMAGE.classList.add("right-padding");
TUTORIAL_IMAGE.style = "height:100%;";
TUTORIAL_IMAGE.title = "Wireframe";
TUTORIAL_IMAGE.src = "./assets/images/tutorial-1.png";

TUTORIAL_INFO.appendChild(TUTORIAL_TEXT);
TUTORIAL_INFO.appendChild(TUTORIAL_IMAGE);

const REMINDER_PANEL = document.createElement("div");
REMINDER_PANEL.classList.add("reminder-container", "reminder-text");
const REMINDER_PARAGRAPH = document.createElement("p");

REMINDER_PANEL.appendChild(REMINDER_PARAGRAPH);

//--- MENU ---------------------------------------------------------------------

let continue_showed = false;
let game_window;

function init_menu() {
    game_window = document.getElementById("game-window");    
}

function show_main_menu(enable_continue) {
    game_window.appendChild(MAIN_TITLE);

    if (enable_continue && !continue_showed) {
        MAIN_MENU.removeChild(TOGGLE_SOUND_BUTTON);
        MAIN_MENU.removeChild(CREDITS_BUTTON);
        MAIN_MENU.appendChild(LOAD_STAGE_BUTTON);
        MAIN_MENU.appendChild(TOGGLE_SOUND_BUTTON);
        MAIN_MENU.appendChild(CREDITS_BUTTON);
    }
    else if (!enable_continue && continue_showed) {
        MAIN_MENU.removeChild(LOAD_STAGE_BUTTON);
    }

    continue_showed = enable_continue;
    
    game_window.appendChild(MAIN_MENU);
}

function hide_main_menu() {
    game_window.removeChild(MAIN_TITLE);
    game_window.removeChild(MAIN_MENU);
}

let credits_shown = false;
function toggle_credits() {
    if(credits_shown){
        credits_shown = false;
        game_window.removeChild(MAIN_TITLE);
        game_window.removeChild(CREDITS_MENU);
        game_window.removeChild(CREDITS);
        show_main_menu(continue_showed);
    }else{
        credits_shown = true;
        hide_main_menu();
        game_window.appendChild(MAIN_TITLE);
        game_window.appendChild(CREDITS_MENU);
        game_window.appendChild(CREDITS);
    }
}

//--- INSTRUCTIONS -------------------------------------------------------------

const TUTORIAL_PAGE_TEXT = [
    `1/10
    
    The aim of the game is to get the block to fall
    into the square hole at the end of each stage.
    There are 33 stages to complete.`,
    `2/10

    To move the block around the world,
    use the left right up and down arrow keys.

    Be careful not to fall off the edges -
    the level will be restarted if this happens.`,
    `3/10

    Use W, A, S and D to control the camera around
    the stage. Zoom in/out with +/-. You can reset
    camera to default perspective pressing K.
    
    You can reset level pressing L. This will
    not account for an attempt.`,
    `4/10

    Bridges and switches are located in many
    levels. The switches are activated when they
    are pressed down by the block.
    
    You do not need to stay resting on the switch
    to keep bridges closed.`,
    `5/10

    There are two types of switches:
    'Heavy' X-shaped ones and 'Soft' round ones.
    
    Soft switches are activated when any part of
    your block presses it. Hard switches require
    much more pressure, so your block must rest
    vertically on them to activate.`,
    `6/10

    When activated, each switch may behave
    differently. Some will swap the bridges from
    open to closed to open each time it is used.
    Some will only ever make certain bridges open,
    and activating it again will not make it close.
    
    Green or red coloured squares will flash to
    indicate which bridges are being operated.`,
    `7/10
    
    Orange tiles are more fragile than the rest of
    the land.
    
    If your block stands up vertically on
    an orange tile, tile will give way and your
    block will fall.`,
    `8/10
    
    Finally is a third type of switch shaped
    like a cut circumference.
    
    It teleports your block to different locations
    splitting it into two smaller blocks at the
    same time. These can be controlled individually
    and will rejoin a normal block when both
    are placed next to each other.`,
    `9/10
    
    You can select which small block to use at any
    time by pressing the spacebar.
    
    Small blocks can still operate soft switches,
    but they aren't big enough to activate heavy
    switches. Also small blocks cannot go through
    the exit hole - only a complete block can finish
    the stage.`,
    `10/10
    
    The game is automatically saved to be
    restored from the main menu by clicking on
    'Continue Saved Game'.
    
    Be sure local storage is enabled in your
    browser, otherwise it won't be able to save
    your current game.`,
];

const TUTORIAL_PAGE_TEXT_MOBILE = [
    TUTORIAL_PAGE_TEXT[0],
    `2/10

    To move the block around the world,
    flick left, right, up and down on the screen.
    You can get a fluid movement if you drag instead.

    Be careful not to fall off the edges -
    the level will be restarted if this happens.`,
    `3/10

    Drag while pressing with other finger to control
    the camera. Pinch with two fingers to zoom in/out.
    Pressing with both fingers for an extended time
    will reset the camera.`,
    TUTORIAL_PAGE_TEXT[3],
    TUTORIAL_PAGE_TEXT[4],
    TUTORIAL_PAGE_TEXT[5],
    TUTORIAL_PAGE_TEXT[6],
    TUTORIAL_PAGE_TEXT[7],
    `9/10
    
    You can select which small block to use at any
    time by double tapping.
    
    Small blocks can still operate soft switches,
    but they aren't big enough to activate heavy
    switches. Also small blocks cannot go through
    the exit hole - only a complete block can finish
    the stage.`,
    TUTORIAL_PAGE_TEXT[9],
];

const REMINDER_TEXT = [
    `Use the up, down, left and right arrow keys to move your block around.
    Use W, A, S and D to control the camera. Zoom in/out with +/-.
    Reset camera and level pressing K and L respectively.`,
    `Remember to use the Spacebar to toggle between the two small blocks.`
]

const REMINDER_TEXT_MOBILE = [
    `Flick up, down, left and right to move your block around. 
    Drag while pressing with other finger to control the camera.
    Pinch with two fingers to zoom in/out.
    Pressing with both fingers for an extended time will reset the camera.`,
    `Remember to double tap to toggle between the two small blocks.`
]

let tutorial_page = 0;

function show_instructions() {
    tutorial_page = 1;
    TUTORIAL_TEXT.innerText = is_mobile ? TUTORIAL_PAGE_TEXT_MOBILE[tutorial_page - 1] : TUTORIAL_PAGE_TEXT[tutorial_page - 1];
    game_window.appendChild(TUTORIAL_FIRST_PAGE);
    game_window.appendChild(TUTORIAL_INFO);
    TUTORIAL_IMAGE.src = `assets/images/tutorial-${tutorial_page}.png`;
}

function next_instructions_page() {
    if (tutorial_page === TUTORIAL_PAGE_TEXT.length)
        return;

    if (tutorial_page === 1) {
        game_window.removeChild(TUTORIAL_FIRST_PAGE);
        game_window.appendChild(TUTORIAL_PAGE);
    }
    tutorial_page += 1;
    if (tutorial_page === TUTORIAL_PAGE_TEXT.length) {
        game_window.removeChild(TUTORIAL_PAGE);
        game_window.appendChild(TUTORIAL_LAST_PAGE);
    }
    TUTORIAL_TEXT.innerText = is_mobile ? TUTORIAL_PAGE_TEXT_MOBILE[tutorial_page - 1] : TUTORIAL_PAGE_TEXT[tutorial_page - 1];
    TUTORIAL_IMAGE.src = `assets/images/tutorial-${tutorial_page}.png`;
}

function prev_instructions_page() {
    if (tutorial_page === 1)
        return;
    
    if (tutorial_page === TUTORIAL_PAGE_TEXT.length) {
        game_window.removeChild(TUTORIAL_LAST_PAGE);
        game_window.appendChild(TUTORIAL_PAGE);
    }
    tutorial_page -= 1;
    if (tutorial_page === 1) {
        game_window.removeChild(TUTORIAL_PAGE);
        game_window.appendChild(TUTORIAL_FIRST_PAGE);
    }
    TUTORIAL_TEXT.innerText = is_mobile ? TUTORIAL_PAGE_TEXT_MOBILE[tutorial_page - 1] : TUTORIAL_PAGE_TEXT[tutorial_page - 1];
    TUTORIAL_IMAGE.src = `assets/images/tutorial-${tutorial_page}.png`;
}

function hide_instructions() {
    if (tutorial_page === 1) {
        game_window.removeChild(TUTORIAL_FIRST_PAGE);
    }
    else if (tutorial_page === TUTORIAL_PAGE_TEXT.length) {
        game_window.removeChild(TUTORIAL_LAST_PAGE);
    }
    else {
        game_window.removeChild(TUTORIAL_PAGE);
    }

    game_window.removeChild(TUTORIAL_INFO);
}

//--- INGAME INSTRUCTIONS ------------------------------------------------------

function show_ingame_instructions() {
    tutorial_page = 1;
    TUTORIAL_TEXT.innerText = is_mobile ? TUTORIAL_PAGE_TEXT_MOBILE[tutorial_page - 1] : TUTORIAL_PAGE_TEXT[tutorial_page - 1];
    game_window.appendChild(TUTORIAL_PAGE);
    game_window.appendChild(TUTORIAL_INFO);
    TUTORIAL_PAGE_R1.removeChild(PREV_BUTTON3);
    TUTORIAL_IMAGE.src = `assets/images/tutorial-${tutorial_page}.png`;
}

function next_ingame_instructions_page() {
    if (tutorial_page === TUTORIAL_PAGE_TEXT.length)
        return;

    if (tutorial_page === 1) {
        TUTORIAL_PAGE_R1.removeChild(NEXT_BUTTON3);
        TUTORIAL_PAGE_R1.appendChild(PREV_BUTTON3);
        TUTORIAL_PAGE_R1.appendChild(NEXT_BUTTON3);
    }

    tutorial_page += 1;
    if (tutorial_page === TUTORIAL_PAGE_TEXT.length) {
        game_window.removeChild(TUTORIAL_PAGE);
        game_window.appendChild(TUTORIAL_LAST_PAGE_INGAME);
    }
    TUTORIAL_TEXT.innerText = is_mobile ? TUTORIAL_PAGE_TEXT_MOBILE[tutorial_page - 1] : TUTORIAL_PAGE_TEXT[tutorial_page - 1];
    TUTORIAL_IMAGE.src = `assets/images/tutorial-${tutorial_page}.png`;
}

function prev_ingame_instructions_page() {
    if (tutorial_page === 1)
        return;
    
    if (tutorial_page === TUTORIAL_PAGE_TEXT.length) {
        game_window.removeChild(TUTORIAL_LAST_PAGE_INGAME);
        game_window.appendChild(TUTORIAL_PAGE);
    }
    tutorial_page -= 1;
    if (tutorial_page === 1) {
        TUTORIAL_PAGE_R1.removeChild(PREV_BUTTON3);
    }
    TUTORIAL_TEXT.innerText = is_mobile ? TUTORIAL_PAGE_TEXT_MOBILE[tutorial_page - 1] : TUTORIAL_PAGE_TEXT[tutorial_page - 1];
    TUTORIAL_IMAGE.src = `assets/images/tutorial-${tutorial_page}.png`;
}

function hide_ingame_instructions() {
    if (tutorial_page === TUTORIAL_PAGE_TEXT.length) {
        game_window.removeChild(TUTORIAL_LAST_PAGE_INGAME);
    }
    else {
        if (tutorial_page === 1) {
            TUTORIAL_PAGE_R1.removeChild(NEXT_BUTTON3);
            TUTORIAL_PAGE_R1.appendChild(PREV_BUTTON3);
            TUTORIAL_PAGE_R1.appendChild(NEXT_BUTTON3);
        }
        game_window.removeChild(TUTORIAL_PAGE);
    }

    game_window.removeChild(TUTORIAL_INFO);
}


//--- LEVEL SCREEN -------------------------------------------------------------

function show_level_screen(level) {
    NUMBER.innerText = level.toString().padStart(2, '0');
    game_window.appendChild(STAGE_TITLE);
}

function hide_level_screen() {
    game_window.removeChild(STAGE_TITLE);
}


//--- PLAYING ------------------------------------------------------------------

function show_in_game_panels(game_state) {
    update_in_game_panel_state(game_state);

    game_window.appendChild(INFORMATION_PANEL);
    game_window.appendChild(STAGE_INFO_PANEL);

    if (is_anotation_hidden) {
        if (game_state.level === 1) {
            set_anotation_text(is_mobile ? REMINDER_TEXT_MOBILE[0] : REMINDER_TEXT[0]);
            show_anotation();
        } else if (game_state.level === 8) {
            set_anotation_text(is_mobile ? REMINDER_TEXT_MOBILE[1] : REMINDER_TEXT[1]);
            show_anotation();
        }
    }
}

function display_digits(number, array) {
    first_not_null = false;
    for(let i = 0; i < 7; i++){
        let mov_digit = (Math.floor(number / Math.pow(10, 7 - i)) % 10);

        if(mov_digit != 0){
            first_not_null = true;
        }

        if(first_not_null){
            array[7 - i].innerText = mov_digit.toString();
        } else {
            array[7 - i].innerText = "";
        }
    }
    array[0].innerText = number % 10;
}

function update_in_game_panel_state(state) {
    //INFO_STAGE.innerText = state.level.toString().padStart(2, '0');

    STG1.innerText = (Math.floor(state.level / 10) % 10).toString();
    STG0.innerText = (state.level % 10).toString();

    //INFO_MOVES.innerText = state.move_counter.toString();
    
    display_digits(state.move_counter, MOV_ARRAY);

    //INFO_ATTEMPTS.innerText = state.attempts.toString();

    display_digits(state.attempts, ATTMP_ARRAY);

    const {hours, minutes, seconds} = state.timer;
    //INFO_TIME.innerText = hours.toString().padStart(2, '0') + ':'
    //                    + minutes.toString().padStart(2, '0') + ':'
    //                    + seconds.toString().padStart(2, '0');

    H2.innerText = (Math.floor(hours / 10) % 10).toString();
    H1.innerText = (hours % 10).toString();
    M2.innerText = (Math.floor(minutes / 10) % 10).toString();
    M1.innerText = (minutes % 10).toString();
    S2.innerText = (Math.floor(seconds / 10) % 10).toString();
    S1.innerText = (seconds % 10).toString();
}

let is_anotation_hidden = true;
function show_anotation() {
    is_anotation_hidden = false;
    game_window.appendChild(REMINDER_PANEL);
}

function hide_anotation() {
    is_anotation_hidden = true;
    game_window.removeChild(REMINDER_PANEL);
}

function set_anotation_text(text) {
    REMINDER_PARAGRAPH.innerText = text;
}

let is_menu_button_hidden = false;
function hide_in_game_panels() {
    if (!is_menu_button_hidden) {
        game_window.removeChild(MENU_BUTTON);
        is_menu_button_hidden = true;
    }
    if (!is_anotation_hidden) {
        game_window.removeChild(REMINDER_PANEL);
        is_anotation_hidden = true;
    }
    game_window.removeChild(INFORMATION_PANEL);
    game_window.removeChild(STAGE_INFO_PANEL);
}


//--- IN-GAME MENU -------------------------------------------------------------

function show_in_game_menu() {
    
    if (!is_menu_button_hidden) {
        is_menu_button_hidden = true;
        game_window.removeChild(MENU_BUTTON);
    }
    game_window.appendChild(GUID_MENU);
}

function show_menu_button() {
    is_menu_button_hidden = false;
    game_window.appendChild(MENU_BUTTON);
}

function hide_in_game_menu() {
    game_window.removeChild(GUID_MENU);
}


//--- END SCREEN ---------------------------------------------------------------

function show_end_screen() {
    game_window.appendChild(CONGRATS_TITLE);
}

function hide_end_screen() {
    game_window.removeChild(CONGRATS_TITLE);
}