<template>
  <div class="quiz-container">
    <div class="quiz-header">
      <div class="header-left">
        <el-button @click="handleBack" :icon="ArrowLeft">返回首页</el-button>
        <span class="bank-name" v-if="store.currentBank">{{ store.currentBank }}</span>
      </div>
      <div class="header-right">
        <el-switch
          v-model="isMemorizeMode"
          active-text="背题模式"
          inactive-text="做题模式"
          @change="toggleMode"
        />
        <span class="mode-tip">{{ isMemorizeMode ? '直接查看答案' : '答题后查看' }}</span>
      </div>
    </div>

    <div class="progress-info">
      <span class="current-num">{{ store.currentIndex + 1 }}</span>
      <span class="separator">/</span>
      <span class="total-num">{{ store.totalQuestions }}</span>
    </div>

    <el-progress 
      :percentage="progressPercent" 
      :show-text="false"
      :stroke-width="6"
      class="progress-bar"
    />

    <div class="quiz-main">
      <div class="question-sidebar">
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="题目导航" name="nav">
            <div class="question-grid">
              <div 
                v-for="(status, index) in questionStatuses" 
                :key="index"
                class="question-dot"
                :class="status"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="question-card" v-if="currentQuestion">
        <div class="question-type">
          <el-tag type="primary">
            {{ currentQuestion.type === 'single' ? '单选题' : currentQuestion.type === 'multiple' ? '多选题' : '判断题' }}
          </el-tag>
          <el-tag type="info">第 {{ store.currentIndex + 1 }} 题</el-tag>
          <el-tag :type="isMemorizeMode ? 'warning' : 'success'">
            {{ isMemorizeMode ? '背题模式' : '做题模式' }}
          </el-tag>
        </div>

        <div class="question-text">
          {{ currentQuestion.question }}
        </div>

        <div class="options-list">
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="{ 
              selected: currentQuestion.type === 'multiple' ? selectedMultipleAnswers.includes(index) : selectedAnswer === index,
              correct: showResult && (currentQuestion.type === 'multiple' ? currentQuestion.answer.includes(index) : index === currentQuestion.answer),
              wrong: showResult && ((currentQuestion.type === 'multiple' ? selectedMultipleAnswers.includes(index) : selectedAnswer === index) && (currentQuestion.type === 'multiple' ? !currentQuestion.answer.includes(index) : index !== currentQuestion.answer)),
              memorize: isMemorizeMode && (currentQuestion.type === 'multiple' ? currentQuestion.answer.includes(index) : index === currentQuestion.answer)
            }"
            @click="selectOption(index)"
          >
            <div class="option-label">
              {{ currentQuestion.type === 'judge' ? (index === 0 ? '正确' : '错误') : ['A', 'B', 'C', 'D', 'E', 'F'][index] }}
            </div>
            <div class="option-content">{{ option }}</div>
            <div class="option-icon" v-if="showResult && isCorrectOption(index)">
              <el-icon><Check /></el-icon>
            </div>
            <div class="option-icon wrong" v-if="showResult && isWrongOption(index)">
              <el-icon><Close /></el-icon>
            </div>
          </div>
        </div>

        <div class="explanation" v-if="showResult && currentQuestion.explanation">
          <div class="explanation-title">
            <el-icon><InfoFilled /></el-icon>
            解析
          </div>
          <div class="explanation-content">{{ currentQuestion.explanation }}</div>
        </div>

        <div class="action-row">
          <template v-if="!isMemorizeMode">
            <el-button 
              v-if="!showResult" 
              type="primary" 
              size="large"
              :disabled="currentQuestion.type === 'multiple' ? selectedMultipleAnswers.length === 0 : selectedAnswer === null"
              @click="submitAnswer"
            >
              提交答案
            </el-button>
            <el-button 
              v-if="showResult" 
              type="success" 
              size="large"
              @click="nextQuestion"
            >
              {{ store.currentIndex === store.totalQuestions - 1 ? '查看结果' : '下一题' }}
            </el-button>
          </template>
          <template v-else>
            <el-button 
              type="primary" 
              size="large"
              @click="nextQuestion"
            >
              {{ store.currentIndex === store.totalQuestions - 1 ? '完成' : '下一题' }}
            </el-button>
          </template>
        </div>
      </div>

      <el-empty v-else description="暂无题目，请先导入题库" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useQuizStore } from '../stores/quiz'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Close, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const store = useQuizStore()
