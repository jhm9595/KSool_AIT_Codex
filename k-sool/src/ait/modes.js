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

// The standalone party lobby has no app tabs and Toss owns the web header.
// Keep its settings action reachable below the game list without a second top bar.
function installPartyControls() {
  const lobby = document.querySelector('#view-party.active .party-lobby-container');
  const settings = document.getElementById('open-settings-btn');
  const tabs = document.querySelector('.tab-bar');
  if (!settings || !tabs) return;
  if (lobby) {
    let controls = lobby.querySelector('.ait-party-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.className = 'ait-party-controls';
      const mode = document.createElement('button');
      mode.id = 'ait-party-mode-btn';
      mode.type = 'button';
      mode.textContent = '게임 모드 변경';
      mode.onclick = () => document.getElementById('mode-select-portal-btn')?.click();
      controls.append(mode);
      lobby.append(controls);
    }
    if (settings.parentElement !== controls) controls.append(settings);
  } else if (settings.parentElement !== tabs) {
    tabs.append(settings);
  }
}
// Recover the original node even when the upstream view replaces its children.
const settingsControl = document.getElementById('open-settings-btn');
new MutationObserver(() => {
  if (settingsControl && !settingsControl.isConnected) document.querySelector('.tab-bar')?.append(settingsControl);
  installPartyControls();
}).observe(document.getElementById('app-container'), { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
installPartyControls();
