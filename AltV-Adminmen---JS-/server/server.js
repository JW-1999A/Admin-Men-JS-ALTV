import * as alt from 'alt-server';

function isAdmin(player) {
    return player.adminLevel >= 1;
}

alt.onClient('admin:teleportToCoords', (player, coords) => {
    if (!isAdmin(player)) return;
    player.pos = coords;
});

alt.onClient('admin:teleportToPlayer', (player, targetId) => {
    if (!isAdmin(player)) return;
    const target = alt.Player.getByID(parseInt(targetId));
    if (target) {
        player.pos = target.pos;
    }
});

alt.onClient('admin:kickPlayer', (player, targetId) => {
    if (!isAdmin(player)) return;
    const target = alt.Player.getByID(parseInt(targetId));
    if (target) {
        target.kick('Kicked by admin');
    }
});

alt.onClient('admin:banPlayer', (player, targetId) => {
    if (!isAdmin(player)) return;
    const target = alt.Player.getByID(parseInt(targetId));
    if (target) {
        // Implement your ban logic here
        target.kick('Banned by admin');
    }
});

alt.onClient('admin:healPlayer', (player, targetId) => {
    if (!isAdmin(player)) return;
    const target = targetId ? alt.Player.getByID(parseInt(targetId)) : player;
    if (target) {
        target.health = 200;
    }
});

alt.onClient('admin:spawnVehicle', (player, model) => {
    if (!isAdmin(player)) return;
    const vehicle = new alt.Vehicle(model, player.pos.x, player.pos.y, player.pos.z, 0, 0, 0);
});

alt.onClient('admin:setPosition', (player, pos) => {
    if (!isAdmin(player)) return;
    player.pos = pos;
});

alt.on('playerConnect', (player) => {
    player.adminLevel = 1;
    console.log(`Player ${player.name} connected - Admin level set to 1`);
});
