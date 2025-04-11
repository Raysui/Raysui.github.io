// 数据管理模块
class DataManager {
    constructor() {
        this.teams = [];
        this.players = [];
        this.brackets = [];
        this.currentMatch = null;
        this.competitionInfo = null;
        this.isInitialized = false;
        this.hasChanges = false;
    }

    // 从Firebase加载数据
    async loadFromFirebase() {
        try {
            console.log("开始从Firebase加载数据...");
            
            // 加载比赛信息数据（优先加载）
            const competitionInfoSnapshot = await db.collection('competitionInfo').doc('info').get();
            if (competitionInfoSnapshot.exists) {
                console.log("成功加载比赛信息数据");
                this.competitionInfo = competitionInfoSnapshot.data();
            } else {
                console.log("比赛信息数据不存在，使用默认数据");
                this.competitionInfo = this.getDefaultCompetitionInfo();
                // 保存默认数据到Firebase
                await db.collection('competitionInfo').doc('info').set(this.competitionInfo);
            }

            // 加载当前比赛数据
            const currentMatchSnapshot = await db.collection('currentMatch').doc('current').get();
            if (currentMatchSnapshot.exists) {
                console.log("成功加载当前比赛数据");
                this.currentMatch = currentMatchSnapshot.data();
            } else {
                console.log("当前比赛数据不存在，使用默认数据");
                this.currentMatch = this.getDefaultCurrentMatch();
                // 保存默认数据到Firebase
                await db.collection('currentMatch').doc('current').set(this.currentMatch);
            }

            // 加载战队数据
            const teamsSnapshot = await db.collection('teams').get();
            if (!teamsSnapshot.empty) {
                console.log(`成功加载${teamsSnapshot.docs.length}个战队数据`);
                this.teams = teamsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                console.log("战队数据不存在，使用默认数据");
                // 如果Firebase中没有数据，则加载默认数据
                this.loadDefaultTeams();
                // 将默认数据保存到Firebase
                const batch = db.batch();
                this.teams.forEach(team => {
                    const docRef = db.collection('teams').doc(team.id);
                    batch.set(docRef, team);
                });
                await batch.commit();
            }

            // 加载选手数据
            const playersSnapshot = await db.collection('players').get();
            if (!playersSnapshot.empty) {
                console.log(`成功加载${playersSnapshot.docs.length}个选手数据`);
                this.players = playersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                console.log("选手数据不存在，使用默认数据");
                this.loadDefaultPlayers();
                // 将默认数据保存到Firebase（分批处理以避免超出限制）
                const batchSize = 500; // Firestore批处理限制
                for (let i = 0; i < this.players.length; i += batchSize) {
                    const batch = db.batch();
                    const chunk = this.players.slice(i, i + batchSize);
                    chunk.forEach(player => {
                        const docRef = db.collection('players').doc(player.id);
                        batch.set(docRef, player);
                    });
                    await batch.commit();
                }
            }

            // 加载对阵图数据
            const bracketsSnapshot = await db.collection('brackets').get();
            if (!bracketsSnapshot.empty) {
                console.log(`成功加载${bracketsSnapshot.docs.length}个对阵图数据`);
                this.brackets = bracketsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                console.log("对阵图数据不存在，使用默认数据");
                this.loadDefaultBrackets();
                // 将默认数据保存到Firebase
                const batch = db.batch();
                this.brackets.forEach(bracket => {
                    const docRef = db.collection('brackets').doc(bracket.id);
                    batch.set(docRef, bracket);
                });
                await batch.commit();
            }

            this.isInitialized = true;
            this.hasChanges = false;
            console.log("所有数据加载完成");
            return true;
        } catch (error) {
            console.error("从Firebase加载数据失败:", error);
            // 加载失败时使用默认数据
            this.loadDefaultData();
            return false;
        }
    }

