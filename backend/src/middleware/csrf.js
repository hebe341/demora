/**
 * CSRF setup: aplica cookie-parser e emite token XSRF-TOKEN para GETs
 * e protege requisições não seguras (POST/PUT/DELETE/PATCH).
 */
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const protection = csrf({ cookie: true });

function initCsrf(app) {
  app.use(cookieParser());

  // Para GETs, gerar e enviar token via cookie para SPA
  app.use((req, res, next) => {
    if (req.method === 'GET') {
      return protection(req, res, (err) => {
        if (!err) {
          try {
            res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: false });
          } catch (e) {
            // ignore token generation errors for static GETs
          }
        }
        next();
      });
    }

    // Para demais métodos, validar token
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return protection(req, res, next);
    }

    next();
  });
}

module.exports = { initCsrf };
