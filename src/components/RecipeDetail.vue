<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  recipe: {
    steps: any[]          
    [key: string]: any    
  }
}>()

const emit = defineEmits(['start-timer', 'back'])

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds === undefined) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
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
</script>

<template>
  <div class="container-fluid px-xl-5 animation-fade-in d-flex flex-column" style="max-height: calc(100vh - 80px);">
    
    <div class="row justify-content-center flex-grow-1">
      <div class="col-xl-11 col-xxl-10 d-flex flex-column">
        
        <!-- HEADER -->
        <div class="d-flex align-items-center justify-content-between mb-3 mt-1">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-circle bg-accent-soft text-accent border border-accent d-flex justify-content-center align-items-center flex-shrink-0" style="width: 45px; height: 45px; border-radius: 50%;">
              <i class="fa-solid fa-check fs-4"></i>
            </div>
            <div>
              <h4 class="fw-bold mb-0 text-white">Recipe Ready!</h4>
              <p class="text-muted-custom small mb-0" style="font-size: 0.8rem;">Review your brewing parameters below.</p>
            </div>
          </div>
          
          <div class="d-none d-md-flex gap-3">
            <button class="btn btn-outline-secondary px-4 text-white border-subtle fw-semibold" @click="emit('back')" style="border-radius: 8px;">
              <i class="fa-solid fa-pen me-2"></i> Edit
            </button>
            <button class="btn btn-primary-custom px-5 shadow fw-bold fs-6" @click="emit('start-timer')" style="border-radius: 8px;">
              <i class="fa-solid fa-play me-2"></i> Ready to Brew
            </button>
          </div>
        </div>

        <!-- 1 LINE SUMMARY -->
        <div class="card card-dark p-3 shadow-sm mb-2">
          <div class="row g-0 text-center recipe-stats-grid align-items-center">
            
            <div class="col stat-col">
              <i class="fa-solid fa-fire text-accent mb-1 fs-5 opacity-75"></i>
              <div class="text-muted-custom small mb-1" style="font-size: 0.7rem;">Method</div>
              <strong class="text-white fs-6">{{ recipe.method || 'Hot V60' }}</strong>
            </div>

            <div class="col stat-col">
              <i class="fa-solid fa-bullseye text-accent mb-1 fs-5 opacity-75"></i>
              <div class="text-muted-custom small mb-1" style="font-size: 0.7rem;">Taste</div>
              <strong class="text-white fs-6">{{ recipe.expectedTaste?.split(' ')[0] || 'Balanced' }}</strong>
            </div>

            <div class="col stat-col">
              <i class="fa-solid fa-seedling text-muted-custom mb-1 fs-5"></i>
              <div class="text-muted-custom small mb-1" style="font-size: 0.7rem;">Coffee</div>
              <strong class="text-white fs-6">{{ recipe.coffeeWeight }} g</strong>
            </div>
            
            <div class="col stat-col">
              <i class="fa-solid fa-droplet text-muted-custom mb-1 fs-5"></i>
              <div class="text-muted-custom small mb-1" style="font-size: 0.7rem;">{{ recipe.iceWeight > 0 ? 'Hot Water' : 'Total Water' }}</div>
              <strong class="text-white fs-6">{{ recipe.hotWater || recipe.totalWater }} ml</strong>
              <div class="text-muted-custom" style="font-size: 0.65rem;">Ratio {{ recipe.ratio }}</div>
            </div>
            
            <div class="col stat-col">
              <i class="fa-solid fa-temperature-half text-muted-custom mb-1 fs-5"></i>
              <div class="text-muted-custom small mb-1" style="font-size: 0.7rem;">Temp</div>
              <strong class="text-white fs-6">{{ recipe.temperature }}°C</strong>
            </div>
            
            <div class="col stat-col">
              <i class="fa-solid fa-spinner text-muted-custom mb-1 fs-5"></i>
              <div class="text-muted-custom small mb-1" style="font-size: 0.7rem;">Grind</div>
              <strong class="text-white fs-6">{{ recipe.grindSize }}</strong>
            </div>
            
            <div class="col stat-col last-col">
              <i class="fa-regular fa-clock text-muted-custom mb-1 fs-5"></i>
              <div class="text-muted-custom small mb-1" style="font-size: 0.7rem;">Time</div>
              <strong class="text-white fs-6">{{ formatTime(recipe.totalTime) }}</strong>
            </div>

          </div>
        </div>

        <!-- ICED PREPARATION ALERT (Hanya muncul jika ada es batu) -->
        <div v-if="recipe.iceWeight > 0" class="card bg-accent-soft border-accent-soft p-2 mb-3 shadow-sm">
            <div class="d-flex align-items-center justify-content-center gap-3">
                <i class="fa-regular fa-snowflake text-accent fs-5"></i>
                <div class="text-white small">
                    <span class="text-accent fw-bold text-uppercase me-2" style="font-size: 0.7rem; letter-spacing: 1px;">Ice Preparation:</span>
                    Place <strong class="fs-6 text-white">{{ recipe.iceWeight }}g</strong> of ice cubes in your server before brewing.
                </div>
            </div>
        </div>

        <!-- STEPS TABLE -->
        <div class="card card-dark p-3 shadow-sm d-flex flex-column flex-grow-1 overflow-hidden mb-2">
          
          <div class="d-flex align-items-center mb-2 px-2">
            <i class="fa-solid fa-list-ol text-accent me-2"></i>
            <h6 class="fw-bold mb-0 text-white">Brewing Steps</h6>
          </div>

          <div class="row px-3 py-2 text-muted-custom fw-semibold border-bottom border-subtle d-none d-md-flex" style="font-size: 0.8rem;">
            <div class="col-md-3">Step</div>
            <div class="col-md-2 text-center">Pour</div>
            <div class="col-md-2 text-center">Total</div>
            <div class="col-md-2 text-center">Time</div>
            <div class="col-md-3">Instruction</div>
          </div>

          <div class="d-flex flex-column custom-scrollbar" style="overflow-y: auto; flex-grow: 1; max-height: 40vh;">
            <div v-for="(step, index) in processedSteps" :key="index" 
                 class="row px-3 py-2 py-md-3 border-bottom border-subtle align-items-center step-row m-0">
              
              <div class="col-md-3 d-flex align-items-center gap-2 mb-2 mb-md-0 ps-0">
                <div class="step-num-circle bg-surface text-muted-custom border border-subtle fw-bold d-flex justify-content-center align-items-center flex-shrink-0" style="width: 28px; height: 28px; font-size: 0.8rem;">
                  {{ index + 1 }}
                </div>
                <div>
                  <strong class="text-white d-block" style="font-size: 0.9rem;">{{ step.stepName }}</strong>
                </div>
              </div>

              <div class="col-6 col-md-2 text-md-center mb-1 mb-md-0">
                <span class="d-md-none text-muted-custom small me-2">Pour:</span>
                <strong class="text-white" style="font-size: 0.9rem;">{{ step.waterAddedInThisStep }} ml</strong>
              </div>

              <div class="col-6 col-md-2 text-md-center mb-1 mb-md-0">
                <span class="d-md-none text-muted-custom small me-2">Total:</span>
                <strong class="text-white" style="font-size: 0.9rem;">{{ step.accumulatedWater }} ml</strong>
              </div>

              <div class="col-12 col-md-2 text-md-center mb-2 mb-md-0">
                <div class="fw-bold text-white" style="font-size: 0.85rem;">{{ step.startTimeFormatted }} - {{ step.endTimeFormatted }}</div>
                <div class="text-muted-custom" style="font-size: 0.7rem;">({{ step.durationSeconds }} sec)</div>
              </div>

              <div class="col-md-3 text-muted-custom" style="font-size: 0.8rem; line-height: 1.3;">
                {{ step.instruction }}
              </div>
            </div>
          </div>
        </div>

        <!-- MOBILE BUTTONS -->
        <div class="d-flex d-md-none flex-column gap-2 mt-2 pb-3">
          <button class="btn btn-primary-custom py-3 shadow w-100 fw-bold fs-5" @click="emit('start-timer')" style="border-radius: 8px;">
            Ready to Brew <i class="fa-solid fa-play ms-2"></i>
          </button>
          <button class="btn btn-outline-secondary py-3 text-white border-subtle w-100 fw-semibold" @click="emit('back')" style="border-radius: 8px;">
            <i class="fa-solid fa-pen me-2"></i> Edit Recipe
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style sama seperti sebelumnya, pastikan .bg-accent-soft dan .border-accent-soft ada */
.animation-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.card-dark { background-color: #1A1A1D !important; border: 1px solid #2A2A2E !important; border-radius: 12px !important; }
.bg-surface { background-color: #121214 !important; }
.border-subtle { border-color: #2A2A2E !important; }
.text-muted-custom { color: #A1A1AA !important; }
.text-accent { color: #C47A2C !important; }
.bg-accent-soft { background-color: rgba(196, 122, 44, 0.08) !important; }
.border-accent-soft { border-color: rgba(196, 122, 44, 0.2) !important; }

.stat-col { border-right: 1px solid #2A2A2E; padding: 0 5px; }
.stat-col:last-child { border-right: none; }
@media (max-width: 768px) {
  .stat-col { border-right: none; border-bottom: 1px solid #2A2A2E; padding: 8px 0; width: 50%; flex: 0 0 50%; }
}

.btn-primary-custom { background: linear-gradient(135deg, #C47A2C, #E89B4A); border: none; color: #1A1A1D; transition: all 0.3s ease; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #2A2A2E; border-radius: 10px; }
</style>