    // 保存数据到Firebase（优化版）
    async saveToFirebase() {
        if (!this.hasChanges) {
            console.log("没有变更，无需保存");
            return true;
        }
        
        try {
            console.log("开始保存数据到Firebase...");
            
            // 使用批量写入减少请求次数
            // 保存比赛信息和当前比赛数据（这两个是单文档，可以直接保存）
            await Promise.all([
                db.collection('competitionInfo').doc('info').set(this.competitionInfo),
                db.collection('currentMatch').doc('current').set(this.currentMatch)
            ]);
            console.log("比赛信息和当前比赛数据保存成功");
            
            // 批量保存战队数据
            const teamBatch = db.batch();
            this.teams.forEach(team => {
                const docRef = db.collection('teams').doc(team.id);
                teamBatch.set(docRef, team);
            });
            await teamBatch.commit();
            console.log("战队数据保存成功");
            
            // 批量保存对阵图数据
            const bracketBatch = db.batch();
            this.brackets.forEach(bracket => {
                const docRef = db.collection('brackets').doc(bracket.id);
                bracketBatch.set(docRef, bracket);
            });
            await bracketBatch.commit();
            console.log("对阵图数据保存成功");
            
            // 选手数据可能较多，分批处理
            const batchSize = 500; // Firestore批处理限制
            for (let i = 0; i < this.players.length; i += batchSize) {
                const playerBatch = db.batch();
                const chunk = this.players.slice(i, i + batchSize);
                chunk.forEach(player => {
                    const docRef = db.collection('players').doc(player.id);
                    playerBatch.set(docRef, player);
                });
                await playerBatch.commit();
            }
            console.log("选手数据保存成功");
            
            this.hasChanges = false;
            console.log("所有数据保存完成");
            return true;
        } catch (error) {
            console.error("保存数据到Firebase失败:", error);
            return false;
        }
    }

    // 标记数据已更改
    markAsChanged() {
        this.hasChanges = true;
    }

    // 加载默认数据
    loadDefaultData() {
        this.loadDefaultTeams();
        this.loadDefaultPlayers();
        this.loadDefaultBrackets();
        this.currentMatch = this.getDefaultCurrentMatch();
        this.competitionInfo = this.getDefaultCompetitionInfo();
        this.isInitialized = true;
        this.hasChanges = true;
    }

