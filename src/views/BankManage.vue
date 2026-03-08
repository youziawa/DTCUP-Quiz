<template>
  <div class="manage-container">
    <div class="manage-header">
      <el-button @click="$router.push('/')" :icon="ArrowLeft">返回首页</el-button>
      <h2>题库管理</h2>
    </div>

    <el-card class="current-bank-card">
      <template #header>
        <div class="card-header">
          <span>当前题库</span>
        </div>
      </template>
      <div class="current-bank-info" v-if="store.currentBank">
        <div class="bank-detail">
          <el-tag type="success" size="large">{{ store.currentBank }}</el-tag>
          <span class="question-count">共 {{ store.totalQuestions }} 道题</span>
        </div>
        <el-button type="danger" plain @click="clearBank">清空题库</el-button>
      </div>
      <el-empty v-else description="暂无题库" />
    </el-card>

    <el-card class="import-card">
      <template #header>
        <div class="card-header">
          <span>导入题库</span>
        </div>
      </template>
      
      <div class="import-section">
        <h4>导入方式</h4>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="JSON 文件" name="json">
            <div class="import-tip">
              <el-alert
                title="JSON 格式说明"
                type="info"
                :closable="false"
              >
                <template #default>
                  <div class="format-tip">
                    题库需符合以下格式：<br/>
                    <code>{ "name": "题库名称", "questions": [{ "question": "题目", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "解析" }] }</code>
                  </div>
                </template>
              </el-alert>
            </div>
            <el-upload
              class="upload-demo"
              :auto-upload="false"
              :on-change="handleJsonChange"
              accept=".json"
              :limit="1"
            >
              <el-button type="primary">选择 JSON 文件</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="手动输入" name="manual">
            <el-form :model="manualForm" label-width="80px">
              <el-form-item label="题库名称">
                <el-input v-model="manualForm.name" placeholder="请输入题库名称" />
              </el-form-item>
              <el-form-item label="题目内容">
                <el-input 
                  v-model="manualForm.question" 
                  type="textarea" 
                  rows="3" 
                  placeholder="请输入题目内容" 
                />
              </el-form-item>
              <el-form-item label="选项">
                <div v-for="(opt, idx) in manualForm.options" :key="idx" class="option-input">
                  <el-tag>{{ ['A', 'B', 'C', 'D'][idx] }}</el-tag>
                  <el-input v-model="manualForm.options[idx]" placeholder="选项内容" />
                </div>
              </el-form-item>
              <el-form-item label="正确答案">
                <el-radio-group v-model="manualForm.answer">
                  <el-radio :label="0">A</el-radio>
                  <el-radio :label="1">B</el-radio>
                  <el-radio :label="2">C</el-radio>
                  <el-radio :label="3">D</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="解析">
                <el-input 
                  v-model="manualForm.explanation" 
                  type="textarea" 
                  rows="2" 
                  placeholder="请输入题目解析（可选）" 
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="addSingleQuestion">添加题目</el-button>
              </el-form-item>
            </el-form>

            <div class="added-questions" v-if="tempQuestions.length > 0">
              <h4>已添加题目 ({{ tempQuestions.length }})</h4>
              <div class="question-list">
                <div v-for="(q, idx) in tempQuestions" :key="idx" class="question-item">
                  <span>{{ idx + 1 }}. {{ q.question }}</span>
                  <el-button type="danger" size="small" text @click="removeTempQuestion(idx)">删除</el-button>
                </div>
              </div>
              <el-button type="success" @click="saveTempQuestions">保存题库</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="使用示例" name="sample">
            <div class="sample-section">
              <p>点击下方按钮加载示例题库（大唐杯5G相关题目）</p>
              <el-button type="primary" @click="loadSampleBank">加载示例题库</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <el-card class="preview-card" v-if="store.totalQuestions > 0">
      <template #header>
        <div class="card-header">
          <span>题库预览</span>
        </div>
      </template>
      <div class="preview-list">
        <div 
          v-for="(q, index) in store.questions.slice(0, 5)" 
          :key="index"
          class="preview-item"
        >
          <div class="preview-num">{{ index + 1 }}</div>
          <div class="preview-content">
            <div class="preview-question">{{ q.question }}</div>
            <div class="preview-answer">答案：{{ ['A', 'B', 'C', 'D'][q.answer] }}</div>
          </div>
        </div>
        <div class="preview-more" v-if="store.totalQuestions > 5">
          ... 还有 {{ store.totalQuestions - 5 }} 道题
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuizStore } from '../stores/quiz'
import { sampleBank } from '../data/sampleBank'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useQuizStore()

