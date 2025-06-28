<script>
  // 事件映射表
  const eventMap = {
    'A': '原地自慰30秒',
    'B': '楼梯间门口闭眼M蹲15秒',
    'C': '放尿3秒',
    'D': '寸止一次',
    'E': '拍打屁股10下（大声）',
    'F': '下次移动改为爬行（注意安全）',
    'G': '背对电梯/住户门掰开屁股15秒'
  };
  
  // 装备映射表
  const equipmentMap = {
    'pants': { name: '裤子', icon: 'fa-male' },
    'underwear': { name: '内裤', icon: 'fa-venus' },
    'shoes': { name: '鞋', icon: 'fa-shopping-bag' },
    'shirt': { name: '上衣', icon: 'fa-black-tie' },
    'coat': { name: '外套', icon: 'fa-snowflake-o' },
    'socks': { name: '袜子', icon: 'fa-socks' }
  };
  
  // 获取DOM元素
  const startPage = document.getElementById('startPage');
  const gamePage = document.getElementById('gamePage');
  const startFloorInput = document.getElementById('startFloor');
  const startGameBtn = document.getElementById('startGameBtn');
  const generateBtn = document.getElementById('generateBtn');
  const centerDisplay = document.getElementById('centerDisplay');
  const currentFloor = document.getElementById('currentFloor');
  const copyToast = document.getElementById('copyToast');
  const floorValidation = document.getElementById('floorValidation');
  const equipmentStatus = document.getElementById('equipmentStatus');
  const specialOptionModal = document.getElementById('specialOptionModal');
  const specialOptionMessage = document.getElementById('specialOptionMessage');
  const specialOptions = document.getElementById('specialOptions');
  const optionBContent = document.getElementById('optionBContent');
  const equipmentSelector = document.getElementById('equipmentSelector');
  const zwTimerContent = document.getElementById('zwTimerContent');
  const zwTimerValue = document.getElementById('zwTimerValue');
  const progressFill = document.getElementById('progressFill');
  const skipZwBtn = document.getElementById('skipZwBtn');
  const gameStatusDot = document.getElementById('gameStatusDot');
  
  // 游戏状态
  let gameState = {
    isStarted: false,
    startFloor: 0,
    currentFloor: 0,
    totalDecrease: 0,
    isGameOver: false,
    equipment: {
      pants: false,   // false表示未脱下
      underwear: false,
      shoes: false,
      shirt: false,
      coat: false,
      socks: false
    },
    equipmentCount: {
      pants: 0,
      underwear: 0,
      shoes: 0,
      shirt: 0,
      coat: 0,
      socks: 0
    },
    currentSpecialEquipment: null,
    zwTimer: null
  };
  
  // 设置输入验证
  function setupInputValidation() {
    startFloorInput.addEventListener('input', validateFloorInput);
    startFloorInput.addEventListener('blur', validateFloorInput);
  }
  
  // 验证楼层输入
  function validateFloorInput() {
    const value = startFloorInput.value.trim();
    const isValid = !isNaN(value) && parseInt(value) >= 1;
    
    floorValidation.classList.toggle('hidden', !isValid);
    startGameBtn.disabled = !isValid;
    
    if (isValid) {
      floorValidation.innerHTML = `<i class="fa fa-check text-success mr-1"></i> 有效输入`;
    } else if (value) {
      floorValidation.innerHTML = `<i class="fa fa-times text-danger mr-1"></i> 无效楼层`;
      floorValidation.classList.remove('hidden');
    } else {
      floorValidation.classList.add('hidden');
    }
  }
  
  // 初始化页面
  document.addEventListener('DOMContentLoaded', () => {
    setupInputValidation();
    setupEventListeners();
    generateBtn.disabled = true;
    
    // 设置示例值便于测试
    startFloorInput.value = 10;
    validateFloorInput();
  });
  
  // 设置事件监听
  function setupEventListeners() {
    startGameBtn.addEventListener('click', switchToGamePage);
    generateBtn.addEventListener('click', renderCurrentChange);
    centerDisplay.addEventListener('click', handleCenterClick);
    
    // 特殊选项事件
    document.querySelectorAll('.special-option').forEach(option => {
      option.addEventListener('click', handleSpecialOption);
    });
    
    // 跳过ZW按钮
    skipZwBtn.addEventListener('click', skipZwTimer);
  }
  
  // 生成1-5的随机整数
  function generateRandomInteger() {
    return Math.floor(Math.random() * 5) + 1;
  }
  
  // 生成A-G的随机事件字母
  function generateRandomEvent() {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return letters[Math.floor(Math.random() * letters.length)];
  }
  
  // 随机选择一件装备
  function selectRandomEquipment() {
    const equipmentKeys = Object.keys(gameState.equipment);
    const availableEquipment = equipmentKeys.filter(key => !gameState.equipment[key]);
    
    // 如果没有可脱装备，返回null
    if (availableEquipment.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableEquipment.length);
    return availableEquipment[randomIndex];
  }
  
  // 页面切换动画
  function switchToGamePage() {
    const startFloor = parseInt(startFloorInput.value);
    
    if (isNaN(startFloor) || startFloor < 1) {
      alert('请输入有效的开始楼层（1或更大的整数）');
      return;
    }
    
    // 重置游戏状态
    gameState.isStarted = true;
    gameState.startFloor = startFloor;
    gameState.currentFloor = startFloor;
    gameState.totalDecrease = 0;
    gameState.isGameOver = false;
    gameState.equipment = {
      pants: false,
      underwear: false,
      shoes: false,
      shirt: false,
      coat: false,
      socks: false
    };
    gameState.equipmentCount = {
      pants: 0,
      underwear: 0,
      shoes: 0,
      shirt: 0,
      coat: 0,
      socks: 0
    };
    
    // 更新显示
    updateCurrentFloorDisplay();
    updateEquipmentDisplay();
    generateBtn.disabled = false;
    
    // 动画切换页面
    startPage.style.opacity = '0';
    startPage.style.transform = 'translate(-50%, calc(-50% + 40px))';
    
    setTimeout(() => {
      startPage.classList.add('hidden');
      gamePage.classList.remove('hidden');
      gamePage.style.opacity = '1';
    }, 500);
  }
  
  // 渲染当前下降值和随机事件
  function renderCurrentChange() {
    if (!gameState.isStarted || gameState.isGameOver) return;
    
    const change = generateRandomInteger();
    let eventLetter = generateRandomEvent();
    let eventText = eventMap[eventLetter];
    let doubleEvent = false;
    
    // 处理装备事件
    const equipmentEvent = handleEquipmentEvent();
    
    // 如果没有装备可脱，则触发双倍事件
    if (equipmentEvent && equipmentEvent.type === 'no-equipment') {
      doubleEvent = true;
      // 再生成一个随机事件
      const secondEventLetter = generateRandomEvent();
      const secondEventText = eventMap[secondEventLetter];
      
      // 合并事件显示
      eventText = `${eventText} + ${secondEventText}`;
    }
    
    // 计算楼层变化
    let newFloor = gameState.currentFloor - change;
    let bounced = false;
    let downSteps = change;
    let upSteps = 0;
    let pathDescription = `下降${change}层`;
    
    // 检查是否需要反弹（确保楼层不为负）
    if (newFloor < 0) {
      bounced = true;
      downSteps = gameState.currentFloor;
      upSteps = Math.abs(newFloor);
      newFloor = upSteps;
      pathDescription = `下降${downSteps}层 → 上升${upSteps}层`;
    }
    
    // 更新游戏状态
    gameState.totalDecrease += change;
    gameState.currentFloor = newFloor;
    
    // 检查游戏是否成功
    if (newFloor === 0) {
      gameSuccess();
      return;
    }
    
    // 更新显示
    updateCenterDisplay(change, eventText, bounced, downSteps, upSteps, equipmentEvent, doubleEvent);
    updateCurrentFloorDisplay();
    
    // 添加楼层变化动画
    addFloorChangeAnimation(change, bounced);
    
    // 按钮点击效果
    generateBtn.classList.add('scale-95');
    setTimeout(() => {
      generateBtn.classList.remove('scale-95');
    }, 200);
  }
  
  // 添加楼层变化动画
  function addFloorChangeAnimation(change, bounced) {
    const animationEl = document.createElement('div');
    animationEl.className = 'floor-change-animation';
    animationEl.textContent = `-${change}`;
    centerDisplay.appendChild(animationEl);
    
    setTimeout(() => {
      animationEl.remove();
    }, 1000);
  }
  
  // 处理装备事件
  function handleEquipmentEvent() {
    const selectedEquipment = selectRandomEquipment();
    
    // 如果没有可脱装备
    if (!selectedEquipment) {
      return { 
        type: 'no-equipment', 
        message: '所有装备已脱下，触发双倍随机事件！' 
      };
    }
    
    gameState.equipmentCount[selectedEquipment]++;
    
    // 首次选择该装备
    if (gameState.equipmentCount[selectedEquipment] === 1) {
      gameState.equipment[selectedEquipment] = true;
      updateEquipmentDisplay();
      highlightEquipment(selectedEquipment);
      
      return {
        type: 'remove',
        equipment: selectedEquipment,
        message: `脱下${equipmentMap[selectedEquipment].name}`
      };
    }
    
    // 重复选择装备 - 触发特殊选项
    gameState.currentSpecialEquipment = selectedEquipment;
    showSpecialOptionModal(selectedEquipment);
    
    return {
      type: 'special',
      equipment: selectedEquipment,
      message: `再次选择${equipmentMap[selectedEquipment].name}，触发特殊选项`
    };
  }
  
  // 显示特殊选项模态框
  function showSpecialOptionModal(equipment) {
    specialOptionMessage.innerHTML = `您再次选择了<span class="font-bold text-warning">${equipmentMap[equipment].name}</span>，请选择操作：`;
    specialOptions.classList.remove('hidden');
    optionBContent.classList.add('hidden');
    zwTimerContent.classList.add('hidden');
    specialOptionModal.classList.add('active');
    
    // 禁用下降按钮
    generateBtn.disabled = true;
  }
  
  // 处理特殊选项
  function handleSpecialOption(e) {
    const option = e.currentTarget.dataset.option;
    const equipment = gameState.currentSpecialEquipment;
    
    if (option === 'a') {
      // 选项A：随机脱下另外两件装备
      removeRandomTwoEquipment();
      specialOptionModal.classList.remove('active');
      generateBtn.disabled = false;
    } else if (option === 'b') {
      // 选项B：显示装备选择器
      specialOptions.classList.add('hidden');
      showEquipmentSelector();
    }
  }
  
  // 随机脱下另外两件装备
  function removeRandomTwoEquipment() {
    const availableEquipment = Object.keys(gameState.equipment)
      .filter(key => !gameState.equipment[key] && key !== gameState.currentSpecialEquipment);
    
    // 如果可用装备不足，脱下所有可用装备
    const toRemove = availableEquipment.slice(0, 2);
    
    toRemove.forEach(equipment => {
      gameState.equipment[equipment] = true;
    });
    
    updateEquipmentDisplay();
  }
  
  // 显示装备选择器
  function showEquipmentSelector() {
    equipmentSelector.innerHTML = '';
    const availableEquipment = Object.keys(gameState.equipment)
      .filter(key => !gameState.equipment[key] && key !== gameState.currentSpecialEquipment);
    
    if (availableEquipment.length === 0) {
      optionBContent.innerHTML = '<p class="text-neutral-500 text-center py-4">没有可脱下的装备</p>';
      optionBContent.classList.remove('hidden');
      return;
    }
    
    availableEquipment.forEach(equipment => {
      const item = document.createElement('div');
      item.className = 'equipment-item';
      item.dataset.equipment = equipment;
      item.innerHTML = `
        <i class="fa ${equipmentMap[equipment].icon} equipment-icon"></i> 
        ${equipmentMap[equipment].name}
      `;
      item.addEventListener('click', () => selectEquipmentToRemove(equipment));
      equipmentSelector.appendChild(item);
    });
    
    optionBContent.classList.remove('hidden');
  }
  
  // 选择要脱下的装备
  function selectEquipmentToRemove(equipment) {
    gameState.equipment[equipment] = true;
    
    updateEquipmentDisplay();
    
    // 显示ZW计时器
    optionBContent.classList.add('hidden');
    showZwTimer();
  }
  
  // 显示ZW计时器
  function showZwTimer() {
    zwTimerContent.classList.remove('hidden');
    let seconds = 30;
    zwTimerValue.textContent = seconds;
    
    // 进度条重置
    progressFill.style.width = '0%';
    
    // 开始计时
    gameState.zwTimer = setInterval(() => {
      seconds--;
      zwTimerValue.textContent = seconds;
      progressFill.style.width = `${(30 - seconds) * 100 / 30}%`;
      
      if (seconds <= 0) {
        finishZwTimer();
      }
    }, 1000);
  }
  
  // 完成ZW计时
  function finishZwTimer() {
    clearInterval(gameState.zwTimer);
    specialOptionModal.classList.remove('active');
    generateBtn.disabled = false;
  }
  
  // 跳过ZW计时
  function skipZwTimer() {
    clearInterval(gameState.zwTimer);
    finishZwTimer();
  }
  
  // 游戏成功处理
  function gameSuccess() {
    gameState.isGameOver = true;
    generateBtn.disabled = true;
    
    centerDisplay.innerHTML = '';
    centerDisplay.classList.add('animate-fall-in');
    
    const successEl = document.createElement('div');
    successEl.className = 'text-center';
    
    const iconEl = document.createElement('i');
    iconEl.className = 'fa fa-trophy text-6xl text-accent mb-4 animate-bounce';
    
    const titleEl = document.createElement('h2');
    titleEl.className = 'text-3xl font-bold text-success mb-2';
    titleEl.textContent = '挑战成功！';
    
    const descEl = document.createElement('p');
    descEl.className = 'text-neutral-600 mb-4';
    descEl.textContent = `您成功从 ${gameState.startFloor} 层下降到 0 层`;
    
    const statsEl = document.createElement('p');
    statsEl.className = 'text-sm text-neutral-500';
    statsEl.innerHTML = `共下降 <span class="font-bold text-accent">${gameState.totalDecrease}</span> 层`;
    
    successEl.appendChild(iconEl);
    successEl.appendChild(titleEl);
    successEl.appendChild(descEl);
    successEl.appendChild(statsEl);
    
    centerDisplay.appendChild(successEl);
    createConfetti();
    
    // 更新游戏状态指示器
    gameStatusDot.style.backgroundColor = 'var(--success)';
  }
  
  // 创建彩花特效
  function createConfetti() {
    const colors = ['#165DFF', '#36CBCB', '#FF7D00', '#00B42A', '#F53F3F'];
    const container = document.body;
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = '-10px';
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = confetti.style.width;
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  }
  
  // 更新中心显示区域
  function updateCenterDisplay(change, eventText, bounced, downSteps, upSteps, equipmentEvent, doubleEvent) {
    centerDisplay.innerHTML = '';
    centerDisplay.classList.add('animate-fall-in');
    
    // 事件显示
    const eventEl = document.createElement('div');
    eventEl.className = 'event-badge mb-3';
    eventEl.textContent = eventText;
    centerDisplay.appendChild(eventEl);
    
    // 双倍事件显示
    if (doubleEvent) {
      const doubleEventEl = document.createElement('div');
      doubleEventEl.className = 'double-event-badge mb-3';
      doubleEventEl.textContent = '双倍事件效果！';
      centerDisplay.appendChild(doubleEventEl);
      
      const doubleInfo = document.createElement('div');
      doubleInfo.className = 'double-event-info';
      doubleInfo.innerHTML = `<i class="fa fa-bolt text-purple-500 mr-1"></i> 所有装备已脱下，触发双倍随机事件效果`;
      centerDisplay.appendChild(doubleInfo);
    }
    
    // 下降值显示
    const floorChangeEl = document.createElement('div');
    floorChangeEl.className = 'text-3xl font-bold text-accent mb-4 text-center';
    floorChangeEl.textContent = `下降${downSteps}层${bounced ? ` → 上升${upSteps}层` : ''}`;
    centerDisplay.appendChild(floorChangeEl);
    
    // 反弹提示
    if (bounced) {
      const bounceInfo = document.createElement('div');
      bounceInfo.className = 'bounce-info';
      bounceInfo.innerHTML = `<i class="fa fa-arrow-circle-down text-warning mr-1"></i> 下降超过0层，反弹为${upSteps}层`;
      centerDisplay.appendChild(bounceInfo);
    }
    
    // 装备事件显示
    if (equipmentEvent) {
      const equipmentInfo = document.createElement('div');
      equipmentInfo.className = 'mt-4 p-3 bg-blue-50 rounded-lg text-center';
      
      const icon = document.createElement('i');
      icon.className = 'fa fa-tshirt text-blue-500 mr-2';
      
      const text = document.createElement('span');
      text.textContent = equipmentEvent.message;
      text.className = 'text-blue-700 font-medium';
      
      equipmentInfo.appendChild(icon);
      equipmentInfo.appendChild(text);
      centerDisplay.appendChild(equipmentInfo);
    }
    
    // 当前楼层显示
    const currentFloorEl = document.createElement('div');
    currentFloorEl.className = 'text-sm text-neutral-500 text-center mt-4';
    currentFloorEl.innerHTML = `当前楼层: <span class="floor-indicator text-accent">${gameState.currentFloor}</span>`;
    centerDisplay.appendChild(currentFloorEl);
    
    setTimeout(() => {
      centerDisplay.classList.remove('animate-fall-in');
    }, 500);
  }
  
  // 更新装备显示
  function updateEquipmentDisplay() {
    const equipmentItems = equipmentStatus.querySelectorAll('.equipment-item');
    
    equipmentItems.forEach(item => {
      const equipment = item.dataset.equipment;
      
      if (gameState.equipment[equipment]) {
        item.classList.add('removed');
      } else {
        item.classList.remove('removed');
      }
      
      // 更新图标和文本
      item.innerHTML = `
        <i class="fa ${equipmentMap[equipment].icon} equipment-icon"></i> 
        ${equipmentMap[equipment].name}
      `;
    });
  }
  
  // 高亮装备
  function highlightEquipment(equipment) {
    const item = document.querySelector(`.equipment-item[data-equipment="${equipment}"]`);
    if (!item) return;
    
    item.classList.add('highlight');
    item.classList.add('animate-equipment-highlight');
    
    setTimeout(() => {
      item.classList.remove('highlight');
      item.classList.remove('animate-equipment-highlight');
    }, 2000);
  }
  
  // 更新当前楼层显示
  function updateCurrentFloorDisplay() {
    currentFloor.innerHTML = `当前楼层: <span class="floor-indicator text-accent">${gameState.currentFloor}</span>`;
  }
  
  // 复制数据到剪贴板
  function copyToClipboard(text, toastMsg = '已复制到剪贴板') {
    navigator.clipboard.writeText(text).then(() => {
      copyToast.querySelector('span').textContent = toastMsg;
      copyToast.style.transform = 'translateY(0)';
      copyToast.style.opacity = '1';
      
      setTimeout(() => {
        copyToast.style.transform = 'translateY(80px)';
        copyToast.style.opacity = '0';
      }, 3000);
    }).catch(err => {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    });
  }
  
  // 处理中心区域点击
  function handleCenterClick(e) {
    if (gameState.currentFloor !== undefined) {
      copyToClipboard(`当前楼层: ${gameState.currentFloor}`);
    }
  }
</script>
