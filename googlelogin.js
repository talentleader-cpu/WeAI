/* WeAI · googlelogin.js v1 — "Sign in with Google" (Workspace wexpandmx.com).
   Agrega un boton bajo "Sign in". El acceso con correo/contraseña se mantiene como respaldo.
   Seguridad: showApp() ya bloquea perfiles inactivos; los usuarios nuevos por Google nacen inactivos (handle_new_user). */
(function () {
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    try {
      var btn = document.getElementById('loginBtn');
      if (!btn || document.getElementById('googleLoginBtn')) return;
      var G = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.2 7-10.3 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
      var wrap = document.createElement('div');
      wrap.style.cssText = 'margin-top:14px';
      wrap.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;color:#8a97a3;font-size:12px;margin:0 0 12px"><span style="flex:1;height:1px;background:#e4ecf2"></span>or<span style="flex:1;height:1px;background:#e4ecf2"></span></div>' +
        '<button type="button" id="googleLoginBtn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:#1f2d3a;border:1.5px solid #d5dfe8;border-radius:10px;padding:11px 14px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">' + G + '<span>Sign in with Google</span></button>' +
        '<div id="googleLoginErr" style="color:#c0392b;font-size:12.5px;margin-top:8px;text-align:center"></div>';
      var anchor = document.getElementById('loginErr') || btn;
      anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
      document.getElementById('googleLoginBtn').addEventListener('click', async function () {
        var err = document.getElementById('googleLoginErr');
        err.textContent = '';
        try {
          var client = (typeof sb !== 'undefined' && sb) ? sb : window.sb;
          if (!client) { err.textContent = 'Not ready yet. Reload the page and try again.'; return; }
          var r = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/', queryParams: { hd: 'wexpandmx.com', prompt: 'select_account' } } });
          if (r && r.error) err.textContent = 'Could not start Google sign-in.';
        } catch (e) { err.textContent = 'Could not start Google sign-in.'; }
      });
      var h = (location.hash || '') + '&' + (location.search || '');
      if (/error_description=/.test(h)) {
        var m = decodeURIComponent((h.match(/error_description=([^&]+)/) || [])[1] || '').replace(/\+/g, ' ');
        var e2 = document.getElementById('googleLoginErr'); if (e2 && m) e2.textContent = 'Google sign-in failed: ' + m;
      }
    } catch (e) { /* nunca romper la pantalla de acceso */ }
  });
})();