    // 加载默认战队数据
    loadDefaultTeams() {
        // 默认战队数据
        this.teams = [
            {
                id: "itzy",
                name: "ITZY",
                logo: "itzy-logo.png",
                members: [
                    { id: "ITZY_BaiLu", nickname: "白露", role: "监管者" },
                    { id: "ITZY_Fox", nickname: "Fox", role: "求生者" },
                    { id: "ITZY_zyan", nickname: "zyan", role: "求生者" },
                    { id: "ITZY_Clover", nickname: "Clover", role: "求生者" },
                    { id: "ITZY_Dahai", nickname: "Dahai", role: "求生者" },
                    { id: "ITZY_Member6", nickname: "队员6", role: "求生者" },
                    { id: "ITZY_Member7", nickname: "队员7", role: "教练" }
                ]
            },
            {
                id: "mrc",
                name: "MRC",
                logo: "mrc-logo.png",
                members: [
                    { id: "MRC_XiaoD", nickname: "小迪", role: "求生者" },
                    { id: "MRC_Nanako", nickname: "奈奈", role: "求生者" },
                    { id: "MRC_HuaC", nickname: "花辞", role: "求生者" },
                    { id: "MRC_Loveleft", nickname: "余情", role: "求生者" },
                    { id: "MRC_XC", nickname: "小程", role: "监管者" },
                    { id: "MRC_ALi", nickname: "阿乐", role: "监管者" },
                    { id: "MRC_HengH", nickname: "哼哼", role: "教练" }
                ]
            },
            {
                id: "team3",
                name: "战队3",
                logo: "default-team-logo.png",
                members: [
                    { id: "Team3_Member1", nickname: "队员1", role: "监管者" },
                    { id: "Team3_Member2", nickname: "队员2", role: "求生者" },
                    { id: "Team3_Member3", nickname: "队员3", role: "求生者" },
                    { id: "Team3_Member4", nickname: "队员4", role: "求生者" },
                    { id: "Team3_Member5", nickname: "队员5", role: "求生者" },
                    { id: "Team3_Member6", nickname: "队员6", role: "监管者" },
                    { id: "Team3_Member7", nickname: "队员7", role: "教练" }
                ]
            },
            {
                id: "team4",
                name: "战队4",
                logo: "default-team-logo.png",
                members: [
                    { id: "Team4_Member1", nickname: "队员1", role: "监管者" },
                    { id: "Team4_Member2", nickname: "队员2", role: "求生者" },
                    { id: "Team4_Member3", nickname: "队员3", role: "求生者" },
                    { id: "Team4_Member4", nickname: "队员4", role: "求生者" },
                    { id: "Team4_Member5", nickname: "队员5", role: "求生者" },
                    { id: "Team4_Member6", nickname: "队员6", role: "监管者" },
                    { id: "Team4_Member7", nickname: "队员7", role: "教练" }
                ]
            },
            {
                id: "team5",
                name: "战队5",
                logo: "default-team-logo.png",
                members: [
                    { id: "Team5_Member1", nickname: "队员1", role: "监管者" },
                    { id: "Team5_Member2", nickname: "队员2", role: "求生者" },
                    { id: "Team5_Member3", nickname: "队员3", role: "求生者" },
                    { id: "Team5_Member4", nickname: "队员4", role: "求生者" },
                    { id: "Team5_Member5", nickname: "队员5", role: "求生者" },
                    { id: "Team5_Member6", nickname: "队员6", role: "监管者" },
                    { id: "Team5_Member7", nickname: "队员7", role: "教练" }
                ]
            },
            {
                id: "team6",
                name: "战队6",
                logo: "default-team-logo.png",
                members: [
                    { id: "Team6_Member1", nickname: "队员1", role: "监管者" },
                    { id: "Team6_Member2", nickname: "队员2", role: "求生者" },
                    { id: "Team6_Member3", nickname: "队员3", role: "求生者" },
                    { id: "Team6_Member4", nickname: "队员4", role: "求生者" },
                    { id: "Team6_Member5", nickname: "队员5", role: "求生者" },
                    { id: "Team6_Member6", nickname: "队员6", role: "监管者" },
                    { id: "Team6_Member7", nickname: "队员7", role: "教练" }
                ]
            },
            {
                id: "team7",
                name: "战队7",
                logo: "default-team-logo.png",
                members: [
                    { id: "Team7_Member1", nickname: "队员1", role: "监管者" },
                    { id: "Team7_Member2", nickname: "队员2", role: "求生者" },
                    { id: "Team7_Member3", nickname: "队员3", role: "求生者" },
                    { id: "Team7_Member4", nickname: "队员4", role: "求生者" },
                    { id: "Team7_Member5", nickname: "队员5", role: "求生者" },
                    { id: "Team7_Member6", nickname: "队员6", role: "监管者" },
                    { id: "Team7_Member7", nickname: "队员7", role: "教练" }
                ]
            },
            {
                id: "team8",
                name: "战队8",
                logo: "default-team-logo.png",
                members: [
                    { id: "Team8_Member1", nickname: "队员1", role: "监管者" },
                    { id: "Team8_Member2", nickname: "队员2", role: "求生者" },
                    { id: "Team8_Member3", nickname: "队员3", role: "求生者" },
                    { id: "Team8_Member4", nickname: "队员4", role: "求生者" },
                    { id: "Team8_Member5", nickname: "队员5", role: "求生者" },
                    { id: "Team8_Member6", nickname: "队员6", role: "监管者" },
                    { id: "Team8_Member7", nickname: "队员7", role: "教练" }
                ]
            },
            {
                id: "team9",
                name: "战队9",
                logo: "default-team-logo.png",
                members: [
                    { id: "Team9_Member1", nickname: "队员1", role: "监管者" },
                    { id: "Team9_Member2", nickname: "队员2", role: "求生者" },
                    { id: "Team9_Member3", nickname: "队员3", role: "求生者" },
                    { id: "Team9_Member4", nickname: "队员4", role: "求生者" },
                    { id: "Team9_Member5", nickname: "队员5", role: "求生者" },
                    { id: "Team9_Member6", nickname: "队员6", role: "监管者" },
                    { id: "Team9_Member7", nickname: "队员7", role: "教练" }
                ]
            },
            {
                id: "team10",
                name: "战队10",
                logo: "default-team-logo.png",
                members: [
                    { id: "Team10_Member1", nickname: "队员1", role: "监管者" },
                    { id: "Team10_Member2", nickname: "队员2", role: "求生者" },
                    { id: "Team10_Member3", nickname: "队员3", role: "求生者" },
                    { id: "Team10_Member4", nickname: "队员4", role: "求生者" },
                    { id: "Team10_Member5", nickname: "队员5", role: "求生者" },
                    { id: "Team10_Member6", nickname: "队员6", role: "监管者" },
                    { id: "Team10_Member7", nickname: "队员7", role: "教练" }
                ]
            }
        ];
    }

