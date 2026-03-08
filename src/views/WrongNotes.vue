<template>
  <div class="wrong-container">
    <div class="wrong-header">
      <el-button @click="$router.push('/')" :icon="ArrowLeft">返回首页</el-button>
      <h2>错题回顾</h2>
      <div class="header-right" v-if="wrongQuestions.length > 0">
        <el-switch
          v-model="isMemorizeMode"
          active-text="背题模式"
          inactive-text="做题模式"
          @change="toggleMode"
        />
      </div>
    </div>

    <div class="wrong-stats" v-if="wrongQuestions.length > 0">
      <el-card shadow="hover">
        <div class="stat-content">
          <div class="stat-icon red">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-text">
            <div class="stat-value">{{ wrongQuestions.length }}</div>
            <div class="stat-label">错题总数</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover">
        <div class="stat-content">
          <div class="stat-icon blue">
            <el-icon><Refresh /></el-icon>
          </div>
          <div class="stat-text">
            <div class="stat-value">{{ totalAnswered }}</div>
            <div class="stat-label">已作答</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover">
        <div class="stat-content">
          <div class="stat-icon green">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-text">
            <div class="stat-value">{{ totalAnswered - wrongQuestions.length }}</div>
            <div class="stat-label">正确</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover">
        <div class="stat-content">
          <div class="stat-icon orange">
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="stat-text">
            <div class="stat-value">{{ accuracyRate }}%</div>
            <div class="stat-label">正确率</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="action-bar" v-if="wrongQuestions.length > 0">
      <el-button type="primary" @click="retryWrongQuestions">
        <el-icon><Refresh /></el-icon>
        重新练习错题
      </el-button>
      <el-button type="danger" plain @click="clearWrongNotes">
        <el-icon><Delete /></el-icon>
        清空错题记录
      </el-button>
    </div>

    <el-empty 
      v-if="wrongQuestions.length === 0" 
      description="暂无错题记录，太棒了！"
    />

    <div class="wrong-list" v-else>
      <el-card 
        v-for="(item, idx) in wrongQuestions" 
        :key="item.index"
        class="wrong-item"
        shadow="hover"
      >
        <div class="wrong-item-header">
          <div class="question-num">
            <el-tag type="danger">错题 {{ idx + 1 }}</el-tag>
            <span class="original-num">原题号: {{ item.question.id }}</span>
          </div>
          <div class="header-actions">
            <el-button 
              size="small" 
              type="success" 
              text
              @click="markAsCorrect(item.index)"
            >
              <el-icon><Check /></el-icon>
              已掌握
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              text
              @click="removeWrongNote(item.index)"
            >
              <el-icon><Delete /></el-icon>
              移除
            </el-button>
          </div>
        </div>

        <div class="question-text">
          {{ item.question.question }}
        </div>

        <div class="options-list">
          <div 
            v-for="(option, optIdx) in item.question.options" 
            :key="optIdx"
            class="option-item"
            :class="{
              correct: isMemorizeMode || optIdx === item.question.answer,
              wrong: !isMemorizeMode && optIdx === item.userAnswer && optIdx !== item.question.answer,
              memorize: isMemorizeMode && optIdx === item.question.answer
            }"
          >
            <div class="option-label">
              {{ ['A', 'B', 'C', 'D'][optIdx] }}
            </div>
            <div class="option-content">{{ option }}</div>
            <div class="option-tag">
              <el-tag v-if="isMemorizeMode && optIdx === item.question.answer" type="warning" size="small">正确答案</el-tag>
              <el-tag v-else-if="optIdx === item.question.answer" type="success" size="small">正确答案</el-tag>
              <el-tag v-if="!isMemorizeMode && optIdx === item.userAnswer && optIdx !== item.question.answer" type="danger" size="small">你的答案</el-tag>
            </div>
          </div>
        </div>

        <div class="explanation" v-if="isMemorizeMode || item.question.explanation">
          <div class="explanation-title">
            <el-icon><InfoFilled /></el-icon>
            解析
          </div>
          <div class="explanation-content">{{ item.question.explanation || '暂无解析' }}</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useQuizStore } from '../stores/quiz'
