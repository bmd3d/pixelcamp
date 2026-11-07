// Erzeugt von scripts/web/build-pwa.ts (D-89).
(function () {
  var ACCESS = {"salt":"e545fbcd3ec742331d8525efdced2039","iterations":200000,"hash":"e023a4414f669e999c40aec997d74b27da7e103e55aa58dd0d1a2cce34da8706"};
  var KEY = "pixelcamp-webzugang";
  var SCRIPTS = ["/pixelcamp/_expo/static/js/web/entry-8394a6e13e0bb73d01b7ac613d2e419d.js"];

  function startApp() {
    SCRIPTS.forEach(function (src) {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      document.body.appendChild(script);
    });
  }
  function remembered() {
    try {
      return localStorage.getItem(KEY) === ACCESS.hash;
    } catch (e) {
      return false;
    }
  }
  function remember() {
    try {
      localStorage.setItem(KEY, ACCESS.hash);
    } catch (e) {
      // Ohne Speicher (z. B. privater Modus) gilt die Freigabe nur für diesen Aufruf.
    }
  }
  function derive(password) {
    var encoder = new TextEncoder();
    var bytes = encoder.encode(password.trim().normalize('NFC'));
    return crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveBits']).then(function (key) {
      return crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(ACCESS.salt), iterations: ACCESS.iterations },
        key,
        256,
      );
    }).then(function (bits) {
      return Array.from(new Uint8Array(bits)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }
  function showGate() {
    var style = document.createElement('style');
    style.textContent = [
      '#zugang{position:fixed;inset:0;z-index:10;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:#1E1B2E;font-family:system-ui,-apple-system,sans-serif}',
      '#zugang form{width:100%;max-width:320px;box-sizing:border-box;padding:24px;background:#F3E9D2;border:4px solid #5A3A2E;color:#2B2118;text-align:center}',
      '#zugang img{width:96px;height:96px;image-rendering:pixelated}',
      '#zugang h1{margin:12px 0 4px;font-size:24px}',
      '#zugang p{margin:0 0 16px;font-size:15px;line-height:1.4}',
      '#zugang input,#zugang button{width:100%;box-sizing:border-box;min-height:48px;padding:10px;font:inherit;font-size:16px;border:3px solid #5A3A2E;border-radius:0}',
      '#zugang input{background:#fff;color:#2B2118}',
      '#zugang button{margin-top:12px;background:#8A5A3C;color:#fff;font-weight:700;cursor:pointer}',
      '#zugang button:disabled{opacity:.6;cursor:default}',
      '#zugang [role=alert]{min-height:21px;margin:12px 0 0;color:#8B1E1E;font-weight:700}',
    ].join('');
    document.head.appendChild(style);

    var gate = document.createElement('div');
    gate.id = 'zugang';
    var form = document.createElement('form');
    var icon = document.createElement('img');
    icon.src = "/pixelcamp/icon-192.png";
    icon.alt = '';
    var title = document.createElement('h1');
    title.textContent = 'Pixel Camp';
    var hint = document.createElement('p');
    hint.textContent = 'Bitte gib das Passwort ein. Das ist je Browser und Gerät nur einmal nötig.';
    var input = document.createElement('input');
    input.type = 'password';
    input.autocomplete = 'current-password';
    input.setAttribute('aria-label', 'Passwort');
    input.setAttribute('autocapitalize', 'off');
    var button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Weiter';
    var error = document.createElement('p');
    error.setAttribute('role', 'alert');
    form.append(icon, title, hint, input, button, error);
    gate.appendChild(form);
    document.body.appendChild(gate);
    input.focus();

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (button.disabled) return;
      button.disabled = true;
      error.textContent = '';
      var check;
      try {
        check = derive(input.value);
      } catch (e) {
        check = Promise.reject(e);
      }
      check.then(function (hash) {
        if (hash === ACCESS.hash) {
          remember();
          gate.remove();
          style.remove();
          startApp();
          return;
        }
        error.textContent = 'Das Passwort stimmt nicht.';
        input.value = '';
        input.focus();
        button.disabled = false;
      }).catch(function () {
        error.textContent = 'Dieser Browser kann das Passwort nicht prüfen.';
        button.disabled = false;
      });
    });
  }

  if (remembered()) startApp();
  else showGate();
})();
