const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_KEY } = require('./env');

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn('Advertencia: No se pudo inicializar Supabase:', err.message);
  }
}

const broadcastMessage = async (channelName, event, payload) => {
  if (!supabase) return false;
  try {
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event,
      payload
    });
    return true;
  } catch (err) {
    console.warn('Error emitiendo evento Supabase:', err.message);
    return false;
  }
};

module.exports = {
  supabase,
  broadcastMessage
};