import { useRouter } from 'vue-router'
import { ArrowLeft, Warning, Refresh, Check, PieChart, Delete, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useQuizStore()
const router = useRouter()

const isMemorizeMode = computed({
  get: () => store.mode === 'memorize',
  set: (val) => store.setMode(val ? 'memorize' : 'answer')
})

const wrongQuestions = computed(() => {
  return store.wrongNotes.map(index => ({
    index,
    question: store.questions[index],
    userAnswer: store.userAnswers[index]
  }))
})

const totalAnswered = computed(() => store.answeredCount)

const accuracyRate = computed(() => {
  if (totalAnswered.value === 0) return 0
  return Math.round(((totalAnswered.value - wrongQuestions.value.length) / totalAnswered.value) * 100)
})

const toggleMode = (val) => {
  store.setMode(val ? 'memorize' : 'answer')
}

const markAsCorrect = (index) => {
  store.removeWrongNote(index)
  ElMessage.success('已从错题库移除')
}

const removeWrongNote = (index) => {
  store.removeWrongNote(index)
  ElMessage.info('已移除该错题')
}

const retryWrongQuestions = () => {
  if (wrongQuestions.value.length > 0) {
    store.currentIndex = wrongQuestions.value[0].index
    router.push('/quiz')
  }
}

const clearWrongNotes = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有错题记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    store.wrongNotes = []
    ElMessage.success('错题记录已清空')
  } catch {}
}
</script>

<style scoped>
.wrong-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px;
}

.wrong-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.wrong-header h2 {
  margin: 0;
  flex: 1;
  color: var(--color-text-primary);
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wrong-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.red {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
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

.stat-text {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wrong-item {
  margin-bottom: 0;
}

.wrong-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-num {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.original-num {
  font-size: 12px;
  color: #909399;
}

.your-answer {
  font-size: 14px;
  color: #606266;
}

.wrong-answer {
  color: #f56c6c;
  font-weight: 600;
  margin: 0 4px;
}

.correct-answer {
  color: #67c23a;
  font-weight: 600;
  margin: 0 4px;
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 20px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  transition: all 0.3s;
}

.option-item.correct {
  border-color: #67c23a;
  background: #f0f9ff;
}

.option-item.wrong {
  border-color: #f56c6c;
  background: #fef0f0;
}

.option-item.memorize {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.option-label {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.option-item.correct .option-label {
  background: #67c23a;
  color: white;
}

.option-item.memorize .option-label {
  background: #e6a23c;
  color: white;
}

.option-item.wrong .option-label {
  background: #f56c6c;
  color: white;
}

.option-content {
  flex: 1;
  font-size: 15px;
  color: #606266;
}

.option-tag {
  margin-left: 12px;
}

.explanation {
  background: #fdf6ec;
  border-radius: 10px;
  padding: 16px;
}

.explanation-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e6a23c;
  font-weight: 600;
  margin-bottom: 10px;
}

.explanation-content {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

@media (max-width: 768px) {
  .wrong-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .wrong-item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .wrong-container {
    padding: 12px 8px;
  }

  .wrong-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .wrong-header .el-button {
    width: 100%;
  }

  .wrong-header h2 {
    font-size: 1.4rem;
  }

  .header-right {
    width: 100%;
  }

  .header-right .el-switch {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .wrong-stats {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-content {
    gap: 10px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
  }

  .action-bar {
    flex-direction: column;
    gap: 10px;
  }

  .action-bar .el-button {
    width: 100%;
  }

  .wrong-item {
    margin-bottom: 0;
  }

  .wrong-item :deep(.el-card__body) {
    padding: 12px;
  }

  .question-num {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .original-num {
    font-size: 12px;
  }

  .header-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .question-text {
    font-size: 14px;
  }

  .options-list {
    gap: 8px;
  }

  .option-item {
    padding: 10px 12px;
    font-size: 13px;
  }

  .option-label {
    width: 26px;
    height: 26px;
    font-size: 12px;
    margin-right: 8px;
  }
}

@media (min-width: 1200px) {
  .wrong-container {
    padding: 32px 24px;
  }

  .wrong-stats {
    gap: 20px;
  }

  .action-bar {
    gap: 20px;
    margin-bottom: 32px;
  }

  .wrong-list {
    gap: 24px;
  }
}
</style>