const router = useRouter()

const selectedAnswer = ref(null)
const selectedMultipleAnswers = ref([])
const showResult = ref(false)
const activeCollapse = ref(['nav'])

const isMemorizeMode = computed({
  get: () => store.mode === 'memorize',
  set: (val) => store.setMode(val ? 'memorize' : 'answer')
})

const isCorrectOption = (index) => {
  const q = currentQuestion.value
  if (!q) return false
  if (q.type === 'multiple') {
    return Array.isArray(q.answer) && q.answer.includes(index)
  }
  return index === q.answer
}

const isWrongOption = (index) => {
  const q = currentQuestion.value
  if (!q) return false
  if (q.type === 'multiple') {
    return selectedMultipleAnswers.value.includes(index) && !q.answer.includes(index)
  }
  return selectedAnswer.value === index && index !== q.answer
}

const currentQuestion = computed(() => store.questions[store.currentIndex])

const progressPercent = computed(() => {
  if (store.totalQuestions === 0) return 0
  return Math.round((store.currentIndex / store.totalQuestions) * 100)
})

const questionStatuses = computed(() => {
  return store.questions.map((_, index) => store.getQuestionStatus(index))
})

watch(() => store.currentIndex, () => {
  const savedAnswer = store.userAnswers[store.currentIndex]
  selectedAnswer.value = savedAnswer !== undefined && !Array.isArray(savedAnswer) ? savedAnswer : null
  selectedMultipleAnswers.value = Array.isArray(savedAnswer) ? [...savedAnswer] : []
  showResult.value = isMemorizeMode.value || store.userAnswers[store.currentIndex] !== undefined
})

watch(() => currentQuestion.value?.type, (newType) => {
  if (newType !== 'multiple') {
    selectedMultipleAnswers.value = []
  }
})

watch(() => store.mode, (newMode) => {
  showResult.value = newMode === 'memorize' || store.userAnswers[store.currentIndex] !== undefined
})

const toggleMode = (val) => {
  store.setMode(val ? 'memorize' : 'answer')
  showResult.value = val || store.userAnswers[store.currentIndex] !== undefined
}

const selectOption = (index) => {
  const q = currentQuestion.value
  
  if (q.type === 'multiple') {
    const idx = selectedMultipleAnswers.value.indexOf(index)
    if (idx > -1) {
      selectedMultipleAnswers.value.splice(idx, 1)
    } else {
      selectedMultipleAnswers.value.push(index)
    }
    
    if (isMemorizeMode.value) {
      store.submitAnswer([...selectedMultipleAnswers.value])
      showResult.value = true
    }
  } else {
    selectedAnswer.value = index
    
    if (isMemorizeMode.value) {
      store.submitAnswer(index)
      showResult.value = true
    }
  }
}

const submitAnswer = () => {
  const q = currentQuestion.value
  
  if (q.type === 'multiple') {
    if (selectedMultipleAnswers.value.length === 0) return
    store.submitAnswer([...selectedMultipleAnswers.value])
  } else {
    if (selectedAnswer.value === null) return
    store.submitAnswer(selectedAnswer.value)
  }
  showResult.value = true
}

const handleBack = () => {
  if (store.practiceType === 'random') {
    store.finishPractice()
  }
  router.push('/')
}

const nextQuestion = () => {
  if (store.currentIndex < store.totalQuestions - 1) {
    store.nextQuestion()
    const savedAnswer = store.userAnswers[store.currentIndex]
    selectedAnswer.value = savedAnswer !== undefined ? savedAnswer : null
    selectedMultipleAnswers.value = Array.isArray(savedAnswer) ? [...savedAnswer] : []
    showResult.value = isMemorizeMode.value
  } else {
    store.finishPractice()
    showResult.value = false
    selectedAnswer.value = null
    selectedMultipleAnswers.value = []
    router.push('/')
    ElMessage.success(`练习完成！正确率：${store.correctCount}/${store.answeredCount}`)
  }
}

