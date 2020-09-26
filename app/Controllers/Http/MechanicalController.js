"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { validate } = use("Validator");
const Mechanical = use("App/Models/Mechanical");

/**
 * Resourceful controller for interacting with mechanicals
 */
class MechanicalController {
  /**
   * Show a list of all mechanicals.
   * GET mechanicals
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    const mechanicals = await Mechanical.all();
    return { success: true, mechanicals };
  }

  /**
   * Create/save a new mechanical.
   * POST mechanicals
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const rules = {
      name: "required|string",
      email: "required|email|unique:mechanicals,email",
      branch_id: "required|integer|exists:branches,id",
    };

    const validation = await validate(request.all(), rules);

    if (validation.fails()) {
      return response.badRequest({
        success: false,
        message: validation.messages()[0].message,
        errors: validation.messages(),
      });
    }

    const { name, email, branch_id } = request.post();

    const mechanical = await Mechanical.create({ email, name, branch_id });
    return { success: true, mechanical };
  }

  /**
   * Display a single mechanical.
   * GET mechanicals/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Update mechanical details.
   * PUT or PATCH mechanicals/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a mechanical with id.
   * DELETE mechanicals/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = MechanicalController;
