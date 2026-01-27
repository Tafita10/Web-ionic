const authService = require('../services/authService');

// Inscription
const register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const result = await authService.register(email, password, displayName);
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Connexion
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const result = await authService.login(email, password);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Mise à jour utilisateur
const updateUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    const result = await authService.updateUser(uid, updates);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Récupérer un utilisateur
const getUser = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const user = await authService.getUser(uid);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  updateUser,
  getUser
};
