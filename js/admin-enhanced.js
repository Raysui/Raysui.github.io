// 管理员功能增强模块
const adminManager = {
    isAdmin: false,
    isEditing: false,
    editingElement: null,
    originalContent: null,
    
    // 初始化管理员功能
    init: function() {
        this.bindAdminEvents();
    },
    
    // 绑定管理员相关事件
    bindAdminEvents: function() {
        // 管理员登录按钮
        const loginBtn = document.getElementById('admin-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', this.showLoginModal.bind(this));
        }
        
        // 登录提交按钮
        const loginSubmit = document.getElementById('login-submit');
        if (loginSubmit) {
            loginSubmit.addEventListener('click', this.handleLogin.bind(this));
        }
        
        // 密码输入框回车事件
        const passwordInput = document.getElementById('admin-password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            }.bind(this));
        }
        
        // 关闭模态框按钮
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                document.getElementById('admin-modal').style.display = 'none';
            });
        });
        
        // 保存更改按钮
        const saveChangesBtn = document.getElementById('save-changes-btn');
        if (saveChangesBtn) {
            saveChangesBtn.addEventListener('click', this.saveChanges.bind(this));
        }
        
        // 放弃更改按钮
        const discardChangesBtn = document.getElementById('discard-changes-btn');
        if (discardChangesBtn) {
            discardChangesBtn.addEventListener('click', this.discardChanges.bind(this));
        }
        
        // 退出编辑按钮
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }
        
        // 点击页面其他地方关闭模态框
        window.addEventListener('click', function(e) {
            const adminModal = document.getElementById('admin-modal');
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
            }
        });
    },
    
    // 显示登录模态框
    showLoginModal: function() {
        const modal = document.getElementById('admin-modal');
        const passwordInput = document.getElementById('admin-password');
        
        modal.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
        
        document.getElementById('login-error').textContent = '';
    },
    
    // 处理登录
    handleLogin: function() {
        const password = document.getElementById('admin-password').value;
        
        // 检查密码是否正确
        if (password === 'admin') {
            this.isAdmin = true;
            document.getElementById('admin-modal').style.display = 'none';
            document.getElementById('admin-login-btn').style.display = 'none';
            document.getElementById('admin-controls').classList.remove('hidden');
            
            this.enableEditMode();
        } else {
            document.getElementById('login-error').textContent = '密码错误，请重试';
        }
    },
    
    // 启用编辑模式
    enableEditMode: function() {
        this.isEditing = true;
        
        // 添加编辑样式
        document.body.classList.add('admin-mode');
        
        // 标记所有可编辑元素
        const editableElements = document.querySelectorAll('.editable');
        editableElements.forEach(element => {
            element.classList.add('editable-active');
            element.contentEditable = true;
            
            // 保存原始内容
            element.dataset.originalContent = element.textContent;
            
            // 添加编辑事件
            element.addEventListener('focus', this.handleElementFocus.bind(this));
            element.addEventListener('blur', this.handleElementBlur.bind(this));
            element.addEventListener('keydown', this.handleElementKeydown.bind(this));
        });
        
        // 显示提示信息
        this.showNotification('已进入编辑模式，点击任意文本直接编辑，按Enter键保存');
    },
    
    // 禁用编辑模式
    disableEditMode: function() {
        this.isEditing = false;
        
        // 移除编辑样式
        document.body.classList.remove('admin-mode');
        
        // 移除可编辑元素的标记
        const editableElements = document.querySelectorAll('.editable-active');
        editableElements.forEach(element => {
            element.classList.remove('editable-active');
            element.contentEditable = false;
            
            // 移除编辑事件
            element.removeEventListener('focus', this.handleElementFocus);
            element.removeEventListener('blur', this.handleElementBlur);
            element.removeEventListener('keydown', this.handleElementKeydown);
        });
    },
    
    // 处理元素获取焦点
    handleElementFocus: function(e) {
        this.editingElement = e.target;
        this.originalContent = e.target.textContent;
    },
    
    // 处理元素失去焦点
    handleElementBlur: function(e) {
        if (this.editingElement === e.target) {
            const newContent = e.target.textContent;
            
            // 如果内容有变化，更新数据模型
            if (newContent !== this.originalContent) {
                this.updateDataFromElement(e.target, newContent);
            }
            
            this.editingElement = null;
            this.originalContent = null;
        }
    },
    
    // 处理元素键盘事件
    handleElementKeydown: function(e) {
        // 按Enter键保存并失去焦点
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.target.blur();
        }
        
        // 按Escape键取消编辑
        if (e.key === 'Escape') {
            e.preventDefault();
            e.target.textContent = this.originalContent;
            e.target.blur();
        }
    },
    
    // 从元素更新数据模型
    updateDataFromElement: function(element, newContent) {
        // 获取元素类型和相关ID
        const type = element.getAttribute('data-type');
        const teamId = element.getAttribute('data-team-id');
        const playerId = element.getAttribute('data-player-id');
        const memberId = element.getAttribute('data-member-id');
        const bracketId = element.getAttribute('data-bracket-id');
        const matchId = element.getAttribute('data-match-id');
        const roundIndex = element.getAttribute('data-round-index');
        const statId = element.getAttribute('data-stat-id');
        const index = element.getAttribute('data-index');
        
        // 根据类型更新数据模型
        this.updateDataModel(type, newContent, {
            teamId,
            playerId,
            memberId,
            bracketId,
            matchId,
            roundIndex,
            statId,
            index
        });
        
        // 更新角色头像（如果需要）
        if (type && type.includes('character')) {
            updateCharacterAvatars();
        }
        
        // 更新进度条（如果需要）
        if (type && type.includes('stat-value')) {
            this.updateProgressBars();
        }
        
        // 显示保存提示
        this.showNotification('内容已更新，请点击"保存更改"按钮保存到数据库');
    },
    
    // 更新数据模型
    updateDataModel: function(type, newContent, ids) {
        if (!type) return;
        
        // 根据类型更新不同的数据
        if (type === 'competition-title') {
            dataManager.competitionInfo.title = newContent;
        } else if (type === 'competition-subtitle') {
            dataManager.competitionInfo.subtitle = newContent;
        } else if (type === 'prize-pool-value') {
            dataManager.competitionInfo.prizePool = newContent;
        } else if (type === 'teams-value') {
            dataManager.competitionInfo.teams = newContent;
        } else if (type === 'location-value') {
            dataManager.competitionInfo.location = newContent;
        } else if (type === 'match-title') {
            dataManager.currentMatch.title = newContent;
        } else if (type === 'team1-name') {
            dataManager.currentMatch.team1.name = newContent;
        } else if (type === 'team2-name') {
            dataManager.currentMatch.team2.name = newContent;
        } else if (type === 'team1-score') {
            dataManager.currentMatch.team1.score = parseInt(newContent) || 0;
        } else if (type === 'team2-score') {
            dataManager.currentMatch.team2.score = parseInt(newContent) || 0;
        } else if (type === 'team1-header') {
            dataManager.currentMatch.team1.name = newContent;
        } else if (type === 'team2-header') {
            dataManager.currentMatch.team2.name = newContent;
        } else if (type.startsWith('team1-stat-name-')) {
            const index = parseInt(type.split('-').pop());
            if (dataManager.currentMatch.team1.stats[index]) {
                dataManager.currentMatch.team1.stats[index].name = newContent;
            }
        } else if (type.startsWith('team2-stat-name-')) {
            const index = parseInt(type.split('-').pop());
            if (dataManager.currentMatch.team2.stats[index]) {
                dataManager.currentMatch.team2.stats[index].name = newContent;
            }
        } else if (type.startsWith('team1-stat-value-')) {
            const index = parseInt(type.split('-').pop());
            if (dataManager.currentMatch.team1.stats[index]) {
                dataManager.currentMatch.team1.stats[index].value = newContent;
                // 更新百分比值
                const numValue = parseFloat(newContent.replace(/[^0-9.]/g, ''));
                if (!isNaN(numValue)) {
                    let percentage = numValue;
                    if (newContent.includes('/')) {
                        const parts = newContent.split('/');
                        if (parts.length === 2) {
                            const numerator = parseFloat(parts[0]);
                            const denominator = parseFloat(parts[1]);
                            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                                percentage = (numerator / denominator) * 100;
                            }
                        }
                    } else if (newContent.includes('%')) {
                        percentage = numValue;
                    } else {
                        // 根据统计类型设置合理的百分比
                        if (dataManager.currentMatch.team1.stats[index].name.includes('时间')) {
                            percentage = Math.min(numValue / 120 * 100, 100); // 假设120秒为满值
                        } else {
                            percentage = Math.min(numValue, 100);
                        }
                    }
                    dataManager.currentMatch.team1.stats[index].percentage = percentage;
                }
            }
        } else if (type.startsWith('team2-stat-value-')) {
            const index = parseInt(type.split('-').pop());
            if (dataManager.currentMatch.team2.stats[index]) {
                dataManager.currentMatch.team2.stats[index].value = newContent;
                // 更新百分比值
                const numValue = parseFloat(newContent.replace(/[^0-9.]/g, ''));
                if (!isNaN(numValue)) {
                    let percentage = numValue;
                    if (newContent.includes('/')) {
                        const parts = newContent.split('/');
                        if (parts.length === 2) {
                            const numerator = parseFloat(parts[0]);
                            const denominator = parseFloat(parts[1]);
                            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                                percentage = (numerator / denominator) * 100;
                            }
                        }
                    } else if (newContent.includes('%')) {
                        percentage = numValue;
                    } else {
                        // 根据统计类型设置合理的百分比
                        if (dataManager.currentMatch.team2.stats[index].name.includes('时间')) {
                            percentage = Math.min(numValue / 120 * 100, 100); // 假设120秒为满值
                        } else {
                            percentage = Math.min(numValue, 100);
                        }
                    }
                    dataManager.currentMatch.team2.stats[index].percentage = percentage;
                }
            }
        } else if (type.startsWith('team1-character-')) {
            const index = parseInt(type.split('-').pop());
            if (dataManager.currentMatch.team1.characters[index]) {
                dataManager.currentMatch.team1.characters[index].fullName = newContent;
                dataManager.currentMatch.team1.characters[index].firstChar = getFirstChar(newContent);
            }
        } else if (type.startsWith('team2-character-')) {
            const index = parseInt(type.split('-').pop());
            if (dataManager.currentMatch.team2.characters[index]) {
                dataManager.currentMatch.team2.characters[index].fullName = newContent;
                dataManager.currentMatch.team2.characters[index].firstChar = getFirstChar(newContent);
            }
        } else if (type === 'team-name' && ids.teamId) {
            const team = dataManager.getTeamById(ids.teamId);
            if (team) {
                team.name = newContent;
            }
        } else if (type === 'member-id' && ids.memberId) {
            // 更新队员ID需要更新所有引用
            // 这里简化处理，仅更新显示
        } else if (type === 'member-nickname' && ids.memberId) {
            // 查找并更新队员昵称
            dataManager.teams.forEach(team => {
                const member = team.members.find(m => m.id === ids.memberId);
                if (member) {
                    member.nickname = newContent;
                }
            });
        } else if (type === 'member-role' && ids.memberId) {
            // 查找并更新队员角色
            dataManager.teams.forEach(team => {
                const member = team.members.find(m => m.id === ids.memberId);
                if (member) {
                    member.role = newContent;
                }
            });
        } else if (type === 'player-name' && ids.playerId) {
            const player = dataManager.getPlayerById(ids.playerId);
            if (player) {
                player.name = newContent;
            }
        } else if (type === 'player-team' && ids.playerId) {
            const player = dataManager.getPlayerById(ids.playerId);
            if (player) {
                player.team = newContent;
            }
        } else if (type === 'player-role' && ids.playerId) {
            const player = dataManager.getPlayerById(ids.playerId);
            if (player) {
                player.role = newContent;
            }
        } else if (type === 'stat-name' && ids.playerId && ids.statId) {
            // 统计数据名称更新仅影响显示，不更新数据模型
        } else if (type === 'stat-value' && ids.playerId && ids.statId) {
            const player = dataManager.getPlayerById(ids.playerId);
            if (player) {
                const statKey = ids.statId.split('-')[0];
                if (statKey === 'score') {
                    player.stats.averageScore = parseInt(newContent) || 0;
                } else if (statKey === 'catch') {
                    player.stats.catchRate = parseInt(newContent) || 0;
                } else if (statKey === 'persons') {
                    player.stats.averagePersons = parseFloat(newContent) || 0;
                } else if (statKey === 'hit') {
                    player.stats.averageHitPersons = parseFloat(newContent) || 0;
                } else if (statKey === 'decode') {
                    player.stats.decodeSpeed = parseInt(newContent) || 0;
                } else if (statKey === 'control') {
                    player.stats.controlTime = parseFloat(newContent) || 0;
                } else if (statKey === 'rescue') {
                    player.stats.rescuePersons = parseFloat(newContent) || 0;
                }
            }
        } else if (type === 'bracket-title' && ids.bracketId) {
            const bracket = dataManager.getBracketById(ids.bracketId);
            if (bracket) {
                bracket.name = newContent;
            }
        } else if (type === 'round-title' && ids.bracketId && ids.roundIndex !== undefined) {
            const bracket = dataManager.getBracketById(ids.bracketId);
            if (bracket && bracket.rounds[ids.roundIndex]) {
                bracket.rounds[ids.roundIndex].name = newContent;
            }
        } else if (type === 'match-team1-name' && ids.matchId) {
            // 查找并更新比赛队伍1名称
            dataManager.brackets.forEach(bracket => {
                bracket.rounds.forEach(round => {
                    const match = round.matches.find(m => m.id === ids.matchId);
                    if (match) {
                        match.team1.name = newContent;
                    }
                });
            });
        } else if (type === 'match-team2-name' && ids.matchId) {
            // 查找并更新比赛队伍2名称
            dataManager.brackets.forEach(bracket => {
                bracket.rounds.forEach(round => {
                    const match = round.matches.find(m => m.id === ids.matchId);
                    if (match) {
                        match.team2.name = newContent;
                    }
                });
            });
        } else if (type === 'match-team1-score' && ids.matchId) {
            // 查找并更新比赛队伍1分数
            dataManager.brackets.forEach(bracket => {
                bracket.rounds.forEach(round => {
                    const match = round.matches.find(m => m.id === ids.matchId);
                    if (match) {
                        match.team1.score = parseInt(newContent) || null;
                    }
                });
            });
        } else if (type === 'match-team2-score' && ids.matchId) {
            // 查找并更新比赛队伍2分数
            dataManager.brackets.forEach(bracket => {
                bracket.rounds.forEach(round => {
                    const match = round.matches.find(m => m.id === ids.matchId);
                    if (match) {
                        match.team2.score = parseInt(newContent) || null;
                    }
                });
            });
        }
        
        // 标记数据已更改
        dataManager.markAsChanged();
    },
    
    // 更新进度条
    updateProgressBars: function() {
        // 更新当前比赛的进度条
        if (dataManager.currentMatch) {
            // 更新队伍1的进度条
            dataManager.currentMatch.team1.stats.forEach((stat, index) => {
                const progressBar = document.querySelector(`.team1-stat-progress-${index}`);
                if (progressBar) {
                    progressBar.style.width = `${stat.percentage || 0}%`;
                }
            });
            
            // 更新队伍2的进度条
            dataManager.currentMatch.team2.stats.forEach((stat, index) => {
                const progressBar = document.querySelector(`.team2-stat-progress-${index}`);
                if (progressBar) {
                    progressBar.style.width = `${stat.percentage || 0}%`;
                }
            });
        }
        
        // 更新选手数据的进度条
        dataManager.players.forEach(player => {
            const playerElement = document.querySelector(`[data-player-id="${player.id}"]`);
            if (playerElement) {
                const progressBars = playerElement.querySelectorAll('.progress-bar');
                progressBars.forEach(bar => {
                    const statType = bar.getAttribute('data-stat-type');
                    if (statType && player.stats) {
                        let percentage = 0;
                        
                        if (player.role === '监管者') {
                            if (statType === 'score') {
                                percentage = Math.min((player.stats.averageScore / 15000) * 100, 100);
                            } else if (statType === 'catch') {
                                percentage = Math.min(player.stats.catchRate, 100);
                            } else if (statType === 'persons') {
                                percentage = Math.min((player.stats.averagePersons / 4) * 100, 100);
                            } else if (statType === 'hit') {
                                percentage = Math.min((player.stats.averageHitPersons / 4) * 100, 100);
                            }
                        } else {
                            if (statType === 'score') {
                                percentage = Math.min((player.stats.averageScore / 10000) * 100, 100);
                            } else if (statType === 'decode') {
                                percentage = Math.min((player.stats.decodeSpeed / 200) * 100, 100);
                            } else if (statType === 'control') {
                                percentage = Math.min((player.stats.controlTime / 100) * 100, 100);
                            } else if (statType === 'rescue') {
                                percentage = Math.min((player.stats.rescuePersons / 2) * 100, 100);
                            }
                        }
                        
                        bar.style.width = `${percentage}%`;
                    }
                });
            }
        });
    },
    
    // 保存更改
    saveChanges: function() {
        // 显示保存指示器
        showSavingIndicator();
        
        // 保存数据到Firebase
        dataManager.saveToFirebase()
            .then(success => {
                // 隐藏保存指示器
                hideSavingIndicator();
                
                if (success) {
                    this.showNotification('所有更改已成功保存到数据库', 'success');
                } else {
                    this.showNotification('保存失败，请重试', 'error');
                }
            })
            .catch(error => {
                // 隐藏保存指示器
                hideSavingIndicator();
                
                console.error('保存数据时出错:', error);
                this.showNotification('保存失败: ' + error.message, 'error');
            });
    },
    
    // 放弃更改
    discardChanges: function() {
        // 重新加载数据
        dataManager.loadFromFirebase()
            .then(success => {
                if (success) {
                    // 重新渲染页面
                    renderPage();
                    
                    this.showNotification('已放弃所有未保存的更改', 'info');
                } else {
                    this.showNotification('加载数据失败，请刷新页面', 'error');
                }
            })
            .catch(error => {
                console.error('加载数据时出错:', error);
                this.showNotification('加载数据失败: ' + error.message, 'error');
            });
    },
    
    // 退出编辑模式
    logout: function() {
        // 如果有未保存的更改，提示用户
        if (dataManager.hasChanges) {
            if (!confirm('有未保存的更改，确定要退出吗？')) {
                return;
            }
        }
        
        this.disableEditMode();
        this.isAdmin = false;
        
        document.getElementById('admin-login-btn').style.display = 'block';
        document.getElementById('admin-controls').classList.add('hidden');
        
        this.showNotification('已退出编辑模式');
    },
    
    // 显示通知
    showNotification: function(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            
            // 移除元素
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// 获取角色名称的首个汉字
function getFirstChar(name) {
    if (!name) return '';
    return name.charAt(0);
}
