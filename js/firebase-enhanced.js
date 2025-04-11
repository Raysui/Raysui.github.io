// Firebase增强功能模块
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Firebase
    initFirebase();
});

// 初始化Firebase
function initFirebase() {
    // 检查Firebase是否已初始化
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK未加载');
        return;
    }
    
    try {
        // 初始化Firestore
        db = firebase.firestore();
        console.log('Firebase初始化成功');
        
        // 启用离线持久化
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('Firebase离线持久化已启用');
            })
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('多个标签页打开，无法启用离线持久化');
                } else if (err.code == 'unimplemented') {
                    console.warn('当前浏览器不支持离线持久化');
                }
            });
    } catch (error) {
        console.error('Firebase初始化失败:', error);
    }
}

// 添加CSS样式
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .notification.info {
            border-left: 4px solid #3498db;
        }
        
        .notification.success {
            border-left: 4px solid #2ecc71;
        }
        
        .notification.error {
            border-left: 4px solid #e74c3c;
        }
        
        .editable-active {
            cursor: text;
            border: 1px dashed transparent;
            transition: all 0.2s ease;
            min-height: 1em;
            min-width: 2em;
            display: inline-block;
        }
        
        .editable-active:hover {
            background-color: rgba(212, 175, 55, 0.2);
            border-color: #d4af37;
        }
        
        .editable-active:focus {
            outline: none;
            background-color: rgba(212, 175, 55, 0.3);
            border-color: #d4af37;
        }
        
        .saving-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 4px;
            z-index: 1000;
            display: none;
        }
        
        .saving-indicator.show {
            display: block;
        }
        
        .saving-indicator .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
}

// 添加保存指示器
function addSavingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'saving-indicator';
    indicator.innerHTML = '<span class="spinner"></span> 正在保存...';
    indicator.id = 'saving-indicator';
    document.body.appendChild(indicator);
}

// 显示保存指示器
function showSavingIndicator() {
    const indicator = document.getElementById('saving-indicator');
    if (indicator) {
        indicator.classList.add('show');
    }
}

// 隐藏保存指示器
function hideSavingIndicator() {
    const indicator = document.getElementById('saving-indicator');
    if (indicator) {
        indicator.classList.remove('show');
    }
}

// 添加样式和指示器
addStyles();
addSavingIndicator();
