<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="title">大唐杯刷题工具</h1>
      <p class="subtitle">高效备考 · 智能练习 · 轻松应战</p>
    </div>

    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon blue">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ store.totalQuestions }}</div>
          <div class="stat-label">题库总量</div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon green">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ store.answeredCount }}</div>
          <div class="stat-label">已答题数</div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon orange">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ store.correctCount }}</div>
          <div class="stat-label">正确答题</div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-icon red">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ store.wrongNotes.length }}</div>
          <div class="stat-label">错题记录</div>
        </div>
      </el-card>
    </div>

    <div class="action-buttons">
      <el-button 
        type="primary" 
        size="large" 
        :disabled="store.totalQuestions === 0"
        @click="startQuiz"
        class="action-btn"
      >
        <el-icon><VideoPlay /></el-icon>
        <span class="btn-text">开始刷题</span>
      </el-button>
      
      <el-button 
        size="large"
        :disabled="store.totalQuestions === 0"
        @click="startQuizRandom"
        class="action-btn"
      >
        <el-icon><Refresh /></el-icon>
        <span class="btn-text">随机练习</span>
      </el-button>

      <el-button 
        size="large"
        type="info"
        :disabled="store.wrongNotes.length === 0"
        @click="startQuizFromWrong"
        class="action-btn"
      >
        <el-icon><RefreshRight /></el-icon>
        <span class="btn-text">巩固错题</span>
      </el-button>

      <el-button 
        size="large" 
        type="warning"
        :disabled="store.wrongNotes.length === 0"
        @click="$router.push('/wrong')"
        class="action-btn"
      >
        <el-icon><Warning /></el-icon>
        <span class="btn-text">错题回顾</span>
      </el-button>
      
      <el-button size="large" type="success" @click="$router.push('/manage')" class="action-btn">
        <el-icon><FolderAdd /></el-icon>
        <span class="btn-text">题库管理</span>
      </el-button>
    </div>

    <div class="current-bank" v-if="store.currentBank">
      <el-tag type="success" size="large">
        当前题库：{{ store.currentBank }}
      </el-tag>
    </div>

    <div class="history-section" v-if="store.practiceHistory.length > 0">
      <h3 class="section-title">练习历史</h3>
      <div class="history-list">
        <div v-for="(row, index) in store.practiceHistory" :key="row.id" class="history-item">
          <div class="history-header">
            <el-tag :type="row.type === 'random' ? 'warning' : row.type === 'wrong' ? 'info' : 'primary'" size="small">
              {{ row.type === 'random' ? '随机练习' : row.type === 'wrong' ? '巩固错题' : '顺序练习' }}
            </el-tag>
            <span class="history-date">{{ row.date }}</span>
          </div>
          <div class="history-stats">
            <span>总题: {{ row.totalQuestions }}</span>
            <span>已答: {{ row.answeredCount }}</span>
            <span class="correct-count">正确: {{ row.correctCount || 0 }}</span>
            <span v-if="row.answeredCount > 0">
              正确率: {{ Math.round((row.correctCount || 0) / row.answeredCount * 100) }}%
            </span>
          </div>
          <div class="history-actions">
            <el-button type="primary" size="small" @click="viewHistoryDetail(row)">
              查看详情
            </el-button>
            <el-button type="danger" size="small" @click="deleteHistory(index)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="练习详情" width="90%" class="history-dialog">
      <div v-if="selectedHistory">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="全部题目" name="all">
            <div v-for="(q, idx) in selectedHistory.questions" :key="idx" class="question-item">
              <div class="question-text">
                <span class="q-num">{{ idx + 1 }}.</span>
                {{ q.question }}
              </div>
              <div class="options-list">
                <div v-for="(opt, optIdx) in q.options" :key="optIdx" 
                  class="option-item"
                  :class="{ 
                    correct: isCorrect(idx, optIdx),
                    wrong: isWrong(idx, optIdx)
                  }">
                  <span class="opt-label">{{ ['A', 'B', 'C', 'D'][optIdx] }}.</span>
                  {{ opt }}
                </div>
              </div>
              <div class="answer-info">
                你的答案: <span :class="selectedHistory.userAnswers[idx] !== undefined ? 'answered' : 'unanswered'">
                  {{ selectedHistory.userAnswers[idx] !== undefined ? (Array.isArray(selectedHistory.userAnswers[idx]) ? selectedHistory.userAnswers[idx].map(i => ['A','B','C','D'][i]).join(',') : ['A','B','C','D'][selectedHistory.userAnswers[idx]]) : '未答' }}
                </span>
                <span class="correct-answer"> | 正确答案: {{ Array.isArray(q.answer) ? q.answer.map(i => ['A','B','C','D'][i]).join(',') : ['A','B','C','D'][q.answer] }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="错题" name="wrong" v-if="selectedHistory.wrongIndices && selectedHistory.wrongIndices.length > 0">
            <div v-for="(idx, displayIdx) in selectedHistory.wrongIndices" :key="idx" class="question-item wrong">
              <div class="question-text">
                <span class="q-num">{{ displayIdx + 1 }}.</span>
                {{ selectedHistory.questions[idx].question }}
              </div>
              <div class="options-list">
                <div v-for="(opt, optIdx) in selectedHistory.questions[idx].options" :key="optIdx" 
                  class="option-item"
                  :class="{ 
                    correct: isCorrect(idx, optIdx),
                    wrong: isWrong(idx, optIdx)
                  }">
                  <span class="opt-label">{{ ['A', 'B', 'C', 'D'][optIdx] }}.</span>
                  {{ opt }}
                </div>
              </div>
              <div class="answer-info">
                你的答案: <span class="wrong-answer">
                  {{ Array.isArray(selectedHistory.userAnswers[idx]) ? selectedHistory.userAnswers[idx].map(i => ['A','B','C','D'][i]).join(',') : ['A','B','C','D'][selectedHistory.userAnswers[idx]] }}
                </span>
                <span class="correct-answer"> | 正确答案: {{ Array.isArray(selectedHistory.questions[idx].answer) ? selectedHistory.questions[idx].answer.map(i => ['A','B','C','D'][i]).join(',') : ['A','B','C','D'][selectedHistory.questions[idx].answer] }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { useQuizStore } from '../stores/quiz'
import { sampleBank } from '../data/sampleBank'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Check, Star, Warning, VideoPlay, Refresh, RefreshRight, FolderAdd } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const store = useQuizStore()
const router = useRouter()

