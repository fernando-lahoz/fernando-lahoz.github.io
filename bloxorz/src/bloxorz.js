// Variable to store the WebGL rendering context
var gl;
var ext;

// Variables para los bufferes
var vertex_buffer;
var color_buffer;
var textcoords_buffer;
var hide_level_buffer;

const shadow_tools = {}

var model = new mat4();   		// create a model matrix and set it to the identity matrix
var view = new mat4();   		// create a view matrix and set it to the identity matrix
var projection = new mat4();	// create a projection matrix and set it to the identity matrix

var eye, target, up;			// for view matrix

var rot_angle = 0.0;
var rot_change = 0.5;

var program;
var tile_program;
var cube_program;
var hole_program;
var sphere_program;

var shadow_program;
var shadow_program_info = {
    uniform_locations: {},
    attrib_locations: {},
};


let not_chosen_texture = {
    texture: null,
    unit: null,
    unit_num: 0,
};

let block_texture = {
    texture: null,
    unit: null,
};



var program_info = {
    uniform_locations: {},
    attrib_locations: {},
};

var tile_program_info = {
    uniform_locations: {},
    attrib_locations: {},
}

var cube_program_info = {
    uniform_locations: {},
    attrib_locations: {},
}

var hole_program_info = {
    uniform_locations: {},
    attrib_locations: {},
}

var sphere_program_info = {
    uniform_locations: {},
    attrib_locations: {},
}

const TILES_OFFSET = 4;

var objects_to_draw = [
    {
        program_info: cube_program_info,
        points_array: points_cube, 
        colors_array: color_cube,
        textcoords_array: cube_textcoords,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
            u_hide_level: { level: -1000 },
            texture: block_texture,
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    },
    {
        program_info: cube_program_info,
        points_array: points_cube, 
        colors_array: color_cube,
        textcoords_array: cube_textcoords,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
            u_hide_level: { level: -1000 },
            texture: not_chosen_texture,
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    },
    {
        program_info: cube_program_info,
        points_array: points_longblock, 
        colors_array: color_longblock,
        textcoords_array: cube_textcoords,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: new mat4(),
            u_hide_level: { level: -1000 },
            texture: block_texture,
        },
        prim_type: "triangles",

        rotation_matrix: new mat4(),
    },
    {
		program_info: sphere_program_info,
		points_array: points_sphere,
		uniforms: {
			u_color_mult: [0.75, 0.156, 0, 1],
			u_model: new mat4(),
            fade: 16,
		},
		prim_type: "triangles",
        radius: 30,
	},
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

// eye: vec3(-6.97, 10.97, 13.47),
// at: vec3(3.5, 1.0, 7.5),
// up: vec3(0.0, 1.0, 0.0),
// size: 20.0,
// depth: 40.0

const light_base_distance = 16.79;
const light_base_vector = vec3(-0.9, 0, 0.45);
const sun_declination = Math.PI/7.0;
const light_eye = add(vec3(7.0, 0.0, 4.5), add(mult(Math.cos(Math.PI/2 - sun_declination)*light_base_distance, light_base_vector), mult(Math.sin(Math.PI/2 - sun_declination)*light_base_distance, vec3(0.0, 1.0, 0.0))));

//Esta es el punto de vista desde el foco de luz
const LIGHT_CAM = {
    eye: light_eye, //vec3(-1.97, 8.97, 13.47),
    at: vec3(7.0, 0.0, 4.5),
    up: vec3(0.0, 1.0, 0.0),
    size: 20.0,
    depth: 25.0
}

//Estas son sus matrices de proyeccion y vista
let light_projection = ortho(-LIGHT_CAM.size/2.0, LIGHT_CAM.size/2.0, -LIGHT_CAM.size/2.0, LIGHT_CAM.size/2.0, 0.0, LIGHT_CAM.depth);
let light_view = lookAt(LIGHT_CAM.eye, LIGHT_CAM.at, LIGHT_CAM.up);

const BASE_CAMERA = {
    eye: vec3(7.0/* -1.0 */, 1.0/* 8.0 */, 20.0/* 20.0 */),
    at: vec3(7.0, 0.0, 4.5),
    up: vec3(0.0, 1.0, 0.0),

    alpha: 20,
    betha: 30,

    fov: 45,
}

const camera = {
    eye: BASE_CAMERA.eye,
    at: BASE_CAMERA.at,
    up: BASE_CAMERA.up,

    alpha: BASE_CAMERA.alpha,
    betha: BASE_CAMERA.betha,

    alpha_speed: 0,
    betha_speed: 0,

    fov: BASE_CAMERA.fov,
};

let camera_actions = {
    left:  false, // -alpha
    right: false, // +alpha
    up:    false, // -betha
    down:  false, // +betha

    add_fov: false,
    sub_fov: false,
};

function reset_camera() {
    camera.alpha = BASE_CAMERA.alpha;
    camera.betha = BASE_CAMERA.betha;
    camera.fov = BASE_CAMERA.fov;
}

function to_uniform(v3, w) {
    const [x, y, z] = v3;
    return vec4(x, y, z, w);
}

function from_uniform(v4) {
    const [x, y, z, w] = v4;
    if (w == 0)
        return vec3(x, y, z);
    return vec3(x / w, y / w, z / w);
}

const ALPHA_ANGLE_SPEED = 90;
const BETHA_ANGLE_SPEED = 90;
const ANGLE_ACCELERATION = 110;

const ANGLE_DECCELERATION = 20;

const ANGLE_SCALE_FACTOR = 0.85;
const ANGLR_SPEED_THRESHOLD = 0.01;

const FOV_SPEED = 20;

function update_camera_state() {

    if (camera_actions.add_fov) {
        camera.fov += FOV_SPEED * delta_time;
        if (camera.fov > 60) camera.fov = 60;
    }
    if (camera_actions.sub_fov) {
        camera.fov -= FOV_SPEED * delta_time;
        if (camera.fov < 20) camera.fov = 20;
    }

    let camera_in_alpha_action = camera_actions.right || camera_actions.left;
    let camera_in_betha_action = camera_actions.up || camera_actions.down;

    if (camera_actions.left)  { 
        //camera.alpha += ALPHA_ANGLE_SPEED * delta_time;
        camera.alpha_speed += ANGLE_ACCELERATION * delta_time;
        if(camera.alpha_speed > ALPHA_ANGLE_SPEED){
            camera.alpha_speed = ALPHA_ANGLE_SPEED;
        }

        camera_in_action = true;
    }

    if (camera_actions.right) { 
        //camera.alpha -= ALPHA_ANGLE_SPEED * delta_time;
        camera.alpha_speed -= ANGLE_ACCELERATION * delta_time;
        if(camera.alpha_speed < -ALPHA_ANGLE_SPEED){
            camera.alpha_speed = -ALPHA_ANGLE_SPEED;
        }
        camera_in_action = true;
    }

    if (camera_actions.up) {
        //camera.betha += BETHA_ANGLE_SPEED * delta_time; 
        camera.betha_speed += ANGLE_ACCELERATION * delta_time;
        if(camera.betha_speed > BETHA_ANGLE_SPEED){
            camera.betha_speed = BETHA_ANGLE_SPEED;
        }
        camera_in_action = true;
    }

    if (camera_actions.down) { 
        //camera.betha -= BETHA_ANGLE_SPEED * delta_time;
        camera.betha_speed -= ANGLE_ACCELERATION * delta_time;
        if(camera.betha_speed < -BETHA_ANGLE_SPEED){
            camera.betha_speed = -BETHA_ANGLE_SPEED;
        }
        camera_in_action = true;
    } 

    if(!camera_in_alpha_action){
        camera.alpha_speed *= Math.pow(ANGLE_SCALE_FACTOR, delta_time*ANGLE_DECCELERATION);
        if (Math.abs(camera.alpha_speed) < ANGLR_SPEED_THRESHOLD) {camera.alpha_speed = 0};
    }

    if(!camera_in_betha_action){
        camera.betha_speed *= Math.pow(ANGLE_SCALE_FACTOR, delta_time*ANGLE_DECCELERATION);
        if (Math.abs(camera.betha_speed) < ANGLR_SPEED_THRESHOLD) {camera.betha_speed = 0};
    }

    camera.alpha += camera.alpha_speed * delta_time;
    camera.betha += camera.betha_speed * delta_time;

    if (camera.alpha > 360) { camera.alpha -= 360; }
    if (camera.alpha < 0) { camera.alpha += 360; }
    if (camera.betha > 70) { camera.betha = 70; }
    if (camera.betha < 0) { camera.betha = 0; }

    const u = subtract(BASE_CAMERA.eye, BASE_CAMERA.at);
    const rotated_alpha = from_uniform(mult(rotate(camera.alpha, vec3(0, 1, 0)), to_uniform(u, 0)));
   
    const betha_axis = cross(vec3(0.0, 1.0, 0.0), rotated_alpha);
    const rotated_betha = from_uniform(mult(rotate(camera.betha, betha_axis), to_uniform(rotated_alpha, 0)));
    
    camera.eye = add(BASE_CAMERA.at, rotated_betha);
}