const goToQuestion = (index) => {
  store.goToQuestion(index)
  const savedAnswer = store.userAnswers[index]
  selectedAnswer.value = savedAnswer !== undefined && !Array.isArray(savedAnswer) ? savedAnswer : null
  selectedMultipleAnswers.value = Array.isArray(savedAnswer) ? [...savedAnswer] : []
  showResult.value = isMemorizeMode.value || store.userAnswers[index] !== undefined
}

onBeforeUnmount(() => {
  if (store.practiceType === 'random') {
    store.finishPractice()
  }
})

if (store.currentIndex >= 0 && store.questions.length > 0) {
  const savedAnswer = store.userAnswers[store.currentIndex]
  selectedAnswer.value = savedAnswer !== undefined && !Array.isArray(savedAnswer) ? savedAnswer : null
  selectedMultipleAnswers.value = Array.isArray(savedAnswer) ? [...savedAnswer] : []
  showResult.value = isMemorizeMode.value || store.userAnswers[store.currentIndex] !== undefined
}
</script>

<style scoped>
.quiz-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.bank-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mode-tip {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;
}

.current-num {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-primary);
}

.separator {
  font-size: 20px;
  color: var(--color-text-muted);
}

.total-num {
  font-size: 20px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.progress-bar {
  margin-bottom: 24px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.quiz-main {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.question-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-md);
}

.question-sidebar .el-collapse {
  border: none;
}

.question-sidebar .el-collapse-item__header {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.question-sidebar .el-collapse-item__content {
  padding-bottom: 12px;
}

.question-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-height: 320px;
  overflow-y: auto;
  padding: 8px;
}

.question-dot {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-bg);
  color: var(--color-text-secondary);
}

.question-dot:hover {
  background: var(--color-primary-lighter);
  color: var(--color-primary-darkest);
  transform: scale(1.1);
}

.question-dot.unanswered {
  background: var(--color-bg);
  color: var(--color-text-secondary);
}

.question-dot.correct {
  background: var(--color-primary);
  color: white;
}

.question-dot.wrong {
  background: var(--color-error);
  color: white;
}

.question-dot.current {
  border: 2px solid var(--color-primary);
  background: var(--color-primary-lighter);
}

