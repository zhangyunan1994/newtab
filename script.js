// 搜索引擎配置
const searchEngines = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: '🔍'
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: '🔎'
  },
  baidu: {
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    icon: '🔍'
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: '🦆'
  },
  yahoo: {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=',
    icon: '🔍'
  }
};

// 当前选中的搜索引擎
let currentSearchEngine = 'bing';

// 预设背景图片
const presetBackgrounds = [
  {
    id: 'preset1',
    name: '背景 1',
    url: 'https://img-s.msn.cn/tenant/amp/entityid/BB1msG0V?w=0&h=0&q=60&m=6&f=jpg&u=t'
  },
  {
    id: 'preset2',
    name: '背景 2',
    url: 'https://img-s.msn.cn/tenant/amp/entityid/AA12rZ8k?w=0&h=0&q=60&m=6&f=jpg&u=t'
  },
  {
    id: 'preset3',
    name: '背景 3',
    url: 'https://img-s.msn.cn/tenant/amp/entityid/BB1msIAz?w=0&h=0&q=60&m=6&f=jpg&u=t'
  },
  {
    id: 'preset4',
    name: '背景 4',
    url: 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDMN?w=0&h=0&q=60&m=6&f=jpg&u=t'
  }
];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initBackground();
  initBookmarks();
  initSettings();
  
  // 收藏夹按钮
  initBookmarksPanel();
});

// 搜索功能
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchEngineBtn = document.getElementById('searchEngineBtn');
  const searchEngineMenu = document.getElementById('searchEngineMenu');
  const searchEngineText = document.getElementById('searchEngineText');
  
  // 加载默认搜索引擎
  chrome.storage.sync.get(['defaultSearchEngine'], (result) => {
    if (result.defaultSearchEngine) {
      currentSearchEngine = result.defaultSearchEngine;
      updateSearchEngineDisplay();
    } else {
      updateSearchEngineDisplay();
    }
  });
  
  // 搜索引擎按钮点击
  searchEngineBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    searchEngineMenu.classList.toggle('active');
  });
  
  // 搜索引擎选项点击
  const searchEngineOptions = document.querySelectorAll('.search-engine-option');
  searchEngineOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      const value = e.target.getAttribute('data-value');
      currentSearchEngine = value;
      updateSearchEngineDisplay();
      searchEngineMenu.classList.remove('active');
      chrome.storage.sync.set({ defaultSearchEngine: value });
    });
  });
  
  // 点击外部关闭菜单
  document.addEventListener('click', (e) => {
    if (!searchEngineBtn.contains(e.target) && !searchEngineMenu.contains(e.target)) {
      searchEngineMenu.classList.remove('active');
    }
  });
  
  // 回车键搜索
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // 搜索框聚焦时关闭菜单
  searchInput.addEventListener('focus', () => {
    searchEngineMenu.classList.remove('active');
  });
}

