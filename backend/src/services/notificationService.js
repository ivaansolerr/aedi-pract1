const { findDebateById } = require('../models/debateModel');
const {
  findSubscription,
  createSubscription,
  deleteSubscription,
  findSubscribersByDebateId
} = require('../models/subscriptionModel');
const {
  createNotification,
  findNotificationById,
  findNotificationsByUserId,
  markNotificationAsRead: updateNotificationAsRead,
  sanitizeNotification
} = require('../models/notificationModel');

const toggleSubscription = async ({ debateId, userId }) => {
  const debate = await findDebateById(debateId);
  if (!debate) {
    const error = new Error('El debate no existe.');
    error.statusCode = 404;
    throw error;
  }

  const existing = await findSubscription({ debateId, userId });
  if (existing) {
    await deleteSubscription({ debateId, userId });
    return {
      subscribed: false,
      message: 'Te has desuscrito del debate.'
    };
  }

  await createSubscription({ debateId, userId });
  return {
    subscribed: true,
    message: 'Te has suscrito al debate.'
  };
};

const notifyDebateSubscribers = async ({ debateId, commentId, authorId }) => {
  const subscribers = await findSubscribersByDebateId(debateId);
  const targetSubscribers = subscribers.filter((subUserId) => subUserId !== authorId);

  const createdNotifications = [];
  for (const subUserId of targetSubscribers) {
    const notif = await createNotification({
      userId: subUserId,
      debateId,
      commentId
    });
    createdNotifications.push(sanitizeNotification(notif));
  }

  return createdNotifications;
};

const listUserNotifications = async (userId) => {
  const notifications = await findNotificationsByUserId(userId);
  return notifications.map(sanitizeNotification);
};

const markAsRead = async ({ notificationId, userId }) => {
  const notification = await findNotificationById(notificationId);
  if (!notification) {
    const error = new Error('La notificación no existe.');
    error.statusCode = 404;
    throw error;
  }

  if (notification.user_id !== userId) {
    const error = new Error('No tienes permiso para modificar esta notificación.');
    error.statusCode = 403;
    throw error;
  }

  const updated = await updateNotificationAsRead(notificationId);
  return sanitizeNotification(updated);
};

module.exports = {
  toggleSubscription,
  notifyDebateSubscribers,
  listUserNotifications,
  markAsRead
};