//------------------------------------------------------------------------------

let num_textures = 0;

function init_shadows() {
    shadow_tools.texture_unit_num = num_textures;
    shadow_tools.texture_unit = gl.TEXTURE0 + num_textures;
    num_textures += 1;

    shadow_tools.depth_texture = gl.createTexture();
    shadow_tools.depth_texture_size = 2048;
    gl.activeTexture(shadow_tools.texture_unit);
    gl.bindTexture(gl.TEXTURE_2D, shadow_tools.depth_texture );
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.DEPTH_COMPONENT, // internal format
        shadow_tools.depth_texture_size,   // width
        shadow_tools.depth_texture_size,   // height
        0,                  // border
        gl.DEPTH_COMPONENT, // format
        gl.UNSIGNED_INT,    // type
        null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    shadow_tools.depth_framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_tools.depth_framebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.DEPTH_ATTACHMENT,  // attachment point
        gl.TEXTURE_2D,        // texture target
        shadow_tools.depth_texture, // texture
        0);                   // mip level

    
    // Unused but necessary
    let texture_num = num_textures;
    shadow_tools.unused_texture_unit = gl.TEXTURE0 + texture_num;
    num_textures += 1;
    gl.activeTexture(shadow_tools.unused_texture_unit);

    shadow_tools.unused_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadow_tools.unused_texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        shadow_tools.depth_texture_size,
        shadow_tools.depth_texture_size,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    // attach it to the framebuffer
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,        // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,         // texture target
        shadow_tools.unused_texture,         // texture
        0);                    // mip level

}


//--------------------

let textures_array = [];