function updateSearchEngineDisplay() {
  const searchEngineText = document.getElementById('searchEngineText');
  const searchEngineOptions = document.querySelectorAll('.search-engine-option');
  
  if (searchEngines[currentSearchEngine]) {
    searchEngineText.textContent = searchEngines[currentSearchEngine].name;
  }
  
  // 更新选中状态
  searchEngineOptions.forEach(option => {
    if (option.getAttribute('data-value') === currentSearchEngine) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.trim();
  
  if (!query) return;
  
  // 检查是否是URL
  if (isValidUrl(query)) {
    window.location.href = query.startsWith('http') ? query : `https://${query}`;
    return;
  }
  
  // 使用选中的搜索引擎搜索
  const engine = searchEngines[currentSearchEngine];
  const searchUrl = engine.url + encodeURIComponent(query);
  window.location.href = searchUrl;
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    // 检查是否是域名格式
    const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return domainPattern.test(string);
  }
}

// 背景设置
function initBackground() {
  const background = document.getElementById('background');
  
  // 加载保存的背景设置
  chrome.storage.sync.get(['backgroundType', 'backgroundColor', 'backgroundImage', 'gradientColors', 'presetBackgroundId'], (result) => {
    const bgType = result.backgroundType || 'bing';
    
    if (bgType === 'bing') {
      loadBingDailyImage();
    } else if (bgType === 'preset' && result.presetBackgroundId) {
      const preset = presetBackgrounds.find(p => p.id === result.presetBackgroundId);
      if (preset) {
        background.classList.add('background-image');
        background.style.backgroundImage = `url(${preset.url})`;
      }
    } else if (bgType === 'color' && result.backgroundColor) {
      background.classList.remove('background-image');
      background.style.background = result.backgroundColor;
    } else if (bgType === 'image' && result.backgroundImage) {
      background.classList.add('background-image');
      background.style.backgroundImage = `url(${result.backgroundImage})`;
    } else if (bgType === 'gradient' && result.gradientColors) {
      background.classList.remove('background-image');
      const [color1, color2] = result.gradientColors;
      background.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    } else {
      // 默认使用Bing每日图片
      loadBingDailyImage();
    }
  });
}

// 加载Bing每日图片
function loadBingDailyImage() {
  const background = document.getElementById('background');
  
  // 使用Bing每日图片API（需要代理或使用其他方式）
  // 这里使用一个公开的Bing图片API
  const apiUrl = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN';
  
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.images && data.images.length > 0) {
        const imageUrl = 'https://www.bing.com' + data.images[0].url;
        background.classList.add('background-image');
        background.style.backgroundImage = `url(${imageUrl})`;
        chrome.storage.sync.set({
          backgroundType: 'bing',
          bingImageUrl: imageUrl
        });
      } else {
        // 如果API失败，使用默认渐变
        background.classList.remove('background-image');
        background.style.background = 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)';
      }
    })
    .catch(error => {
      console.log('无法加载Bing每日图片，使用默认背景');
      background.classList.remove('background-image');
      background.style.background = 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)';
    });
}

function applyBackground(type, value) {
  const background = document.getElementById('background');
  
  if (type === 'bing') {
    loadBingDailyImage();
    chrome.storage.sync.set({
      backgroundType: 'bing'
    });
  } else if (type === 'preset') {
    const preset = presetBackgrounds.find(p => p.id === value);
    if (preset) {
      background.classList.add('background-image');
      background.style.backgroundImage = `url(${preset.url})`;
      chrome.storage.sync.set({
        backgroundType: 'preset',
        presetBackgroundId: value
      }, () => {
        // 更新预设图片选中状态
        updatePresetImagesSelection(value);
      });
    }
  } else if (type === 'color') {
    background.classList.remove('background-image');
    background.style.background = value;
    chrome.storage.sync.set({
      backgroundType: 'color',
      backgroundColor: value
    });
  } else if (type === 'image') {
    background.classList.add('background-image');
    background.style.backgroundImage = `url(${value})`;
    chrome.storage.sync.set({
      backgroundType: 'image',
      backgroundImage: value
    });
  } else if (type === 'gradient') {
    background.classList.remove('background-image');
    const [color1, color2] = value;
    background.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    chrome.storage.sync.set({
      backgroundType: 'gradient',
      gradientColors: value
    });
  }
}

