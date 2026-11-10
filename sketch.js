let characterSprite; // 儲存角色1的精靈圖
let walkingSprite; // 儲存角色1的走路精靈圖
let attackSprite; // 儲存角色1的單次發功精靈圖
let effectSprite; // 儲存角色發功後的特效精靈圖
const spriteFrameCount = 10; // 設定精靈圖中的動畫影格數
const walkingFrameCount = 9; // 設定走路精靈圖中的動畫影格數
const attackFrameCount = 4; // 設定單次發功精靈圖中的動畫影格數
const effectFrameCount = 5; // 設定特效精靈圖中的動畫影格數
const animationFrameDuration = 110; // 設定每張影格顯示的毫秒數
let characterCenterX; // 儲存角色中心目前在畫布上的水平位置
let isWalking = false; // 記錄角色是否已切換到走路動畫
let movementDirection = 0; // 記錄角色移動方向，正值向右、負值向左
let facingDirection = 1; // 記錄角色目前面向方向，初始面向右側
let attackDirection = 1; // 記錄本次發功動畫與特效使用的方向
let isAttacking = false; // 記錄角色是否正在播放單次發功動畫
let attackStartedAt = 0; // 記錄單次發功動畫開始播放的時間
let spaceKeyHeld = false; // 記錄空白鍵是否仍被按住以避免連續觸發
let isEffectActive = false; // 記錄發功特效是否正在畫面中移動
let effectX = 0; // 儲存發功特效目前的水平位置
let effectStartedAt = 0; // 記錄發功特效開始播放的時間

function preload() { // 在畫布建立前載入角色精靈圖
  characterSprite = loadImage('2/發功/全部發功.png'); // 載入角色1的十格發功動畫
  walkingSprite = loadImage('2/走路/全部走路.png'); // 載入角色1的九格走路動畫
  attackSprite = loadImage('2/發功2/全部發功2.png'); // 載入角色1的四格單次發功動畫
  effectSprite = loadImage('2/特效/全部特效.png'); // 載入角色發功後的五格特效動畫
} // 結束精靈圖載入設定

function setup() { // 設定全視窗畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗尺寸的畫布
  imageMode(CORNER); // 使用圖片左上角作為繪製座標
  frameRate(60); // 設定畫面更新頻率
  characterCenterX = width * (2 / 3); // 將角色初始中心放在畫布寬度的三分之二處
} // 結束畫布初始化