.question-card {
  flex: 1;
  min-height: 500px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 36px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.question-type {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}

.question-text {
  font-size: 19px;
  line-height: 1.8;
  color: var(--color-text-primary);
  margin-bottom: 36px;
  font-weight: 500;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 18px 22px;
  border: 2px solid #E5E7EB;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--color-surface);
}

.option-item:hover {
  border-color: var(--color-primary);
  background: var(--color-bg);
  transform: translateX(4px);
}

.option-item.selected {
  border-color: var(--color-primary);
  background: var(--color-success-light);
}

.option-item.correct {
  border-color: var(--color-primary);
  background: var(--color-success-light);
}

.option-item.wrong {
  border-color: var(--color-error);
  background: var(--color-error-light);
}

.option-item.memorize {
  border-color: var(--color-warning);
  background: var(--color-warning-light);
}

.option-label {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-right: 18px;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.option-item:hover .option-label {
  background: var(--color-primary-lighter);
  color: var(--color-primary-darkest);
}

.option-item.selected .option-label {
  background: var(--color-primary);
  color: white;
}

.option-item.correct .option-label {
  background: var(--color-primary);
  color: white;
}

.option-item.wrong .option-label {
  background: var(--color-error);
  color: white;
}

.option-content {
  flex: 1;
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.option-icon {
  margin-left: 14px;
  font-size: 22px;
}

.option-icon.wrong {
  color: var(--color-error);
}

.explanation {
  background: var(--color-warning-light);
  border-radius: var(--radius-lg);
  padding: 22px;
  margin-bottom: 28px;
  border-left: 4px solid var(--color-warning);
}

.explanation-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: var(--color-warning);
  margin-bottom: 14px;
  font-size: 15px;
}

.explanation-content {
  line-height: 1.8;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.action-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.action-row .el-button {
  flex: 1;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.action-row .el-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
  .quiz-container {
    padding: 16px 12px;
  }

  .quiz-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-left {
    justify-content: space-between;
  }

  .header-right {
    justify-content: space-between;
  }

  .bank-name {
    font-size: 14px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mode-tip {
    display: none;
  }

  .progress-info {
    margin-bottom: 12px;
  }

  .current-num {
    font-size: 20px;
  }

  .total-num {
    font-size: 16px;
  }

  .quiz-main {
    flex-direction: column;
    gap: 16px;
  }

  .question-sidebar {
    width: 100%;
    order: 2;
  }

  .question-grid {
    max-height: 200px;
    justify-content: flex-start;
  }

  .question-dot {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .question-card {
    padding: 20px 16px;
    order: 1;
  }

  .question-type {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .question-text {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .options-list {
    gap: 12px;
    margin-bottom: 20px;
  }

  .option-item {
    padding: 14px 16px;
    min-height: 52px;
  }

  .option-label {
    width: 32px;
    height: 32px;
    font-size: 14px;
    margin-right: 12px;
  }

  .option-content {
    font-size: 14px;
    line-height: 1.5;
  }

  .option-icon {
    font-size: 18px;
    margin-left: 8px;
  }

  .explanation {
    padding: 16px;
    margin-bottom: 20px;
  }

  .explanation-title {
    font-size: 14px;
  }

  .explanation-content {
    font-size: 14px;
    line-height: 1.6;
  }

  .action-row {
    gap: 12px;
  }

  .action-row .el-button {
    height: 48px;
    font-size: 15px;
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .quiz-container {
    padding: 12px 8px;
  }

  .quiz-header {
    margin-bottom: 12px;
  }

  .quiz-main {
    flex-direction: column;
    align-items: center;
  }

  .question-sidebar {
    width: 100%;
    max-width: 360px;
    margin-top: 8px;
  }

  .question-card {
    padding: 16px 12px;
    border-radius: 12px;
    min-height: 400px;
    width: 100%;
    max-width: 360px;
  }

  .header-left {
    gap: 8px;
  }

  .header-left .el-button {
    padding: 8px 12px;
    font-size: 13px;
  }

  .header-left .el-button .el-icon {
    margin-right: 4px;
  }

  .header-right {
    gap: 8px;
  }

  .header-right .el-switch {
    transform: scale(0.85);
  }

  .progress-info {
    margin-bottom: 8px;
  }

  .current-num {
    font-size: 18px;
  }

  .separator {
    font-size: 14px;
  }

  .total-num {
    font-size: 14px;
  }

  .question-sidebar {
    margin-top: 8px;
  }

  .question-grid {
    max-height: 150px;
    gap: 4px;
  }

  .question-dot {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .question-type {
    margin-bottom: 12px;
  }

  .question-type .el-tag {
    font-size: 12px;
    padding: 4px 8px;
  }

  .question-text {
    font-size: 15px;
    margin-bottom: 16px;
  }

  .options-list {
    gap: 10px;
    margin-bottom: 16px;
  }

  .option-item {
    padding: 12px;
    min-height: 48px;
    border-radius: 8px;
  }

  .option-label {
    width: 28px;
    height: 28px;
    font-size: 12px;
    margin-right: 10px;
  }

  .option-content {
    font-size: 13px;
  }

  .explanation {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .explanation-content {
    font-size: 13px;
  }

  .action-row {
    flex-direction: column;
    gap: 12px;
  }

  .action-row .el-button {
    width: 100%;
    height: 56px;
    font-size: 16px;
    font-weight: 600;
  }
}

@media (min-width: 1200px) {
  .quiz-container {
    padding: 32px 24px;
  }

  .question-card {
    padding: 40px;
  }

  .question-text {
    font-size: 20px;
    margin-bottom: 36px;
  }

  .option-item {
    padding: 20px 24px;
  }

  .option-content {
    font-size: 17px;
  }
}

@media (min-width: 1920px) {
  .quiz-container {
    max-width: 1400px;
    padding: 40px 32px;
  }

  .question-card {
    padding: 48px;
  }

  .question-text {
    font-size: 22px;
  }

  .option-content {
    font-size: 18px;
  }
}
</style>