// 更新预设图片选中状态
function updatePresetImagesSelection(selectedId) {
  const presetItems = document.querySelectorAll('.preset-image-item');
  presetItems.forEach(item => {
    if (item.dataset.presetId === selectedId) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

// 初始化预设图片网格
function initPresetImages() {
  const presetImagesGrid = document.getElementById('presetImagesGrid');
  if (!presetImagesGrid) return;
  
  presetImagesGrid.innerHTML = '';
  
  presetBackgrounds.forEach((preset, index) => {
    const item = document.createElement('div');
    item.className = 'preset-image-item';
    item.dataset.presetId = preset.id;
    
    item.innerHTML = `
      <img src="${preset.url}" alt="${preset.name}" loading="lazy">
      <div class="preset-name">${preset.name}</div>
    `;
    
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      
      const clickedPresetId = this.dataset.presetId;
      console.log('点击预设图片:', clickedPresetId, preset.name);
      
      // 选中预设图片选项
      const presetRadio = document.querySelector('input[name="background"][value="preset"]');
      if (presetRadio) {
        presetRadio.checked = true;
      }
      
      // 直接应用选中的预设图片
      applyBackground('preset', clickedPresetId);
    });
    
    presetImagesGrid.appendChild(item);
  });
  
  // 加载保存的预设图片选中状态
  chrome.storage.sync.get(['presetBackgroundId'], (result) => {
    if (result.presetBackgroundId) {
      updatePresetImagesSelection(result.presetBackgroundId);
    }
  });
}

// 书签管理
function initBookmarks() {
  loadBookmarks();
  
  const addBookmarkBtn = document.getElementById('addBookmarkBtn');
  const addBookmarkModal = document.getElementById('addBookmarkModal');
  const closeBookmarkModalBtn = document.getElementById('closeBookmarkModalBtn');
  const cancelBookmarkBtn = document.getElementById('cancelBookmarkBtn');
  const saveBookmarkBtn = document.getElementById('saveBookmarkBtn');
  
  addBookmarkBtn.addEventListener('click', () => {
    addBookmarkModal.classList.add('active');
    document.getElementById('bookmarkName').value = '';
    document.getElementById('bookmarkUrl').value = '';
  });
  
  closeBookmarkModalBtn.addEventListener('click', () => {
    addBookmarkModal.classList.remove('active');
  });
  
  cancelBookmarkBtn.addEventListener('click', () => {
    addBookmarkModal.classList.remove('active');
  });
  
  saveBookmarkBtn.addEventListener('click', () => {
    const name = document.getElementById('bookmarkName').value.trim();
    const url = document.getElementById('bookmarkUrl').value.trim();
    
    if (!name || !url) {
      alert('请填写名称和URL');
      return;
    }
    
    // 验证URL
    let validUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      validUrl = 'https://' + url;
    }
    
    addBookmark(name, validUrl);
    addBookmarkModal.classList.remove('active');
  });
  
  // 点击模态框外部关闭
  addBookmarkModal.addEventListener('click', (e) => {
    if (e.target === addBookmarkModal) {
      addBookmarkModal.classList.remove('active');
    }
  });
}

function loadBookmarks() {
  chrome.storage.sync.get(['bookmarks'], (result) => {
    const bookmarks = result.bookmarks || [];
    const bookmarksGrid = document.getElementById('bookmarksGrid');
    bookmarksGrid.innerHTML = '';
    
    bookmarks.forEach((bookmark, index) => {
      const bookmarkItem = createBookmarkElement(bookmark, index);
      bookmarksGrid.appendChild(bookmarkItem);
    });
  });
}

function createBookmarkElement(bookmark, index) {
  const item = document.createElement('div');
  item.className = 'quick-link-item';
  
  // 获取网站图标（使用favicon）
  let domain;
  try {
    domain = new URL(bookmark.url).hostname;
  } catch (e) {
    domain = bookmark.url;
  }
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  
  item.innerHTML = `
    <div class="link-icon">
      <img src="${faviconUrl}" alt="${bookmark.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="fallback-icon" style="display:none;">🔖</div>
    </div>
    <div class="link-name">${bookmark.name}</div>
    <button class="link-delete" data-index="${index}">×</button>
  `;
  
  // 点击快速链接跳转
  item.addEventListener('click', (e) => {
    if (!e.target.classList.contains('link-delete') && !e.target.closest('.link-delete')) {
      window.location.href = bookmark.url;
    }
  });
  
  // 删除快速链接
  const deleteBtn = item.querySelector('.link-delete');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteBookmark(index);
  });
  
  return item;
}

