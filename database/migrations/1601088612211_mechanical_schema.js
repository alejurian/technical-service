"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class MechanicalSchema extends Schema {
  up() {
    this.create("mechanicals", (table) => {
      table.increments();
      table.string("name");
      table.string("email").unique();
      table
        .integer("branch_id")
        .unsigned()
        .references("id")
        .inTable("branches");
      table.timestamps();
    });
  }

  down() {
    this.drop("mechanicals");
  }
}

module.exports = MechanicalSchema;
