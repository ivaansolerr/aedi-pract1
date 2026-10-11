const {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead
} = require('../services/messageService');

const create = async (req, res) => {
  try {
    const message = await sendMessage({
      senderId: req.user.id,
      receiverId: req.body.receiver_id,
      content: req.body.content
    });
    return res.status(201).json({
      message: 'Mensaje enviado correctamente.',
      directMessage: message
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al enviar el mensaje.' });
  }
};

const getChat = async (req, res) => {
  try {
    const messages = await getConversation({
      userId: req.user.id,
      targetUserId: req.params.targetUserId
    });
    return res.status(200).json({ messages });
  } catch (error) {
    const status = error.statusCode || 404;
    return res.status(status).json({ message: error.message || 'Error al obtener la conversación.' });
  }
};

const getActiveConversations = async (req, res) => {
  try {
    const conversations = await getConversations(req.user.id);
    return res.status(200).json({ conversations });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error al listar las conversaciones.' });
  }
};

const markRead = async (req, res) => {
  try {
    const message = await markAsRead({
      messageId: req.params.id,
      userId: req.user.id
    });
    return res.status(200).json({
      message: 'Mensaje marcado como leído.',
      directMessage: message
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ message: error.message || 'Error al marcar el mensaje como leído.' });
  }
};

module.exports = {
  create,
  getChat,
  getActiveConversations,
  markRead
};
