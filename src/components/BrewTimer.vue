<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps<{
  recipe: {
    steps: any[]          
    [key: string]: any    
  }
}>()
const emit = defineEmits(['reset', 'back']) // Feedback & Save di-hold dulu

// STATE TIMER
const currentStepIndex = ref(0)
const timeLeft = ref(0)
const totalTimeElapsed = ref(0)
const isRunning = ref(false)
let timerInterval: any = null

const currentStep = computed(() => {
  if (!props.recipe || !props.recipe.steps) return {}
  return props.recipe.steps[currentStepIndex.value] || {}
})

// LOGIC RENTANG WAKTU (Timeline)
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds === undefined || seconds === null) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const processedSteps = computed(() => {
  let currentTime = 0;
  if (!props.recipe || !props.recipe.steps) return []
  
  return props.recipe.steps.map(step => {
    const start = currentTime;
    const end = currentTime + (step.durationSeconds || 0);
    currentTime = end;
    
    return {
      ...step,
      startTimeFormatted: formatTime(start),
      endTimeFormatted: formatTime(end)
    };
  });
});

// LOGIC LINGKARAN (ViewBox Responsive)
const circleRadius = 90 
const circleCircumference = 2 * Math.PI * circleRadius
const stepProgressPercentage = computed(() => {
  const duration = currentStep.value?.durationSeconds || 1
  return ((duration - timeLeft.value) / duration) * 100
})
const strokeDashoffset = computed(() => {
  return circleCircumference - (stepProgressPercentage.value / 100) * circleCircumference
})

const globalProgressPercentage = computed(() => {
  const total = props.recipe?.totalTime || 1
  return Math.min((totalTimeElapsed.value / total) * 100, 100)
})

// KONTROL TIMER
const startStep = () => {
  timeLeft.value = currentStep.value?.durationSeconds || 0
}

const toggleTimer = () => {
  if (isRunning.value) {
    clearInterval(timerInterval)
  } else {
    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
        totalTimeElapsed.value++
      } else {
        nextStep()
      }
    }, 1000)
  }
  isRunning.value = !isRunning.value
}

const nextStep = () => {
  if (currentStepIndex.value < (props.recipe?.steps?.length || 0) - 1) {
    currentStepIndex.value++
    startStep()
  } else {
    finishBrewing()
  }
}

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    startStep()
    totalTimeElapsed.value = Math.max(0, totalTimeElapsed.value - (currentStep.value?.durationSeconds || 0))
  }
}
const showFinishModal = ref(false)

const finishBrewing = () => {
  clearInterval(timerInterval)
  isRunning.value = false
  
  // Tembak Confetti!
  triggerConfetti()
  
  // Munculin Modal
  showFinishModal.value = true
}

