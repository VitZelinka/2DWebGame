const db_planet = require('./db_planet.js');
const db_user = require('./db_user.js');

module.exports = {
    planet: db_planet,
    user: db_user
  }