const db = require('../db');
const STEPS = require('../config/steps');

/**
 * Checks whether a single step applies to a given user profile.
 * Returns true if the step should be included in their roadmap.
 */
const stepApplies = (step, profile) => {
  const rules = step.appliesTo;

  // null means the step applies to absolutely everyone
  if (!rules) return true;

  // Check nationality rule
  // non-eu means anyone who is NOT Irish, British, or EU
  if (rules.nationalities) {
    const euNationalities = [
      'irish', 'british', 'german', 'french', 'italian',
      'spanish', 'polish', 'dutch', 'portuguese', 'swedish',
      'danish', 'finnish', 'belgian', 'austrian', 'greek'
    ];
    const isEU = euNationalities.includes(
      profile.nationality?.toLowerCase()
    );
    if (rules.nationalities.includes('non-eu') && isEU) return false;
  }

  // Check employment rule
  if (rules.employment) {
    if (!rules.employment.includes(profile.employment_status)) {
      return false;
    }
  }

  // Check has_children rule
  if (rules.has_children !== undefined) {
    if (rules.has_children !== profile.has_children) return false;
  }

  // Check has_driving_licence rule
  if (rules.has_driving_licence !== undefined) {
    if (rules.has_driving_licence !== profile.has_driving_licence) {
      return false;
    }
  }

  return true;
};

/**
 * Calculates a due date for steps that have a deadline.
 * For example IRP card must be done within 90 days of arrival.
 */
const calculateDueDate = (step, arrivalDate) => {
  if (!step.due_days_from_arrival || !arrivalDate) return null;

  const due = new Date(arrivalDate);
  due.setDate(due.getDate() + step.due_days_from_arrival);

  // Returns date as "YYYY-MM-DD" string for PostgreSQL
  return due.toISOString().split('T')[0];
};

/**
 * Main function — generates and saves the roadmap for a user.
 * Called once after the user completes the onboarding quiz.
 */
const generateRoadmap = async (userId, profile) => {
  // Step 1 — filter the catalogue down to only relevant steps
  const applicableSteps = STEPS.filter(
    step => stepApplies(step, profile)
  );

  // Step 2 — build and run all DB inserts in parallel
  const insertPromises = applicableSteps.map(step => {
    const dueDate = calculateDueDate(step, profile.arrival_date);

    return db.query(
      `INSERT INTO roadmap_steps
         (user_id, step_key, title, description, order_index, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, step_key) DO NOTHING`,
      [
        userId,
        step.key,
        step.title,
        step.description,
        step.order_index,
        dueDate,
      ]
    );
  });

  // Step 3 — wait for ALL inserts to finish
  await Promise.all(insertPromises);

  // Return how many steps were generated
  return applicableSteps.length;
};

module.exports = { generateRoadmap };