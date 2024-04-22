const MAIN_TITLE = document.createElement("div");
MAIN_TITLE.classList.add("title-container");

const TITLE = document.createElement("p");
TITLE.classList.add("animated-bloxorz-title");
TITLE.innerText = "BLOXORZ";

MAIN_TITLE.appendChild(TITLE);

const MAIN_MENU = document.createElement("div");
MAIN_MENU.classList.add("option-container");
MAIN_MENU.style = "position : absolute; top: 62%; left:33%;";

const START_NEW_GAME_BUTTON = document.createElement("button");
START_NEW_GAME_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
START_NEW_GAME_BUTTON.innerText = "Start New Game";
START_NEW_GAME_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.main_menu.start_new_game); };

const LOAD_STAGE_BUTTON = document.createElement("button");
LOAD_STAGE_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
LOAD_STAGE_BUTTON.innerText = "Continue Saved Game";
LOAD_STAGE_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.main_menu.continue); };

const TOGGLE_SOUND_BUTTON = document.createElement("button");
TOGGLE_SOUND_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
TOGGLE_SOUND_BUTTON.innerText = "Toggle Sound";

MAIN_MENU.appendChild(START_NEW_GAME_BUTTON);
//MAIN_MENU.appendChild(LOAD_STAGE_BUTTON);
MAIN_MENU.appendChild(TOGGLE_SOUND_BUTTON);

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
PREV_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
PREV_BUTTON.innerText = "< Prev";
const prev_button_onclick = () => { event_queue.push(GAME_EVENTS.instructions.prev); };

const SKIP_INSTRUCTIONS_BUTTON = document.createElement("button");
SKIP_INSTRUCTIONS_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
SKIP_INSTRUCTIONS_BUTTON.innerText = "Skip Instructions >";

const BACK_TO_MENU_BUTTON = document.createElement("button");
BACK_TO_MENU_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
BACK_TO_MENU_BUTTON.innerText = "< Back to Menu";
const back_to_menu_onclick = () => { event_queue.push(GAME_EVENTS.instructions.back_to_menu); };

const START_BUTTON = document.createElement("button");
START_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
START_BUTTON.innerText = "Start >";
const start_button_onclick = () => { event_queue.push(GAME_EVENTS.instructions.start); };

const TUTORIAL_FIRST_PAGE = SELECTOR_COLUMN_CONTAINER.cloneNode(true);
const TUTORIAL_FIRST_PAGE_R1 = SELECTOR_ROW_CONTAINER.cloneNode(true);
const TUTORIAL_FIRST_PAGE_R2 = SELECTOR_ROW_CONTAINER.cloneNode(true);
TUTORIAL_FIRST_PAGE_R1.appendChild(NEXT_BUTTON.cloneNode(true)).onclick = next_button_onclick;
TUTORIAL_FIRST_PAGE_R2.appendChild(BACK_TO_MENU_BUTTON.cloneNode(true)).onclick = back_to_menu_onclick;
TUTORIAL_FIRST_PAGE_R2.appendChild(SKIP_INSTRUCTIONS_BUTTON.cloneNode(true)).onclick = start_button_onclick;
TUTORIAL_FIRST_PAGE.appendChild(TUTORIAL_FIRST_PAGE_R1);
TUTORIAL_FIRST_PAGE.appendChild(TUTORIAL_FIRST_PAGE_R2);

const TUTORIAL_PAGE = SELECTOR_COLUMN_CONTAINER.cloneNode(true);
const TUTORIAL_PAGE_R1 = SELECTOR_ROW_CONTAINER.cloneNode(true);
TUTORIAL_PAGE_R1.appendChild(PREV_BUTTON.cloneNode(true)).onclick = prev_button_onclick;
TUTORIAL_PAGE_R1.appendChild(NEXT_BUTTON.cloneNode(true)).onclick = next_button_onclick;
TUTORIAL_PAGE.appendChild(TUTORIAL_PAGE_R1);

const TUTORIAL_LAST_PAGE = SELECTOR_COLUMN_CONTAINER.cloneNode(true);
const TUTORIAL_LAST_PAGE_R1 = SELECTOR_ROW_CONTAINER.cloneNode(true);
TUTORIAL_LAST_PAGE_R1.appendChild(PREV_BUTTON.cloneNode(true)).onclick = prev_button_onclick;
TUTORIAL_LAST_PAGE_R1.appendChild(START_BUTTON.cloneNode(true)).onclick = start_button_onclick;
TUTORIAL_LAST_PAGE.appendChild(TUTORIAL_LAST_PAGE_R1);

