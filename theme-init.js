/* Runs in <head> before first paint: applies the saved theme (or the OS
   preference on first visit) so there is no dark/light flash. */
(function () {
    var t = null;
    try { t = localStorage.getItem('jk_portfolio_theme'); } catch (e) { /* private mode */ }
    if (t !== 'light' && t !== 'dark') {
        t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    document.documentElement.dataset.theme = t;
})();