function load_texture(tex_obj, url) {
    let unit_num = num_textures;
    num_textures += 1;
    const unit = gl.TEXTURE0 + unit_num;

    const texture = gl.createTexture();
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([100, 100, 100, 255]));

    textures_array.push(texture);


    const image = new Image();
    image.onload = () => {
        gl.activeTexture(unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
        function isPowerOf2(value) {
            return (value & (value - 1)) === 0;
        }

        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;
  
    tex_obj.texture = texture;
    tex_obj.unit = unit;
    tex_obj.unit_num = unit_num;
  }

//----------------------------------------------------------------------------
// Initialization function
//----------------------------------------------------------------------------

let canvas;

const CANVAS_HEIGHT = 1080; //TODO: change to screen
const ACTION_RADIUS = 30.0;
const QUADRANT_LIMIT = Math.sqrt(2.0)/2.0;

const OCTANT_COS_LIMIT = Math.sqrt(2.0 + Math.sqrt(2.0))/2.0;
const OCTANT_SIN_LIMIT = Math.sqrt(2.0 - Math.sqrt(2.0))/2.0;

const SCALE_THRESHOLD = 15.0;

let allow_gesture_player_movement = true;
let allow_gesture_camera_movement = false;
let allow_gesture_zoom_movement = false;
let camera_has_moved = false;

let current_fov = camera.fov;
let prev_pinch_distance = null;
let current_pinch_distance = null;
let retain_variables = false;
let current_pointers = 0;

let gesture_reset_camera_delay = null;

let cursor_1_pos;
let cursor_2_pos;

function reset_camera_timeout(){
    //Si se ha puesto una cuenta atras para resetear la camara
    if(gesture_reset_camera_delay !== null){

        //La cancelamos
        clearTimeout(gesture_reset_camera_delay);
        gesture_reset_camera_delay = null;
    }

    //Se ha movido la camara
    camera_has_moved = true;
}

function update_player_motion_gesture(direction_vector){
    
    //Calculamos el modulo
    let modulus = length(direction_vector);

    //Si el modulo es mayor al umbral de accion
    if(modulus > ACTION_RADIUS){

        //Calculamos el vector unitario
        let unit_dir_vector = normalize(direction_vector);

        //En funcion de en que cuadrante este el vector asignamos una direccion
        if(unit_dir_vector[0] < 0.0 && (-QUADRANT_LIMIT < unit_dir_vector[1] && unit_dir_vector[1] <= QUADRANT_LIMIT)){
            //left
            player_action.left = true;
        }else if(unit_dir_vector[0] > 0.0 && (-QUADRANT_LIMIT <= unit_dir_vector[1] && unit_dir_vector[1] < QUADRANT_LIMIT)){
            //right
            player_action.right = true;
        }else if(unit_dir_vector[1] < 0.0 && (-QUADRANT_LIMIT <= unit_dir_vector[0] && unit_dir_vector[0] < QUADRANT_LIMIT)){
            //up
            player_action.up = true;
        }else{
            //down
            player_action.down = true;
        }
    }
}

function update_camera_motion_gesture(direction_vector){

    //Calculamos el modulo
    let modulus = length(direction_vector);
     
    //Si el modulo es mayor al umbral de accion
    if(modulus > ACTION_RADIUS){

        //Quitamos el timeout del reinicio
        reset_camera_timeout();

        //Calculamos el vector unitario
        let unit_dir_vector = normalize(direction_vector);

        if(unit_dir_vector[0] > 0.0 && (-OCTANT_SIN_LIMIT < unit_dir_vector[1] && unit_dir_vector[1] <= OCTANT_SIN_LIMIT)){
            //right
            camera_actions.left = true;
        }else if((OCTANT_SIN_LIMIT< unit_dir_vector[0] && unit_dir_vector[0] <= OCTANT_COS_LIMIT) && 
                 (-OCTANT_SIN_LIMIT > unit_dir_vector[1] && unit_dir_vector[1] >= -OCTANT_COS_LIMIT)){
            //right up
            camera_actions.left = true;
            camera_actions.down = true;
        }else if(unit_dir_vector[1] < 0.0 && (-OCTANT_SIN_LIMIT < unit_dir_vector[0] && unit_dir_vector[0] <= OCTANT_SIN_LIMIT)){
            //up
            camera_actions.down = true;
        }else if((-OCTANT_COS_LIMIT < unit_dir_vector[0] && unit_dir_vector[0] <= -OCTANT_SIN_LIMIT) && 
                 (-OCTANT_SIN_LIMIT > unit_dir_vector[1] && unit_dir_vector[1] >= -OCTANT_COS_LIMIT)){
            //left up
            camera_actions.right = true;
            camera_actions.down = true;
        }else if(unit_dir_vector[0] < 0.0 && (-OCTANT_SIN_LIMIT < unit_dir_vector[1] && unit_dir_vector[1] <= OCTANT_SIN_LIMIT)){
            //left
            camera_actions.right = true;
        }else if((-OCTANT_COS_LIMIT < unit_dir_vector[0] && unit_dir_vector[0] <= -OCTANT_SIN_LIMIT) && 
                (OCTANT_COS_LIMIT > unit_dir_vector[1] && unit_dir_vector[1] >= OCTANT_SIN_LIMIT)){
            //left down
            camera_actions.right = true;
            camera_actions.up = true;
        }else if(unit_dir_vector[1] > 0.0 && (-OCTANT_SIN_LIMIT < unit_dir_vector[0] && unit_dir_vector[0] <= OCTANT_SIN_LIMIT)){
            //down
            camera_actions.up = true;
        }else{
            //right down
            camera_actions.left = true;
            camera_actions.up = true;
        }
    }
}

function update_camera_fov(scale){

    //Escala en funcion del factor de escala el fov
    let new_fov = current_fov/scale;
    if(new_fov > 60){camera.fov = 60;}
    else if(new_fov < 20){camera.fov = 20;}
    else{camera.fov = new_fov;}
}

function reset_camera_action() {
    camera_actions.left = false;
    camera_actions.right = false;
    camera_actions.up = false;
    camera_actions.down = false;
    camera_actions.add_fov = false;
    camera_actions.sub_fov = false;
}

function control_gestures(ev){

    //Evitamos la accion predeterminada
    ev.preventDefault();

    //Si no estamos jugando no hagas nada
    if(current_app_state !== APP_STATES.PLAYING){ return; }

    //Reiniciamos las acciones del jugador y de la camara
    reset_player_action();
    reset_camera_action();

    //Calculamos la posicion actual del cursor 1
    let current_cursor_1_pos = vec2(ev.pointers[0].clientX, ev.pointers[0].clientY);

    //Calculamos cuanto se ha desplazado de su posicion original
    let delta_cursor_1 = length(subtract(current_cursor_1_pos, cursor_1_pos));
    
    //Si hay 2 cursores
    if(current_pointers === 2){

        //Calculamos la posicion actual del cursor 2
        let current_cursor_2_pos = vec2(ev.pointers[1].clientX, ev.pointers[1].clientY);

        //Calcula la distancia entre los dos dedos
        current_pinch_distance = length(subtract(current_cursor_2_pos, current_cursor_1_pos));

        //Si el cursor 1 supera un determinado umbral de movimiento y se puede mover la camara
        if(delta_cursor_1 > SCALE_THRESHOLD && allow_gesture_camera_movement) {

            //Quitamos el timeout del reinicio
            reset_camera_timeout();

            //Damos feedback al usuario de que ha entrado en modo zoom
            play_sound(SOUNDS.menu_click);

            //Desactivamos el movimiento de camara y habilitamos el de zoom
            allow_gesture_camera_movement = false;
            allow_gesture_zoom_movement = true;
        }

        //Si se va a mover la camara
        if(allow_gesture_camera_movement){

            //Calculamos el vector delta entre la nueva posicion del cursor 2 y su anterior
            let direction_vector = subtract(current_cursor_2_pos, cursor_2_pos);

            //Actualizamos la posicion de la camara
            update_camera_motion_gesture(direction_vector);

        //Si no se va a mover la camara actualizamos el fov en funcion del factor de escala
        }else if(allow_gesture_zoom_movement){

            //La distancia entre dedos previa es la actual en caso de no haber sido guardada
            if(prev_pinch_distance === null){
                prev_pinch_distance = current_pinch_distance;
            }

            //Calculamos la escala
            let scale = current_pinch_distance / prev_pinch_distance;

            //Actualizamos el fov
            update_camera_fov(scale);
        }
        
    
    //Si solo hay un cursor y no se ha presionado la pantalla con mas cursores
    }else if(current_pointers === 1){

        //Calculamos el vector dirección desde el centro en el que se presiono hasta el lugar desplazado
        let direction_vector = vec2(ev.deltaX, ev.deltaY);

        //Actualizamos la posicion del jugador
        if(allow_gesture_player_movement){
            update_player_motion_gesture(direction_vector);
        }
    }
}

// Regular expression to match common mobile device keywords
// const mobileKeywordsRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
function check_mobile() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
//const is_mobile = mobileKeywordsRegex.test(navigator.userAgent);
const is_mobile = check_mobile();

// Solo si es movil obliga el uso de pantalla completa
if(is_mobile){
    addEventListener("click", (_) => {
        document.documentElement.requestFullscreen();
    });
}

function init_gesture_control(game_window){

    //Registra todos los eventos de gesto
    gesture_manager = new Hammer.Manager(game_window);

    //Añadimos gestos de movimiento, cambio de bloque y reseteo de camara
    gesture_manager.add(new Hammer.Pan({ event:'motion', pointers : 0, direction: Hammer.DIRECTION_ALL, threshold: 10}));
    gesture_manager.add(new Hammer.Tap({ event:'change_block', taps : 2}));

    //Con esto controlamos camara y bloque
    gesture_manager.on('motion', control_gestures);

    //Con esto sacamos el numero de cursores en pantalla
    game_window.addEventListener('touchstart', function(ev) {

        //Si no estamos jugando vuelve
        if(current_app_state !== APP_STATES.PLAYING){ return; }
        
        //Medimos el numero de cursores
        current_pointers = ev.touches.length;

        //Si el numero de cursores es 1
        if(current_pointers === 1){

            //Nos guardamos la posicion del primer punto tocado
            cursor_1_pos = vec2(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
        }

        //Si hay 2 presionando la pantalla
        if(current_pointers === 2){

            //Nos guardamos la posicion del segundo punto tocado
            cursor_2_pos = vec2(ev.targetTouches[1].clientX, ev.targetTouches[1].clientY);

            //Si la camara aun no se ha movido
            if(!camera_has_moved){
                
                //Lanzamos una funcion dentro de 1 segundo para reiniciar la camara
                gesture_reset_camera_delay = setTimeout(() => {

                    //Deshabilitamos la camara
                    allow_gesture_camera_movement = false;

                    //Damos feedback al usuario de que ha reseteado la camara
                    play_sound(SOUNDS.flush_map);

                    //Reseteamos la camara
                    event_queue.push(GAME_EVENTS.playing.reset_camera);
                }, 1000);
            }

            //Si permitiamos el movimiento del jugador
            if(allow_gesture_player_movement){

                //Damos feedback para que se entere que ha cambiado al modo camara
                play_sound(SOUNDS.menu_click);
            }

            //Deshabilitamos el control de gestos del jugador
            allow_gesture_player_movement = false;

            //Si no estamos en proceso de hacer zoom activamos el gesto de camara
            if(!allow_gesture_zoom_movement){
                allow_gesture_camera_movement = true;
            }
        }
    });

    game_window.addEventListener('touchend', function(ev) {

        //Medimos el numero de cursores
        current_pointers = ev.touches.length;

        //Si solo hay un cursor
        if(current_pointers === 1){
            //Reseteamos la accion de la camara
            reset_camera_action();

            //Reseteamos la pinch distance previa
            prev_pinch_distance = null;

            //Tomamos el fov actual
            current_fov = camera.fov;
        }

        //Si ya no hay cursor alguno
        if(current_pointers === 0){
            //Reseteamos las acciones
            reset_player_action();
            reset_camera_action();

            allow_gesture_player_movement = true;
            allow_gesture_camera_movement = false;
            allow_gesture_zoom_movement = false;
            retain_variables = false;
            camera_has_moved = false;
        }
    });

    //Cuando haga un doble tap el usuario cambiara el bloque
    gesture_manager.on('change_block', (_) => {

        if(current_app_state !== APP_STATES.PLAYING){ return; }
        event_queue.push(GAME_EVENTS.playing.change_chosen_block);
    });
}

const WHEEL_THRESHOLD = 1000.0;

function update_scale_by_wheel(ev){
    ev.preventDefault();

    //Si no estamos jugando vuelve
    if(current_app_state !== APP_STATES.PLAYING){ return; }

    //Guardamos el fov actual
    current_fov = camera.fov;

    //Calculamos la escala en función de lo que se ha movido la ruedeta
    let scale = 1.0 - ev.deltaY/WHEEL_THRESHOLD;

    //Si la escala se hace cero la ponemos a un valor no nulo
    if(scale === 0.0) {scale = 0.001};

    //Actualizamos el fov
    update_camera_fov(scale);
}

function init() {

    init_menu();
    init_sound();

    // Set up a WebGL Rendering Context in an HTML5 Canvas
    canvas = document.getElementById("gl-canvas");

    canvas.toDataURL("image/png")

    const aspect_ratio = 1920 / 1080;
    canvas.width = CANVAS_HEIGHT * aspect_ratio;
    canvas.height = CANVAS_HEIGHT;

    if(is_mobile) {init_gesture_control(game_window)};

    game_window.addEventListener("wheel", update_scale_by_wheel);

    // <----------

    gl = WebGLUtils.setupWebGL(canvas, {antialias: true});
    if (!gl) {
        alert("WebGL isn't available");
    }

    ext = gl.getExtension('WEBGL_depth_texture');
    if (!ext) {
        alert('need WEBGL_depth_texture');
    }

    init_shadows();

    //Genera los bufferes
    vertex_buffer = gl.createBuffer();
    color_buffer = gl.createBuffer();
    textcoords_buffer = gl.createBuffer();
    hide_level_buffer = gl.createBuffer();

    //  Configure WebGL
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    set_primitive(objects_to_draw);

    // Set up a WebGL program
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    cube_program = initShaders(gl, "block-vertex-shader", "block-fragment-shader");
    hole_program = initShaders(gl, "block-vertex-shader", "hole-fragment-shader");
    tile_program = initShaders(gl, "tile-vertex-shader", "tile-fragment-shader");
    sphere_program = initShaders(gl, "sphere-vertex-shader", "sphere-fragment-shader");
    shadow_program = initShaders(gl, "shadow-vertex-shader", "shadow-fragment-shader");

    // Save the attribute and uniform locations
    program_info.uniform_locations.model = gl.getUniformLocation(program, "model");
    program_info.uniform_locations.view = gl.getUniformLocation(program, "view");
    program_info.uniform_locations.projection = gl.getUniformLocation(program, "projection");
    program_info.uniform_locations.colorMult = gl.getUniformLocation(program, "colorMult");
    program_info.uniform_locations.textureMatrix = gl.getUniformLocation(program, "textureMatrix");
    program_info.uniform_locations.shadowTexture = gl.getUniformLocation(program, "shadowTexture");
    program_info.attrib_locations.vPosition = gl.getAttribLocation(program, "vPosition");
    program_info.attrib_locations.vColor = gl.getAttribLocation(program, "vColor");
    program_info.program = program;

    tile_program_info.uniform_locations.model = gl.getUniformLocation(tile_program, "model");
    tile_program_info.uniform_locations.view = gl.getUniformLocation(tile_program, "view");
    tile_program_info.uniform_locations.projection = gl.getUniformLocation(tile_program, "projection");
    tile_program_info.uniform_locations.colorMult = gl.getUniformLocation(tile_program, "colorMult");
    tile_program_info.attrib_locations.vPosition = gl.getAttribLocation(tile_program, "vPosition");
    tile_program_info.attrib_locations.vColor = gl.getAttribLocation(tile_program, "vColor");
    tile_program_info.attrib_locations.vTextcoords = gl.getAttribLocation(tile_program, "vTextcoords");
    tile_program_info.uniform_locations.textureMatrix = gl.getUniformLocation(tile_program, "textureMatrix");
    tile_program_info.uniform_locations.shadowTexture = gl.getUniformLocation(tile_program, "shadowTexture");
    tile_program_info.program = tile_program;

    cube_program_info.uniform_locations.model = gl.getUniformLocation(cube_program, "model");
    cube_program_info.uniform_locations.view = gl.getUniformLocation(cube_program, "view");
    cube_program_info.uniform_locations.projection = gl.getUniformLocation(cube_program, "projection");
    cube_program_info.uniform_locations.colorMult = gl.getUniformLocation(cube_program, "colorMult");
    cube_program_info.attrib_locations.vPosition = gl.getAttribLocation(cube_program, "vPosition");
    cube_program_info.attrib_locations.vColor = gl.getAttribLocation(cube_program, "vColor");
    cube_program_info.attrib_locations.vTextcoords = gl.getAttribLocation(cube_program, "vTextcoords");
    cube_program_info.uniform_locations.hideLevel = gl.getUniformLocation(cube_program, "hideLevel");
    cube_program_info.uniform_locations.textureMatrix = gl.getUniformLocation(cube_program, "textureMatrix");
    cube_program_info.uniform_locations.shadowTexture = gl.getUniformLocation(cube_program, "shadowTexture");
    cube_program_info.program = cube_program;

    cube_program_info.texture_location = gl.getUniformLocation(cube_program, "uTexture");


    hole_program_info.uniform_locations.model = gl.getUniformLocation(hole_program, "model");
    hole_program_info.uniform_locations.view = gl.getUniformLocation(hole_program, "view");
    hole_program_info.uniform_locations.projection = gl.getUniformLocation(hole_program, "projection");
    hole_program_info.uniform_locations.colorMult = gl.getUniformLocation(hole_program, "colorMult");
    hole_program_info.attrib_locations.vPosition = gl.getAttribLocation(hole_program, "vPosition");
    hole_program_info.attrib_locations.vColor = gl.getAttribLocation(hole_program, "vColor");
    hole_program_info.attrib_locations.vTextcoords = gl.getAttribLocation(hole_program, "vTextcoords");
    hole_program_info.uniform_locations.hideLevel = gl.getUniformLocation(hole_program, "hideLevel");
    hole_program_info.uniform_locations.textureMatrix = gl.getUniformLocation(hole_program, "textureMatrix");
    hole_program_info.uniform_locations.shadowTexture = gl.getUniformLocation(hole_program, "shadowTexture");
    hole_program_info.program = hole_program;


    // Background sphere
    sphere_program_info.uniform_locations.model = gl.getUniformLocation(sphere_program, "model");
    sphere_program_info.uniform_locations.view = gl.getUniformLocation(sphere_program, "view");
    sphere_program_info.uniform_locations.colorMult = gl.getUniformLocation(sphere_program, "colorMult");
    sphere_program_info.uniform_locations.projection = gl.getUniformLocation(sphere_program, "projection");
    sphere_program_info.uniform_locations.fade = gl.getUniformLocation(sphere_program, "fadeValue");
    sphere_program_info.attrib_locations.vPosition = gl.getAttribLocation(sphere_program, "vPosition");
    sphere_program_info.program = sphere_program;


    // Shadow Program
    shadow_program_info.uniform_locations.model = gl.getUniformLocation(shadow_program, "model");
    shadow_program_info.uniform_locations.view = gl.getUniformLocation(shadow_program, "view");
    shadow_program_info.uniform_locations.projection = gl.getUniformLocation(shadow_program, "projection");
    shadow_program_info.uniform_locations.colorMult = gl.getUniformLocation(shadow_program, "colorMult");
    shadow_program_info.attrib_locations.vPosition = gl.getAttribLocation(shadow_program, "vPosition");
    shadow_program_info.attrib_locations.vColor = gl.getAttribLocation(shadow_program, "vColor");
    shadow_program_info.program = shadow_program;

    
    // Create a texture.
    load_texture(block_texture, "./assets/images/rusty-block.jpg");
    load_texture(not_chosen_texture, "./assets/images/light-grey-block.jpg");

    // Flip image pixels into the bottom-to-top order that WebGL expects.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const sphere = objects_to_draw[3];
    sphere.uniforms.u_model = scale(sphere.radius * 2, sphere.radius * 2, sphere.radius * 2);
    translate_object(sphere, vec3(7.0, 0.0, 4.5))

    // Set up viewport 
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    set_app_state(APP_STATES.MAIN_MENU);

    create_texture_matrix();

    requestAnimFrame(render);
};

document.addEventListener("DOMContentLoaded", init);

//----------------------------------------------------------------------------
// States and animations
//----------------------------------------------------------------------------

const APP_STATES = {
    MAIN_MENU: 0,
    INSTRUCTIONS: 1,
    LEVEL_SCREEN: 2,
    PLAYING: 3,
    INGAME_MENU: 4,
    END_SCREEN: 5,
    INGAME_INSTRUCTIONS: 6,
};

let current_app_state = APP_STATES.MAIN_MENU;

let is_menu_song_playing = false; 
function set_main_menu_state() {
    const saved_state = restore_game_state();

    if (!is_sound_playing(SOUNDS.menu_song)) {
        play_sound(SOUNDS.menu_song);
    }

    if (saved_state !== null) {
        game_state.level = saved_state.level;
        game_state.matrix = saved_state.matrix; // 10 x 15
        game_state.move_counter = saved_state.move_counter;
        game_state.attempts = saved_state.attempts;
        game_state.timer = saved_state.timer;
        show_main_menu(true);
    }
    else {
        show_main_menu(false);
    }
    
}

function set_instructions_state() {
    show_instructions();
}

const LEVEL_SCREEN_TIME = 2;
let remaining_level_screen_time;
function set_level_screen_state() {
    stop_sound(SOUNDS.menu_song);
    play_sound(SOUNDS.level_screen);
    show_level_screen(game_state.level);
    
    remaining_level_screen_time = LEVEL_SCREEN_TIME;
}

function set_playing_state() {
    if (current_app_state === APP_STATES.INGAME_MENU) {
        show_menu_button();
        start_timer();
    }
    else {
        set_level(game_state.level);
        play_sound(SOUNDS.ambience);
        reset_camera();
        fade_counter = 0;
        show_in_game_panels(game_state);
        start_timer();
        show_menu_button();
    }    
} 

function set_ingame_menu_state() {
    stop_timer();
    show_in_game_menu();
}

function set_end_screen_state() {
    remaining_level_screen_time = LEVEL_SCREEN_TIME;
    play_sound(SOUNDS.level_screen);
    show_end_screen();
}

function set_ingame_instructions_state() {
    show_ingame_instructions();
}

function set_app_state(state) {
    switch (state) {
        case APP_STATES.MAIN_MENU: set_main_menu_state(); break;
        case APP_STATES.INSTRUCTIONS: set_instructions_state(); break;
        case APP_STATES.LEVEL_SCREEN: set_level_screen_state(); break;
        case APP_STATES.PLAYING: set_playing_state(); break; 
        case APP_STATES.INGAME_MENU: set_ingame_menu_state(); break;
        case APP_STATES.END_SCREEN: set_end_screen_state(); break;
        case APP_STATES.INGAME_INSTRUCTIONS: set_ingame_instructions_state(); break;
    }
    current_app_state = state;
}

//------------------------------------------------------------------------------

function update_main_menu_state() {

}

function update_instructions_state() {

}

function update_level_screen_state() {
    remaining_level_screen_time -= delta_time;
    if (remaining_level_screen_time <= 0) {
        event_queue.push(GAME_EVENTS.level_screen.end);
    }
}

function update_playing_state() {
    update_player_state();
    update_camera_state();
} 

function update_ingame_menu_state() {

}

function update_end_screen_state() {
    remaining_level_screen_time -= delta_time;
    if (remaining_level_screen_time <= 0) {
        hide_end_screen();
        set_app_state(APP_STATES.MAIN_MENU);
    }
}

function update_app_state() {
    switch (current_app_state) {
        case APP_STATES.MAIN_MENU: update_main_menu_state(); break;
        case APP_STATES.INSTRUCTIONS: update_instructions_state(); break;
        case APP_STATES.LEVEL_SCREEN: update_level_screen_state(); break;
        case APP_STATES.PLAYING: update_playing_state(); break; 
        case APP_STATES.INGAME_MENU: update_ingame_menu_state(); break;
        case APP_STATES.END_SCREEN: update_end_screen_state(); break;
    }
}

//------------------------------------------------------------------------------

function visualize_app_state() {
    switch (current_app_state) {
        case APP_STATES.PLAYING:
        case APP_STATES.INGAME_MENU:
            visualize_game_state();
            visualize_tile_activation();
            update_hide_level();
            update_background_fade();
            break;
    }
}

//------------------------------------------------------------------------------

function draw_app_state(draw_shadow) {
    switch (current_app_state) {
        case APP_STATES.PLAYING:
        case APP_STATES.INGAME_MENU:
            if (player.block_type == LONG) {
                draw_object(objects_to_draw[2], draw_shadow);
            }
            else {
                draw_object(objects_to_draw[0], draw_shadow);
                draw_object(objects_to_draw[1], draw_shadow);
            }

            // Background sphere
            if (!draw_shadow) {
                draw_object(objects_to_draw[3]);
            }
        
            for (let i = TILES_OFFSET; i < objects_to_draw.length; i++) {
                const object = objects_to_draw[i];
                if (!object.hide) {
                    draw_object(object, draw_shadow);
                }
            }
            break;
    }
}

//------------------------------------------------------------------------------

const MOVEMENT_ANGLE = 90.0; // degree
const MOVEMENT_COOLDOWN = 0.225;
const MOVEMENT_ANGULAR_SPEED = 90.0 / MOVEMENT_COOLDOWN; // degree / s

const FALLING_DURATION = [0.2,0.5];

const WINNING_DURATION = 0.7;
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

const AXIS_CONTROL = [
    [[-1,0], [0,-1], [+1,0], [0,+1]],//LEFT
    [[+1,0], [0,+1], [-1,0], [0,-1]],//RIGHT
    [[0,-1], [+1,0], [0,+1], [-1,0]],//UP
    [[0,+1], [-1,0], [0,-1], [+1,0]],//DOWN
];

function get_camera_quadrant() {
    if (camera.alpha > 45 && camera.alpha <= 135) { return 1; }
    else if (camera.alpha > 135 && camera.alpha <= 225) { return 2; }
    else if (camera.alpha > 225 && camera.alpha <= 315) { return 3; }
    else { return 0; }
}

function idle_state() {

    let dir = null;

    if (player_action.left)       { dir = LEFT;  }
    else if (player_action.right) { dir = RIGHT; }
    else if (player_action.up)    { dir = UP;    }
    else if (player_action.down)  { dir = DOWN;  }

    if (dir !== null) {
        const [dx, dz] = AXIS_CONTROL[dir][get_camera_quadrant()];
        apply_action(dir, dx, dz);
    }
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
                play_sound(SOUNDS.victory);
                player.animation = {
                    remaining_time: WINNING_DURATION,
                    falling_speed: 0.0,
                    falling_distance: 0.0,
                }
                break;
            case FALLING:
                game_state.attempts += 1;
                update_in_game_panel_state(game_state);
                if (player.block_type === SHORT || falling_block === BOTH_BLOCKS_FALL || falling_block === FRAGILE_BLOCK_FALLS) {
                    player.animation = {
                        fase: 1, // do not rotate
                        remaining_time: FALLING_DURATION[1],
                        falling_speed: 0.0,
                        falling_distance: 0.0,
                        falling_block: falling_block,
                        fragile_falls: falling_block === FRAGILE_BLOCK_FALLS,
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
                        falling_block: falling_block,
                    }
                    
                    if (!previsualization_events.block_mixed) {
                        player.position[falling_block][1] = -1;
                        player.position[1 - falling_block] = vec3(player.position[falling_block][0], 0, player.position[falling_block][2]);
                    }
                }
                break;
            case SPLITING:
                play_sound(SOUNDS.split);
                player.animation = {
                    remaining_time: MOVEMENT_COOLDOWN,
                    falling_speed: 0.0,
                    falling_distance: -2.5
                }
                break;
        }        
    }
}

