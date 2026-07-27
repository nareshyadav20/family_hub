const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getHome = async (req, res) => {
  try {
    const familyId = req.familyId;
    
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
        where: { familyId, category: 'Gallery', visibility: 'PUBLIC' },
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
        where: { familyId, liveStream: true, streamStatus: 'LIVE' },
        orderBy: { eventDate: 'desc' },
        take: 5
      }),
      prisma.announcement.findMany({
        where: { familyId, targetType: 'All Members' }, // Adjust if announcements have specific public visibility
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getFamily = async (req, res) => {
  try {
    const family = req.family;
    res.json(family);
  } catch (error) {
    console.error('Error fetching public family data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getGallery = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: {
        familyId: req.familyId,
        category: 'Gallery', // Assuming gallery items are in Document model with category 'Gallery' or similar
        // Adjust the query based on how photos are actually stored
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching public gallery data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getVideos = async (req, res) => {
  try {
    const videos = await prisma.document.findMany({
      where: {
        familyId: req.familyId,
        type: { contains: 'video' }, // Assuming videos are stored here
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching public videos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        familyId: req.familyId,
        visibility: 'Public', // You might want only public events on landing page
      },
      orderBy: { eventDate: 'desc' }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getLiveStreams = async (req, res) => {
  try {
    const streams = await prisma.event.findMany({
      where: {
        familyId: req.familyId,
        liveStream: true,
        streamStatus: 'LIVE', // Or similar logic
      },
      orderBy: { eventDate: 'desc' }
    });
    res.json(streams);
  } catch (error) {
    console.error('Error fetching public live streams:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getPosts = async (req, res) => {
  try {
    // Assuming posts are group posts that might be public? Or announcements?
    // Instruction says: Return only Latest Posts WHERE familyId=req.familyId
    // Will pull from group posts mapped to family groups for now.
    const posts = await prisma.groupPost.findMany({
      where: {
        group: {
          familyId: req.familyId
        }
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching public posts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        familyId: req.familyId
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching public announcements:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getFamilyTree = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { familyId: req.familyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        fatherId: true,
        motherId: true,
        spouseId: true
      }
    });
    res.json(members);
  } catch (error) {
    console.error('Error fetching public family tree:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMembers = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: {
        familyId: req.familyId,
        // we might filter by some featured flag, for now return limited active members
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        memberProfile: {
          select: { biography: true, occupation: true }
        }
      },
      take: 10
    });
    res.json(members);
  } catch (error) {
    console.error('Error fetching public members:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
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
};
