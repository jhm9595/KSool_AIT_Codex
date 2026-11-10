// The web header is hidden inside Toss; expose its mode action in settings.
function installModeControl() {
  const content = document.querySelector('#settings-modal-content .settings-modal-body');
  if (!content || content.querySelector('#ait-mode-select-btn')) return;
  const button = document.createElement('button');
  button.id = 'ait-mode-select-btn';
  button.type = 'button';
  button.textContent = '게임 모드 변경';
  button.style.cssText = 'width:100%;min-height:44px;margin-bottom:16px';
  button.onclick = () => {
    window.ksoolApp?.settingsModalView.close();
    document.getElementById('mode-select-portal-btn')?.click();
  };
  content.prepend(button);
}
new MutationObserver(installModeControl).observe(document.getElementById('settings-modal-content'), {childList:true,subtree:true});
installModeControl();
