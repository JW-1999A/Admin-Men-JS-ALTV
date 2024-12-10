import * as alt from 'alt-client';
import * as native from 'natives';

let adminMenu = null;
let noclipActive = false;
let noclipSpeed = 1.0;
const NOCLIP_SPEEDS = [1.0, 2.0, 4.0, 8.0, 16.0];
let currentSpeedIndex = 0;

console.log('[ADMIN] Client Script started');

alt.on('keyup', (key) => {
    if (key === 117) { // F6
        toggleAdminMenu();
    }
});

function toggleAdminMenu() {
    if (!adminMenu) {
        adminMenu = new alt.WebView('http://resource/client/index.html');
        adminMenu.focus();
        alt.showCursor(true);
        alt.toggleGameControls(false);
        setupAdminMenuEvents();
    } else {
        adminMenu.unfocus();
        adminMenu.destroy();
        adminMenu = null;
        alt.showCursor(false);
        alt.toggleGameControls(true);
    }
}


function setupAdminMenuEvents() {
    adminMenu.on('admin:teleportToCoords', (coords) => {
        alt.emitServer('admin:teleportToCoords', coords);
    });

    adminMenu.on('admin:teleportToPlayer', (playerId) => {
        alt.emitServer('admin:teleportToPlayer', playerId);
    });

    adminMenu.on('admin:kickPlayer', (playerId) => {
        alt.emitServer('admin:kickPlayer', playerId);
    });

    adminMenu.on('admin:banPlayer', (playerId) => {
        alt.emitServer('admin:banPlayer', playerId);
    });

    adminMenu.on('admin:healPlayer', (playerId) => {
        alt.emitServer('admin:healPlayer', playerId);
    });

    adminMenu.on('admin:spawnVehicle', (model) => {
        alt.emitServer('admin:spawnVehicle', model);
    });

    adminMenu.on('admin:toggleNoclip', (state) => {
        noclipActive = state;
        game.freezeEntityPosition(alt.Player.local.scriptID, state);
        game.setEntityCollision(alt.Player.local.scriptID, !state, true);
    });

    adminMenu.on('admin:savePosition', () => {
        const pos = alt.Player.local.pos;
        adminMenu.emit('admin:updatePosition', pos);
    });
}

function handleNoclip() {
    if (!noclipActive) return;

    const pos = alt.Player.local.pos;
    const rot = game.getGameplayCamRot(2);
    const forward = game.getForwardVector(rot);
    let multiplier = noclipSpeed;

    if (game.isControlPressed(0, 21)) { // LSHIFT
        multiplier *= 2;
    }

    if (game.isControlPressed(0, 32)) { // W
        pos.x += forward.x * multiplier;
        pos.y += forward.y * multiplier;
        pos.z += forward.z * multiplier;
    }
    if (game.isControlPressed(0, 33)) { // S
        pos.x -= forward.x * multiplier;
        pos.y -= forward.y * multiplier;
        pos.z -= forward.z * multiplier;
    }
    if (game.isControlPressed(0, 34)) { // A
        const right = game.getForwardVector(new alt.Vector3(0, 0, rot.z + 90));
        pos.x -= right.x * multiplier;
        pos.y -= right.y * multiplier;
    }
    if (game.isControlPressed(0, 35)) { // D
        const right = game.getForwardVector(new alt.Vector3(0, 0, rot.z + 90));
        pos.x += right.x * multiplier;
        pos.y += right.y * multiplier;
    }
    if (game.isControlPressed(0, 22)) { // SPACE
        pos.z += multiplier;
    }
    if (game.isControlPressed(0, 36)) { // LCTRL
        pos.z -= multiplier;
    }

    alt.emitServer('admin:setPosition', pos);
}

alt.everyTick(handleNoclip);

async function teleportToWaypoint() {
    const waypointBlip = game.getFirstBlipInfoId(8);
    if (!game.doesBlipExist(waypointBlip)) {
        alt.emit('notification', 'No waypoint set!');
        return;
    }

    const coords = game.getBlipInfoIdCoord(waypointBlip);
    const groundZ = await getGroundZ(coords);
    
    if (groundZ) {
        coords.z = groundZ;
        alt.emitServer('admin:setPosition', coords);
    }
}

async function getGroundZ(coords) {
    let groundZ = 0;
    for (let z = 1000; z > 0; z -= 25) {
        coords.z = z;
        const [, height] = game.getGroundZFor3dCoord(coords.x, coords.y, z, 0, false);
        if (height) {
            groundZ = height + 1;
            break;
        }
    }
    return groundZ;
}
