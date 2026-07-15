const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const SALT_ROUNDS = 10;

async function register(req, res) {
  const { firstName, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit faire au moins 8 caractères" });
  }

  try {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.create({ firstName, email, passwordHash });

    res.status(201).json({ user});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user.id, email: user.email, created_at: user.created_at },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function me(req, res) {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updateProfile(req, res) {
  const { firstName, email } = req.body;

  if (!firstName || !email) {
    return res.status(400).json({ error: "Prénom et email requis" });
  }

  try {
    const existing = await userModel.findByEmail(email);
    if (existing && existing.id !== req.userId) {
      return res.status(409).json({ error: "Cet email est déjà utilisé par un autre compte" });
    }

    const user = await userModel.updateProfile(req.userId, { firstName, email });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Mot de passe actuel et nouveau mot de passe requis" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit faire au moins 8 caractères" });
  }

  try {
    const user = await userModel.findById(req.userId);
    // findById ne retourne pas password_hash (volontairement, pour /me) — requête directe nécessaire ici
    const fullUser = await userModel.findByEmail(user.email); // contient password_hash
    const match = await bcrypt.compare(currentPassword, fullUser.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Mot de passe actuel incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userModel.updatePassword(req.userId, newHash);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { register, login, me, updateProfile, updatePassword };