function addBookmark(name, url) {
  chrome.storage.sync.get(['bookmarks'], (result) => {
    const bookmarks = result.bookmarks || [];
    bookmarks.push({ name, url });
    chrome.storage.sync.set({ bookmarks }, () => {
      loadBookmarks();
    });
  });
}

function deleteBookmark(index) {
  chrome.storage.sync.get(['bookmarks'], (result) => {
    const bookmarks = result.bookmarks || [];
    bookmarks.splice(index, 1);
    chrome.storage.sync.set({ bookmarks }, () => {
      loadBookmarks();
    });
  });
}

// 设置面板
function initSettings() {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const defaultSearchEngine = document.getElementById('defaultSearchEngine');
  const backgroundColorPicker = document.getElementById('backgroundColorPicker');
  const backgroundImageInput = document.getElementById('backgroundImageInput');
  const uploadImageBtn = document.getElementById('uploadImageBtn');
  const gradientColor1 = document.getElementById('gradientColor1');
  const gradientColor2 = document.getElementById('gradientColor2');
  const backgroundRadios = document.querySelectorAll('input[name="background"]');
  
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('active');
  });
  
  closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
  });
  
  // 初始化预设图片网格
  initPresetImages();
  
  // 加载保存的设置
  chrome.storage.sync.get(['defaultSearchEngine', 'backgroundType', 'backgroundColor', 'gradientColors', 'presetBackgroundId'], (result) => {
    if (result.defaultSearchEngine) {
      defaultSearchEngine.value = result.defaultSearchEngine;
      currentSearchEngine = result.defaultSearchEngine;
      updateSearchEngineDisplay();
    }
    
    const bgType = result.backgroundType || 'bing';
    const bgRadio = document.querySelector(`input[name="background"][value="${bgType}"]`);
    if (bgRadio) {
      bgRadio.checked = true;
    }
    
    if (bgType === 'preset' && result.presetBackgroundId) {
      updatePresetImagesSelection(result.presetBackgroundId);
    } else if (bgType === 'color' && result.backgroundColor) {
      backgroundColorPicker.value = result.backgroundColor;
    } else if (bgType === 'gradient' && result.gradientColors) {
      gradientColor1.value = result.gradientColors[0];
      gradientColor2.value = result.gradientColors[1];
    }
  });
  
  // 默认搜索引擎设置
  defaultSearchEngine.addEventListener('change', (e) => {
    currentSearchEngine = e.target.value;
    chrome.storage.sync.set({ defaultSearchEngine: e.target.value });
    updateSearchEngineDisplay();
  });
  
  // 背景颜色设置
  backgroundColorPicker.addEventListener('change', (e) => {
    applyBackground('color', e.target.value);
  });
  
  // 图片背景设置
  uploadImageBtn.addEventListener('click', () => {
    backgroundImageInput.click();
  });
  
  backgroundImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        applyBackground('image', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
  
  // 渐变背景设置
  gradientColor1.addEventListener('change', () => {
    applyBackground('gradient', [gradientColor1.value, gradientColor2.value]);
  });
  
  gradientColor2.addEventListener('change', () => {
    applyBackground('gradient', [gradientColor1.value, gradientColor2.value]);
  });
  
  // 背景类型切换
  backgroundRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'bing') {
        applyBackground('bing');
      } else if (e.target.value === 'preset') {
        // 如果选择了预设图片，使用第一个预设或已保存的预设
        chrome.storage.sync.get(['presetBackgroundId'], (result) => {
          const presetId = result.presetBackgroundId || presetBackgrounds[0].id;
          applyBackground('preset', presetId);
        });
      } else if (e.target.value === 'color') {
        applyBackground('color', backgroundColorPicker.value);
      } else if (e.target.value === 'gradient') {
        applyBackground('gradient', [gradientColor1.value, gradientColor2.value]);
      }
    });
  });
  
  // 点击设置面板外部关闭
  settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
      settingsPanel.classList.remove('active');
    }
  });
}

