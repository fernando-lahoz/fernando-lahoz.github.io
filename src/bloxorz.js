// Variable to store the WebGL rendering context
var gl;

var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var eye, target, up;			// for view matrix

var rot_angle = 0.0;
var rot_change = 0.5;

var program;
var uLocations = {};
var aLocations = {};

var program_info = {
    program,
    uniform_locations: {},
    attrib_locations: {},
};

const TILES_OFFSET = 3;

var objects_to_draw = [
    {
        program_info: program_info,
        points_array: points_cube, 
        colors_array: color_cube,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    },
    {
        program_info: program_info,
        points_array: points_cube, 
        colors_array: color_cube,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    },
    {
        program_info: program_info,
        points_array: points_longblock, 
        colors_array: color_longblock,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    }
];


//----------------------------------------------------------------------------
// Delta time management
//----------------------------------------------------------------------------

let delta_time = 0.0;
let start_time = performance.now();

function update_delta_time() {
    const end_time = performance.now();
    delta_time = (end_time - start_time) / 1000;
    start_time = end_time;
}


//----------------------------------------------------------------------------
// Camera movement management
//----------------------------------------------------------------------------

const INITIAL_CAMERA = {
    eye:  vec3(-1.0, 10.0, 20.0),
    front: vec3(5.0, -7.0, -10.0),
    up: vec3(0.0, 1.0, 0.0),
};

var camera = {
    eye: INITIAL_CAMERA.eye,
    front: INITIAL_CAMERA.front,
    up: INITIAL_CAMERA.up,
};


//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

let canvas;

const CANVAS_HEIGHT = 720;

window.onload = function init() {

    // Set up a WebGL Rendering Context in an HTML5 Canvas
    canvas = document.getElementById("gl-canvas");

    const aspect_ratio = 1280 / 720;
    canvas.width = CANVAS_HEIGHT * aspect_ratio;
    canvas.height = CANVAS_HEIGHT;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //  Configure WebGL
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    set_primitive(objects_to_draw);

    // Set up a WebGL program
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    // Save the attribute and uniform locations
    uLocations.model = gl.getUniformLocation(program, "model");
    uLocations.view = gl.getUniformLocation(program, "view");
    uLocations.projection = gl.getUniformLocation(program, "projection");
    uLocations.colorMult = gl.getUniformLocation(program, "colorMult");
    aLocations.vPosition = gl.getAttribLocation(program, "vPosition");
    aLocations.vColor = gl.getAttribLocation(program, "vColor");

    program_info.uniform_locations = uLocations;
    program_info.attrib_locations = aLocations;
    program_info.program = program;

    gl.useProgram(program_info.program);
    
    // Set up viewport 
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Set up camera
    // Projection matrix
    projection = perspective( 30.0, canvas.width/canvas.height, 0.1, 100.0 );

    // copy projection to uniform value in shader
    gl.uniformMatrix4fv( program_info.uniform_locations.projection, gl.FALSE, projection );

    requestAnimFrame(render);

    set_level(Number(prompt("First level pls")));
};

//----------------------------------------------------------------------------
// States and animations
//----------------------------------------------------------------------------

const MOVEMENT_ANGLE = 90.0; // degree
const MOVEMENT_COOLDOWN = 0.20;
const MOVEMENT_ANGULAR_SPEED = 90.0 / MOVEMENT_COOLDOWN; // degree / s

const FALLING_DURATION = [0.20, 0.5];

const WINNING_DURATION = 3.0;
const GRAVITY = 100;

function apply_action(direction, dx, dz) {
    player.state = MOVING;
    player.animation = {
        direction: direction,
        remaining_time: MOVEMENT_COOLDOWN,
        acum_angle: 0.0,
        rotation_point: player.position[player.chosen_block],
        distance_to_edge: get_distance_to_rotation_edge(dx, dz),
        dx: dx, dz: dz,
    }
    move_player_position(dx, dz);
}

function idle_state() {
    if (player_action.left)       { apply_action(LEFT, -1, 0);  }
    else if (player_action.right) { apply_action(RIGHT, +1, 0); }
    else if (player_action.up)    { apply_action(UP, 0, -1);    }
    else if (player_action.down)  { apply_action(DOWN, 0, +1);  }
}

