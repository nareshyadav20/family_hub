const prisma = require('../prismaClient');

const getHome = async (req, res) => {
  try {
    const familyId = req.familyId;
    if (!familyId) {
      return res.status(400).json({ error: 'Family ID is required' });
    }
    
    // Fetch all related entities in parallel
    const [
      feed,
      gallery,
      videos,
      events,
      livestreams,
      announcements,
      members,
      familyTree,
      posts
    ] = await Promise.all([
      prisma.familyFeed.findMany({
        where: { familyId, visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.document.findMany({
        where: { familyId, type: { contains: 'image' }, visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.document.findMany({
        where: { familyId, type: { contains: 'video' }, visibility: 'PUBLIC' },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.event.findMany({
        where: { familyId, visibility: 'Public' },
        orderBy: { eventDate: 'desc' },
        take: 10
      }),
      prisma.event.findMany({
        where: { familyId, liveStream: true },
        orderBy: { eventDate: 'desc' },
        take: 5
      }),
      prisma.announcement.findMany({
        where: { familyId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.user.findMany({
        where: { familyId, isActive: true },
        select: {
          id: true, firstName: true, lastName: true, avatar: true, role: true,
          memberProfile: { select: { biography: true, occupation: true } }
        },
        take: 15
      }),
      prisma.user.findMany({
        where: { familyId },
        select: {
          id: true, firstName: true, lastName: true, avatar: true,
          fatherId: true, motherId: true, spouseId: true
        }
      }),
      prisma.groupPost.findMany({
        where: { group: { familyId } },
        include: { author: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Compute basic statistics
    const statistics = {
      members: familyTree.length,
      photos: gallery.length,
      videos: videos.length,
      events: events.length,
      announcements: announcements.length
    };

    res.json({
      family: req.family, // From resolveFamilyByDomain middleware
      branding: req.family,
      feed,
      gallery,
      videos,
      events,
      livestreams,
      announcements,
      members,
      familyTree,
      posts,
      statistics
    });

  } catch (error) {
    console.error('Error fetching public home data:', error);
    res.status(500).json({ error: 'Internal server error fetching home data' });
  }
};

const getFamily = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const family = await prisma.family.findUnique({
      where: { id: req.familyId },
      include: { members: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } }
    });
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json(family);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getGallery = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const gallery = await prisma.document.findMany({
      where: { familyId: req.familyId, type: { contains: 'image' }, visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getVideos = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const videos = await prisma.document.findMany({
      where: { familyId: req.familyId, type: { contains: 'video' }, visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getEvents = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const events = await prisma.event.findMany({
      where: { familyId: req.familyId, visibility: 'Public' },
      orderBy: { eventDate: 'desc' }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getLiveStreams = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const streams = await prisma.event.findMany({
      where: { familyId: req.familyId, liveStream: true },
      orderBy: { eventDate: 'desc' }
    });
    res.json(streams);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getAnnouncements = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const announcements = await prisma.announcement.findMany({
      where: { familyId: req.familyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getFamilyTree = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const tree = await prisma.user.findMany({
      where: { familyId: req.familyId },
      select: {
        id: true, firstName: true, lastName: true, avatar: true,
        fatherId: true, motherId: true, spouseId: true
      }
    });
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getMembers = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const members = await prisma.user.findMany({
      where: { familyId: req.familyId, isActive: true },
      select: { id: true, firstName: true, lastName: true, avatar: true, role: true }
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getPosts = async (req, res) => {
  if (!req.familyId) return res.status(400).json({ error: 'Family ID is required' });
  try {
    const posts = await prisma.groupPost.findMany({
      where: { group: { familyId: req.familyId } },
      include: { author: { select: { firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getHome,
  getFamily,
  getGallery,
  getVideos,
  getEvents,
  getLiveStreams,
  getAnnouncements,
  getFamilyTree,
  getMembers,
  getPosts
};
