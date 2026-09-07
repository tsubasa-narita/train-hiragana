let installPrompt;
const standalone = () => matchMedia('(display-mode: standalone)').matches;
export function installMarkup() {
  return `<section class="install-app"><h2>アプリとして使う</h2><p>${standalone() ? 'アプリとして起動しています。' : 'AndroidのChromeで、メニューの「アプリをインストール」（または「ホーム画面に追加」→「インストール」）を選ぶと、アプリとして起動できます。'} </p><button class="secondary" data-action="install" ${!installPrompt || standalone() ? 'hidden' : ''}>アプリをインストール</button><p class="install-status" role="status"></p></section>`;
}
function updateButton() {
  const button = document.querySelector('[data-action="install"]');
  if (button) button.hidden = !installPrompt || standalone();
}
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault(); installPrompt = event; updateButton();
});
window.addEventListener('appinstalled', () => { installPrompt = undefined; updateButton(); });
export async function installApp() {
  const pending = installPrompt;
  if (!pending) return;
  installPrompt = undefined; updateButton();
  try { await pending.prompt(); await pending.userChoice; }
  catch {
    const status = document.querySelector('.install-status');
    if (status) status.textContent = 'ブラウザのメニューからインストールしてください。';
  }
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { updateViaCache: 'none' }).catch(() => {
    // Installation support must not prevent ordinary browser play.
  });
}
