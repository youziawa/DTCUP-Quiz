<template>
  <div id="app">
    <router-view />
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-info">
          <p class="project-name">大唐杯刷题工具 (DTCUP Quiz)</p>
          <p class="copyright">© 2025 本软件使用AI辅助开发</p>
        </div>
        <div class="footer-links">
          <a href="https://github.com/youziawa/DTCUP-Quiz" target="_blank" class="footer-link">
            <span>GitHub</span>
          </a>
          <span class="divider">|</span>
          <a href="https://github.com/youziawa/DTCUP-Quiz/blob/main/LICENSE" target="_blank" class="footer-link">
            <span>MIT License</span>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
</script>

<style>
:root {
  --color-primary: #10B981;
  --color-primary-light: #34D399;
  --color-primary-lighter: #6EE7B7;
  --color-primary-dark: #059669;
  --color-primary-darkest: #047857;
  
  --color-bg: #ECFDF5;
  --color-bg-gradient-start: #ECFDF5;
  --color-bg-gradient-end: #D1FAE5;
  
  --color-surface: #FFFFFF;
  --color-surface-hover: #F0FDF4;
  
  --color-text-primary: #064E3B;
  --color-text-secondary: #047857;
  --color-text-tertiary: #6EE7B7;
  --color-text-muted: #9CA3AF;
  
  --color-success: #10B981;
  --color-success-light: #D1FAE5;
  --color-error: #EF4444;
  --color-error-light: #FEE2E2;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-info: #3B82F6;
  --color-info-light: #DBEAFE;
  
  --shadow-sm: 0 1px 2px 0 rgba(16, 185, 129, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(16, 185, 129, 0.1), 0 4px 6px -2px rgba(16, 185, 129, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04);
  
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 
               'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-gradient-start) 0%, var(--color-bg-gradient-end) 100%);
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: auto;
  padding: 24px 20px;
  background: var(--color-surface);
  border-top: 1px solid #E5E7EB;
  box-shadow: var(--shadow-sm);
}

.footer-content {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 8px;
}

.footer-info {
  text-align: center;
}

.project-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
}

.copyright {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition-fast);
  padding: 10px 16px;
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.footer-link:hover {
  color: var(--color-primary-dark);
  background: var(--color-bg);
}

.footer-link:active {
  transform: scale(0.98);
  background: var(--color-success-light);
}

.divider {
  color: #D1D5DB;
}

@media (max-width: 600px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer {
    padding: 20px 16px;
  }
  
  .footer-link {
    font-size: 14px;
    padding: 10px 14px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 17px;
  }
}

@media (min-width: 1920px) {
  html {
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.el-button--primary {
  --el-button-bg-color: var(--color-primary);
  --el-button-border-color: var(--color-primary);
  --el-button-hover-bg-color: var(--color-primary-dark);
  --el-button-hover-border-color: var(--color-primary-dark);
  --el-button-active-bg-color: var(--color-primary-darkest);
  --el-button-active-border-color: var(--color-primary-darkest);
}

.el-button--success {
  --el-button-bg-color: var(--color-success);
  --el-button-border-color: var(--color-success);
  --el-button-hover-bg-color: #059669;
  --el-button-hover-border-color: #059669;
}

.el-button--warning {
  --el-button-bg-color: var(--color-warning);
  --el-button-border-color: var(--color-warning);
  --el-button-hover-bg-color: #D97706;
  --el-button-hover-border-color: #D97706;
}

.el-button--danger {
  --el-button-bg-color: var(--color-error);
  --el-button-border-color: var(--color-error);
  --el-button-hover-bg-color: #DC2626;
  --el-button-hover-border-color: #DC2626;
}

.el-switch.is-checked .el-switch__core {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.el-progress-bar__outer {
  background-color: #E5E7EB;
}

.el-progress-bar__inner {
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.el-tag--primary {
  --el-tag-bg-color: var(--color-success-light);
  --el-tag-border-color: transparent;
  --el-tag-text-color: var(--color-primary-dark);
}

.el-tag--success {
  --el-tag-bg-color: var(--color-success-light);
  --el-tag-border-color: transparent;
  --el-tag-text-color: var(--color-primary-dark);
}

.el-tag--warning {
  --el-tag-bg-color: var(--color-warning-light);
  --el-tag-border-color: transparent;
  --el-tag-text-color: #B45309;
}

.el-tag--danger {
  --el-tag-bg-color: var(--color-error-light);
  --el-tag-border-color: transparent;
  --el-tag-text-color: #B91C1C;
}

.el-tag--info {
  --el-tag-bg-color: var(--color-info-light);
  --el-tag-border-color: transparent;
  --el-tag-text-color: #1D4ED8;
}

.el-card {
  --el-card-border-radius: var(--radius-lg);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.el-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.el-input__wrapper {
  border-radius: var(--radius-md);
  box-shadow: none;
  border: 2px solid #E5E7EB;
  transition: all var(--transition-fast);
}

.el-input__wrapper:hover {
  border-color: var(--color-primary-lighter);
}

.el-input__wrapper.is-focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

.el-dialog {
  --el-dialog-border-radius: var(--radius-xl);
}

.el-tabs__item.is-active {
  color: var(--color-primary);
  font-weight: 600;
}

.el-tabs__active-bar {
  background-color: var(--color-primary);
}

.el-radio__input.is-checked .el-radio__inner {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.el-radio-button__inner {
  border-radius: var(--radius-md) !important;
}

.el-radio-button__original-radio:checked + .el-radio-button__inner {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: -1px 0 0 0 var(--color-primary);
}

.el-message {
  border-radius: var(--radius-md);
}

.el-message--success {
  --el-message-bg-color: var(--color-success-light);
  --el-message-border-color: var(--color-primary);
}
</style>
