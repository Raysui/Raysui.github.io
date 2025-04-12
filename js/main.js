// 主要功能模块
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
});

// 初始化页面
async function initPage() {
    // 绑定导航事件
    bindNavEvents();
    
    // 从Firebase加载数据
    await dataManager.loadFromFirebase();
    
    // 渲染页面
    renderPage();
    
    // 初始化管理员功能
    adminManager.init();
}

// 绑定导航事件
function bindNavEvents() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标部分的ID
            const targetId = this.getAttribute('href').substring(1);
            
            // 激活当前链接
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // 显示目标部分
            const sections = document.querySelectorAll('main section');
            sections.forEach(section => {
                section.classList.remove('section-active');
                if (section.id === targetId) {
                    section.classList.add('section-active');
                }
            });
        });
    });
}

// 渲染页面
function renderPage() {
    renderCompetitionInfo();
    renderCurrentMatch();
    renderTeams();
    renderPlayers();
    renderBrackets();
    updateCharacterAvatars();
}

// 渲染比赛信息
function renderCompetitionInfo() {
    const container = document.getElementById('competition-info');
    if (!container) return;
    
    const info = dataManager.getCompetitionInfo();
    if (!info) {
        container.innerHTML = '<div class="info-error">加载比赛信息失败</div>';
        return;
    }
    
    let html = `
        <div class="info-header">
            <h1 class="editable" data-type="competition-title">${info.title}</h1>
            <h2 class="editable" data-type="competition-subtitle">${info.subtitle}</h2>
        </div>
        <div class="info-content">
            <div class="info-item">
                <h3>奖金池 Prize Pool</h3>
                <p class="editable" data-type="prize-pool-value">${info.prizePool}</p>
            </div>
            <div class="info-item">
                <h3>参赛队伍 Teams</h3>
                <p class="editable" data-type="teams-value">${info.teams}</p>
            </div>
            <div class="info-item">
                <h3>比赛地点 Location</h3>
                <p class="editable" data-type="location-value">${info.location}</p>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// 渲染当前比赛
function renderCurrentMatch() {
    const container = document.getElementById('current-match-container');
    if (!container) return;
    
    const match = dataManager.getCurrentMatch();
    if (!match) {
        container.innerHTML = '<div class="match-error">加载当前比赛信息失败</div>';
        return;
    }
    
    let html = `
        <div class="match-header">
            <h3 class="editable" data-type="match-title">${match.title}</h3>
        </div>
        <div class="match-content">
            <div class="match-teams">
                <div class="team team1">
                    <h3 class="editable" data-type="team1-name">${match.team1.name}</h3>
                </div>
                <div class="match-score">
                    <span class="score team1-score editable" data-type="team1-score">${match.team1.score}</span>
                    <span class="vs">VS</span>
                    <span class="score team2-score editable" data-type="team2-score">${match.team2.score}</span>
                </div>
                <div class="team team2">
                    <h3 class="editable" data-type="team2-name">${match.team2.name}</h3>
                </div>
            </div>
            
            <div class="match-details">
                <div class="team-details team1-details">
                    <h4 class="editable" data-type="team1-header">${match.team1.name}</h4>
                    <div class="team-stats">
                        ${match.team1.stats.map((stat, index) => `
                            <div class="stat-item">
                                <div class="stat-name editable" data-type="team1-stat-name-${index}">${stat.name}</div>
                                <div class="stat-value editable" data-type="team1-stat-value-${index}">${stat.value}</div>
                                <div class="progress-bar">
                                    <div class="progress-fill team1-stat-progress-${index}" style="width: ${stat.percentage || 0}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="team-characters">
                        ${match.team1.characters.map((character, index) => `
                            <div class="character">
                                <div class="character-avatar ${character.role === '监管者' ? 'hunter-avatar' : 'survivor-avatar'}" data-first-char="${character.firstChar}" data-role="${character.role}">
                                    <span>${character.firstChar}</span>
                                </div>
                                <div class="character-name editable" data-type="team1-character-${index}">${character.fullName}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="team-details team2-details">
                    <h4 class="editable" data-type="team2-header">${match.team2.name}</h4>
                    <div class="team-stats">
                        ${match.team2.stats.map((stat, index) => `
                            <div class="stat-item">
                                <div class="stat-name editable" data-type="team2-stat-name-${index}">${stat.name}</div>
                                <div class="stat-value editable" data-type="team2-stat-value-${index}">${stat.value}</div>
                                <div class="progress-bar">
                                    <div class="progress-fill team2-stat-progress-${index}" style="width: ${stat.percentage || 0}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="team-characters">
                        ${match.team2.characters.map((character, index) => `
                            <div class="character">
                                <div class="character-avatar ${character.role === '监管者' ? 'hunter-avatar' : 'survivor-avatar'}" data-first-char="${character.firstChar}" data-role="${character.role}">
                                    <span>${character.firstChar}</span>
                                </div>
                                <div class="character-name editable" data-type="team2-character-${index}">${character.fullName}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// 渲染战队信息
function renderTeams() {
    const container = document.getElementById('team-container');
    if (!container) return;
    
    const teams = dataManager.getTeams();
    if (!teams || teams.length === 0) {
        container.innerHTML = '<div class="team-error">加载战队信息失败</div>';
        return;
    }
    
    let html = '<div class="teams-grid">';
    
    teams.forEach(team => {
        html += `
            <div class="team-card" data-team-id="${team.id}">
                <div class="team-header">
                    <h3 class="editable" data-type="team-name" data-team-id="${team.id}">${team.name}</h3>
                </div>
                <div class="team-members">
                    <table class="members-table">
                        <thead>
                            <tr>
                                <th>选手</th>
                                <th>昵称</th>
                                <th>阵营</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${team.members.map(member => `
                                <tr data-member-id="${member.id}">
                                    <td class="editable" data-type="member-id" data-member-id="${member.id}">${member.id}</td>
                                    <td class="editable" data-type="member-nickname" data-member-id="${member.id}">${member.nickname}</td>
                                    <td class="editable" data-type="member-role" data-member-id="${member.id}">${member.role}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// 渲染选手数据
function renderPlayers() {
    const container = document.getElementById('player-container');
    if (!container) return;
    
    const players = dataManager.getPlayers();
    if (!players || players.length === 0) {
        container.innerHTML = '<div class="player-error">加载选手数据失败</div>';
        return;
    }
    
    let html = '<div class="players-grid">';
    
    players.forEach(player => {
        const isHunter = player.role === '监管者';
        
        html += `
            <div class="player-card" data-player-id="${player.id}">
                <div class="player-header ${isHunter ? 'hunter' : 'survivor'}">
                    <h3 class="editable" data-type="player-name" data-player-id="${player.id}">${player.name}</h3>
                    <div class="player-info">
                        <span class="editable" data-type="player-team" data-player-id="${player.id}">${player.team}</span>
                        <span class="editable" data-type="player-role" data-player-id="${player.id}">${player.role}</span>
                    </div>
                </div>
                <div class="player-stats">
                    ${isHunter ? `
                        <div class="stat-row">
                            <div class="stat-label editable" data-type="stat-name" data-player-id="${player.id}" data-stat-id="score-label">局均演绎分</div>
                            <div class="stat-value editable" data-type="stat-value" data-player-id="${player.id}" data-stat-id="score-value">${player.stats.averageScore}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-stat-type="score" style="width: ${Math.min((player.stats.averageScore / 15000) * 100, 100)}%"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label editable" data-type="stat-name" data-player-id="${player.id}" data-stat-id="catch-label">四抓率</div>
                            <div class="stat-value editable" data-type="stat-value" data-player-id="${player.id}" data-stat-id="catch-value">${player.stats.catchRate}%</div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-stat-type="catch" style="width: ${Math.min(player.stats.catchRate, 100)}%"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label editable" data-type="stat-name" data-player-id="${player.id}" data-stat-id="persons-label">局均法人数</div>
                            <div class="stat-value editable" data-type="stat-value" data-player-id="${player.id}" data-stat-id="persons-value">${player.stats.averagePersons}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-stat-type="persons" style="width: ${Math.min((player.stats.averagePersons / 4) * 100, 100)}%"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label editable" data-type="stat-name" data-player-id="${player.id}" data-stat-id="hit-label">局均击倒人数</div>
                            <div class="stat-value editable" data-type="stat-value" data-player-id="${player.id}" data-stat-id="hit-value">${player.stats.averageHitPersons}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-stat-type="hit" style="width: ${Math.min((player.stats.averageHitPersons / 4) * 100, 100)}%"></div>
                            </div>
                        </div>
                    ` : `
                        <div class="stat-row">
                            <div class="stat-label editable" data-type="stat-name" data-player-id="${player.id}" data-stat-id="score-label">局均演绎分</div>
                            <div class="stat-value editable" data-type="stat-value" data-player-id="${player.id}" data-stat-id="score-value">${player.stats.averageScore}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-stat-type="score" style="width: ${Math.min((player.stats.averageScore / 10000) * 100, 100)}%"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label editable" data-type="stat-name" data-player-id="${player.id}" data-stat-id="decode-label">破译速度</div>
                            <div class="stat-value editable" data-type="stat-value" data-player-id="${player.id}" data-stat-id="decode-value">${player.stats.decodeSpeed}%</div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-stat-type="decode" style="width: ${Math.min((player.stats.decodeSpeed / 200) * 100, 100)}%"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label editable" data-type="stat-name" data-player-id="${player.id}" data-stat-id="control-label">控制时长</div>
                            <div class="stat-value editable" data-type="stat-value" data-player-id="${player.id}" data-stat-id="control-value">${player.stats.controlTime}s</div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-stat-type="control" style="width: ${Math.min((player.stats.controlTime / 100) * 100, 100)}%"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label editable" data-type="stat-name" data-player-id="${player.id}" data-stat-id="rescue-label">救人数</div>
                            <div class="stat-value editable" data-type="stat-value" data-player-id="${player.id}" data-stat-id="rescue-value">${player.stats.rescuePersons}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-stat-type="rescue" style="width: ${Math.min((player.stats.rescuePersons / 2) * 100, 100)}%"></div>
                            </div>
                        </div>
                    `}
                </div>
                <div class="player-chart">
                    <canvas id="player-chart-${player.id}"></canvas>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // 创建雷达图
    players.forEach(player => {
        chartManager.createPlayerRadarChart(`player-chart-${player.id}`, player);
    });
}

// 渲染对阵图
function renderBrackets() {
    const container = document.getElementById('bracket-container');
    if (!container) return;
    
    const brackets = dataManager.getBrackets();
    if (!brackets || brackets.length === 0) {
        container.innerHTML = '<div class="bracket-error">加载对阵图失败</div>';
        return;
    }
    
    let html = '';
    
    brackets.forEach(bracket => {
        html += `
            <div class="bracket" data-bracket-id="${bracket.id}">
                <h3 class="bracket-title editable" data-type="bracket-title" data-bracket-id="${bracket.id}">${bracket.name}</h3>
                <div class="bracket-rounds">
                    ${bracket.rounds.map((round, roundIndex) => `
                        <div class="round">
                            <h4 class="round-title editable" data-type="round-title" data-bracket-id="${bracket.id}" data-round-index="${roundIndex}">${round.name}</h4>
                            <div class="matches">
                                ${round.matches.map(match => `
                                    <div class="match" data-match-id="${match.id}">
                                        <div class="match-team team1 ${match.team1.score > match.team2.score ? 'winner' : ''}">
                                            <span class="team-name editable" data-type="match-team1-name" data-match-id="${match.id}">${match.team1.name || '待定'}</span>
                                            <span class="team-score editable" data-type="match-team1-score" data-match-id="${match.id}">${match.team1.score !== null ? match.team1.score : '-'}</span>
                                        </div>
                                        <div class="match-team team2 ${match.team2.score > match.team1.score ? 'winner' : ''}">
                                            <span class="team-name editable" data-type="match-team2-name" data-match-id="${match.id}">${match.team2.name || '待定'}</span>
                                            <span class="team-score editable" data-type="match-team2-score" data-match-id="${match.id}">${match.team2.score !== null ? match.team2.score : '-'}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 更新角色头像
function updateCharacterAvatars() {
    const avatars = document.querySelectorAll('.character-avatar');
    
    avatars.forEach(avatar => {
        const firstChar = avatar.getAttribute('data-first-char');
        const role = avatar.getAttribute('data-role');
        
        if (!firstChar) return;
        
        // 根据角色类型设置不同的CSS类
        if (role === '监管者') {
            avatar.classList.add('hunter-avatar');
            avatar.classList.remove('survivor-avatar');
        } else {
            avatar.classList.add('survivor-avatar');
            avatar.classList.remove('hunter-avatar');
        }
        
        // 确保头像中的文字是角色名称的首个汉字
        const spanElement = avatar.querySelector('span');
        if (spanElement) {
            spanElement.textContent = firstChar;
        }
    });
}
