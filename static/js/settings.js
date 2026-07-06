async function loadSettings() {
  var result = document.getElementById('settingsResult');
  if (result) result.innerHTML = '';
  var r = await api('GET', '/admin/settings');
  if (r.code !== 0 || !r.data) {
    showToast('配置加载失败：' + (r.message || '未知错误'), 'error');
    return;
  }
  var d = r.data;
  document.getElementById('settingMaxUpstreamCheckConcurrency').value = Number.isFinite(Number(d.maxUpstreamCheckConcurrency)) ? Number(d.maxUpstreamCheckConcurrency) : 6;
  document.getElementById('settingRequestTimeoutSeconds').value = Number.isFinite(Number(d.requestTimeoutSeconds)) ? Number(d.requestTimeoutSeconds) : 45;
  document.getElementById('settingRateLimitEnabled').checked = !!d.rateLimitEnabled;
  document.getElementById('settingRateLimitPerMin').value = d.rateLimitPerMin || 30;
  document.getElementById('settingLoginFailLimit').value = d.loginFailLimit || 5;
  document.getElementById('settingLoginLockMinutes').value = d.loginLockMinutes || 15;
  document.getElementById('settingCaptchaEnabled').checked = !!d.captchaEnabled;
  document.getElementById('settingCaptchaSiteKey').value = d.captchaSiteKey || '';
  document.getElementById('settingCaptchaSecretKey').value = '';
  document.getElementById('settingCaptchaFreeCount').value = Number.isFinite(Number(d.captchaFreeCount)) ? Number(d.captchaFreeCount) : 0;
  document.getElementById('settingMinResponseMs').value = Number.isFinite(Number(d.minResponseMs)) ? Number(d.minResponseMs) : 150;
  document.getElementById('settingLogFileEnabled').checked = d.logFileEnabled !== false;
  document.getElementById('settingLogFilePath').value = d.logFilePath || 'logs/app.log';
  document.getElementById('settingLogMaxSizeMB').value = Number.isFinite(Number(d.logMaxSizeMB)) ? Number(d.logMaxSizeMB) : 20;
  document.getElementById('settingLogMaxBackups').value = Number.isFinite(Number(d.logMaxBackups)) ? Number(d.logMaxBackups) : 7;
  document.getElementById('settingLogMaxAgeDays').value = Number.isFinite(Number(d.logMaxAgeDays)) ? Number(d.logMaxAgeDays) : 30;
  document.getElementById('settingLogCompress').checked = !!d.logCompress;
  document.getElementById('settingAutoUpdateEnabled').checked = !!d.autoUpdateEnabled;
  var state = document.getElementById('settingCaptchaSecretState');
  if (state) state.textContent = d.captchaSecretConfigured ? 'Secret Key 已配置，留空保存不会覆盖。' : 'Secret Key 尚未配置。';
}

function readIntSetting(id, fallback) {
  var n = parseInt(document.getElementById(id).value, 10);
  return Number.isFinite(n) ? n : fallback;
}

async function saveSettings() {
  var body = {
    maxUpstreamCheckConcurrency: readIntSetting('settingMaxUpstreamCheckConcurrency', 6),
    requestTimeoutSeconds: readIntSetting('settingRequestTimeoutSeconds', 45),
    rateLimitEnabled: document.getElementById('settingRateLimitEnabled').checked,
    rateLimitPerMin: readIntSetting('settingRateLimitPerMin', 30),
    loginFailLimit: readIntSetting('settingLoginFailLimit', 5),
    loginLockMinutes: readIntSetting('settingLoginLockMinutes', 15),
    captchaEnabled: document.getElementById('settingCaptchaEnabled').checked,
    captchaSiteKey: document.getElementById('settingCaptchaSiteKey').value.trim(),
    captchaSecretKey: document.getElementById('settingCaptchaSecretKey').value.trim(),
    captchaFreeCount: readIntSetting('settingCaptchaFreeCount', 0),
    minResponseMs: readIntSetting('settingMinResponseMs', 150),
    logFileEnabled: document.getElementById('settingLogFileEnabled').checked,
    logFilePath: document.getElementById('settingLogFilePath').value.trim(),
    logMaxSizeMB: readIntSetting('settingLogMaxSizeMB', 20),
    logMaxBackups: readIntSetting('settingLogMaxBackups', 7),
    logMaxAgeDays: readIntSetting('settingLogMaxAgeDays', 30),
    logCompress: document.getElementById('settingLogCompress').checked,
    autoUpdateEnabled: document.getElementById('settingAutoUpdateEnabled').checked
  };
  var result = document.getElementById('settingsResult');
  if (result) result.innerHTML = '<div style="color:var(--text-muted);font-size:13px">正在保存...</div>';
  var r = await api('POST', '/admin/settings', body);
  if (r.code === 0) {
    showToast('配置已保存', 'success');
    await loadSettings();
    if (result) result.innerHTML = '<div class="status success">配置已保存并立即生效</div>';
  } else {
    var msg = r.message || '保存失败';
    showToast(msg, 'error');
    if (result) result.innerHTML = '<div class="status error">' + escapeHtml(msg) + '</div>';
  }
}