const activeTab = ref('json')
const tempQuestions = ref([])

const manualForm = reactive({
  name: '',
  question: '',
  options: ['', '', '', ''],
  answer: 0,
  explanation: ''
})

const handleJsonChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.questions && Array.isArray(data.questions)) {
        store.setQuestionBank(data)
        ElMessage.success(`成功导入题库：${data.name}，共 ${data.questions.length} 道题`)
      } else {
        ElMessage.error('JSON格式错误，请检查题库结构')
      }
    } catch (err) {
      ElMessage.error('JSON解析失败，请检查文件内容')
    }
  }
  reader.readAsText(file.raw)
}

const addSingleQuestion = () => {
  if (!manualForm.question || manualForm.options.some(o => !o)) {
    ElMessage.warning('请填写完整题目信息')
    return
  }
  
  tempQuestions.value.push({
    type: 'single',
    question: manualForm.question,
    options: [...manualForm.options],
    answer: manualForm.answer,
    explanation: manualForm.explanation
  })
  
  manualForm.question = ''
  manualForm.options = ['', '', '', '']
  manualForm.answer = 0
  manualForm.explanation = ''
  
  if (!manualForm.name) {
    manualForm.name = '手动题库'
  }
  
  ElMessage.success('题目已添加')
}

const removeTempQuestion = (index) => {
  tempQuestions.value.splice(index, 1)
}

const saveTempQuestions = () => {
  if (!manualForm.name) {
    manualForm.name = '手动题库'
  }
  store.setQuestionBank({
    name: manualForm.name,
    questions: tempQuestions.value
  })
  tempQuestions.value = []
  ElMessage.success('题库保存成功')
}

const loadSampleBank = () => {
  store.setQuestionBank(sampleBank)
  ElMessage.success('示例题库加载成功')
}

const clearBank = async () => {
  try {
    await ElMessageBox.confirm('确定要清空当前题库吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    store.clearQuestions()
    ElMessage.success('题库已清空')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.manage-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px;
}

.manage-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding: 16px 20px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.manage-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-weight: 700;
}

.current-bank-card,
.import-card,
.preview-card {
  margin-bottom: 28px;
}

.card-header {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.current-bank-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bank-detail {
  display: flex;
  align-items: center;
  gap: 16px;
}

.question-count {
  color: #909399;
  font-size: 14px;
}

.import-section h4 {
  margin: 16px 0;
}

.format-tip {
  font-size: 12px;
}

.format-tip code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #409eff;
}

.import-tip {
  margin-bottom: 16px;
}

.option-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.option-input .el-input {
  flex: 1;
}

.added-questions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.added-questions h4 {
  margin-bottom: 16px;
}

.question-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.sample-section {
  text-align: center;
  padding: 40px 0;
}

.sample-section p {
  color: #909399;
  margin-bottom: 20px;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-num {
  width: 28px;
  height: 28px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.preview-content {
  flex: 1;
}

.preview-question {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.preview-answer {
  font-size: 12px;
  color: #67c23a;
}

.preview-more {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 12px;
}

@media (max-width: 768px) {
  .manage-container {
    padding: 16px 12px;
  }

  .manage-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .manage-header h2 {
    font-size: 1.4rem;
  }

  .current-bank-info {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .bank-detail {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .option-input {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .option-input .el-input {
    width: 100%;
  }

  .preview-item {
    flex-direction: column;
    gap: 8px;
  }

  .preview-num {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .question-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .question-item .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .manage-container {
    padding: 12px 8px;
  }

  .manage-header .el-button {
    width: 100%;
  }

  .card-header {
    font-size: 14px;
  }

  .format-tip code {
    font-size: 11px;
    word-break: break-all;
  }

  .import-tip :deep(.el-alert__content) {
    font-size: 12px;
  }

  .el-form-item {
    margin-bottom: 16px;
  }

  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .question-list {
    max-height: 150px;
  }

  .added-questions h4 {
    font-size: 14px;
  }
}

@media (min-width: 1200px) {
  .manage-container {
    padding: 32px 24px;
  }

  .manage-header {
    margin-bottom: 32px;
  }

  .current-bank-card,
  .import-card,
  .preview-card {
    margin-bottom: 32px;
  }
}
</style>