const triggerConfetti = () => {
  const end = Date.now() + (3 * 1000); // 3 detik
  const colors = ['#C47A2C', '#E89B4A', '#ffffff'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}

const handleFinalDone = () => {
  showFinishModal.value = false
  emit('reset')
}
onMounted(() => { setTimeout(() => { startStep() }, 100) })
onUnmounted(() => { clearInterval(timerInterval) })
</script>

<template>
  <div class="container-fluid px-xl-4 animation-fade-in d-flex flex-column brew-layout-container pb-3">
    <div class="row justify-content-center h-100 flex-grow-1 m-0 w-100" style="min-height: 0;" v-if="props.recipe">
      
      <div class="col-12 col-xl-11 col-xxl-10 h-100 d-flex flex-column p-0" style="min-height: 0;">

        <div class="d-flex flex-column h-100 w-100" style="min-height: 0;">
          
          <!-- TOP HEADER BAR -->
          <div class="d-flex justify-content-between align-items-center mb-2 px-1 flex-shrink-0 flex-wrap gap-2">
            <button class="btn btn-outline-secondary text-white border-subtle rounded-pill px-3 py-1 me-2 d-flex align-items-center" @click="emit('back')" style="font-size: 0.8rem;">
              <i class="fa-solid fa-arrow-left me-2"></i> Back to Recipe
            </button>

            <div class="d-flex align-items-center gap-3 flex-grow-1 justify-content-end">
              <div class="d-none d-sm-flex align-items-center gap-2">
                <i class="fa-solid fa-mug-hot text-accent" style="font-size: 0.85rem;"></i>
                <div class="lh-1">
                  <div class="text-muted-custom" style="font-size: 0.6rem;">Method</div>
                  <strong class="text-white" style="font-size: 0.8rem;">{{ recipe?.method }}</strong>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-seedling text-muted-custom" style="font-size: 0.85rem;"></i>
                <div class="lh-1">
                  <div class="text-muted-custom" style="font-size: 0.6rem;">Coffee</div>
                  <strong class="text-white" style="font-size: 0.8rem;">{{ recipe?.coffeeWeight }} g</strong>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-droplet text-muted-custom" style="font-size: 0.85rem;"></i>
                <div class="lh-1">
                  <div class="text-muted-custom" style="font-size: 0.6rem;">Water</div>
                  <strong class="text-white" style="font-size: 0.8rem;">{{ recipe?.totalWater }} ml</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- SPLIT LAYOUT MAIN ROW -->
          <div class="row g-3 flex-grow-1 m-0 main-content-row w-100" style="min-height: 0;">
            
            <!-- LEFT PANEL: Timeline & Controls -->
            <div class="col-lg-4 d-flex flex-column h-100 p-0 pe-lg-2 order-2 order-lg-1 left-panel" style="min-height: 0;">
              <div class="card card-dark p-0 shadow-sm h-100 d-flex flex-column overflow-hidden" style="min-height: 0;">
                
                <div class="p-2 px-3 border-bottom border-subtle flex-shrink-0 bg-surface">
                  <h6 class="fw-bold mb-0 text-white" style="font-size: 0.85rem;"><i class="fa-solid fa-list-check text-accent me-2"></i> Brewing Steps</h6>
                </div>

                <div class="d-flex flex-column custom-scrollbar flex-grow-1 p-1" style="overflow-y: auto; min-height: 0;">
                  <div class="timeline-wrapper mt-2 ms-2 mb-2">
                    <div v-for="(step, index) in processedSteps" :key="index" 
                         class="timeline-item position-relative py-2 ps-5 pe-2"
                         :class="{ 'active-step': currentStepIndex === index, 'passed-step': currentStepIndex > index }">
                      <div class="timeline-line" v-if="index !== processedSteps.length - 1"></div>
                      <div class="timeline-dot d-flex justify-content-center align-items-center text-white shadow-sm">
                        <span v-if="currentStepIndex <= index">{{ index + 1 }}</span>
                        <i v-else class="fa-solid fa-check text-dark" style="font-size: 0.6rem;"></i>
                      </div>
                      <div class="step-content" :class="currentStepIndex === index ? 'opacity-100' : 'opacity-50'">
                        <strong class="d-block mb-1" :class="currentStepIndex === index ? 'text-white' : 'text-muted-custom'" style="font-size: 0.85rem;">{{ step.stepName }}</strong>
                        <div class="text-muted-custom" style="font-size: 0.75rem;">
                          <div class="fw-semibold lh-1 mb-1" :class="currentStepIndex === index ? 'text-white' : ''">{{ step.startTimeFormatted }} - {{ step.endTimeFormatted }}</div>
                          <div class="lh-1">{{ step.waterAddedInThisStep }} ml</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- BOTTOM CONTROLS -->
                <div class="p-2 px-3 border-top border-subtle bg-surface flex-shrink-0">
                  <div class="d-flex justify-content-between text-white fw-bold mb-1 align-items-center">
                    <span style="font-size: 0.7rem;"><i class="fa-solid fa-clipboard-check text-accent me-1"></i> Progress</span>
                    <span style="font-size: 0.75rem;">{{ Math.round(globalProgressPercentage) }}%</span>
                  </div>
                  <div class="progress rounded-pill mb-2" style="height: 4px; background-color: #2A2A2E;">
                    <div class="progress-bar rounded-pill" role="progressbar" :style="{ width: globalProgressPercentage + '%', background: 'linear-gradient(90deg, #C47A2C, #E89B4A)' }"></div>
                  </div>
                  <div class="d-flex justify-content-between text-muted-custom mb-2" style="font-size: 0.7rem;">
                    <div>Elapsed <strong class="text-white ms-1 tabular-nums">{{ formatTime(totalTimeElapsed) }}</strong></div>
                    <div class="text-end">Est. <strong class="text-white ms-1 tabular-nums">{{ formatTime(recipe?.totalTime) }}</strong></div>
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary flex-shrink-0 text-white border-subtle p-0" @click="prevStep" :disabled="currentStepIndex === 0" style="width: 40px; height: 40px; border-radius: 8px;"><i class="fa-solid fa-backward-step"></i></button>
                    <button class="btn btn-primary-custom flex-grow-1 shadow fw-bold p-0" @click="toggleTimer" style="height: 40px; border-radius: 8px; font-size: 0.85rem;"><i class="fa-solid" :class="isRunning ? 'fa-pause' : 'fa-play'"></i><span class="ms-2">{{ isRunning ? 'Pause' : 'Start' }}</span></button>
                    <button class="btn btn-outline-accent flex-shrink-0 p-0" @click="nextStep" style="width: 40px; height: 40px; border-radius: 8px;"><i class="fa-solid fa-forward-step"></i></button>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT PANEL: HUD Timer -->
            <div class="col-lg-8 d-flex flex-column h-100 p-0 ps-lg-2 order-1 order-lg-2 right-panel" style="min-height: 0;">
              <div class="card card-dark p-2 p-sm-3 shadow-lg d-flex flex-column align-items-center justify-content-between border-accent-soft h-100 overflow-hidden" style="min-height: 0;">
                <div class="w-100 d-flex align-items-center gap-3 mb-1 flex-shrink-0 px-2 pt-1">
                  <div class="icon-circle border border-accent text-accent d-flex justify-content-center align-items-center rounded-circle flex-shrink-0" style="width: 42px; height: 42px;"><i class="fa-solid fa-droplet fs-6"></i></div>
                  <div class="d-flex flex-column">
                    <span class="text-accent fw-bold lh-1 mb-1" style="font-size: 0.65rem; letter-spacing: 1px;">STEP {{ currentStepIndex + 1 }} OF {{ recipe?.steps?.length || 1 }}</span>
                    <h3 class="fw-bold text-white mb-0 lh-1" style="font-size: 1.15rem;">{{ currentStep?.stepName }}</h3>
                  </div>
                </div>

                <div class="timer-wrapper position-relative d-flex justify-content-center align-items-center cursor-pointer my-1 flex-grow-1 w-100" style="min-height: 0;" @click="toggleTimer">
                  <svg viewBox="0 0 200 200" class="timer-svg" style="width: 100%; height: 100%; max-width: 180px; max-height: 180px;">
                    <circle cx="100" cy="100" :r="circleRadius" fill="none" stroke="#2A2A2E" stroke-width="6" />
                    <circle cx="100" cy="100" :r="circleRadius" fill="none" stroke="#C47A2C" stroke-width="10" stroke-linecap="round" :stroke-dasharray="circleCircumference" :stroke-dashoffset="strokeDashoffset" class="timer-progress-circle glow-effect" />
                  </svg>
                  <div class="timer-text-content position-absolute text-center">
                    <div class="text-muted-custom mb-1" style="font-size: 0.6rem; letter-spacing: 1px;">{{ isRunning ? 'POUR NOW' : 'PAUSED' }}</div>
                    <div class="fw-bold text-white lh-1 mb-1 tabular-nums" style="font-size: 3rem;">{{ formatTime(timeLeft) }}</div>
                    <div class="text-muted-custom" style="font-size: 0.7rem;">of {{ formatTime(currentStep?.durationSeconds) }}</div>
                  </div>
                </div>

                <div class="w-100 mt-1 flex-shrink-0 px-2 pb-1">
                  <div class="row w-100 text-center border border-subtle rounded-3 py-2 bg-surface mx-0 mb-2 shadow-sm">
                    <div class="col-4 border-end border-subtle"><div class="text-muted-custom mb-1" style="font-size: 0.65rem;">Pour Amount</div><div class="text-white fs-5 fw-bold">{{ currentStep?.waterAddedInThisStep }}<span class="fs-6 text-muted-custom ms-1 fw-normal">ml</span></div></div>
                    <div class="col-4 border-end border-subtle"><div class="text-muted-custom mb-1" style="font-size: 0.65rem;">Total Poured</div><div class="text-white fs-5 fw-bold">{{ currentStep?.accumulatedWater }}<span class="fs-6 text-muted-custom ms-1 fw-normal">ml</span></div></div>
                    <div class="col-4"><div class="text-muted-custom mb-1" style="font-size: 0.65rem;">Target Temp</div><div class="text-white fs-5 fw-bold">{{ recipe?.temperature }}<span class="fs-6 text-muted-custom ms-1 fw-normal">°C</span></div></div>
                  </div>
                  <div class="w-100 text-start p-2 px-3 border border-subtle rounded-3 position-relative overflow-hidden bg-surface shadow-sm d-flex flex-column justify-content-center" style="min-height: 50px;">
                    <div class="d-flex align-items-center gap-2 mb-1"><i class="fa-regular fa-lightbulb text-accent" style="font-size: 0.75rem;"></i><strong class="text-white" style="font-size: 0.75rem;">Instructions</strong></div>
                    <p class="text-muted-custom mb-0 text-truncate-2-lines" style="font-size: 0.8rem; line-height: 1.3;">{{ currentStep?.instruction }}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

    <div v-if="showFinishModal" class="custom-modal-overlay">
      <div class="card card-dark p-5 text-center shadow-lg border-accent-soft animation-pop-in" style="max-width: 450px;">
        <div class="mb-4">
          <div class="success-icon">
            <i class="fa-solid fa-check"></i>
          </div>
        </div>
        <h2 class="fw-bold text-white mb-2">Brewing Ready!</h2>
        <p class="text-muted-custom mb-4">Your perfect cup of coffee is ready to enjoy. Don't forget to smell the aroma first!</p>
        
        <button class="btn btn-primary-custom w-100 py-3 fw-bold rounded-pill" @click="handleFinalDone">
          Done, Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (min-width: 992px) { .brew-layout-container { height: calc(100vh - 85px) !important; overflow: hidden; } }

.text-truncate-2-lines { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.card-dark { background-color: #1A1A1D !important; border: 1px solid #2A2A2E !important; border-radius: 12px !important; }
.bg-surface { background-color: #121214 !important; }
.border-subtle { border-color: #2A2A2E !important; }
.text-muted-custom { color: #A1A1AA !important; }
.text-accent { color: #C47A2C !important; }
.bg-accent-soft { background-color: rgba(196, 122, 44, 0.08) !important; }
.border-accent-soft { border-color: rgba(196, 122, 44, 0.3) !important; }
.hover-accent:hover { color: #dc3545 !important; }

.timeline-wrapper { position: relative; }
.timeline-item { transition: all 0.3s ease; border-left: 3px solid transparent; }
.active-step { background-color: rgba(196, 122, 44, 0.05); border-left: 3px solid #C47A2C; }
.timeline-line { position: absolute; top: 30px; bottom: -10px; left: 35px; width: 2px; background-color: #2A2A2E; z-index: 1; }
.timeline-dot { position: absolute; left: 24px; top: 12px; width: 24px; height: 24px; border-radius: 50%; background-color: #2A2A2E; border: 2px solid #1A1A1D; font-size: 0.75rem; z-index: 2; transition: all 0.3s ease; }
.active-step .timeline-dot { background-color: #C47A2C; color: #1A1A1D !important; border-color: #C47A2C; box-shadow: 0 0 0 4px rgba(196, 122, 44, 0.2); }
.passed-step .timeline-dot { background-color: #2A2A2E; color: #C47A2C !important; }

.btn-primary-custom { background: linear-gradient(135deg, #C47A2C, #E89B4A); border: none; color: #1A1A1D; transition: all 0.3s ease; }
.btn-primary-custom:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(196, 122, 44, 0.3) !important; }
.btn-outline-accent { border: 1px solid #C47A2C; color: #C47A2C; }

.timer-svg { transform: rotate(-90deg); }
.timer-progress-circle { transition: stroke-dashoffset 1s linear; }
.glow-effect { filter: drop-shadow(0 0 10px rgba(196, 122, 44, 0.4)); }
.tabular-nums { font-variant-numeric: tabular-nums; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #2A2A2E; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C47A2C; }

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: rgba(196, 122, 44, 0.2);
  color: #C47A2C;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  margin: 0 auto;
  border: 2px solid #C47A2C;
}

.animation-pop-in {
  animation: popIn 0.5s cubic-bezier(0.26, 0.53, 0.74, 1.48) forwards;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
</style>