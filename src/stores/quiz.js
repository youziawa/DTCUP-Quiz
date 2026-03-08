import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'dtcup-quiz-data'

export const useQuizStore = defineStore('quiz', () => {
  const currentBank = ref(null)
  const questions = ref([])
  const backupQuestions = ref([])
  const currentIndex = ref(0)
  const userAnswers = ref({})
  const wrongNotes = ref([])
  const mode = ref('answer')
  const practiceType = ref('normal')
  const practiceHistory = ref([])

  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        currentBank.value = parsed.currentBank || null
        questions.value = parsed.questions || []
        backupQuestions.value = parsed.backupQuestions || parsed.questions || []
        currentIndex.value = parsed.currentIndex || 0
        userAnswers.value = parsed.userAnswers || {}
        wrongNotes.value = parsed.wrongNotes || []
        mode.value = parsed.mode || 'answer'
        practiceType.value = parsed.practiceType || 'normal'
        practiceHistory.value = parsed.practiceHistory || []
      }
    } catch (e) {
      console.error('加载本地数据失败:', e)
    }
  }

  function saveToStorage() {
    try {
      const data = {
        currentBank: currentBank.value,
        questions: questions.value,
        backupQuestions: backupQuestions.value,
        currentIndex: currentIndex.value,
        userAnswers: userAnswers.value,
        wrongNotes: wrongNotes.value,
        mode: mode.value,
        practiceType: practiceType.value,
        practiceHistory: practiceHistory.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('保存本地数据失败:', e)
    }
  }

  loadFromStorage()

  watch([currentBank, questions, backupQuestions, currentIndex, userAnswers, wrongNotes, mode, practiceType, practiceHistory], () => {
    saveToStorage()
  }, { deep: true })

  watch(practiceType, (newVal, oldVal) => {
    if (oldVal === 'random' && newVal === 'normal') {
      if (backupQuestions.value.length > 0 && questions.value.length !== backupQuestions.value.length) {
        questions.value = [...backupQuestions.value]
        userAnswers.value = {}
        wrongNotes.value = []
      }
    }
  })

  const totalQuestions = computed(() => questions.value.length)
  const answeredCount = computed(() => Object.keys(userAnswers.value).length)
  const correctCount = computed(() => {
    let count = 0
    for (const [index, answer] of Object.entries(userAnswers.value)) {
      const q = questions.value[index]
      if (q) {
        if (q.type === 'multiple' && Array.isArray(q.answer) && Array.isArray(answer)) {
          const sortedAnswer = [...answer].sort()
          const sortedCorrect = [...q.answer].sort()
          if (JSON.stringify(sortedAnswer) === JSON.stringify(sortedCorrect)) count++
        } else if (q.answer === answer) {
          count++
        }
      }
    }
    return count
  })

  function setMode(newMode) {
    mode.value = newMode
  }

  function setQuestionBank(bank) {
    currentBank.value = bank.name
    questions.value = bank.questions || []
    backupQuestions.value = bank.questions || []
    currentIndex.value = 0
    userAnswers.value = {}
    wrongNotes.value = []
    practiceType.value = 'normal'
  }

  function startRandomPractice(count = 20) {
    if (questions.value.length === 0) return
    
    backupQuestions.value = [...questions.value]
    
    const allQuestions = [...questions.value]
    
    const allIndices = [...Array(allQuestions.length).keys()]
    const shuffled = allIndices.sort(() => Math.random() - 0.5)
    const selectedIndices = shuffled.slice(0, Math.min(count, allQuestions.length))
    
    const practiceId = Date.now()
    const historyRecord = {
      id: practiceId,
      type: 'random',
      date: new Date().toLocaleString(),
      totalQuestions: selectedIndices.length,
      questionIndices: selectedIndices,
      questions: selectedIndices.map(i => allQuestions[i]),
      userAnswers: {},
      wrongIndices: [],
      correctCount: 0,
      answeredCount: 0
    }
    
    practiceHistory.value.unshift(historyRecord)
    if (practiceHistory.value.length > 10) {
      practiceHistory.value = practiceHistory.value.slice(0, 10)
    }
    
    questions.value = selectedIndices.map(i => allQuestions[i])
    currentIndex.value = 0
    userAnswers.value = {}
    wrongNotes.value = []
    practiceType.value = 'random'
  }

  function startRandomPracticeFromWrong(count = 10) {
    if (wrongNotes.value.length === 0 && backupQuestions.value.length === 0) {
      ElMessage.warning('暂无错题记录，请先完成练习')
      return
    }
    
    if (backupQuestions.value.length === 0) {
      backupQuestions.value = [...questions.value]
    }
    
    const wrongIndices = [...wrongNotes.value]
    const shuffled = wrongIndices.sort(() => Math.random() - 0.5)
    const selectedIndices = shuffled.slice(0, Math.min(count, wrongIndices.length))
    
    const practiceId = Date.now()
    const historyRecord = {
      id: practiceId,
      type: 'wrong',
      date: new Date().toLocaleString(),
      totalQuestions: selectedIndices.length,
      questionIndices: selectedIndices,
      questions: selectedIndices.map(i => backupQuestions.value[i]),
      userAnswers: {},
      wrongIndices: [],
      correctCount: 0,
      answeredCount: 0
    }
    
    practiceHistory.value.unshift(historyRecord)
    if (practiceHistory.value.length > 10) {
      practiceHistory.value = practiceHistory.value.slice(0, 10)
    }
    
    const selectedQuestions = selectedIndices.map(i => backupQuestions.value[i])
    questions.value = selectedQuestions
    currentIndex.value = 0
    userAnswers.value = {}
    wrongNotes.value = []
    practiceType.value = 'random'
  }

  function finishPractice() {
    if (practiceType.value === 'random' && practiceHistory.value.length > 0) {
      const history = practiceHistory.value[0]
      history.userAnswers = { ...userAnswers.value }
      history.wrongIndices = [...wrongNotes.value]
      history.answeredCount = answeredCount.value
      history.correctCount = correctCount.value
      history.wrongCount = wrongNotes.value.length
      
      if (backupQuestions.value.length > 0) {
        questions.value = [...backupQuestions.value]
      }
      userAnswers.value = {}
      wrongNotes.value = []
    }
    practiceType.value = 'normal'
  }

  function importQuestions(newQuestions) {
    questions.value = [...questions.value, ...newQuestions]
    backupQuestions.value = [...questions.value]
  }

  function clearQuestions() {
    questions.value = []
    backupQuestions.value = []
    currentIndex.value = 0
    userAnswers.value = {}
    wrongNotes.value = []
    currentBank.value = null
  }

  function clearAllData() {
    clearQuestions()
    localStorage.removeItem(STORAGE_KEY)
  }

  function submitAnswer(answer) {
    const q = questions.value[currentIndex.value]
    const wasWrong = wrongNotes.value.includes(currentIndex.value)
    
    userAnswers.value[currentIndex.value] = answer
    
    let isCorrect = false
    const correctAnswer = q.answer
    
    if (q.type === 'multiple') {
      if (Array.isArray(correctAnswer) && Array.isArray(answer)) {
        const sortedAnswer = [...answer].sort()
        const sortedCorrect = [...correctAnswer].sort()
        isCorrect = JSON.stringify(sortedAnswer) === JSON.stringify(sortedCorrect)
      }
    } else {
      isCorrect = answer === correctAnswer
    }
    
    if (!isCorrect) {
      if (!wrongNotes.value.includes(currentIndex.value)) {
        wrongNotes.value.push(currentIndex.value)
      }
    } else {
      if (wasWrong) {
        const idx = wrongNotes.value.indexOf(currentIndex.value)
        if (idx > -1) {
          wrongNotes.value.splice(idx, 1)
        }
      }
    }
  }

  function removeWrongNote(index) {
    const idx = wrongNotes.value.indexOf(index)
    if (idx > -1) {
      wrongNotes.value.splice(idx, 1)
    }
  }

  function addWrongNote(index) {
    if (!wrongNotes.value.includes(index)) {
      wrongNotes.value.push(index)
    }
  }

  function nextQuestion() {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++
    }
  }

  function prevQuestion() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  function goToQuestion(index) {
    if (index >= 0 && index < questions.value.length) {
      currentIndex.value = index
    }
  }

  function getQuestionStatus(index) {
    if (!(index in userAnswers.value)) return 'unanswered'
    const answer = userAnswers.value[index]
    const q = questions.value[index]
    if (!q) return 'unanswered'
    
    if (q.type === 'multiple' && Array.isArray(q.answer) && Array.isArray(answer)) {
      const sortedAnswer = [...answer].sort()
      const sortedCorrect = [...q.answer].sort()
      return JSON.stringify(sortedAnswer) === JSON.stringify(sortedCorrect) ? 'correct' : 'wrong'
    }
    return answer === q.answer ? 'correct' : 'wrong'
  }

  return {
    currentBank,
    questions,
    currentIndex,
    userAnswers,
    wrongNotes,
    mode,
    practiceType,
    practiceHistory,
    totalQuestions,
    answeredCount,
    correctCount,
    setMode,
    setQuestionBank,
    startRandomPractice,
    startRandomPracticeFromWrong,
    finishPractice,
    importQuestions,
    clearQuestions,
    clearAllData,
    submitAnswer,
    removeWrongNote,
    addWrongNote,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    getQuestionStatus,
    loadFromStorage,
    saveToStorage
  }
})
