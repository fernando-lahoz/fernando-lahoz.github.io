
// Cookies won't work on Chrome for local html files
// function save_game_state() {
//     let matrix = game_state.matrix;
//     game_state.matrix = null;
//     let expire_date = new Date();
//     expire_date.setFullYear(expire_date.getFullYear() + 100);
//     document.cookie = `saved_game_state=${JSON.stringify(game_state)}; expires=${expire_date.toUTCString()}; SameSite=Lax`;
//     game_state.matrix = matrix;
// }

// function restore_game_state() {
//     try {
//         let cookies = document.cookie.split(";").map(v => v.split('='));
//         let [key, value] = cookies.find((v) => { return v[0] === "saved_game_state"; });
//         return value != undefined ? JSON.parse(value) : null;
//     } catch(err) {
//         return null;
//     }
// }

function save_game_state() {
    let matrix = game_state.matrix;
    game_state.matrix = null;
    localStorage.setItem("saved_game_state", JSON.stringify(game_state));
    game_state.matrix = matrix;
}

function restore_game_state() {
    const saved_game_state = localStorage.getItem("saved_game_state");
    return saved_game_state === null ? null : JSON.parse(saved_game_state);
}

function remove_game_state() {
    localStorage.removeItem("saved_game_state");
}