function moving_state() {

    const block = objects_to_draw[player.block_type === LONG ? 2 : player.chosen_block];
    const dx = player.animation.dx;
    const dz = player.animation.dz;

    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        block.rotation_matrix = mult(rotate((dz - dx) * MOVEMENT_ANGLE, vec3(Math.abs(dz), 0, Math.abs(dx))), block.rotation_matrix);
        
        const [next_state, falling_block] = get_after_movement_state();
        player.state = next_state;
        switch (player.state) {
            case IDLE: break;
            case WINNING:
                player.animation = {
                    remaining_time: WINNING_DURATION,
                    falling_speed: 0.0,
                    falling_distance: 0.0,
                }
                break;
            case FALLING:
                if (player.block_type === SHORT || falling_block === BOTH_BLOCKS_FALL) {
                    player.animation = {
                        fase: 1, // do not rotate
                        remaining_time: FALLING_DURATION[1],
                        falling_speed: 0.0,
                        falling_distance: 0.0,
                    }
                }
                else {
                    const [x_f, y_f, z_f] = player.position[falling_block];
                    const [x_nf, y_nf, z_nf] = player.position[1 - falling_block];
                    const dx = x_f - x_nf;
                    const dz = z_f - z_nf;

                    const tx = player.position[0][0] - player.position[1][0];
                    const tz = player.position[0][2] - player.position[1][2];

                    player.animation = {
                        fase: 0, // first rotate, then fall
                        remaining_time: FALLING_DURATION[0],
                        acum_angle: 0.0,
                        rotation_point: player.position[0],
                        distance_to_edge: [ (dx + dz) * (tx + tz) * -0.5, 0.5],
                        dx: dx, dz: dz,
                    }
                    player.position[falling_block][1] = -1;
                    player.position[1 - falling_block] = vec3(x_f, 0, z_f);
                }
                break;
        }        
    }
}

function winning_state() {
    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        console.log("YOOADASDASD")
        set_level(game_state.level + 1);
    }
}

function falling_state() {
    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        if (player.animation.fase === 0) {

            const object = objects_to_draw[2];
            const dx = player.animation.dx;
            const dz = player.animation.dz;
            object.rotation_matrix = mult(rotate((dz - dx) * MOVEMENT_ANGLE, vec3(Math.abs(dz), 0, Math.abs(dx))), object.rotation_matrix);
            
            player.animation = {
                fase: 1,
                remaining_time: FALLING_DURATION[1],
                falling_speed: 0.0,
                falling_distance: 0.0,
            }

        }
        else if (player.animation.fase === 1) {
            set_level(game_state.level);
        }
    }
}

function update_player_state() {
    switch (player.state) {
        case IDLE: idle_state(); break;
        case MOVING: moving_state(); break;
        case FALLING: falling_state(); break;
        case WINNING: winning_state(); break;
    }
}

//------------------------------------------------------------------------------

function idle_visualize_state() {

    if (player.block_type === LONG) {
        objects_to_draw[2].uniforms.u_model = objects_to_draw[2].rotation_matrix;
        translate_object(objects_to_draw[2], player.position[0]);
    }
    else {
        objects_to_draw[0].uniforms.u_model = objects_to_draw[0].rotation_matrix;
        translate_object(objects_to_draw[0], player.position[0]);
        objects_to_draw[1].uniforms.u_model = objects_to_draw[1].rotation_matrix;
        translate_object(objects_to_draw[1], player.position[1]);
    }
}

function moving_visualize_state() {
    const block = objects_to_draw[player.block_type === LONG ? 2 : player.chosen_block];

    const dx = player.animation.dx;
    const dz = player.animation.dz;
    const adj = player.animation.distance_to_edge[0];
    const adj_y = player.animation.distance_to_edge[1];
    const [r_x, r_y, r_z] = player.animation.rotation_point;

    block.uniforms.u_model = block.rotation_matrix;
    
    translate_object(block, vec3(-dx * adj, +adj_y, -dz * adj));

    player.animation.acum_angle += (dz - dx) * MOVEMENT_ANGULAR_SPEED * delta_time;
    player.animation.acum_angle = Math.min(player.animation.acum_angle, MOVEMENT_ANGLE);
    player.animation.acum_angle = Math.max(player.animation.acum_angle, -MOVEMENT_ANGLE);
    rotate_object(block, player.animation.acum_angle, vec3(Math.abs(dz), 0, Math.abs(dx)));

    translate_object(block, vec3(r_x + dx * adj, -0.5, r_z + dz * adj));


    if (player.block_type === SHORT) {
        const other_block = objects_to_draw[1 - player.chosen_block];
        other_block.uniforms.u_model = other_block.rotation_matrix;
        translate_object(other_block, player.position[1 - player.chosen_block]);
    }
    
}

