const db_planet = require('./db_planet.js');
const db_user = require('./db_user.js');
const db_chunk = require('./db_chunk.js');

module.exports = {
    planet: db_planet,
    user: db_user,
    chunk: db_chunk
}