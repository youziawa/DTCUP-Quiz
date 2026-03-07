import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Quiz from '../views/Quiz.vue'
import BankManage from '../views/BankManage.vue'
import WrongNotes from '../views/WrongNotes.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/quiz', name: 'Quiz', component: Quiz },
  { path: '/manage', name: 'BankManage', component: BankManage },
  { path: '/wrong', name: 'WrongNotes', component: WrongNotes }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