const dialogVisible = ref(false)
const selectedHistory = ref(null)
const activeTab = ref('all')

const viewHistoryDetail = (row) => {
  selectedHistory.value = row
  dialogVisible.value = true
}

const deleteHistory = (index) => {
  store.practiceHistory.splice(index, 1)
}

const isCorrect = (idx, optIdx) => {
  if (!selectedHistory.value || !selectedHistory.value.userAnswers) return false
  const q = selectedHistory.value.questions[idx]
  if (q.type === 'multiple') {
    return Array.isArray(q.answer) && q.answer.includes(optIdx)
  }
  return q.answer === optIdx
}

const isWrong = (idx, optIdx) => {
  if (!selectedHistory.value || !selectedHistory.value.userAnswers) return false
  const userAnswer = selectedHistory.value.userAnswers[idx]
  const q = selectedHistory.value.questions[idx]
  if (userAnswer === undefined) return false
  if (q.type === 'multiple') {
    return Array.isArray(userAnswer) && userAnswer.includes(optIdx) && !q.answer.includes(optIdx)
  }
  return userAnswer === optIdx && optIdx !== q.answer
}

onMounted(() => {
  if (store.totalQuestions === 0) {
    store.setQuestionBank(sampleBank)
  }
})

const resetProgress = async () => {
  if (store.answeredCount > 0) {
    try {
      await ElMessageBox.confirm(
        '您有未完成的练习进度，请选择：', 
        '继续练习', 
        {
          confirmButtonText: '继续上次',
          cancelButtonText: '重新开始',
          distinguishCancelAndClose: true,
          type: 'info'
        }
      )
      return 'continue'
    } catch (action) {
      if (action === 'cancel') {
        store.userAnswers = {}
        store.wrongNotes = []
        store.currentIndex = 0
        return 'restart'
      }
      return false
    }
  }
  store.currentIndex = 0
  return 'restart'
}

