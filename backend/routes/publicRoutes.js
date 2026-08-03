const express = require('express');
const router = express.Router();
const resolveTenant = require('../middleware/resolveTenant');
const {
  getHome,
  getFamily,
  getGallery,
  getVideos,
  getEvents,
  getLiveStreams,
  getPosts,
  getAnnouncements,
  getFamilyTree,
  getMembers
} = require('../controllers/publicController');

// Apply middleware to all public routes
router.use(resolveTenant);

router.get('/home', getHome);

router.get('/family', getFamily);
router.get('/gallery', getGallery);
router.get('/videos', getVideos);
router.get('/events', getEvents);
router.get('/livestreams', getLiveStreams);
router.get('/posts', getPosts);
router.get('/announcements', getAnnouncements);
router.get('/family-tree', getFamilyTree);
router.get('/members', getMembers);

module.exports = router;
