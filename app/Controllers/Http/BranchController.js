"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const moment = use("moment");
const { validate } = use("Validator");
const Branch = use("App/Models/Branch");

async function getFreeMechanical(branchId, date) {
  const branch = await Branch.query()
    .where({ id: branchId })
    .whereHas("mechanicals", (builder) => {
      builder.whereDoesntHave("technicalServices", (qb) => {
        qb.whereBetween("date", [
          date,
          moment(date).add(20, "minutes").format(),
        ]);
      });
    })
    .first();
  return branch;
}

/**
 * Resourceful controller for interacting with branches
 */
class BranchController {
  /**
   * Show a list of all branches.
   * GET branches
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    let branches = await Branch.query().with("technicalService").fetch();

    const today = moment().format("YYYY-MM-DD");
    const dayOfWeek = moment(today).format("dddd");
    const startWorkingTime = moment(`${today} 13:00:00`).format();
    const endWorkingTime = moment(`${today} 14:40:00`).format();

    branches = await Promise.all(
      branches.toJSON().map(async (branch) => {
        let tempDate = startWorkingTime;
        const availableSchedules = [];
        if (["Saturday", "Sunday"].includes(dayOfWeek)) {
          delete branch.technicalService;
          return {
            ...branch,
            availableSchedules,
          };
        }
        const freeMechanical = await getFreeMechanical(branch.id, tempDate);
        if (freeMechanical) {
          availableSchedules.push(tempDate);
        }
        do {
          tempDate = moment(tempDate).add(20, "minutes").format();
          const freeMechanical = await getFreeMechanical(branch.id, tempDate);
          console.log(!!freeMechanical, branch.id, tempDate);
          if (freeMechanical) {
            availableSchedules.push(tempDate);
          }
        } while (tempDate !== endWorkingTime);
        delete branch.technicalService;
        return {
          ...branch,
          availableSchedules,
        };
      })
    );
    return { success: true, branches };
  }

  /**
   * Create/save a new branch.
   * POST branches
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    const rules = { name: "required|string" };

    const validation = await validate(request.all(), rules);

    if (validation.fails()) {
      return response.badRequest({
        success: false,
        message: validation.messages()[0].message,
        errors: validation.messages(),
      });
    }

    const { name } = request.post();
    const isBranchRegistered = await Branch.findBy("name", name);
    if (isBranchRegistered) {
      return response.badRequest({
        success: false,
        message: "There's already a branch with that name registered.",
      });
    }

    const branch = await Branch.create({ name });
    return { success: true, branch };
  }

  /**
   * Display a single branch.
   * GET branches/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {}

  /**
   * Update branch details.
   * PUT or PATCH branches/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {}

  /**
   * Delete a branch with id.
   * DELETE branches/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {}
}

module.exports = BranchController;
