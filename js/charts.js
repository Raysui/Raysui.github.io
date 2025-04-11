// 图表管理模块
const chartManager = {
    // 创建选手雷达图
    createPlayerRadarChart: function(canvasId, player) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // 根据角色类型设置不同的数据
        let data, labels;
        
        if (player.role === '监管者') {
            labels = ['局均演绎分', '四抓率', '局均法人数', '局均击倒人数'];
            data = [
                player.stats.averageScore / 15000,
                player.stats.catchRate / 100,
                player.stats.averagePersons / 4,
                player.stats.averageHitPersons / 4
            ];
        } else {
            labels = ['局均演绎分', '破译速度', '控制时长', '救人数'];
            data = [
                player.stats.averageScore / 10000,
                player.stats.decodeSpeed / 200,
                player.stats.controlTime / 100,
                player.stats.rescuePersons / 2
            ];
        }
        
        // 创建雷达图
        const chart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: player.name,
                    data: data.map(val => val * 100),
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    pointBackgroundColor: '#d4af37',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#d4af37'
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        pointLabels: {
                            color: '#f5f5f5'
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: '#f5f5f5',
                            z: 1
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        return chart;
    },
    
    // 创建进度条
    createProgressBar: function(id, percentage) {
        const progressBar = document.getElementById(id);
        if (!progressBar) return;
        
        const progressFill = progressBar.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(percentage, 100)}%`;
        }
    },
    
    // 更新进度条
    updateProgressBar: function(id, percentage) {
        const progressBar = document.getElementById(id);
        if (!progressBar) return;
        
        const progressFill = progressBar.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = '0%';
            
            // 使用setTimeout来触发动画
            setTimeout(() => {
                progressFill.style.width = `${Math.min(percentage, 100)}%`;
            }, 10);
        }
    },
    
    // 更新雷达图
    updateRadarChart: function(chartInstance, newData) {
        if (!chartInstance) return;
        
        chartInstance.data.datasets[0].data = newData;
        chartInstance.update();
    }
};