const MENU_BUTTON = document.createElement("button");
MENU_BUTTON.classList.add("guid-bloxorz-text", "guid-bloxorz-option", "guid-bloxorz-click");
MENU_BUTTON.style = "position:absolute; top : 5%; left : 5%";
MENU_BUTTON.innerHTML = "Menu";
MENU_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.playing.show_menu); };

const RETURN_TO_GAME_BUTTON = document.createElement("button");
RETURN_TO_GAME_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
RETURN_TO_GAME_BUTTON.innerText = "Return to Game";
RETURN_TO_GAME_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.ingame_menu.return_to_game); };

const QUIT_TO_MENU_BUTTON = document.createElement("button");
QUIT_TO_MENU_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
QUIT_TO_MENU_BUTTON.innerText = "Quit to Menu";
QUIT_TO_MENU_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.ingame_menu.quit_to_menu); };

const SHOW_INSTRUCTIONS_BUTTON = document.createElement("button");
SHOW_INSTRUCTIONS_BUTTON.classList.add("bloxorz-text", "menu-option", "bloxorz-click");
SHOW_INSTRUCTIONS_BUTTON.innerText = "Show Instructions";
SHOW_INSTRUCTIONS_BUTTON.onclick = () => { event_queue.push(GAME_EVENTS.ingame_menu.show_instructions); };

const GUID_MENU = document.createElement("div");
GUID_MENU.classList.add("guid-container");

GUID_MENU.appendChild(RETURN_TO_GAME_BUTTON);
GUID_MENU.appendChild(TOGGLE_SOUND_BUTTON.cloneNode(true));
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
const INFO_TIME = INFO_TEXT.cloneNode(true);
INFO_TIME.innerText = "00:00:00"
const INFO_MOVES = INFO_TEXT.cloneNode(true);
INFO_MOVES.innerText = "0"
const INFO_ATTEMPTS = INFO_TEXT.cloneNode(true);
INFO_ATTEMPTS.innerText = "0"

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

const INFO_STAGE = INFO_TEXT.cloneNode(true);
INFO_STAGE.innerText = "00";

STAGE_INFO_PANEL_C2.appendChild(INFO_STAGE);

STAGE_INFO_PANEL.appendChild(STAGE_INFO_PANEL_C1);
STAGE_INFO_PANEL.appendChild(STAGE_INFO_PANEL_C2);

const TUTORIAL_INFO = document.createElement("div");
TUTORIAL_INFO.classList.add("tutorial-container");
const TUTORIAL_TEXT = document.createElement("p");
TUTORIAL_TEXT.classList.add("bloxorz-text");
TUTORIAL_TEXT.style = "width:65%";

const TUTORIAL_IMAGE = document.createElement("img");
TUTORIAL_IMAGE.style = "height:100%";
TUTORIAL_IMAGE.title = "Yaranaika??";
TUTORIAL_IMAGE.src = "https://ih0.redbubble.net/image.206201235.0962/flat,800x800,070,f.u2.jpg";

TUTORIAL_INFO.appendChild(TUTORIAL_TEXT);
TUTORIAL_INFO.appendChild(TUTORIAL_IMAGE);

//Para añadir o quitar un elemento simplemente appendChild o removeChild

//MAIN_TITLE
//STAGE_TITLE
//MAIN_MENU
//TUTORIAL_FIRST_PAGE
//TUTORIAL_PAGE
//TUTORIAL_LAST_PAGE
//MENU_BUTTON
//STAGE_TITLE
//INFORMATION_PANEL
//STAGE_INFO_PANEL

//Modificando el atributo .innerText uno puede cambiar lo que muestra cada elemento del GUID

//INFO_MOVES
//INFO_TIME
//INFO_ATTEMPS
//INFO_STAGE

//NUMBER //Para el STAGE_TITLE