function winning_state() {
    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        
        if (game_state.level === 33) {
            stop_timer();
            hide_in_game_panels();
            remove_game_state();
            stop_sound(SOUNDS.ambience);
            //play_sound(SOUNDS.flush_map);
            set_app_state(APP_STATES.END_SCREEN);
        } else {
            set_level(game_state.level + 1);
            save_game_state();
            hide_in_game_panels();
            stop_sound(SOUNDS.ambience);
            //play_sound(SOUNDS.flush_map);
            set_app_state(APP_STATES.LEVEL_SCREEN);
        }
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
            save_game_state();
        }
    }
}

function spliting_state() {
    player.animation.remaining_time -= delta_time;
    if (player.animation.remaining_time <= 0) {
        player.state = IDLE;
        play_sound(SOUNDS.block_move_cube_1);
        play_sound(SOUNDS.block_move_cube_2);
    }
}

function update_player_state() {
    switch (player.state) {
        case IDLE: idle_state(); break;
        case MOVING: moving_state(); break;
        case FALLING: falling_state(); break;
        case WINNING: winning_state(); break;
        case SPLITING: spliting_state(); break;
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

    if (player.animation.fragile_falls === true) {
        const fragile_tile = tile_objects_matrix[z][x];
        set_position(fragile_tile, vec3(x, -1 - player.animation.falling_distance, z));
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

function spliting_visualize_state() {
    player.animation.falling_speed += GRAVITY * delta_time;
    player.animation.falling_distance += player.animation.falling_speed * delta_time;

    const block0 = objects_to_draw[0];
    const [x0, y0, z0] = player.position[0];

    block0.uniforms.u_model = block0.rotation_matrix;
    translate_object(block0, vec3(x0,  Math.max(0, y0 - player.animation.falling_distance), z0));

    const block1 = objects_to_draw[1];
    const [x1, y1, z1] = player.position[1];

    block1.uniforms.u_model = block1.rotation_matrix;
    translate_object(block1, vec3(x1, Math.max(0, y1 - player.animation.falling_distance), z1));
}

let previsualization_events = {
    block_mixed: false,
    change_chosen_block: false,
};

function visualize_game_state() {
    if (previsualization_events.block_mixed) {
        previsualization_events.block_mixed = false;
        
        objects_to_draw[2].rotation_matrix = get_longblock_rotation();

        const falling_block = player.animation.falling_block;
        if (player.state === FALLING && falling_block !== BOTH_BLOCKS_FALL) {
            player.position[falling_block][1] = -1;
            player.position[1 - falling_block] = vec3(player.position[falling_block][0], 0, player.position[falling_block][2]);
        }
    }

    if (previsualization_events.change_chosen_block) {
        previsualization_events.change_chosen_block = false;
        
        // objects_to_draw[player.chosen_block].colors_array = color_cube;
        // objects_to_draw[1 - player.chosen_block].colors_array = color_cube_not_chosen;

        objects_to_draw[player.chosen_block].uniforms.texture = block_texture;
        objects_to_draw[1 - player.chosen_block].uniforms.texture = not_chosen_texture;
    }

    switch (player.state) {
        case IDLE: idle_visualize_state(); break;
        case MOVING: moving_visualize_state(); break;
        case FALLING: falling_visualize_state(); break;
        case WINNING: winning_visualize_state(); break;
        case SPLITING: spliting_visualize_state(); break;
    }
}

//------------------------------------------------------------------------------

let animation_array = [];

function switched_off_animation(animation) {
    if (animation.pre_active) {
        animation.falling_speed += GRAVITY * delta_time;
        animation.falling_distance += animation.falling_speed * delta_time;

        animation.affected_objects.forEach((object) => {
            const [x, y, z] = object.position;
            object.colors_array = color_tile_deactivated;
            object.hide = false;
            set_position(object, vec3(x, y - animation.falling_distance, z));
        });
    }
    else {
        animation.affected_objects.forEach((object) => {
            object.colors_array = color_tile_deactivated;
            object.hide = false;
            set_position(object, object.position);
        });
    }
}

function switched_on_animation(animation) {
    if (!animation.pre_active) {
        animation.falling_speed -= GRAVITY * delta_time;
        if (animation.falling_speed < 0)  animation.falling_speed = 0;
        animation.falling_distance -= animation.falling_speed * delta_time;
        if (animation.falling_distance < 0)  animation.falling_distance = 0;

        animation.affected_objects.forEach((object) => {
            const [x, y, z] = object.position;
            object.colors_array = color_tile_activated;
            object.hide = false;
            set_position(object, vec3(x, y - animation.falling_distance, z));
        });
    }
    else {
        animation.affected_objects.forEach((object) => {
            object.colors_array = color_tile_activated;
            object.hide = false;
            set_position(object, object.position);
        });
    }
}

function visualize_tile_activation() {
    const animations = animation_array;
    animations.forEach((animation) => {
 
        animation.remaining_time -= delta_time;

        if (animation.remaining_time <= 0)
        {
            animation.affected_objects.forEach((object) => {
                object.colors_array = color_tile_switched;
                set_position(object, object.position);
                object.hide = animation.type === SWITCHED_OFF;
            });
            
            animation.remove = true;
        } 
        else
        {   
            switch (animation.type) {
                case SWITCHED_ON: switched_on_animation(animation); break;
                case SWITCHED_OFF: switched_off_animation(animation); break;
            }
        }
    });

    animation_array = [];
    animations.forEach((animation) => {
        if (animation.remove !== true) {
            animation_array.push(animation);
        }
    });
}

//----------------------------------------------------------------------------
// Key control
//----------------------------------------------------------------------------

const key_pressed = {
    reset_camera: false,
    reset_level: false,
    change_chosen_block: false,
    show_menu: false,
};

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

        case " ":
            if (!key_pressed.change_chosen_block) {
                key_pressed.change_chosen_block = true;
                event_queue.push(GAME_EVENTS.playing.change_chosen_block);
            } break;
        case "Enter":
            if (!key_pressed.show_menu) {
                key_pressed.show_menu = true;
                if (current_app_state === APP_STATES.PLAYING) {
                    event_queue.push(GAME_EVENTS.playing.show_menu);
                } else {
                    event_queue.push(GAME_EVENTS.ingame_menu.return_to_game);
                }
            } break;
        case "k": case "K":
            if (!key_pressed.reset_camera) {
                key_pressed.reset_camera = true;
                event_queue.push(GAME_EVENTS.playing.reset_camera);
            } break;
        case "l": case "L":
            if (!key_pressed.reset_level) {
                key_pressed.reset_level = true;
                event_queue.push(GAME_EVENTS.playing.reset_level);
            } break;
        

        case "w": case "W": camera_actions.up = true;    break;
        case "s": case "S": camera_actions.down = true;  break;
        case "a": case "A": camera_actions.left = true;  break;
        case "d": case "D": camera_actions.right = true; break;

        case "-": camera_actions.add_fov = true; break;
        case "+": camera_actions.sub_fov = true; break;
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "ArrowUp":    arrow_key_queue_set_next(UP); player_action.up = false;    break;
        case "ArrowDown":  arrow_key_queue_set_next(DOWN); player_action.down = false;  break;
        case "ArrowLeft":  arrow_key_queue_set_next(LEFT); player_action.left = false;  break;
        case "ArrowRight": arrow_key_queue_set_next(RIGHT); player_action.right = false; break;
    
        case " ":     key_pressed.change_chosen_block = false; break;
        case "Enter": key_pressed.show_menu = false; break;
        case "k": case "K": key_pressed.reset_camera = false; break;
        case "l": case "L": key_pressed.reset_level = false; break;


        case "w": case "W": camera_actions.up = false;    break;
        case "s": case "S": camera_actions.down = false;  break;
        case "a": case "A": camera_actions.left = false;  break;
        case "d": case "D": camera_actions.right = false; break;

        case "-": camera_actions.add_fov = false; break;
        case "+": camera_actions.sub_fov = false; break;
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
    objects_to_draw.length = TILES_OFFSET;
}

let tile_objects_matrix = null;

function generate_tile(program, points, color, textcoords, x, y, z) {
    const tile = {
        program_info: program,
        points_array: points, 
        colors_array: color,
        textcoords_array: textcoords,
        uniforms: {
            u_color_mult: [1.0, 1.0, 1.0, 1.0],
            u_model: translate(x, y, z)
        },
        primitive: gl.TRIANGLES,
        position: vec3(x, y, z),
    };

    tile_objects_matrix[z][x] = tile;
    return tile;
}

function generate_floor() {
    tile_objects_matrix = [];
    tile_objects_matrix.length = LEVEL_MATRIX.H;

    for (let i = 0; i < LEVEL_MATRIX.H; i++) {
        tile_objects_matrix[i] = [];
        tile_objects_matrix[i].length = LEVEL_MATRIX.W;

    for (let j = 0; j < LEVEL_MATRIX.W; j++) {

        const tile = game_state.matrix[i][j];
        switch (tile.type) {
            case AIR:
                break;
            case PLAIN:
                objects_to_draw.push(generate_tile(tile_program_info, points_tile, color_tile_plain, tile_textcoords, j, -1, i));
                break;
            case FRAGILE:
                objects_to_draw.push(generate_tile(tile_program_info, points_tile, color_tile_fragile, tile_textcoords, j, -1, i));
                break;
            case BUTTON:
                const [points_button, color_button] = tile.activation === HEAVY ? [points_heavybutton, color_heavybutton] : [points_softbutton, color_softbutton];
                objects_to_draw.push(generate_tile(program_info, points_button, color_button, undefined, j, 0, i));
                objects_to_draw.push(generate_tile(tile_program_info, points_tile, color_tile_plain, tile_textcoords, j, -1, i));
                break;
            case SPLIT:
                objects_to_draw.push(generate_tile(program_info, points_split, color_split, undefined, j, 0, i));
                objects_to_draw.push(generate_tile(tile_program_info, points_tile, color_tile_plain, tile_textcoords, j, -1, i));
                break;
            case SWITCHED:
                const object = generate_tile(tile_program_info, points_tile, color_tile_switched, tile_textcoords, j, -1, i);
                object.hide = !tile.active;
                if (!tile.affected_objects) { tile.affected_objects = [ object ]; }
                else { tile.affected_objects.push(object); }
                objects_to_draw.push(object);
                break;
            case HOLE:
                hole_object = generate_tile(hole_program_info, points_hole, color_hole, hole_textcoords, j, -1, i);
                hole_object.uniforms.u_hide_level = cube_hide_level;
                objects_to_draw.push(hole_object);
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

// Input events to be processed at the begining of the loop
const GAME_EVENTS = {
    playing: {
        reset_level:            APP_STATES.PLAYING * 100 + 0,
        change_chosen_block:    APP_STATES.PLAYING * 100 + 1,
        reset_camera:           APP_STATES.PLAYING * 100 + 2,
        show_menu:              APP_STATES.PLAYING * 100 + 3,
    },
    
    main_menu: {
        start_new_game:         APP_STATES.MAIN_MENU * 100 + 0,
        continue:               APP_STATES.MAIN_MENU * 100 + 1,
        toggle_sound:           APP_STATES.MAIN_MENU * 100 + 2,
    },

    instructions: {
        next:                   APP_STATES.INSTRUCTIONS * 100 + 0,
        prev:                   APP_STATES.INSTRUCTIONS * 100 + 1,
        start:                  APP_STATES.INSTRUCTIONS * 100 + 2,
        back_to_menu:           APP_STATES.INSTRUCTIONS * 100 + 3,
    },

    level_screen: {
        end:                    APP_STATES.LEVEL_SCREEN * 100 + 0,
    },

    ingame_menu: {
        quit_to_menu:           APP_STATES.INGAME_MENU * 100 + 0,
        return_to_game:         APP_STATES.INGAME_MENU * 100 + 1,
        show_instructions:      APP_STATES.INGAME_MENU * 100 + 2,
    },
};

let event_queue = [];


function main_menu_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.main_menu.start_new_game:
            hide_main_menu();
            set_app_state(APP_STATES.INSTRUCTIONS);
            break;
        case GAME_EVENTS.main_menu.continue:
            hide_main_menu();
            set_app_state(APP_STATES.LEVEL_SCREEN);
            break;
        case GAME_EVENTS.main_menu.toggle_sound:
            if (!is_menu_song_playing) {
                is_menu_song_playing = true;
                play_sound(SOUNDS.menu_song);
            }
            break;
    }
}

function instructions_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.instructions.next:
            next_instructions_page();
            break;
        case GAME_EVENTS.instructions.prev:
            prev_instructions_page();
            break;
        case GAME_EVENTS.instructions.start:
            hide_instructions();
            reset_game_state();
            set_app_state(APP_STATES.LEVEL_SCREEN);
            break;
        case GAME_EVENTS.instructions.back_to_menu:
            hide_instructions();
            set_app_state(APP_STATES.MAIN_MENU);
            break;
    }
}

function ingame_instructions_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.instructions.next:
            next_ingame_instructions_page();
            break;
        case GAME_EVENTS.instructions.prev:
            prev_ingame_instructions_page();
            break;
        case GAME_EVENTS.instructions.start:
            hide_ingame_instructions();
            show_in_game_panels(game_state);
            set_app_state(APP_STATES.INGAME_MENU);
            break;
    }
}

