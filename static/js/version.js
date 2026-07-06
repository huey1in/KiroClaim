var VERSION_INFO = null;
var VERSION_LOADING = false;

function versionEscape(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function loadVersionBadge(force) {
  if (VERSION_LOADING) return VERSION_INFO;
  VERSION_LOADING = true;
  try {
    var r = await api('GET', '/admin/version' + (force ? '?force=1' : ''));
    if (r.code === 0 && r.data) {
      VERSION_INFO = r.data;
      renderVersionBadge(r.data);
      return r.data;
    }
  } catch (e) {
    // 版本检测失败不影响后台主流程。
  } finally {
    VERSION_LOADING = false;
  }
  return VERSION_INFO;
}

function renderVersionBadge(data) {
  var badge = document.getElementById('sidebarVersion');
  var label = document.getElementById('sidebarVersionText');
  if (!badge || !label || !data) return;
  label.textContent = data.currentVersion || 'dev';
  badge.classList.toggle('has-update', !!data.hasUpdate);
  badge.title = data.hasUpdate ? '发现新版本 ' + data.latestVersion : '当前版本 ' + (data.currentVersion || 'dev');
}

async function showVersionPanel() {
  var data = VERSION_INFO || await loadVersionBadge(false);
  if (!data) {
    showToast('版本信息读取失败', 'error');
    return;
  }
  renderVersionModal(data);
}

function renderVersionModal(data) {
  var old = document.getElementById('versionModal');
  if (old) old.remove();

  var overlay = document.createElement('div');
  overlay.id = 'versionModal';
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = buildVersionModalHtml(data);
  document.body.appendChild(overlay);
}

function buildVersionModalHtml(data) {
  var latest = data.latestVersion || '-';
  var current = data.currentVersion || 'dev';
  var statusText = data.error ? ('检测失败：' + data.error) : (data.hasUpdate ? '发现可用更新' : '当前已是最新版本');
  var updateBtn = '';
  if (data.hasUpdate) {
    updateBtn = '<button class="ui-btn ui-btn-primary" id="versionUpdateBtn" onclick="triggerDockerUpdate()" ' +
      (data.updateInProgress ? 'disabled' : '') + '>更新到最新 Docker</button>';
  }
  var support = data.updateSupported
    ? '当前环境支持应用内 Docker 更新。'
    : '应用内更新需要容器可访问宿主 Docker，并挂载 compose 文件；否则请在服务器执行 docker compose pull && docker compose up -d。';

  return '' +
    '<div class="modal-content" style="max-width:560px">' +
      '<div class="modal-header">' +
        '<span class="modal-title">系统版本</span>' +
        '<span class="modal-close" onclick="closeVersionModal()">&times;</span>' +
      '</div>' +
      '<div class="modal-body">' +
        '<div class="version-info-grid">' +
          '<div class="version-info-row"><span>当前版本</span><strong>' + versionEscape(current) + '</strong></div>' +
          '<div class="version-info-row"><span>最新版本</span><strong>' + versionEscape(latest) + '</strong></div>' +
          '<div class="version-info-row"><span>镜像</span><strong>' + versionEscape(data.dockerImage || '-') + '</strong></div>' +
          '<div class="version-info-row"><span>状态</span><strong>' + versionEscape(statusText) + '</strong></div>' +
        '</div>' +
        '<div class="version-update-note">' + versionEscape(support) + '</div>' +
        (data.lastUpdateMessage ? '<div class="version-update-note">' + versionEscape(data.lastUpdateMessage) + '</div>' : '') +
        '<div class="version-actions">' +
          '<button class="ui-btn ui-btn-secondary" onclick="refreshVersionPanel()">重新检测</button>' +
          (data.releaseUrl ? '<a class="ui-btn ui-btn-secondary" href="' + versionEscape(data.releaseUrl) + '" target="_blank" rel="noopener">查看 Release</a>' : '') +
          updateBtn +
        '</div>' +
      '</div>' +
    '</div>';
}

function closeVersionModal() {
  var modal = document.getElementById('versionModal');
  if (modal) modal.remove();
}

async function refreshVersionPanel() {
  var data = await loadVersionBadge(true);
  if (data) renderVersionModal(data);
}

async function triggerDockerUpdate() {
  if (!confirm('确认更新到最新 Docker 镜像吗？更新过程会拉取镜像并重建容器。')) return;
  var btn = document.getElementById('versionUpdateBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '更新中...';
  }
  var r = await api('POST', '/admin/version/update', {});
  if (r.code === 0) {
    showToast(r.message || '更新任务已启动', 'success');
    await refreshVersionPanel();
  } else {
    showToast(r.message || '更新失败', 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '更新到最新 Docker';
    }
  }
}
