const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'routes', 'superadmin.js');
let content = fs.readFileSync(file, 'utf8');

// I will overwrite the whole families/resend-email block and GET /families block safely.

const regex = /router\.post\('\/families\/resend-email'[\s\S]+?router\.get\('\/families\/resend-email'/;
// wait, I can just use string slice if I know the exact boundaries.

const startMarker = "router.post('/families/resend-email', async (req, res) => {";
const endMarker = "router.get('/families', async (req, res) => {";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

const replacement = `router.post('/families/resend-email', async (req, res) => {
  const { familyId } = req.body;
  try {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: { members: { where: { role: 'ADMIN' } } }
    });

    if (!family || !family.members || family.members.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found for this family' });
    }

    const admin = family.members[0];
    
    // Generate new temporary password
    const crypto = require('crypto');
    const newTempPassword = crypto.randomBytes(4).toString('hex') + 'A1!';
    const hashedPassword = await bcrypt.hash(newTempPassword, 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        isTemporaryPassword: true,
        mustChangePassword: true
      }
    });

    const emailResult = await sendFamilyAdminEmail(
      admin.firstName + ' ' + (admin.lastName || ''),
      admin.email,
      family.name,
      family.familyCode,
      newTempPassword,
      true
    );

    if (emailResult.success) {
      res.json({ success: true, message: 'Credentials sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send credentials email' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all families
`;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Fixed!");
} else {
  console.log("Markers not found");
}
