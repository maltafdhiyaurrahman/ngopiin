<script setup lang="ts">
import { ref, onMounted } from 'vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import BrewForm from './components/BrewForm.vue'
import BrewTimer from './components/BrewTimer.vue'
import RecipeDetail from './components/RecipeDetail.vue'
import { useHistory } from './composables/useHistory'

// INITIAL STATE
const currentView = ref('welcome')
const activeRecipe = ref<any>(null)
const isLoading = ref(false)

// Fungsi simulasi/nembak API
const handleRecipeReady = async (data: any) => {
  isLoading.value = true // Aktifkan loading

  // Nanti di sini logic nembak API Gemini-nya
  // Kita simulasiin delay 2 detik dulu:
  setTimeout(() => {
    activeRecipe.value = data
    currentView.value = 'recipe-detail'
    isLoading.value = false // Matikan loading
  }, 2000)
}

const { history, loadHistory, saveRecipe } = useHistory()

onMounted(() => {
  loadHistory()
})


const handleSaveRecipe = (recipe: any) => {
  saveRecipe(recipe)
}

const loadRecipeFromHistory = (recipe: any) => {
  activeRecipe.value = recipe
  currentView.value = 'timer'
}
</script>

<template>
  <!-- FULL SCREEN LOADING OVERLAY -->
  <div v-if="isLoading" class="loading-overlay">
    <div class="text-center">
      <div class="spinner-brew mb-4"></div>
      <h4 class="text-white fw-bold">AI Barista is crafting your recipe...</h4>
      <p class="text-muted-custom">Analyzing beans and flavor profile</p>
    </div>
  </div>
  <!-- NAVBAR -->
  <nav class="navbar border-bottom border-subtle py-3 sticky-top mb-4"
    style="background-color: rgba(15, 15, 16, 0.9); backdrop-filter: blur(10px); z-index: 1050;">
    <div class="container-fluid justify-content-center" style="max-width: 1000px;">

      <span class="navbar-brand d-flex align-items-center m-0" style="cursor: pointer;"
        @click="currentView = 'welcome'">
        <!-- Logo Custom Lu -->
        <img src="./assets/logo.png" alt="ngopiin logo" style="height: 42px; width: auto; object-fit: contain;">
      </span>

      <!-- History Button (Hidden/Commented for now as requested) -->
      <!-- 
      <div class="d-flex align-items-center gap-3">
        <button v-if="currentView !== 'welcome'" 
                class="btn btn-nav-history rounded-pill px-3 py-2 fw-semibold d-flex align-items-center shadow-sm" 
                @click="currentView = 'history'">
          <i class="fa-solid fa-clock-rotate-left me-2"></i> 
          <span>History ({{ history.length }})</span>
        </button>
      </div> 
      -->

    </div>
  </nav>

  <!-- MAIN CONTENT -->
  <main class="container-fluid p-0 d-flex justify-content-center mb-4" style="max-width: 1000px;">

    <WelcomeScreen v-if="currentView === 'welcome'" @start="currentView = 'form'" />

    <BrewForm v-if="currentView === 'form'" @recipe-generated="handleRecipeReady" />

    <RecipeDetail v-if="currentView === 'recipe-detail'" :recipe="activeRecipe" @back="currentView = 'form'"
      @start-timer="currentView = 'timer'" />

    <BrewTimer v-if="currentView === 'timer'" :recipe="activeRecipe" @back="currentView = 'recipe-detail'"
      @reset="currentView = 'form'" @save="handleSaveRecipe" />

    <!-- BREW HISTORY SECTION (Hold/Hidden) -->
    <div v-if="currentView === 'history'" class="row justify-content-center animation-fade-in pb-5 w-100 mt-4">
      <div class="col-lg-8">

        <div class="d-flex justify-content-between align-items-center mb-5 mt-2 px-3">
          <div>
            <h2 class="fw-bold mb-1 text-white">Brew <span class="text-accent">History.</span></h2>
            <p class="text-muted-custom small mb-0">A log of your best brewing recipes.</p>
          </div>
          <button class="btn btn-outline-accent rounded-pill px-4 shadow-sm" @click="currentView = 'form'">
            <i class="fa-solid fa-plus me-1"></i> New Brew
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="history.length === 0" class="mx-3 text-center p-5 card card-dark shadow-sm"
          style="border-style: dashed !important; border-width: 2px !important;">
          <div class="mb-4 mt-3">
            <i class="fa-solid fa-mug-hot text-muted-custom opacity-25" style="font-size: 5rem;"></i>
          </div>
          <h4 class="text-white fw-bold mb-2">No history yet</h4>
          <p class="text-muted-custom mb-4">Save your first recipe after brewing to access it again here.</p>
          <button class="btn btn-primary-custom rounded-pill px-4 mb-3" @click="currentView = 'form'">
            Create Recipe Now
          </button>
        </div>

        <!-- History List -->
        <div v-else class="d-flex flex-column gap-4 px-3">
          <div v-for="(item, index) in history" :key="index"
            class="history-card card card-dark p-4 shadow-sm transition-all">

            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div class="w-100">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <span class="badge bg-surface border border-subtle text-muted-custom px-2 py-1 fw-normal">
                    <i class="fa-regular fa-clock me-1"></i> {{ item.savedAt || 'Just now' }}
                  </span>
                  <span class="badge bg-accent-soft text-accent border border-accent-soft px-2 py-1">
                    {{ item.method || 'Manual Brew' }}
                  </span>
                </div>

                <h4 class="fw-bold text-white mb-3">
                  <i class="fa-solid fa-seedling text-accent me-2"></i>{{ item.coffeeWeight }}g <span
                    class="text-muted-custom mx-2 fw-light">|</span> Ratio {{ item.ratio }}
                </h4>

                <div class="p-3 bg-surface rounded-3 border border-subtle">
                  <div class="small text-muted-custom mb-1"><i class="fa-solid fa-bullseye text-info me-1"></i> Target
                    Taste:</div>
                  <div class="small text-white fst-italic lh-sm">
                    "{{ item.expectedTaste }}"
                  </div>
                </div>
              </div>

              <div class="d-flex flex-md-column gap-2 mt-2 mt-md-0 flex-shrink-0 justify-content-end">
                <button class="btn btn-primary-custom rounded-pill px-4 py-2 w-100 shadow"
                  @click="loadRecipeFromHistory(item)">
                  <i class="fa-solid fa-play me-2"></i> Brew Again
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </main>
</template>


