"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class BranchSchema extends Schema {
  up() {
    this.create("branches", (table) => {
      table.increments();
      table.string("name");
      table.timestamps();
    });
  }

  down() {
    this.drop("branches");
  }
}

module.exports = BranchSchema;
