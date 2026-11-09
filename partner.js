/*
 * Codice partner dal QR - versione minima e invisibile.
 *
 * Il QR di ogni partner porta a:  .../portfolio-francesco/?ref=CODICE
 * Lo script ricorda il codice per 90 giorni (vale il PRIMO partner) e lo aggiunge
 * al modulo di contatto e all'oggetto delle email. Il sito non cambia aspetto.
 */
(function () {
  var STORAGE_KEY = 'partnerRef';
  var DURATA_GIORNI = 90;
  var FORMATO_CODICE = /^[A-Z0-9]{2,12}$/;

  function leggiSalvato() {
    try {
      var dato = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!dato || !dato.code || !dato.ts) return null;
      if (Date.now() - dato.ts > DURATA_GIORNI * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return dato.code;
    } catch (e) {
      return null;
    }
  }

  function codiceDalLink() {
    try {
      var ref = new URLSearchParams(window.location.search).get('ref');
      if (!ref) return null;
      ref = ref.trim().toUpperCase();
      return FORMATO_CODICE.test(ref) ? ref : null;
    } catch (e) {
      return null;
    }
  }

  var salvato = leggiSalvato();
  var dalLink = codiceDalLink();
  var codice = salvato || dalLink;
  if (dalLink && !salvato) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: dalLink, ts: Date.now() }));
    } catch (e) { /* il codice vale solo per questa visita */ }
  }
  if (!codice) return;

  function applica() {
    document.querySelectorAll('form[action*="formsubmit"]').forEach(function (form) {
      if (form.querySelector('input[name="Codice partner"]')) return;
      var campo = document.createElement('input');
      campo.type = 'hidden';
      campo.name = 'Codice partner';
      campo.value = codice;
      form.appendChild(campo);
      var oggetto = form.querySelector('input[name="_subject"]');
      if (oggetto) oggetto.value = 'Nuovo cliente dal Portfolio - codice partner ' + codice;
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      var base = link.getAttribute('href').split('?')[0];
      link.setAttribute('href', base + '?subject=' +
        encodeURIComponent('Richiesta progetto - codice partner ' + codice));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applica);
  } else {
    applica();
  }
})();