function advance_falling_animation() {
    const block = objects_to_draw[player.block_type === LONG ? 2 : player.chosen_block];
    const [x, y, z] = player.position[player.chosen_block];
    block.uniforms.u_model = block.rotation_matrix;
    player.animation.falling_speed += GRAVITY * delta_time;
    player.animation.falling_distance += player.animation.falling_speed * delta_time;
    translate_object(block, vec3(x, y - player.animation.falling_distance, z));

    if (player.block_type === SHORT) {
        const other_block = objects_to_draw[1 - player.chosen_block];
        other_block.uniforms.u_model = other_block.rotation_matrix;
        translate_object(other_block, player.position[1 - player.chosen_block]);
    }
}

function falling_visualize_state() {
    if (player.animation.fase === 0) {

        const block = objects_to_draw[2];
        const dx = player.animation.dx;
        const dz = player.animation.dz;
        const adj = player.animation.distance_to_edge[0];
        const adj_y = player.animation.distance_to_edge[1];
        const [r_x, r_y, r_z] = player.animation.rotation_point;

        block.uniforms.u_model = block.rotation_matrix;
        
        translate_object(block, vec3(-dx * adj, +adj_y, -dz * adj));

        player.animation.acum_angle += (dz - dx) * MOVEMENT_ANGULAR_SPEED * delta_time;
        player.animation.acum_angle = Math.min(player.animation.acum_angle, MOVEMENT_ANGLE);
        player.animation.acum_angle = Math.max(player.animation.acum_angle, -MOVEMENT_ANGLE);
        rotate_object(block, player.animation.acum_angle, vec3(Math.abs(dz), 0, Math.abs(dx)));

        translate_object(block, vec3(r_x + dx * adj, -0.5, r_z + dz * adj));

    } else if (player.animation.fase === 1) {
        advance_falling_animation();
    }
}

function winning_visualize_state() {
    advance_falling_animation();
}

let previsualization_events = {
    block_mixed: false,
    change_chosen_block: false,
};

function visualize_state() {
    if (previsualization_events.block_mixed) {
        previsualization_events.block_mixed = false;
        
        objects_to_draw[2].rotation_matrix = get_longblock_rotation();
    }

    if (previsualization_events.change_chosen_block) {
        previsualization_events.change_chosen_block = false;
        
        objects_to_draw[player.chosen_block].colors_array = color_cube;
        objects_to_draw[1 - player.chosen_block].colors_array = color_cube_not_chosen;
    }

    switch (player.state) {
        case IDLE: idle_visualize_state(); break;
        case MOVING: moving_visualize_state(); break;
        case FALLING: falling_visualize_state(); break;
        case WINNING: winning_visualize_state(); break;
    }
}


//----------------------------------------------------------------------------
// Key control
//----------------------------------------------------------------------------

let enter_pressed = false;
let spacebar_pressed = false;

// In order to offer an intuitive and predictable control
const arrow_key_queue = [];

function arrow_key_queue_set_next(keyup) {
    const top = arrow_key_queue.pop();
    let key = null;
    if (top === keyup) {
        key = arrow_key_queue.pop();
    } else {
        key = top;
        const index = arrow_key_queue.indexOf(keyup);
        arrow_key_queue.splice(index, 1);
    }

    switch (key) {
        case UP:    player_action.up = true;    arrow_key_queue.push(key); break;
        case DOWN:  player_action.down = true;  arrow_key_queue.push(key); break;
        case LEFT:  player_action.left = true;  arrow_key_queue.push(key); break;
        case RIGHT: player_action.right = true; arrow_key_queue.push(key); break;
    }
}

