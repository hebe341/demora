/**
 * Auto placeholder controller used by automated placeholder replacements.
 * Exports a set of generic handlers to allow the app to boot while manual review
 * replaces these with real controllers.
 */

module.exports = {
  getDetailedHealth: (req, res) => {
    res.json({ status: 'OK', detail: 'placeholder detailed health' });
  },
  getLiveness: (req, res) => {
    res.json({ status: 'ALIVE' });
  },
  getReadiness: (req, res) => {
    res.json({ status: 'READY' });
  },
  getDatabaseReady: (req, res) => {
    res.json({ status: 'DB_OK' });
  },
  getQueueStatus: (req, res) => {
    res.json({ status: 'QUEUE_OK' });
  },
  // Generic handler for any other method names used by routes
  __fallback: (req, res) => {
    res.status(501).json({ error: 'Not implemented (placeholder)' });
  }
};