    // 加载默认选手数据
    loadDefaultPlayers() {
        // 默认选手数据
        this.players = [
            {
                id: "ITZY_BaiLu",
                name: "白露",
                team: "ITZY",
                role: "监管者",
                avatar: "bailu.jpg",
                stats: {
                    averageScore: 11460,
                    rank: 3,
                    catchRate: 36,
                    averagePersons: 2.86,
                    averageChairTime: 8.57,
                    averageHitPersons: 2.0
                }
            },
            {
                id: "ITZY_Fox",
                name: "Fox",
                team: "ITZY",
                role: "求生者",
                avatar: "fox.jpg",
                stats: {
                    averageScore: 7033,
                    decodeSpeed: 92,
                    controlTime: 75.2,
                    rescuePersons: 0.86
                }
            },
            {
                id: "ITZY_zyan",
                name: "zyan",
                team: "ITZY",
                role: "求生者",
                avatar: "zyan.jpg",
                stats: {
                    averageScore: 7075,
                    decodeSpeed: 157,
                    controlTime: 60.1,
                    rescuePersons: 1.14
                }
            },
            {
                id: "ITZY_Clover",
                name: "Clover",
                team: "ITZY",
                role: "求生者",
                avatar: "clover.jpg",
                stats: {
                    averageScore: 6927,
                    decodeSpeed: 148,
                    controlTime: 57.9,
                    rescuePersons: 0.79
                }
            },
            {
                id: "ITZY_Dahai",
                name: "Dahai",
                team: "ITZY",
                role: "求生者",
                avatar: "dahai.jpg",
                stats: {
                    averageScore: 7767,
                    decodeSpeed: 166,
                    controlTime: 57.4,
                    rescuePersons: 0.64
                }
            }
        ];

        // 添加更多选手数据模板
        for (let i = 1; i <= 56; i++) {
            const teamPrefix = i <= 5 ? "ITZY" : 
                              i <= 12 ? "MRC" : 
                              i <= 19 ? "Team3" : 
                              i <= 26 ? "Team4" : 
                              i <= 33 ? "Team5" : 
                              i <= 40 ? "Team6" : 
                              i <= 47 ? "Team7" : 
                              i <= 54 ? "Team8" : 
                              "Team9";
            
            const teamName = teamPrefix === "ITZY" ? "ITZY" : 
                            teamPrefix === "MRC" ? "MRC" : 
                            teamPrefix === "Team3" ? "战队3" : 
                            teamPrefix === "Team4" ? "战队4" : 
                            teamPrefix === "Team5" ? "战队5" : 
                            teamPrefix === "Team6" ? "战队6" : 
                            teamPrefix === "Team7" ? "战队7" : 
                            teamPrefix === "Team8" ? "战队8" : 
                            "战队9";
            
            // 跳过已经添加的ITZY选手
            if (teamPrefix === "ITZY" && i <= 5) continue;
            
            const role = i % 4 === 0 ? "监管者" : "求生者";
            const playerId = `${teamPrefix}_Player${i}`;
            
            const playerData = {
                id: playerId,
                name: `选手${i}`,
                team: teamName,
                role: role,
                avatar: "default-avatar.png",
                stats: role === "监管者" ? {
                    averageScore: 8000 + Math.floor(Math.random() * 4000),
                    rank: Math.floor(Math.random() * 10) + 1,
                    catchRate: Math.floor(Math.random() * 50) + 20,
                    averagePersons: (Math.random() * 3 + 1).toFixed(2),
                    averageChairTime: (Math.random() * 10 + 5).toFixed(2),
                    averageHitPersons: (Math.random() * 3 + 1).toFixed(1)
                } : {
                    averageScore: 5000 + Math.floor(Math.random() * 3000),
                    decodeSpeed: Math.floor(Math.random() * 100) + 80,
                    controlTime: (Math.random() * 60 + 30).toFixed(1),
                    rescuePersons: (Math.random() * 1.5 + 0.5).toFixed(2)
                }
            };
            
            this.players.push(playerData);
        }
    }

