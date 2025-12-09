// 搜索引擎配置
const searchEngines = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: '🔍'
  },
  bing: {
    name: 'Bing',
    url: 'https://cn.bing.com/search?q=',
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
  
  // Todo 列表
  initTodoList();
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

// Todo 列表功能
function initTodoList() {
  const todoBtn = document.getElementById('todoBtn');
  const todoPanel = document.getElementById('todoPanel');
  const closeTodoPanelBtn = document.getElementById('closeTodoPanelBtn');
  const addTodoBtn = document.getElementById('addTodoBtn');
  const addTodoModal = document.getElementById('addTodoModal');
  const closeTodoModalBtn = document.getElementById('closeTodoModalBtn');
  const cancelTodoBtn = document.getElementById('cancelTodoBtn');
  const saveTodoBtn = document.getElementById('saveTodoBtn');
  
  // 打开 Todo 面板
  if (todoBtn) {
    todoBtn.addEventListener('click', () => {
      todoPanel.classList.add('active');
      loadTodos();
    });
  }
  
  // 关闭 Todo 面板
  if (closeTodoPanelBtn) {
    closeTodoPanelBtn.addEventListener('click', () => {
      todoPanel.classList.remove('active');
    });
  }
  
  // 点击面板外部关闭
  if (todoPanel) {
    todoPanel.addEventListener('click', (e) => {
      if (e.target === todoPanel) {
        todoPanel.classList.remove('active');
      }
    });
  }
  
  // 打开添加 Todo 模态框
  if (addTodoBtn) {
    addTodoBtn.addEventListener('click', () => {
      openTodoModal();
    });
  }
  
  // 关闭 Todo 模态框
  if (closeTodoModalBtn) {
    closeTodoModalBtn.addEventListener('click', () => {
      addTodoModal.classList.remove('active');
      resetTodoForm();
    });
  }
  
  if (cancelTodoBtn) {
    cancelTodoBtn.addEventListener('click', () => {
      addTodoModal.classList.remove('active');
      resetTodoForm();
    });
  }
  
  // 点击模态框外部关闭
  if (addTodoModal) {
    addTodoModal.addEventListener('click', (e) => {
      if (e.target === addTodoModal) {
        addTodoModal.classList.remove('active');
        resetTodoForm();
      }
    });
  }
  
  // 保存 Todo
  if (saveTodoBtn) {
    saveTodoBtn.addEventListener('click', () => {
      saveTodo();
    });
  }
  
  // 加载初始 Todo 列表
  loadTodos();
}

function loadTodos() {
  const todoList = document.getElementById('todoList');
  if (!todoList) return;
  
  chrome.storage.sync.get(['todos'], (result) => {
    const todos = result.todos || [];
    
    if (todos.length === 0) {
      todoList.innerHTML = '<div class="empty-todos">暂无待办事项</div>';
      return;
    }
    
    // 按创建时间倒序排列
    todos.sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return timeB - timeA;
    });
    
    todoList.innerHTML = '';
    
    todos.forEach((todo, index) => {
      const todoItem = createTodoElement(todo, index);
      todoList.appendChild(todoItem);
    });
  });
}

