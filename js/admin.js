// 管理员功能模块
class AdminManager {
    constructor() {
        this.isLoggedIn = false;
        this.isEditing = false;
        this.editableElements = [];
        this.currentEditElement = null;
        this.adminPassword = "admin"; // 管理员密码
    }

    // 初始化管理员功能
    init() {
        // 获取DOM元素
        this.adminLoginBtn = document.getElementById('admin-login-btn');
        this.adminControls = document.getElementById('admin-controls');
        this.saveChangesBtn = document.getElementById('save-changes-btn');
        this.discardChangesBtn = document.getElementById('discard-changes-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.adminModal = document.getElementById('admin-modal');
        this.editModal = document.getElementById('edit-modal');
        this.loginSubmitBtn = document.getElementById('login-submit');
        this.adminPasswordInput = document.getElementById('admin-password');
        this.loginErrorMsg = document.getElementById('login-error');
        this.editSubmitBtn = document.getElementById('edit-submit');
        this.editCancelBtn = document.getElementById('edit-cancel');
        this.editForm = document.getElementById('edit-form');

        // 绑定事件
        this.bindEvents();
    }

    // 绑定事件处理函数
    bindEvents() {
        // 管理员登录按钮点击事件
        this.adminLoginBtn.addEventListener('click', () => {
            this.showLoginModal();
        });

        // 登录提交按钮点击事件
        this.loginSubmitBtn.addEventListener('click', () => {
            this.login();
        });

        // 管理员密码输入框回车事件
        this.adminPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.login();
            }
        });

        // 保存更改按钮点击事件
        this.saveChangesBtn.addEventListener('click', () => {
            this.saveChanges();
        });

        // 放弃更改按钮点击事件
        this.discardChangesBtn.addEventListener('click', () => {
            this.discardChanges();
        });

        // 退出编辑按钮点击事件
        this.logoutBtn.addEventListener('click', () => {
            this.logout();
        });

        // 编辑提交按钮点击事件
        this.editSubmitBtn.addEventListener('click', () => {
            this.submitEdit();
        });

        // 编辑取消按钮点击事件
        this.editCancelBtn.addEventListener('click', () => {
            this.hideEditModal();
        });

        // 关闭模态框按钮点击事件
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // 点击模态框外部关闭模态框
        window.addEventListener('click', (e) => {
            if (e.target === this.adminModal) {
                this.hideLoginModal();
            } else if (e.target === this.editModal) {
                this.hideEditModal();
            }
        });
    }

    // 显示登录模态框
    showLoginModal() {
        this.adminModal.style.display = 'block';
        this.adminPasswordInput.value = '';
        this.loginErrorMsg.textContent = '';
        this.adminPasswordInput.focus();
    }

    // 隐藏登录模态框
    hideLoginModal() {
        this.adminModal.style.display = 'none';
    }

    // 显示编辑模态框
    showEditModal(element, content, type) {
        this.currentEditElement = element;
        this.editModal.style.display = 'block';
        
        // 根据内容类型生成不同的编辑表单
        let formHtml = '';
        
        if (type === 'text') {
            formHtml = `
                <div class="form-group">
                    <label for="edit-text">编辑文本</label>
                    <input type="text" id="edit-text" value="${content}">
                </div>
            `;
        } else if (type === 'textarea') {
            formHtml = `
                <div class="form-group">
                    <label for="edit-textarea">编辑内容</label>
                    <textarea id="edit-textarea" rows="5">${content}</textarea>
                </div>
            `;
        } else if (type === 'number') {
            formHtml = `
                <div class="form-group">
                    <label for="edit-number">编辑数值</label>
                    <input type="number" id="edit-number" value="${content}">
                </div>
            `;
        } else if (type === 'select') {
            // 这里可以根据需要添加选择框的选项
            formHtml = `
                <div class="form-group">
                    <label for="edit-select">选择选项</label>
                    <select id="edit-select">
                        <option value="监管者" ${content === '监管者' ? 'selected' : ''}>监管者</option>
                        <option value="求生者" ${content === '求生者' ? 'selected' : ''}>求生者</option>
                        <option value="教练" ${content === '教练' ? 'selected' : ''}>教练</option>
                    </select>
                </div>
            `;
        }
        
        this.editForm.innerHTML = formHtml;
    }

    // 隐藏编辑模态框
    hideEditModal() {
        this.editModal.style.display = 'none';
        this.currentEditElement = null;
    }

    // 隐藏所有模态框
    hideAllModals() {
        this.hideLoginModal();
        this.hideEditModal();
    }

    // 登录验证
    login() {
        const password = this.adminPasswordInput.value;
        
        if (password === this.adminPassword) {
            this.isLoggedIn = true;
            this.hideLoginModal();
            this.showAdminControls();
            this.enableEditing();
        } else {
            this.loginErrorMsg.textContent = '密码错误，请重试';
        }
    }

    // 显示管理员控制面板
    showAdminControls() {
        this.adminLoginBtn.classList.add('hidden');
        this.adminControls.classList.remove('hidden');
    }

    // 隐藏管理员控制面板
    hideAdminControls() {
        this.adminLoginBtn.classList.remove('hidden');
        this.adminControls.classList.add('hidden');
    }

    // 启用编辑模式
    enableEditing() {
        this.isEditing = true;
        document.body.classList.add('admin-mode');
        
        // 查找所有可编辑元素
        this.findEditableElements();
        
        // 为可编辑元素添加点击事件
        this.editableElements.forEach(element => {
            element.classList.add('editable');
            element.addEventListener('click', this.handleElementClick.bind(this));
        });
    }

    // 禁用编辑模式
    disableEditing() {
        this.isEditing = false;
        document.body.classList.remove('admin-mode');
        
        // 移除可编辑元素的点击事件和样式
        this.editableElements.forEach(element => {
            element.classList.remove('editable', 'editing');
            element.removeEventListener('click', this.handleElementClick.bind(this));
        });
        
        this.editableElements = [];
    }

    // 查找所有可编辑元素
    findEditableElements() {
        // 清空之前的可编辑元素列表
        this.editableElements = [];
        
        // 添加可编辑的文本元素
        const textElements = document.querySelectorAll('.team-name, .player-name, .player-team, .stat-name, .stat-value, .bracket-team-name, .bracket-team-score');
        textElements.forEach(element => {
            this.editableElements.push(element);
        });
        
        // 添加可编辑的表格单元格
        const tableCells = document.querySelectorAll('.team-table td');
        tableCells.forEach(element => {
            this.editableElements.push(element);
        });
    }

    // 处理可编辑元素的点击事件
    handleElementClick(event) {
        if (!this.isEditing) return;
        
        const element = event.currentTarget;
        const content = element.textContent.trim();
        
        // 根据元素类型确定编辑类型
        let type = 'text';
        
        if (element.classList.contains('stat-value')) {
            // 如果是数值统计，使用数字输入
            type = 'number';
        } else if (element.textContent.length > 50) {
            // 如果内容较长，使用文本区域
            type = 'textarea';
        } else if (element.classList.contains('team-table') && element.cellIndex === 2) {
            // 如果是角色列，使用选择框
            type = 'select';
        }
        
        // 显示编辑模态框
        this.showEditModal(element, content, type);
        
        // 阻止事件冒泡
        event.stopPropagation();
    }

    // 提交编辑内容
    submitEdit() {
        if (!this.currentEditElement) return;
        
        let newContent = '';
        
        // 根据编辑类型获取新内容
        if (this.editForm.querySelector('#edit-text')) {
            newContent = this.editForm.querySelector('#edit-text').value;
        } else if (this.editForm.querySelector('#edit-textarea')) {
            newContent = this.editForm.querySelector('#edit-textarea').value;
        } else if (this.editForm.querySelector('#edit-number')) {
            newContent = this.editForm.querySelector('#edit-number').value;
        } else if (this.editForm.querySelector('#edit-select')) {
            newContent = this.editForm.querySelector('#edit-select').value;
        }
        
        // 更新元素内容
        this.currentEditElement.textContent = newContent;
        
        // 如果是数据相关的元素，更新数据和图表
        this.updateDataFromElement(this.currentEditElement, newContent);
        
        // 隐藏编辑模态框
        this.hideEditModal();
    }

    // 根据编辑的元素更新数据
    updateDataFromElement(element, newContent) {
        // 这里需要根据实际情况实现数据更新逻辑
        // 例如，如果编辑的是选手名称，需要更新选手数据
        
        // 更新进度条
        if (element.classList.contains('stat-value')) {
            const statItem = element.closest('.stat-item');
            if (statItem) {
                const progressBar = statItem.querySelector('.progress-bar');
                if (progressBar) {
                    const progressId = progressBar.id;
                    // 根据统计类型确定最大值
                    let maxValue = 100;
                    if (element.previousElementSibling.textContent.includes('演绎分')) {
                        maxValue = 15000;
                    } else if (element.previousElementSibling.textContent.includes('破译速度')) {
                        maxValue = 200;
                    } else if (element.previousElementSibling.textContent.includes('控制时长')) {
                        maxValue = 100;
                    }
                    
                    chartManager.updateProgressBar(progressId, parseFloat(newContent), maxValue);
                }
            }
        }
        
        // 更新数据库
        // 这里需要根据实际情况实现数据库更新逻辑
    }

    // 保存所有更改
    saveChanges() {
        // 将更改保存到Firebase
        dataManager.saveToFirebase().then(success => {
            if (success) {
                alert('更改已保存');
            } else {
                alert('保存失败，请重试');
            }
        });
    }

    // 放弃所有更改
    discardChanges() {
        if (confirm('确定要放弃所有未保存的更改吗？')) {
            // 重新加载数据
            dataManager.loadFromFirebase().then(success => {
                if (success) {
                    // 重新渲染页面
                    renderTeams();
                    renderPlayers();
                    renderBrackets();
                    alert('已恢复到上次保存的状态');
                } else {
                    alert('恢复失败，请重试');
                }
            });
        }
    }

    // 退出编辑模式
    logout() {
        this.isLoggedIn = false;
        this.disableEditing();
        this.hideAdminControls();
    }
}

// 创建管理员管理器实例
const adminManager = new AdminManager();
