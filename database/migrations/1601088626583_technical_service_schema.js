"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class TechnicalServiceSchema extends Schema {
  up() {
    this.create("technical_services", (table) => {
      table.increments();
      table.string("name");
      table.string("email");
      table.timestamp("date");
      table
        .integer("mechanical_id")
        .unsigned()
        .references("id")
        .inTable("mechanicals");
      table.timestamps();
    });
  }

  down() {
    this.drop("technical_services");
  }
}

module.exports = TechnicalServiceSchema;