    // 加载默认对阵图数据
    loadDefaultBrackets() {
        // 默认对阵图数据
        this.brackets = [
            {
                id: "mainland_a",
                name: "大陆赛区A组",
                rounds: [
                    {
                        name: "第一轮",
                        matches: [
                            {
                                id: "match1",
                                team1: { name: "ITZY", score: null },
                                team2: { name: "FPX.ZQ", score: null }
                            },
                            {
                                id: "match2",
                                team1: { name: "DOUS", score: null },
                                team2: { name: "LYMN", score: null }
                            },
                            {
                                id: "match3",
                                team1: { name: "Free", score: null },
                                team2: { name: "Meow", score: null }
                            },
                            {
                                id: "match4",
                                team1: { name: "Tul", score: null },
                                team2: { name: "WBG", score: null }
                            }
                        ]
                    },
                    {
                        name: "半决赛第一轮",
                        matches: [
                            {
                                id: "match5",
                                team1: { name: "ITZY", score: null },
                                team2: { name: "DOUS", score: null }
                            },
                            {
                                id: "match6",
                                team1: { name: "Meow", score: null },
                                team2: { name: "WBG", score: null }
                            }
                        ]
                    },
                    {
                        name: "胜者组决赛",
                        matches: [
                            {
                                id: "match7",
                                team1: { name: "DOUS", score: null },
                                team2: { name: "Meow", score: null }
                            }
                        ]
                    },
                    {
                        name: "冠军",
                        matches: [
                            {
                                id: "match8",
                                team1: { name: "DOUS", score: null },
                                team2: { name: null, score: null }
                            }
                        ]
                    }
                ]
            }
        ];
    }

    // 获取默认当前比赛数据
    getDefaultCurrentMatch() {
        return {
            title: "半决赛 - 灵梦战队 vs 幻象战队",
            team1: {
                name: "灵梦战队",
                score: 2,
                stats: [
                    { name: "密码机解码", value: "4/5", percentage: 80 },
                    { name: "救援成功率", value: "67%", percentage: 67 },
                    { name: "平均牵制时间", value: "98秒", percentage: 75 }
                ],
                characters: [
                    { name: "前锋", firstChar: "前", fullName: "前锋" },
                    { name: "医生", firstChar: "医", fullName: "医生" },
                    { name: "机械师", firstChar: "机", fullName: "机械师" },
                    { name: "佣兵", firstChar: "佣", fullName: "佣兵" }
                ]
            },
            team2: {
                name: "幻象战队",
                score: 1,
                stats: [
                    { name: "击倒次数", value: "10", percentage: 90 },
                    { name: "破坏板子数", value: "15", percentage: 85 },
                    { name: "首抓击倒用时", value: "60秒", percentage: 70 }
                ],
                characters: [
                    { name: "红蝶", firstChar: "红", fullName: "红蝶" }
                ]
            }
        };
    }

