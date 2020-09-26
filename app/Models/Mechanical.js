"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Mechanical extends Model {
  branches() {
    return this.hasOne("App/Models/Branch");
  }

  technicalServices() {
    return this.hasMany("App/Models/TechnicalService");
  }
}

module.exports = Mechanical;