<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

/* GLOBAL STYLES */
body,
html {
  background-color: #0F0F10 !important;
  color: #F5F5F5;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  background-color: #0F0F10;
  display: flex;
  flex-direction: column;
}

/* GLOBAL ANIMATION */
.animation-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* CARDS & BACKGROUNDS */
.card-dark {
  background-color: #1A1A1D !important;
  border: 1px solid #2A2A2E !important;
  border-radius: 16px !important;
  color: #F5F5F5;
}

.bg-surface {
  background-color: #121214 !important;
}

.border-subtle {
  border-color: #2A2A2E !important;
}

/* INPUT & SELECT */
.form-control,
.form-select {
  background-color: #121214 !important;
  border: 1px solid #2A2A2E !important;
  color: #F5F5F5 !important;
}

.form-control:focus,
.form-select:focus {
  border-color: #C47A2C !important;
  box-shadow: 0 0 0 2px rgba(196, 122, 44, 0.2) !important;
  background-color: #121214 !important;
  color: #fff !important;
}

.form-control::placeholder {
  color: #4A4A52 !important;
}

/* HISTORY CARDS HOVER EFFECT */
.history-card {
  transition: all 0.3s ease;
}

.history-card:hover {
  transform: translateY(-4px);
  border-color: rgba(196, 122, 44, 0.4) !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
}

/* PRIMARY BUTTON (GRADIENT ORANGE) */
.btn-primary-custom {
  background: linear-gradient(135deg, #C47A2C, #E89B4A);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  color: #1A1A1D;
  transition: all 0.3s ease;
}

.btn-primary-custom:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(196, 122, 44, 0.3) !important;
}

.btn-primary-custom:disabled {
  background: #2A2A2E;
  color: #A1A1AA;
}

/* NAVBAR BUTTONS */
.btn-nav-history {
  background-color: #1A1A1D;
  border: 1px solid #2A2A2E;
  color: #A1A1AA;
  transition: all 0.2s ease;
}

.btn-nav-history:hover {
  border-color: #C47A2C;
  color: #C47A2C;
  background-color: rgba(196, 122, 44, 0.05);
}

/* OUTLINE ACCENT BUTTON */
.btn-outline-accent {
  background-color: transparent;
  border: 1px solid #C47A2C;
  color: #C47A2C;
  transition: all 0.2s ease;
}

.btn-outline-accent:hover {
  background-color: rgba(196, 122, 44, 0.1);
  color: #C47A2C;
}

/* HELPERS */
.text-muted-custom {
  color: #A1A1AA !important;
}

.text-accent {
  color: #C47A2C !important;
}

.bg-accent-soft {
  background-color: rgba(196, 122, 44, 0.1) !important;
}

.border-accent-soft {
  border-color: rgba(196, 122, 44, 0.3) !important;
}

.tracking-wider {
  letter-spacing: 1px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 16, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.spinner-brew {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(196, 122, 44, 0.1);
  border-left-color: #C47A2C;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>