function level_screen_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.level_screen.end:
            hide_level_screen();
            set_app_state(APP_STATES.PLAYING);
            break;
    }
}

function playing_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.playing.reset_level:
            set_level(game_state.level);
            break;
        case GAME_EVENTS.playing.change_chosen_block:
            if (player.block_type === SHORT && player.state === IDLE) {
                player.chosen_block = 1 - player.chosen_block; // Toggle between 1 and 0
                previsualization_events.change_chosen_block = true; 
                play_sound(SOUNDS.split)
            }
            break;
        case GAME_EVENTS.playing.reset_camera:
            reset_camera();
            break;
        case GAME_EVENTS.playing.show_menu:
            set_app_state(APP_STATES.INGAME_MENU);
            break;
    }
} 

function ingame_menu_handle_event(event) {
    switch (event) {
        case GAME_EVENTS.ingame_menu.quit_to_menu:
            save_game_state();
            hide_in_game_menu();
            hide_in_game_panels();
            stop_sound(SOUNDS.ambience);
            set_app_state(APP_STATES.MAIN_MENU);
            break;
        case GAME_EVENTS.ingame_menu.return_to_game:
            hide_in_game_menu();
            set_app_state(APP_STATES.PLAYING);
            break;
        case GAME_EVENTS.ingame_menu.show_instructions:
            hide_in_game_menu();
            hide_in_game_panels();
            set_app_state(APP_STATES.INGAME_INSTRUCTIONS);
            break;
    }
}

