"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class TechnicalService extends Model {
  mechanical() {
    return this.belongsTo("App/Models/Mechanical");
  }
}

module.exports = TechnicalService;