// 收藏夹面板
function initBookmarksPanel() {
  const bookmarksBtn = document.getElementById('bookmarksBtn');
  const bookmarksPanel = document.getElementById('bookmarksPanel');
  const closeBookmarksPanelBtn = document.getElementById('closeBookmarksPanelBtn');
  
  if (!bookmarksBtn || !bookmarksPanel) return;
  
  // 打开收藏夹面板
  bookmarksBtn.addEventListener('click', () => {
    bookmarksPanel.classList.add('active');
    loadBrowserBookmarks();
  });
  
  // 关闭收藏夹面板
  if (closeBookmarksPanelBtn) {
    closeBookmarksPanelBtn.addEventListener('click', () => {
      bookmarksPanel.classList.remove('active');
    });
  }
  
  // 点击面板外部关闭
  bookmarksPanel.addEventListener('click', (e) => {
    if (e.target === bookmarksPanel) {
      bookmarksPanel.classList.remove('active');
    }
  });
}

// 加载浏览器收藏夹
function loadBrowserBookmarks() {
  const bookmarksList = document.getElementById('bookmarksList');
  if (!bookmarksList) return;
  
  bookmarksList.innerHTML = '<div class="loading">加载中...</div>';
  
  // 检查是否有bookmarks权限
  if (!chrome.bookmarks) {
    bookmarksList.innerHTML = '<div class="empty-bookmarks">无法访问收藏夹，请检查扩展权限</div>';
    return;
  }
  
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    if (chrome.runtime.lastError) {
      bookmarksList.innerHTML = '<div class="empty-bookmarks">无法加载收藏夹</div>';
      return;
    }
    
    bookmarksList.innerHTML = '';
    
    // 处理根节点
    if (bookmarkTreeNodes && bookmarkTreeNodes.length > 0) {
      const root = bookmarkTreeNodes[0];
      if (root.children) {
        root.children.forEach(child => {
          if (child.url) {
            // 直接的书签
            const bookmarkItem = createBookmarkItem(child);
            bookmarksList.appendChild(bookmarkItem);
          } else if (child.children && child.children.length > 0) {
            // 文件夹
            const folder = createBookmarkFolder(child);
            bookmarksList.appendChild(folder);
          }
        });
      }
    }
    
    if (bookmarksList.children.length === 0) {
      bookmarksList.innerHTML = '<div class="empty-bookmarks">暂无收藏夹</div>';
    }
  });
}

// 创建收藏夹项
function createBookmarkItem(bookmark) {
  const item = document.createElement('a');
  item.className = 'bookmark-item-link';
  item.href = bookmark.url;
  item.target = '_blank';
  
  let domain = '';
  try {
    domain = new URL(bookmark.url).hostname;
  } catch (e) {
    domain = bookmark.url;
  }
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  
  item.innerHTML = `
    <img src="${faviconUrl}" alt="" class="bookmark-item-icon" onerror="this.style.display='none'">
    <div class="bookmark-item-title">${bookmark.title || '未命名'}</div>
    <div class="bookmark-item-url">${domain}</div>
  `;
  
  return item;
}

// 创建收藏夹文件夹
function createBookmarkFolder(folder) {
  const folderDiv = document.createElement('div');
  folderDiv.className = 'bookmark-folder';
  
  const title = document.createElement('div');
  title.className = 'bookmark-folder-title';
  title.textContent = folder.title || '未命名文件夹';
  
  const itemList = document.createElement('div');
  itemList.className = 'bookmark-item-list';
  
  // 只显示前20个书签，避免列表过长
  const bookmarks = folder.children.filter(child => child.url).slice(0, 20);
  bookmarks.forEach(bookmark => {
    const bookmarkItem = createBookmarkItem(bookmark);
    itemList.appendChild(bookmarkItem);
  });
  
  folderDiv.appendChild(title);
  folderDiv.appendChild(itemList);
  
  return folderDiv;
}