function f1() {
    console.log(document);
    let game_window = document.getElementById("game-window");
    console.log(game_window);

    game_window.appendChild(MAIN_TITLE);
    game_window.appendChild(MAIN_MENU);
    //game_window.appendChild(TUTORIAL_FIRST_PAGE);
    //game_window.appendChild(MENU_BUTTON);
    //game_window.appendChild(STAGE_TITLE);
    //game_window.appendChild(INFORMATION_PANEL);
    //game_window.appendChild(STAGE_INFO_PANEL);
    //game_window.appendChild(TUTORIAL_INFO);

}

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
        MAIN_MENU.appendChild(LOAD_STAGE_BUTTON);
        MAIN_MENU.appendChild(TOGGLE_SOUND_BUTTON);
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

//--- INSTRUCTIONS -------------------------------------------------------------

const TUTORIAL_PAGE_TEXT = [
    `1/9
    
    The aim of the game is to get the block to fall
    into the square hole at the end of each stage.
    There are 33 stages to complete.`,
    `2/9

    To move the block around the world,
    use the left right up and down arrow keys.

    Be careful not to fall off the edges -
    the level will be restarted if this happens.`,
    `3/9

    Bridges and switches are located in many
    levels. The switches are activated when they
    are pressed down by the block.
    
    You do not need to stay resting on the switch
    to keep bridges closed.`,
    `4/9

    There are two types of switches:
    'Heavy' X-shaped ones and 'Soft' round ones.
    
    Soft switches are activated when any part of
    your block presses it. Hard switches require
    much more pressure, so your block must be
    standing on its end to activate it.`,
    `5/9

    When activated, each switch may behave
    differently. Some will swap the bridges from
    open to closed to open each time it is used.
    Some will only ever make certain bridges open,
    and activating it again will not make it close.
    
    Green or red coloured squares will flash to
    indicate which bridges are being operated.`,
    `6/9
    
    Orange tiles are more fragile than the rest of
    the land.
    
    If your block stands up vertically on
    an orange tile, tile will give way and your
    block will fall.`,
    `7/9
    
    Finally is a third type of switch shaped
    like a cut circumference.
    
    It teleports your block to different locations
    splitting it into two smaller blocks at the
    same time. These can be controlled individually
    and will rejoin a normal block when both
    are placed next to each other.`,
    `8/9
    
    You can select which small block to use at any
    time by pressing the spacebar.
    
    Small blocks can still operate soft switches,
    but they aren't big enough to activate heavy
    switches. Also small blocks cannot go through
    the exit hole - only a complete block can finish
    the stage.`,
    `9/9
    
    The game is automatically saved to be
    restored from the main menu by clicking on
    'Continue Saved Game'.
    
    Be sure local storage is enabled in your
    browser, otherwise it won't be able to save
    your current game.`,
];

let tutorial_page = 0;

function show_instructions() {
    tutorial_page = 1;
    TUTORIAL_TEXT.innerText = TUTORIAL_PAGE_TEXT[tutorial_page - 1];
    game_window.appendChild(TUTORIAL_FIRST_PAGE);
    game_window.appendChild(TUTORIAL_INFO);
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
    TUTORIAL_TEXT.innerText = TUTORIAL_PAGE_TEXT[tutorial_page - 1];
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
    TUTORIAL_TEXT.innerText = TUTORIAL_PAGE_TEXT[tutorial_page - 1];
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
}

function update_in_game_panel_state(state) {
    INFO_STAGE.innerText = state.level.toString().padStart(2, '0');
    INFO_MOVES.innerText = state.move_counter.toString();
    INFO_ATTEMPTS.innerText = state.attempts.toString();

    const {hours, minutes, seconds} = state.timer;
    INFO_TIME.innerText = hours.toString().padStart(2, '0') + ':'
                        + minutes.toString().padStart(2, '0') + ':'
                        + seconds.toString().padStart(2, '0');
}

let is_menu_button_hidden = false;
function hide_in_game_panels() {
    if (!is_menu_button_hidden) {
        game_window.removeChild(MENU_BUTTON);
        is_menu_button_hidden = true;
    }
    game_window.removeChild(INFORMATION_PANEL);
    game_window.removeChild(STAGE_INFO_PANEL);
}


//--- IN-GAME MENU -------------------------------------------------------------

function show_in_game_menu() {
    is_menu_button_hidden = true;
    game_window.removeChild(MENU_BUTTON);
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

function show_end_screen(level) {
    //...
}

function hide_end_screen() {
    //...
}