function arrow_key_check_top_of_queue(keydown) {
    const top = arrow_key_queue.pop();
    if (top !== undefined) {
        arrow_key_queue.push(top);
    }
    if (top === keydown) {
        return false;
    }
    arrow_key_queue.push(keydown);
    return true;
}

window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":    if (arrow_key_check_top_of_queue(UP))    { reset_player_action(); player_action.up = true;    } break;
        case "ArrowDown":  if (arrow_key_check_top_of_queue(DOWN))  { reset_player_action(); player_action.down = true;  } break;
        case "ArrowLeft":  if (arrow_key_check_top_of_queue(LEFT))  { reset_player_action(); player_action.left = true;  } break;
        case "ArrowRight": if (arrow_key_check_top_of_queue(RIGHT)) { reset_player_action(); player_action.right = true; } break;

        case " ": if (!spacebar_pressed) { spacebar_pressed = true; game_events.change_chosen_block = true;} break;

        case "Enter": if (!enter_pressed) { enter_pressed = true; game_events.reset_game = true;} break;
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowUp":    arrow_key_queue_set_next(UP); player_action.up = false;    break;
        case "ArrowDown":  arrow_key_queue_set_next(DOWN); player_action.down = false;  break;
        case "ArrowLeft":  arrow_key_queue_set_next(LEFT); player_action.left = false;  break;
        case "ArrowRight": arrow_key_queue_set_next(RIGHT); player_action.right = false; break;
    
        case " ": spacebar_pressed = false; break;

        case "Enter": enter_pressed = false; break;
    }
});


//----------------------------------------------------------------------------
// Mixed...
//----------------------------------------------------------------------------

function set_position(object, position) {
    const [x, y, z] = position;
    object.uniforms.u_model = translate(x, y, z);
}

function set_rotation(object, angle, axis) {
    object.uniforms.u_model = rotate(angle, axis);
}

function translate_object(object, direction) {
    const [x, y, z] = direction;
    object.uniforms.u_model = mult(translate(x, y, z), object.uniforms.u_model);
}

function rotate_object(object, angle, axis) {
    object.uniforms.u_model = mult(rotate(angle, axis), object.uniforms.u_model);
}

function clear_floor() {
    objects_to_draw.length = 3;
}

function generate_tile(points, color, x, y, z) {
    return {
        program_info: program_info,
        points_array: points, 
        colors_array: color,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: translate(x, y, z)
        },
        primitive: gl.TRIANGLES
    };
}

function generate_floor() {
    for (let i = 0; i < LEVEL_MATRIX.H; i++) {
    for (let j = 0; j < LEVEL_MATRIX.W; j++) {

        const tile = game_state.matrix[i][j];
        switch (tile.type) {
            case AIR:
                break;
            case PLAIN:
                objects_to_draw.push(generate_tile(points_tile, color_tile_plain, j, -1, i));
                break;
            case FRAGILE:
                objects_to_draw.push(generate_tile(points_tile, color_tile_fragile, j, -1, i));
                break;
            case BUTTON:
                const [points_button, color_button] = tile.activation === HEAVY ? [points_heavybutton, color_heavybutton] : [points_softbutton, color_softbutton];
                objects_to_draw.push(generate_tile(points_button, color_button, j, 0, i));
                objects_to_draw.push(generate_tile(points_tile, color_tile_plain, j, -1, i));
                break;
            case SPLIT:
                objects_to_draw.push(generate_tile(points_split, color_split, j, 0, i));
                objects_to_draw.push(generate_tile(points_tile, color_tile_plain, j, -1, i));
                break;
            case SWITCHED:
                const object = generate_tile(points_tile, color_tile_switched, j, -1, i);
                object.switched_tile = tile;
                objects_to_draw.push(object);
                break;
            case HOLE:
                //...
                break;
        }

    }
    }
}

function set_level(level) {
    clear_floor();

    game_state.level = level;
    game_state.matrix = LEVEL_MATRIX.generate_matrix[level - 1]();

    player.position = LEVEL_INITIAL_POSITION[level - 1];
    player.block_type = LONG;
    player.state = IDLE;
    player.chosen_block = 0;

    objects_to_draw[0].rotation_matrix = new mat4();
    objects_to_draw[1].rotation_matrix = new mat4();
    objects_to_draw[2].rotation_matrix = new mat4();

    generate_floor();
}

