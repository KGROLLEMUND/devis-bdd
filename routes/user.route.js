const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Route pour obtenir tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isSubscribed: true,
        oauthProvider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour obtenir un utilisateur par email
// Important: Cette route doit être avant la route /:id pour éviter les conflits
router.get('/email/:email', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.params.email },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isSubscribed: true,
        oauthProvider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour obtenir un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Recherche d\'utilisateur par ID:', req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isSubscribed: true,
        oauthProvider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      console.log('Utilisateur non trouvé avec l\'ID:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Utilisateur trouvé:', user);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Route pour créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isSubscribed: true,
        oauthProvider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour mettre à jour le statut d'abonnement d'un utilisateur
router.put('/subscription/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { isSubscribed, subscriptionId, subscriptionEndDate } = req.body;
    
    // Vérifier que l'email est fourni
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Préparer les données de mise à jour
    const updateData = {};
    
    if (isSubscribed !== undefined) {
      updateData.isSubscribed = isSubscribed;
    }
    
    if (subscriptionId !== undefined) {
      updateData.subscriptionId = subscriptionId;
    }
    
    if (subscriptionEndDate !== undefined) {
      updateData.subscriptionEndDate = new Date(subscriptionEndDate);
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isSubscribed: true,
        subscriptionId: true,
        subscriptionEndDate: true,
        oauthProvider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router; 