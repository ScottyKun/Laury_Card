const cron = require("node-cron");
const pool = require("../db");
const milestoneModel = require("../models/milestoneModel");
const { notifyUser } = require("../services/notificationService");

function elapsedYearsMonths(startDate, today) {
  let years = today.getFullYear() - startDate.getFullYear();
  let months = today.getMonth() - startDate.getMonth();
  if (today.getDate() < startDate.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  return { years, months };
}

function monthsBetween(startDate, today) {
  return (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
}

function formatDuration(years, months) {
  const parts = [];
  if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`);
  if (months > 0 || years === 0) parts.push(`${months} mois`);
  return parts.join(" et ");
}

async function runMilestonesJob() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const milestones = await milestoneModel.findAllGlobal();

  for (const milestone of milestones) {
    const startDate = new Date(milestone.start_date);
    const diffMonths = monthsBetween(startDate, today);
    if (diffMonths < 0) continue; // le jalon n'a pas encore commencé

    const alreadySent = await notificationModel.existsTodayForMilestone(milestone.owner_id, milestone.id, todayStr);
    if (alreadySent) continue;

    let message = null;

    // Rappel majeur : anniversaire annuel exact (même mois/jour que le départ)
    const isYearlyAnniversary =
      today.getDate() === startDate.getDate() &&
      today.getMonth() === startDate.getMonth() &&
      diffMonths >= 12;

    if (isYearlyAnniversary) {
      const { years } = elapsedYearsMonths(startDate, today);
      message = `🎉 Joyeux anniversaire ! Cela fait ${years} an${years > 1 ? "s" : ""} de ${milestone.label} aujourd'hui.`;
    } else if (
      today.getDate() === milestone.minor_day &&
      diffMonths >= 1 &&
      (milestone.minor_frequency === "monthly" || diffMonths % 2 === 0)
    ) {
      const { years, months } = elapsedYearsMonths(startDate, today);
      message = `💕 Cela fait ${formatDuration(years, months)} de ${milestone.label} aujourd'hui.`;
    }

    if (message) {
      await notifyUser({
        userId: milestone.owner_id,
        type: "milestone",
        message: `[[${milestone.id}]] ${message}`,
      });
    }
  }
}

async function runNudgeJob() {
  const usersResult = await pool.query("SELECT id FROM users");

  for (const user of usersResult.rows) {
    const last = await notificationModel.findLastByType(user.id, "nudge");
    const daysSinceLast = last
      ? (Date.now() - new Date(last.created_at).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (daysSinceLast >= 14) {
      await notifyUser({
        userId: user.id,
        type: "nudge",
        message: "✨ Ça fait un moment ! Envie de créer une nouvelle carte ou un livre de souvenirs ?",
      });
    }
  }
}

function startScheduler() {
  // Tous les jours à 8h du matin
  cron.schedule("0 8 * * *", async () => {
    try {
      await runMilestonesJob();
      await runNudgeJob();
    } catch (err) {
      console.error("Erreur dans le job planifié:", err);
    }
  });

  console.log("Planificateur de notifications démarré (jalons + relances).");
}

module.exports = { startScheduler, runMilestonesJob, runNudgeJob };