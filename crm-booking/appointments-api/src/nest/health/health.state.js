const { defineInjectable } = require('../common/injection');

class HealthState {
  constructor() {
    this.databaseConnected = false;
  }

  isDatabaseConnected() {
    return this.databaseConnected;
  }

  setDatabaseConnected(connected) {
    this.databaseConnected = Boolean(connected);
  }
}

defineInjectable(HealthState, []);

module.exports = HealthState;
