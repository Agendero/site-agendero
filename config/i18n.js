const i18next = require('i18next');
const middleware = require('i18next-http-middleware');
const FsBackend = require('i18next-fs-backend');
const path = require('path');

i18next
  .use(FsBackend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en', 'es'],
    preload: ['pt', 'en', 'es'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    detection: {
      order: ['cookie', 'header'],
      lookupCookie: 'language',
      caches: ['cookie'],
      cookieSecure: false, // set to true in production with HTTPS
      cookieDomain: 'localhost' // change in production
    }
  });

module.exports = i18next;
