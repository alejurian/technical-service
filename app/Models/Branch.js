"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Branch extends Model {
  mechanicals() {
    return this.hasMany("App/Models/Mechanical");
  }

  technicalService() {
    return this.manyThrough("App/Models/Mechanical", "technicalServices");
  }
}

module.exports = Branch;