function createTodoElement(todo, index) {
  const item = document.createElement('div');
  item.className = 'todo-item';
  
  // 检查任务状态
  const now = new Date().getTime();
  const startTime = todo.startTime ? new Date(todo.startTime).getTime() : null;
  const endTime = todo.endTime ? new Date(todo.endTime).getTime() : null;
  
  let statusClass = '';
  let statusText = '';
  
  if (todo.completed) {
    statusClass = 'completed';
    statusText = '已完成';
  } else if (endTime && now > endTime) {
    statusClass = 'overdue';
    statusText = '已过期';
  } else if (startTime && now < startTime) {
    statusClass = 'upcoming';
    statusText = '未开始';
  } else if (startTime && endTime && now >= startTime && now <= endTime) {
    statusClass = 'in-progress';
    statusText = '进行中';
  } else {
    statusClass = 'pending';
    statusText = '待处理';
  }
  
  item.classList.add(statusClass);
  
  const startTimeStr = todo.startTime ? formatDateTime(todo.startTime) : '未设置';
  const endTimeStr = todo.endTime ? formatDateTime(todo.endTime) : '未设置';
  
  item.innerHTML = `
    <div class="todo-item-header">
      <div class="todo-item-title">${escapeHtml(todo.title || '未命名任务')}</div>
      <div class="todo-item-actions">
        <button class="todo-action-btn todo-edit-btn" data-index="${index}" title="编辑">✏️</button>
        <button class="todo-action-btn todo-delete-btn" data-index="${index}" title="删除">🗑️</button>
      </div>
    </div>
    ${todo.description ? `<div class="todo-item-description">${escapeHtml(todo.description)}</div>` : ''}
    <div class="todo-item-time">
      <div class="todo-time-item">
        <span class="todo-time-label">开始：</span>
        <span class="todo-time-value">${startTimeStr}</span>
      </div>
      <div class="todo-time-item">
        <span class="todo-time-label">结束：</span>
        <span class="todo-time-value">${endTimeStr}</span>
      </div>
    </div>
    <div class="todo-item-status">
      <span class="status-badge ${statusClass}">${statusText}</span>
      ${!todo.completed ? `<button class="todo-complete-btn" data-index="${index}">标记为完成</button>` : ''}
    </div>
  `;
  
  // 编辑按钮
  const editBtn = item.querySelector('.todo-edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editTodo(index);
    });
  }
  
  // 删除按钮
  const deleteBtn = item.querySelector('.todo-delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTodo(index);
    });
  }
  
  // 完成按钮
  const completeBtn = item.querySelector('.todo-complete-btn');
  if (completeBtn) {
    completeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTodoComplete(index);
    });
  }
  
  return item;
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '未设置';
  
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function openTodoModal(todoIndex = null) {
  const modal = document.getElementById('addTodoModal');
  const modalTitle = document.getElementById('todoModalTitle');
  const titleInput = document.getElementById('todoTitle');
  const descriptionInput = document.getElementById('todoDescription');
  const startTimeInput = document.getElementById('todoStartTime');
  const endTimeInput = document.getElementById('todoEndTime');
  
  if (todoIndex !== null) {
    // 编辑模式
    modalTitle.textContent = '编辑任务';
    chrome.storage.sync.get(['todos'], (result) => {
      const todos = result.todos || [];
      const todo = todos[todoIndex];
      
      if (todo) {
        titleInput.value = todo.title || '';
        descriptionInput.value = todo.description || '';
        
        // 转换时间格式为 datetime-local 需要的格式 (YYYY-MM-DDTHH:mm)
        if (todo.startTime) {
          const startDate = new Date(todo.startTime);
          startTimeInput.value = formatDateTimeLocal(startDate);
        } else {
          startTimeInput.value = '';
        }
        
        if (todo.endTime) {
          const endDate = new Date(todo.endTime);
          endTimeInput.value = formatDateTimeLocal(endDate);
        } else {
          endTimeInput.value = '';
        }
        
        // 保存当前编辑的索引
        modal.dataset.editIndex = todoIndex;
      }
    });
  } else {
    // 添加模式
    modalTitle.textContent = '添加任务';
    resetTodoForm();
    delete modal.dataset.editIndex;
  }
  
  modal.classList.add('active');
}

function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function resetTodoForm() {
  document.getElementById('todoTitle').value = '';
  document.getElementById('todoDescription').value = '';
  document.getElementById('todoStartTime').value = '';
  document.getElementById('todoEndTime').value = '';
}

function editTodo(index) {
  openTodoModal(index);
}

function saveTodo() {
  const modal = document.getElementById('addTodoModal');
  const title = document.getElementById('todoTitle').value.trim();
  const description = document.getElementById('todoDescription').value.trim();
  const startTime = document.getElementById('todoStartTime').value;
  const endTime = document.getElementById('todoEndTime').value;
  const editIndex = modal.dataset.editIndex;
  
  if (!title) {
    alert('请输入任务标题');
    return;
  }
  
  // 验证时间
  if (startTime && endTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    if (start >= end) {
      alert('结束时间必须晚于开始时间');
      return;
    }
  }
  
  chrome.storage.sync.get(['todos'], (result) => {
    const todos = result.todos || [];
    
    const todoData = {
      title,
      description,
      startTime: startTime || null,
      endTime: endTime || null,
      completed: false,
      createdAt: Date.now()
    };
    
    if (editIndex !== undefined) {
      // 编辑模式：保留原有的创建时间和完成状态
      const existingTodo = todos[editIndex];
      if (existingTodo) {
        todoData.createdAt = existingTodo.createdAt;
        todoData.completed = existingTodo.completed;
      }
      todos[editIndex] = todoData;
    } else {
      // 添加模式
      todos.push(todoData);
    }
    
    chrome.storage.sync.set({ todos }, () => {
      loadTodos();
      modal.classList.remove('active');
      resetTodoForm();
    });
  });
}

function deleteTodo(index) {
  if (!confirm('确定要删除这个任务吗？')) {
    return;
  }
  
  chrome.storage.sync.get(['todos'], (result) => {
    const todos = result.todos || [];
    todos.splice(index, 1);
    chrome.storage.sync.set({ todos }, () => {
      loadTodos();
    });
  });
}

function toggleTodoComplete(index) {
  chrome.storage.sync.get(['todos'], (result) => {
    const todos = result.todos || [];
    if (todos[index]) {
      todos[index].completed = !todos[index].completed;
      chrome.storage.sync.set({ todos }, () => {
        loadTodos();
      });
    }
  });
}

