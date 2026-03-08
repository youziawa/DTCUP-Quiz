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
  padding: 48px 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: var(--radius-full);
}

.title {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary-darkest) 0%, var(--color-primary) 50%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.15rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.stat-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 26px;
  box-shadow: var(--shadow-md);
}

.stat-icon.blue {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
}

.stat-icon.green {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
  color: white;
}

.stat-icon.orange {
  background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
  color: white;
}

.stat-icon.red {
  background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
  color: white;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-top: 8px;
  font-weight: 500;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
}

.action-btn {
  padding: 18px 20px;
  font-size: 1rem;
  font-weight: 600;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.action-btn:active {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.action-btn .el-icon {
  font-size: 1.3rem;
}

.history-section {
  margin-top: 40px;
  padding: 24px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.section-title {
  text-align: center;
  margin-bottom: 24px;
  color: var(--color-text-primary);
  font-size: 1.3rem;
  font-weight: 700;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: var(--radius-full);
  margin: 12px auto 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-item {
  padding: 18px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all var(--transition-fast);
}

.history-item:hover {
  border-color: var(--color-primary-lighter);
  background: var(--color-surface);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-date {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.history-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.history-stats .correct-count {
  color: var(--color-primary);
  font-weight: 700;
}

.history-actions {
  display: flex;
  gap: 10px;
}

.history-actions .el-button {
  flex: 1;
  min-height: 42px;
  border-radius: var(--radius-md);
}

.question-item {
  padding: 16px;
  margin-bottom: 16px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
}

.question-item.wrong {
  border-left: 4px solid var(--color-error);
  background: var(--color-error-light);
}

.question-text {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 12px;
  word-break: break-word;
  color: var(--color-text-primary);
  line-height: 1.6;
}

.q-num {
  color: var(--color-primary);
  font-weight: 700;
}

.options-list {
  margin-left: 18px;
}

.option-item {
  padding: 10px 12px;
  margin: 6px 0;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 0.95rem;
}

.option-item.correct {
  background: var(--color-success-light);
  border: 1px solid var(--color-primary);
}

.option-item.wrong {
  background: var(--color-error-light);
  border: 1px solid var(--color-error);
}

.opt-label {
  font-weight: 700;
  margin-right: 8px;
  color: var(--color-primary);
}

.answer-info {
  margin-top: 12px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.answer-info .answered {
  color: var(--color-primary);
  font-weight: 700;
}

.answer-info .unanswered {
  color: var(--color-text-muted);
}

.answer-info .wrong-answer {
  color: var(--color-error);
  font-weight: 700;
}

.answer-info .correct-answer {
  color: var(--color-primary);
  font-weight: 700;
}

.current-bank {
  text-align: center;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .home-container {
    padding: 32px 16px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .action-btn {
    padding: 16px 12px;
    font-size: 0.9rem;
    min-height: 56px;
    flex-direction: column;
    gap: 6px;
  }

  .action-btn .el-icon {
    font-size: 1.2rem;
  }

  .btn-text {
    display: inline;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card :deep(.el-card__body) {
    padding: 16px 10px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .action-buttons {
    grid-template-columns: 1fr;
    gap: 10px;
    max-width: 320px;
  }

  .action-btn {
    padding: 14px 16px;
    font-size: 0.95rem;
    min-height: 52px;
    flex-direction: row;
    gap: 8px;
  }

  .action-btn .el-icon {
    font-size: 1.1rem;
  }

  .btn-text {
    display: inline;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .history-stats {
    font-size: 0.88rem;
  }

  .history-actions {
    flex-direction: column;
  }

  .history-actions .el-button {
    width: 100%;
  }

  .question-text {
    font-size: 0.95rem;
  }

  .option-item {
    font-size: 0.88rem;
    padding: 8px 10px;
  }
}

@media (min-width: 1200px) {
  .title {
    font-size: 3.2rem;
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
    font-size: 3.6rem;
  }

  .stat-value {
    font-size: 2.4rem;
  }
}
</style>
