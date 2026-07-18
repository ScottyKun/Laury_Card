const { randomUUID } = require("crypto");
const milestoneModel = require("../models/milestoneModel");

async function createMilestone(req, res) {
  const { label, startDate, minorFrequency, minorDay } = req.body;

  if (!label || !startDate || !minorFrequency || !minorDay) {
    return res.status(400).json({ error: "Tous les champs sont requis" });
  }

  try {
    const milestone = await milestoneModel.create({
      id: randomUUID(), ownerId: req.userId, label, startDate, minorFrequency, minorDay,
    });
    res.status(201).json({ milestone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function listMilestones(req, res) {
  try {
    const milestones = await milestoneModel.findAllByOwner(req.userId);
    res.json({ milestones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function deleteMilestone(req, res) {
  try {
    const deleted = await milestoneModel.remove(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: "Jalon introuvable" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { createMilestone, listMilestones, deleteMilestone };