function end_screen_handle_event(event) {

}

function process_events() {

    while (event_queue.length > 0) {
        const event = event_queue.pop();
        switch (current_app_state) {
            case APP_STATES.MAIN_MENU: main_menu_handle_event(event); break;
            case APP_STATES.INSTRUCTIONS: instructions_handle_event(event); break;
            case APP_STATES.LEVEL_SCREEN: level_screen_handle_event(event); break;
            case APP_STATES.PLAYING: playing_handle_event(event); break; 
            case APP_STATES.INGAME_MENU: ingame_menu_handle_event(event); break;
            case APP_STATES.END_SCREEN: end_screen_handle_event(event); break;
            case APP_STATES.INGAME_INSTRUCTIONS: ingame_instructions_handle_event(event); break;
        }        
    }
}


//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------

function draw_object(object, draw_shadow) {
    if (draw_shadow) {
        gl.useProgram(shadow_program);

        set_buffers_and_attributes(shadow_program_info, object.points_array, object.colors_array, object.textcoords_array);

        set_shadow_camera_uniforms(shadow_program_info);

        set_uniforms(shadow_program_info, object.uniforms);
        
        // Draw
        gl.drawArrays(object.primitive, 0, object.points_array.length);
    } else {
        gl.useProgram(object.program_info.program);

        // Setup buffers and attributes
        set_buffers_and_attributes(object.program_info, object.points_array, object.colors_array, object.textcoords_array);

        set_camera_uniforms(object.program_info);

        // Set the uniforms
        set_uniforms(object.program_info, object.uniforms);

        // Draw
        gl.drawArrays(object.primitive, 0, object.points_array.length);
    }
}

