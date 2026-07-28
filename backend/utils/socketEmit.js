const emitPublicUpdate = (req, familyId) => {
  const io = req.app.get('socketio');
  if (io && familyId) {
    io.to(`family_${familyId}`).emit('publicContentUpdated');
  }
};

module.exports = { emitPublicUpdate };