//----------------------------------------------------------------------------
// Event handling
//----------------------------------------------------------------------------

// Keyboard events to be processed at the begining
let game_events = {
    reset_game: false,
    change_chosen_block: false,
};

function process_events() {
    if (game_events.reset_game) {
        console.log("RESET")
        game_events.reset_game = false;
        set_level(1);
    }

    if (game_events.change_chosen_block) {
        game_events.change_chosen_block = false;
        if (player.block_type === SHORT) {
            console.log("CHANGED CHOSEN BLOCK")
            player.chosen_block = 1 - player.chosen_block; // Toggle between 1 and 0
            previsualization_events.change_chosen_block = true; 
        }
    }
}


//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function draw_object(object) {
    gl.useProgram(object.program_info.program);

    // Setup buffers and attributes
    set_buffers_and_attributes(object.program_info, object.points_array, object.colors_array);

    // Set the uniforms
    set_uniforms(object.program_info, object.uniforms);

    // Draw
    gl.drawArrays(object.primitive, 0, object.points_array.length);
}

let last_state = null;

let last_pos = null;

function render() {
    if (last_pos !== player.position) {
        last_pos = player.position;
        console.log(player.position[0], player.position[1], player.chosen_block);
    }
    
    if (last_state !== player.state) {
        last_state = player.state;
        switch (player.state) {
            case IDLE:    console.log("IDLE"); break;
            case MOVING:  console.log("MOVING"); break;
            case FALLING: console.log("FALLING"); break;
            case WINNING: console.log("WINNING"); break;
        }
    }

    process_events();

    //----------------------------------------------------------------------------
    // UPDATE STATE
    //----------------------------------------------------------------------------

    update_delta_time();
    update_player_state()
    //...

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);	
    
    //----------------------------------------------------------------------------
    // MOVE STUFF AROUND
    //----------------------------------------------------------------------------

    visualize_state();

    //----------------------------------------------------------------------------
    // DRAW
    //----------------------------------------------------------------------------

    if (player.block_type == LONG) {
        draw_object(objects_to_draw[2]);
    }
    else {
        draw_object(objects_to_draw[0]);
        draw_object(objects_to_draw[1]);
    }

    for (let i = TILES_OFFSET; i < objects_to_draw.length; i++) {
        const object = objects_to_draw[i];
        if (!(object.switched_tile && !object.switched_tile.active)) {
            draw_object(object);
        }
    }
    
    requestAnimationFrame(render);
}

//----------------------------------------------------------------------------
// Utils functions
//----------------------------------------------------------------------------

function set_primitive(objects_to_draw) {	
    
    objects_to_draw.forEach((object) => {
        switch(object.prim_type) {
            case "lines":
                object.primitive = gl.LINES;
                break;
            case "line_strip":
                object.primitive = gl.LINE_STRIP;
                break;
            case "triangles":
                object.primitive = gl.TRIANGLES;
                break;
            default:
                object.primitive = gl.TRIANGLES;
        }
    });
}

function set_uniforms(program_info, uniforms) {
    // Copy uniform model values to corresponding values in shaders
    gl.uniform4f(program_info.uniform_locations.colorMult, uniforms.u_color_mult[0], uniforms.u_color_mult[1], uniforms.u_color_mult[2], uniforms.u_color_mult[3]);
    gl.uniformMatrix4fv(program_info.uniform_locations.model, gl.FALSE, uniforms.u_model);

    var view = lookAt(camera.eye, add(camera.eye, camera.front), camera.up);
    gl.uniformMatrix4fv(program_info.uniform_locations.view, gl.FALSE, view); // copy view to uniform value in shader
}

function set_buffers_and_attributes(program_info, points_array, colors_array) {
    // Load the data into GPU data buffers
    // Vertices
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buffer );
    gl.bufferData( gl.ARRAY_BUFFER,  flatten(points_array), gl.STATIC_DRAW );
    gl.vertexAttribPointer( program_info.attrib_locations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program_info.attrib_locations.vPosition );

    // Colors
    var color_buffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, color_buffer );
    gl.bufferData( gl.ARRAY_BUFFER,  flatten(colors_array), gl.STATIC_DRAW );
    gl.vertexAttribPointer( program_info.attrib_locations.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program_info.attrib_locations.vColor );
}