    // 获取默认比赛信息数据
    getDefaultCompetitionInfo() {
        return {
            title: "东华杯",
            subtitle: "第五人格电竞赛事",
            prizePool: "¥10,000",
            teams: "8支战队",
            location: "东莞市东华中学"
        };
    }

    // 获取所有战队
    getTeams() {
        return this.teams;
    }

    // 获取所有选手
    getPlayers() {
        return this.players;
    }

    // 获取所有对阵图
    getBrackets() {
        return this.brackets;
    }

    // 获取当前比赛数据
    getCurrentMatch() {
        return this.currentMatch;
    }

    // 获取比赛信息数据
    getCompetitionInfo() {
        return this.competitionInfo;
    }

    // 根据ID获取战队
    getTeamById(teamId) {
        return this.teams.find(team => team.id === teamId);
    }

    // 根据ID获取选手
    getPlayerById(playerId) {
        return this.players.find(player => player.id === playerId);
    }

    // 根据ID获取对阵图
    getBracketById(bracketId) {
        return this.brackets.find(bracket => bracket.id === bracketId);
    }

    // 更新战队信息
    updateTeam(teamId, updatedData) {
        const index = this.teams.findIndex(team => team.id === teamId);
        if (index !== -1) {
            this.teams[index] = { ...this.teams[index], ...updatedData };
            this.markAsChanged();
            return true;
        }
        return false;
    }

    // 更新选手信息
    updatePlayer(playerId, updatedData) {
        const index = this.players.findIndex(player => player.id === playerId);
        if (index !== -1) {
            this.players[index] = { ...this.players[index], ...updatedData };
            this.markAsChanged();
            return true;
        }
        return false;
    }

    // 更新对阵图信息
    updateBracket(bracketId, updatedData) {
        const index = this.brackets.findIndex(bracket => bracket.id === bracketId);
        if (index !== -1) {
            this.brackets[index] = { ...this.brackets[index], ...updatedData };
            this.markAsChanged();
            return true;
        }
        return false;
    }

    // 更新当前比赛数据
    updateCurrentMatch(updatedData) {
        this.currentMatch = { ...this.currentMatch, ...updatedData };
        this.markAsChanged();
        return true;
    }

    // 更新比赛信息数据
    updateCompetitionInfo(updatedData) {
        this.competitionInfo = { ...this.competitionInfo, ...updatedData };
        this.markAsChanged();
        return true;
    }

    // 添加新战队
    addTeam(teamData) {
        this.teams.push(teamData);
        this.markAsChanged();
        return true;
    }

    // 添加新选手
    addPlayer(playerData) {
        this.players.push(playerData);
        this.markAsChanged();
        return true;
    }

    // 添加新对阵图
    addBracket(bracketData) {
        this.brackets.push(bracketData);
        this.markAsChanged();
        return true;
    }

    // 删除战队
    deleteTeam(teamId) {
        const index = this.teams.findIndex(team => team.id === teamId);
        if (index !== -1) {
            this.teams.splice(index, 1);
            this.markAsChanged();
            return true;
        }
        return false;
    }

    // 删除选手
    deletePlayer(playerId) {
        const index = this.players.findIndex(player => player.id === playerId);
        if (index !== -1) {
            this.players.splice(index, 1);
            this.markAsChanged();
            return true;
        }
        return false;
    }

    // 删除对阵图
    deleteBracket(bracketId) {
        const index = this.brackets.findIndex(bracket => bracket.id === bracketId);
        if (index !== -1) {
            this.brackets.splice(index, 1);
            this.markAsChanged();
            return true;
        }
        return false;
    }
}

// 创建数据管理器实例
const dataManager = new DataManager();
