const {
  listUserNotifications,
  markAsRead
} = require('../services/notificationService');

const getAll = async (req, res) => {
  try {
    const notifications = await listUserNotifications(req.user.id);
    return res.status(200).json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error al listar las notificaciones.' });
  }
};

const markRead = async (req, res) => {
  try {
    const notification = await markAsRead({
      notificationId: req.params.id,
      userId: req.user.id
    });
    return res.status(200).json({
      message: 'Notificación marcada como leída.',
      notification
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al actualizar la notificación.' });
  }
};

module.exports = {
  getAll,
  markRead
};