function render() {

    process_events();

    //----------------------------------------------------------------------------

    update_delta_time();
    update_app_state()

    //----------------------------------------------------------------------------

    visualize_app_state();

    //----------------------------------------------------------------------------
    // DRAW
    //----------------------------------------------------------------------------

    const draw_shadow = true;
    
    //draw to the depth texture
    gl.activeTexture(shadow_tools.texture_unit);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_tools.depth_framebuffer);
    gl.viewport(0, 0, shadow_tools.depth_texture_size, shadow_tools.depth_texture_size);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw_app_state(draw_shadow);

    // now draw scene to the canvas projecting the depth texture into the scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.activeTexture(shadow_tools.texture_unit);
    gl.bindTexture(gl.TEXTURE_2D, shadow_tools.depth_texture);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw_app_state(false);

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

function set_camera_uniforms(program_info) {
    projection = perspective( camera.fov, canvas.width/canvas.height, 0.1, 100.0 );
	gl.uniformMatrix4fv( program_info.uniform_locations.projection, gl.FALSE, projection ); // copy projection to uniform value in shader

    var view = lookAt(camera.eye, camera.at, camera.up);
    gl.uniformMatrix4fv(program_info.uniform_locations.view, gl.FALSE, view); // copy view to uniform value in shader
}

