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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 
               'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: auto;
  padding: 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.footer-content {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 16px;
}

.footer-info {
  text-align: center;
}

.project-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 5px 0;
}

.copyright {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-link {
  color: #409eff;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s;
  padding: 8px 12px;
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.footer-link:hover {
  color: #66b1ff;
}

.footer-link:active {
  background-color: #f0f0f0;
  border-radius: 8px;
}

.divider {
  color: #dcdfe6;
}

@media (max-width: 600px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer {
    padding: 16px 12px;
  }
  
  .footer-link {
    font-size: 14px;
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 18px;
  }
}

@media (min-width: 1920px) {
  html {
    font-size: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