const startQuiz = async () => {
  const action = await resetProgress()
  if (action === 'continue') {
    router.push('/quiz')
  } else if (action === 'restart') {
    store.currentIndex = 0
    router.push('/quiz')
  }
}

const startQuizRandom = async () => {
  store.startRandomPractice(20)
  router.push('/quiz')
}

const startQuizFromWrong = async () => {
  store.startRandomPracticeFromWrong(10)
  router.push('/quiz')
}
</script>

<style scoped>
.home-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 16px;
}

.hero-section {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 1.1rem;
  color: #909399;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  text-align: center;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 24px;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.red {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 0.85rem;
  color: #909399;
  margin-top: 6px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 16px 24px;
  font-size: 1rem;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn .el-icon {
  font-size: 1.2rem;
}

.history-section {
  margin-top: 32px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.section-title {
  text-align: center;
  margin-bottom: 16px;
  color: #303133;
  font-size: 1.2rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 14px;
  background: #f5f7fa;
  border-radius: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-date {
  font-size: 0.85rem;
  color: #909399;
}

.history-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.9rem;
  color: #606266;
  margin-bottom: 10px;
}

.history-stats .correct-count {
  color: #67c23a;
  font-weight: 600;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.history-actions .el-button {
  flex: 1;
  min-height: 40px;
}

.question-item {
  padding: 14px;
  margin-bottom: 14px;
  border-radius: 8px;
  background: #f5f7fa;
}

.question-item.wrong {
  border-left: 4px solid #f56c6c;
  background: #fef0f0;
}

.question-text {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 10px;
  word-break: break-word;
}

.q-num {
  color: #409eff;
  font-weight: bold;
}

.options-list {
  margin-left: 16px;
}

.option-item {
  padding: 8px 10px;
  margin: 4px 0;
  border-radius: 4px;
  background: #fff;
  font-size: 0.9rem;
}

.option-item.correct {
  background: #f0f9eb;
  border: 1px solid #67c23a;
}

.option-item.wrong {
  background: #fef0f0;
  border: 1px solid #f56c6c;
}

.opt-label {
  font-weight: bold;
  margin-right: 6px;
}

.answer-info {
  margin-top: 10px;
  font-size: 0.85rem;
  color: #606266;
}

.answer-info .answered {
  color: #409eff;
  font-weight: bold;
}

.answer-info .unanswered {
  color: #909399;
}

.answer-info .wrong-answer {
  color: #f56c6c;
  font-weight: bold;
}

.answer-info .correct-answer {
  color: #67c23a;
  font-weight: bold;
}

.current-bank {
  text-align: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .home-container {
    padding: 24px 12px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-btn {
    padding: 14px 16px;
    font-size: 0.9rem;
    min-height: 52px;
  }

  .btn-text {
    display: none;
  }

  .action-btn::after {
    content: attr(aria-label);
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card :deep(.el-card__body) {
    padding: 16px 8px;
  }

  .stat-icon {
    width: 42px;
    height: 42px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .action-buttons {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .history-stats {
    font-size: 0.85rem;
  }

  .history-actions {
    flex-direction: column;
  }

  .history-actions .el-button {
    width: 100%;
  }

  .question-text {
    font-size: 0.9rem;
  }

  .option-item {
    font-size: 0.85rem;
    padding: 6px 8px;
  }
}

@media (min-width: 1200px) {
  .title {
    font-size: 3rem;
  }

  .stats-cards {
    gap: 24px;
  }

  .action-buttons {
    gap: 20px;
  }

  .action-btn {
    padding: 20px 36px;
  }
}

@media (min-width: 1920px) {
  .home-container {
    max-width: 1100px;
  }

  .title {
    font-size: 3.5rem;
  }

  .stat-value {
    font-size: 2.2rem;
  }
}
</style>