function draw() { // 每個畫面更新時繪製背景與角色
  background(135, 206, 235); // 使用天空藍清除並填滿畫布
  const attackJustCompleted = isAttacking && millis() - attackStartedAt >= attackFrameCount * animationFrameDuration; // 判斷單次發功動畫是否剛好播放完畢
  if (attackJustCompleted) { // 處理單次發功動畫結束
    isAttacking = false; // 結束單次發功動畫並讓角色回到原本動作
    isEffectActive = true; // 啟動發功後的飛行特效
  } // 結束發功動畫完成處理
  const activeSprite = isAttacking ? attackSprite : isWalking ? walkingSprite : characterSprite; // 根據角色狀態選擇發功、走路或待機精靈圖
  const activeFrameCount = isAttacking ? attackFrameCount : isWalking ? walkingFrameCount : spriteFrameCount; // 取得目前角色動畫的影格總數
  const frameWidth = activeSprite.width / activeFrameCount; // 計算目前精靈圖單格寬度
  const frameHeight = activeSprite.height; // 取得目前精靈圖單格高度
  const scaleFactor = min((height * 0.72) / frameHeight, (width * 0.34) / frameWidth); // 依畫布高寬限制角色縮放比例
  const characterWidth = frameWidth * scaleFactor; // 計算角色顯示寬度
  const characterHeight = frameHeight * scaleFactor; // 計算角色顯示高度
  const halfCharacterWidth = characterWidth / 2; // 計算角色顯示寬度的一半以供邊界判斷
  const movementSpeed = max(2, width * 0.004); // 依畫布寬度設定適合不同裝置的移動速度
  characterCenterX += movementDirection * movementSpeed; // 依目前方向逐格移動角色
  characterCenterX = constrain(characterCenterX, halfCharacterWidth, width - halfCharacterWidth); // 限制角色完整留在畫布左右邊界內
  if (attackJustCompleted) { // 設定單次發功動畫結束後的特效起點
    const effectScale = characterHeight / frameHeight; // 依角色高度計算特效縮放比例
    const effectWidth = (effectSprite.width / effectFrameCount) * effectScale; // 計算特效單格顯示寬度
    effectX = attackDirection > 0 ? characterCenterX + halfCharacterWidth : characterCenterX - halfCharacterWidth - effectWidth; // 將特效放在角色面向的一側
    effectStartedAt = millis(); // 記錄特效動畫開始時間
  } // 結束發功動畫完成判斷
  const frameIndex = isAttacking ? min(floor((millis() - attackStartedAt) / animationFrameDuration), attackFrameCount - 1) : floor(millis() / animationFrameDuration) % activeFrameCount; // 單次播放發功動畫並循環其他動畫
  const characterX = characterCenterX - halfCharacterWidth; // 依角色中心位置計算圖片左側座標
  const characterY = height - characterHeight; // 將角色圖片底部對齊畫布底部
  const characterFacingDirection = isAttacking ? attackDirection : facingDirection; // 攻擊期間鎖定方向，其他時間依最後面向繪製
  if (characterFacingDirection < 0) { // 判斷角色是否面向左側並需要翻轉
    push(); // 暫存目前的繪圖座標與縮放狀態
    translate(characterX + characterWidth, characterY); // 將翻轉基準移到角色圖片右上角
    scale(-1, 1); // 水平翻轉角色使其面向左側
    image(activeSprite, 0, 0, characterWidth, characterHeight, frameIndex * frameWidth, 0, frameWidth, frameHeight); // 繪製翻轉後的角色動畫影格
    pop(); // 還原繪圖座標與縮放狀態
  } else { // 處理面向右側的角色動畫
    image(activeSprite, characterX, characterY, characterWidth, characterHeight, frameIndex * frameWidth, 0, frameWidth, frameHeight); // 繪製目前方向的動畫影格
  } // 結束角色方向繪製判斷
  if (isEffectActive) { // 判斷是否需要繪製並移動發功特效
    const effectFrameWidth = effectSprite.width / effectFrameCount; // 計算特效精靈圖單格寬度
    const effectFrameHeight = effectSprite.height; // 取得特效精靈圖單格高度
    const effectScale = characterHeight / frameHeight; // 依角色目前高度縮放特效尺寸
    const effectWidth = effectFrameWidth * effectScale; // 計算特效顯示寬度
    const effectHeight = effectFrameHeight * effectScale; // 計算特效顯示高度
    const effectY = characterY + characterHeight * 0.52; // 將特效放在角色身體前方
    const effectSpeed = max(3, width * 0.008); // 依畫布寬度設定特效移動速度
    effectX += attackDirection * effectSpeed; // 依發功方向移動特效
    if ((attackDirection > 0 && effectX >= width) || (attackDirection < 0 && effectX + effectWidth <= 0)) { // 判斷特效是否已抵達畫布邊緣
      isEffectActive = false; // 移除抵達畫布邊緣的特效
    } else if (attackDirection < 0) { // 判斷特效是否需要朝左翻轉
      const effectFrameIndex = floor((millis() - effectStartedAt) / animationFrameDuration) % effectFrameCount; // 循環播放特效的五格動畫
      push(); // 暫存目前的繪圖座標與縮放狀態
      translate(effectX + effectWidth, effectY); // 將特效翻轉基準移到圖片右上角
      scale(-1, 1); // 水平翻轉特效使其往左移動
      image(effectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 繪製翻轉後的特效動畫影格
      pop(); // 還原繪圖座標與縮放狀態
    } else { // 處理朝右移動的特效
      const effectFrameIndex = floor((millis() - effectStartedAt) / animationFrameDuration) % effectFrameCount; // 循環播放特效的五格動畫
      image(effectSprite, effectX, effectY, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); // 繪製特效動畫影格
    } // 結束特效方向繪製判斷
  } // 結束特效繪製與移動
} // 結束畫面繪製

function keyPressed() { // 按下方向鍵時設定角色走路方向
  if (keyCode === RIGHT_ARROW) { // 判斷是否按下鍵盤右方向鍵
    isWalking = true; // 切換成走路精靈動畫
    facingDirection = 1; // 設定角色面向右側
    movementDirection = 1; // 設定角色持續向右移動
    return false; // 阻止瀏覽器因方向鍵捲動畫面
  } // 結束右方向鍵處理
  if (keyCode === LEFT_ARROW) { // 判斷是否按下鍵盤左方向鍵
    isWalking = true; // 切換成走路精靈動畫
    facingDirection = -1; // 設定角色面向左側
    movementDirection = -1; // 設定角色持續向左移動並翻轉朝向
    return false; // 阻止瀏覽器因方向鍵捲動畫面
  } // 結束左方向鍵處理
  if (keyCode === 32) { // 判斷是否按下空白鍵
    if (!spaceKeyHeld) { // 確認這是本次空白鍵按下事件而非長按重複事件
      spaceKeyHeld = true; // 記錄空白鍵目前處於按住狀態
      if (!isAttacking && !isEffectActive) { // 確認目前沒有發功動畫或飛行特效
        isAttacking = true; // 啟動單次發功動畫
        attackDirection = facingDirection; // 記錄發功時角色面向的方向
        attackStartedAt = millis(); // 記錄發功動畫開始時間
      } // 結束攻擊狀態確認
    } // 結束空白鍵長按檢查
    return false; // 阻止空白鍵捲動網頁
  } // 結束空白鍵攻擊處理
} // 結束方向鍵控制

function keyReleased() { // 放開方向鍵時停止移動並恢復發功動畫
  if (keyCode === 32) { // 判斷是否放開空白鍵
    spaceKeyHeld = false; // 允許下一次空白鍵按下重新觸發攻擊
    return false; // 阻止空白鍵放開事件造成瀏覽器預設行為
  } // 結束空白鍵放開處理
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) { // 判斷放開的是否為左右方向鍵
    movementDirection = 0; // 停止角色水平移動
    isWalking = false; // 切換回發功精靈動畫
    return false; // 阻止瀏覽器因方向鍵捲動畫面
  } // 結束方向鍵放開處理
} // 結束鍵盤放開事件

function windowResized() { // 視窗尺寸改變時重新調整畫布
  const horizontalRatio = characterCenterX / width; // 記錄角色目前相對於畫布寬度的位置
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿目前視窗
  characterCenterX = horizontalRatio * width; // 依新畫布寬度保留角色相對位置
} // 結束視窗尺寸調整
