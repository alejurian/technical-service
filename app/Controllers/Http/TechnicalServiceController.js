"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { validate, rule } = use("Validator");
const moment = use("moment");
const TechnicalService = use("App/Models/TechnicalService");
const Branch = use("App/Models/Branch");

/**
 * Resourceful controller for interacting with technicalservices
 */
class TechnicalServiceController {
  /**
   * Show a list of all technicalservices.
   * GET technicalservices
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    const technicalServices = await TechnicalService.query()
      .with("mechanical")
      .fetch();
    return { success: true, technicalServices };
  }

  /**
   * Create/save a new technicalservice.
   * POST technicalservices
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const rules = {
      name: "required|string",
      email: "required|email",
      branch_id: "required|integer|exists:branches,id",
      date: [rule("required"), rule("dateFormat", "YYYY-MM-DD HH:mm")],
    };

    const validation = await validate(request.all(), rules);

    if (validation.fails()) {
      return response.badRequest({
        success: false,
        message: validation.messages()[0].message,
        errors: validation.messages(),
      });
    }

    const { name, email, mechanical_id } = request.post();
    let { date } = request.post();
    const dayOfWeek = moment(date).format("dddd");
    const dateOnUnix = moment(date).unix();
    const dateFormatted = moment(date).format("YYYY-MM-DD");
    const startWorkingTime = moment(`${dateFormatted} 13:00:00`).unix();
    const endWorkingTime = moment(`${dateFormatted} 14:40:00`).unix();
    const validTime =
      startWorkingTime >= dateOnUnix || dateOnUnix <= endWorkingTime;
    if (["Saturday", "Sunday"].includes(dayOfWeek) || !validTime) {
      return response.badRequest({
        success: false,
        message: "Only works Monday through Friday from 13:00 hrs to 15:00 hrs",
      });
    }
    const roundedUp = Math.ceil(moment(date).minute() / 20) * 20;
    date = moment(date).minute(roundedUp).second(1).format();

    let freeMecanics = await Branch.query()
      .whereHas("mechanicals", (builder) => {
        builder.whereDoesntHave("technicalServices", (qb) => {
          qb.whereBetween("date", [
            date,
            moment(date).add(20, "minutes").format(),
          ]);
        });
      })
      .with("mechanicals", (builder) => {
        builder.whereDoesntHave("technicalServices", (qb) => {
          qb.whereBetween("date", [
            date,
            moment(date).add(20, "minutes").format(),
          ]);
        });
      })
      .first();
    if (!freeMecanics) {
      return response.badRequest({
        success: false,
        message: "The branch has no free mechanicals.",
      });
    }
    freeMecanics = freeMecanics.toJSON();
    const freeMecanicId = freeMecanics.mechanicals[0].id;
    const technicalservice = await TechnicalService.create({
      email,
      name,
      mechanical_id: freeMecanicId,
      date,
    });
    return { success: true, technicalservice };
  }

  /**
   * Display a single technicalservice.
   * GET technicalservices/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Render a form to update an existing technicalservice.
   * GET technicalservices/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit({ params, request, response, view }) {}

  /**
   * Update technicalservice details.
   * PUT or PATCH technicalservices/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a technicalservice with id.
   * DELETE technicalservices/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = TechnicalServiceController;
