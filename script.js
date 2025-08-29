class CSGORollBot {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.trades = 0;
        this.totalValue = 0;
        this.successfulTrades = 0;
        this.attemptedTrades = 0;
        this.blacklist = ['AK-47 | Safari Mesh', 'AWP | Safari Mesh'];
        
        this.initializeEventListeners();
        this.updateTimestamp();
        this.startUptimeCounter();
        
        // Sample console messages
        this.logMessage('System initialized', 'info');
        this.logMessage('Waiting for configuration...', 'info');
    }

    initializeEventListeners() {
        // Bot control buttons
        document.getElementById('startBot').addEventListener('click', () => this.startBot());
        document.getElementById('pauseBot').addEventListener('click', () => this.pauseBot());
        document.getElementById('stopBot').addEventListener('click', () => this.stopBot());
        
        // Utility buttons
        document.getElementById('toggleToken').addEventListener('click', () => this.toggleTokenVisibility());
        document.getElementById('clearConsole').addEventListener('click', () => this.clearConsole());
        document.getElementById('addBlacklist').addEventListener('click', () => this.addBlacklistItem());
        
        // Enter key for blacklist input
        document.getElementById('blacklistItem').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBlacklistItem();
        });
    }

    startBot() {
        const sessionToken = document.getElementById('sessionToken').value;
        const licensePassword = document.getElementById('licensePassword').value;
        const minCoins = document.getElementById('minCoins').value;
        const maxCoins = document.getElementById('maxCoins').value;
        
        if (!sessionToken || !licensePassword) {
            this.logMessage('Error: Session token and license password required', 'error');
            return;
        }
        
        if (!minCoins || !maxCoins) {
            this.logMessage('Error: Min and max coins must be set', 'error');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.startTime = new Date();
        
        // Update UI
        document.getElementById('startBot').disabled = true;
        document.getElementById('pauseBot').disabled = false;
        document.getElementById('stopBot').disabled = false;
        document.getElementById('status').textContent = 'Online';
        document.getElementById('status').className = 'badge bg-success status-online';
        
        this.logMessage('Bot started successfully', 'success');
        this.logMessage(`Configuration: Min: $${minCoins}, Max: $${maxCoins}, Markup: ${document.getElementById('markupPercent').value}%`, 'info');
        this.logMessage('Looking for trades...', 'info');
        
        // Start bot simulation
        this.startBotSimulation();
    }

    pauseBot() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBot');
        
        if (this.isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play me-2"></i>Resume Bot';
            document.getElementById('status').textContent = 'Paused';
            document.getElementById('status').className = 'badge bg-warning status-paused';
            this.logMessage('Bot paused', 'warning');
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause me-2"></i>Pause Bot';
            document.getElementById('status').textContent = 'Online';
            document.getElementById('status').className = 'badge bg-success status-online';
            this.logMessage('Bot resumed', 'success');
        }
    }

    stopBot() {
        this.isRunning = false;
        this.isPaused = false;
        
        // Update UI
        document.getElementById('startBot').disabled = false;
        document.getElementById('pauseBot').disabled = true;
        document.getElementById('stopBot').disabled = true;
        document.getElementById('pauseBot').innerHTML = '<i class="fas fa-pause me-2"></i>Pause Bot';
        document.getElementById('status').textContent = 'Offline';
        document.getElementById('status').className = 'badge bg-secondary status-offline';
        
        this.logMessage('Bot stopped', 'error');
        this.logMessage('Session ended', 'info');
    }

    startBotSimulation() {
        if (!this.isRunning) return;
        
        const weapons = [
            'AK-47 | Redline', 'AWP | Dragon Lore', 'M4A4 | Howl', 'Karambit | Fade',
            'Glock-18 | Water Elemental', 'USP-S | Kill Confirmed', 'Desert Eagle | Blaze',
            'Butterfly Knife | Crimson Web', 'M4A1-S | Hot Rod', 'AK-47 | Fire Serpent'
        ];
        
        const getRandomDelay = () => Math.random() * 10000 + 5000; // 5-15 seconds
        
        const simulateTrade = () => {
            if (!this.isRunning || this.isPaused) {
                setTimeout(simulateTrade, 1000);
                return;
            }
            
            const weapon = weapons[Math.floor(Math.random() * weapons.length)];
            const price = Math.floor(Math.random() * 2000) + 100;
            const markup = document.getElementById('markupPercent').value;
            
            // Check blacklist
            if (this.blacklist.some(item => weapon.includes(item.split(' | ')[0]))) {
                this.logMessage(`Skipped blacklisted item`, 'warning');
                setTimeout(simulateTrade, getRandomDelay());
                return;
            }
            
            // this.logMessage(`Trade found: ${weapon} - ${price} coins, ${markup}% markup`, 'info');
            
            // Simulate joining trade
            setTimeout(() => {
                if (!this.isRunning || this.isPaused) return;
                
                const success = Math.random() > 0.2; // 80% success rate
                this.attemptedTrades++;
                
                if (success) {
                    this.logMessage(`Successfully joined trade`, 'success');
                    this.trades++;
                    this.totalValue += price;
                    this.successfulTrades++;
                    this.updateStats();
                } else {
                    this.logMessage(`Failed to join trade:  (Trade already taken)`, 'error');
                }
                
                setTimeout(simulateTrade, getRandomDelay());
            }, 2000);
        };
        
        setTimeout(simulateTrade, 3000);
    }

    updateStats() {
        document.getElementById('totalTrades').textContent = this.trades;
        document.getElementById('totalValue').textContent = `$${this.totalValue}`;
        
        const successRate = this.attemptedTrades > 0 ? 
            Math.round((this.successfulTrades / this.attemptedTrades) * 100) : 0;
        document.getElementById('successRate').textContent = `${successRate}%`;
    }

    toggleTokenVisibility() {
        const tokenInput = document.getElementById('sessionToken');
        const toggleBtn = document.getElementById('toggleToken');
        
        if (tokenInput.type === 'password') {
            tokenInput.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            tokenInput.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }

    addBlacklistItem() {
        const input = document.getElementById('blacklistItem');
        const item = input.value.trim();
        
        if (item && !this.blacklist.includes(item)) {
            this.blacklist.push(item);
            
            const container = document.getElementById('blacklistItems');
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger me-1 mb-1';
            badge.innerHTML = `${item} <i class="fas fa-times ms-1 cursor-pointer" onclick="removeBlacklistItem(this)"></i>`;
            
            container.appendChild(badge);
            input.value = '';
            
            this.logMessage(`Added "${item}" to blacklist`, 'info');
        }
    }

    clearConsole() {
        document.getElementById('console').innerHTML = '';
        this.logMessage('Console cleared', 'info');
    }

    logMessage(message, level = 'info') {
        const console = document.getElementById('console');
        const timestamp = new Date().toLocaleTimeString();
        
        const line = document.createElement('div');
        line.className = 'console-line';
        line.innerHTML = `
            <span class="console-timestamp">[${timestamp}]</span>
            <span class="console-level-${level}">${message}</span>
        `;
        
        console.appendChild(line);
        console.scrollTop = console.scrollHeight;
    }

    updateTimestamp() {
        const now = new Date();
        document.getElementById('timestamp').textContent = now.toLocaleString();
        setTimeout(() => this.updateTimestamp(), 1000);
    }

    startUptimeCounter() {
        setInterval(() => {
            if (this.startTime && this.isRunning) {
                const now = new Date();
                const diff = now - this.startTime;
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                
                document.getElementById('uptime').textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else if (!this.isRunning) {
                document.getElementById('uptime').textContent = '00:00:00';
            }
        }, 1000);
    }
}

// Global function for removing blacklist items
function removeBlacklistItem(element) {
    const badge = element.parentElement;
    const itemName = badge.textContent.trim();
    
    // Remove from blacklist array
    const bot = window.bot;
    const index = bot.blacklist.indexOf(itemName);
    if (index > -1) {
        bot.blacklist.splice(index, 1);
        bot.logMessage(`Removed "${itemName}" from blacklist`, 'info');
    }
    
    badge.remove();
}

// Initialize bot when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bot = new CSGORollBot();
});