function set_shadow_camera_uniforms(program_info) {
	gl.uniformMatrix4fv(program_info.uniform_locations.projection, gl.FALSE, light_projection );
    gl.uniformMatrix4fv(program_info.uniform_locations.view, gl.FALSE, light_view);
}

function is_location(location) {
    return location !== undefined &&
        location !== null && location !== -1;
}

function set_uniforms(program_info, uniforms) {
    // Copy uniform model values to corresponding values in shaders
    gl.uniform4f(program_info.uniform_locations.colorMult, uniforms.u_color_mult[0], uniforms.u_color_mult[1], uniforms.u_color_mult[2], uniforms.u_color_mult[3]);
    gl.uniformMatrix4fv(program_info.uniform_locations.model, gl.FALSE, uniforms.u_model);
    
    if (is_location(program_info.uniform_locations.textureMatrix)) {
        gl.uniformMatrix4fv(program_info.uniform_locations.textureMatrix, gl.FALSE, shadow_tools.texture_matrix);
    }
    
    if (is_location(program_info.uniform_locations.shadowTexture))
    {
        gl.activeTexture(shadow_tools.texture_unit);
        gl.bindTexture(gl.TEXTURE_2D, shadow_tools.depth_texture);
        gl.uniform1i(program_info.uniform_locations.shadowTexture, shadow_tools.texture_unit_num);
    }

    //Hide Level
    if (is_location(program_info.uniform_locations.hideLevel)) {
        gl.uniform1f(program_info.uniform_locations.hideLevel, uniforms.u_hide_level.level);
    }

    if (is_location(program_info.uniform_locations.fade)) {
        gl.uniform1f(program_info.uniform_locations.fade, uniforms.fade);
    }

    if (is_location(program_info.texture_location)) {
        gl.activeTexture(uniforms.texture.unit);
        gl.bindTexture(gl.TEXTURE_2D, uniforms.texture.texture);
        gl.uniform1i(program_info.texture_location, uniforms.texture.unit_num);
    }
}

function set_buffers_and_attributes(program_info, points_array, colors_array, textcoords_array) {
    // Load the data into GPU data buffers
    // Vertices
    //var vertex_buffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vertex_buffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points_array), gl.STATIC_DRAW );
    gl.vertexAttribPointer( program_info.attrib_locations.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program_info.attrib_locations.vPosition );

    // Colors
    //var color_buffer = gl.createBuffer();
    if (is_location(program_info.attrib_locations.vColor)) {
        gl.bindBuffer( gl.ARRAY_BUFFER, color_buffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colors_array), gl.STATIC_DRAW );
        gl.vertexAttribPointer( program_info.attrib_locations.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
        gl.enableVertexAttribArray( program_info.attrib_locations.vColor );
    }

    // (u, v)
    if (is_location(program_info.attrib_locations.vTextcoords)) {
        //var textcoords_buffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, textcoords_buffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(textcoords_array), gl.STATIC_DRAW );
        gl.vertexAttribPointer( program_info.attrib_locations.vTextcoords, 2, gl.FLOAT, gl.FALSE, 0, 0 );
        gl.enableVertexAttribArray( program_info.attrib_locations.vTextcoords );       
    }
}

function create_texture_matrix() {
    let texture_matrix = new mat4();
    texture_matrix = mult(texture_matrix, translate(0.5, 0.5, 0.5));
    texture_matrix = mult(texture_matrix, scale(0.5, 0.5, 0.5));
    texture_matrix = mult(texture_matrix, light_projection);
    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this world space.
    shadow_tools.texture_matrix = mult(texture_matrix, light_view);
}


//------------------------------------------------------------------------------
// Shaders uniform variadic parameters
//------------------------------------------------------------------------------

let hole_object;

let cube_hide_level = { level: -1000.0 };

const cube_NO_hide_level = { level: -1000.0 };


function update_hide_level() {

    // Get top vertices of hole
    const [x, y, z] = hole_object.position;
    const vertices = [
        vec3(x + 0.5, y + 0.5, z + 0.5),
        vec3(x - 0.5, y + 0.5, z + 0.5),
        vec3(x + 0.5, y + 0.5, z - 0.5),
        vec3(x - 0.5, y + 0.5, z - 0.5)
    ];

    const d = vertices.map((v, idx) => {
        const a = (v[0] - camera.eye[0]);
        const b = (v[1] - camera.eye[1]);
        const c = (v[2] - camera.eye[2]);
        return [a*a + b*b + c*c, idx];
    });

    d.sort((a, b) => {
        return a[0] - b[0];
    });

    const r = normalize(subtract(vertices[d[0][1]], camera.eye));
    
    const n = normalize(cross(vec3(0, 1, 0), subtract(vertices[d[2][1]], vertices[d[3][1]]) ));

    const v0 = vertices[d[0][1]];
    const v3 = vertices[d[3][1]];

    let level = eval_level(r, v0, n, v3);

    cube_hide_level.level = level < 0 ? level : -1000;

    if (player.state === WINNING) {
        objects_to_draw[0].uniforms.u_hide_level = cube_hide_level;
        objects_to_draw[1].uniforms.u_hide_level = cube_hide_level;
        objects_to_draw[2].uniforms.u_hide_level = cube_hide_level;
    } else {
        objects_to_draw[0].uniforms.u_hide_level = cube_NO_hide_level;
        objects_to_draw[1].uniforms.u_hide_level = cube_NO_hide_level;
        objects_to_draw[2].uniforms.u_hide_level = cube_NO_hide_level;
    }
}

function eval_level(r, p, n, o) {
    const nd = dot(n, r);
    if (nd === 0) {
        return -1000;
    }
    const t = (dot(n, subtract(o, p))) / nd;
    return add(p, mult(t, r))[1];
}


const FADE_MAX = 18;
const FADE_MIN = 12;

const FADE_SPEED = 2.0;

let fade_counter = 0.0;

function update_background_fade() {
    fade_counter += delta_time * FADE_SPEED;
    if (fade_counter > 2 * Math.PI) {
        fade_counter -= 2 * Math.PI;    
    }

    objects_to_draw[3].uniforms.fade = (Math.cos(fade_counter) + 1) * (FADE_MAX - FADE_MIN) + FADE_MIN;
}


