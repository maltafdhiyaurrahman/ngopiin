<script setup lang="ts">
const emit = defineEmits(['start'])
</script>

<template>
  <!-- Welcome container with transparent background to match the dark theme -->
  <div class="welcome-container w-100 bg-transparent d-flex flex-column justify-content-center align-items-center text-center px-3">
    
    <!-- AI Badge Highlight -->
    <div class="badge-ai mb-4 px-3 py-2 rounded-pill small fw-semibold border border-accent-soft text-accent">
      <i class="fa-solid fa-wand-magic-sparkles me-1"></i> AI-Powered Barista
    </div>

    <!-- Main Headline -->
    <h1 class="display-3 fw-bold mb-3 text-white tracking-tight">
      Precision in <br>
      <span class="text-accent">every pour.</span>
    </h1>

    <!-- Sub Headline -->
    <p class="text-muted-custom fs-5 mb-5 mx-auto" style="max-width: 550px;">
      Stop the guesswork. Let our AI craft the most precise V60 recipes tailored to your coffee beans and preferred taste profile.
    </p>

    <!-- Call to Action Button -->
    <button @click="emit('start')" class="btn btn-primary-custom btn-lg px-5 py-3 fw-bold rounded-pill shadow-lg transition-all" style="font-size: 1.1rem; letter-spacing: 0.5px;">
      Start Brewing Now <i class="fa-solid fa-arrow-right ms-2"></i>
    </button>

    <!-- Supported Methods Decor -->
    <div class="mt-5 pt-4 text-muted-custom small opacity-50 d-flex gap-4 fw-medium">
      <span><i class="fa-solid fa-mug-hot me-1"></i> Hot V60</span>
      <span class="opacity-25">|</span>
      <span><i class="fa-regular fa-snowflake me-1"></i> Japanese Iced</span>
    </div>

  </div>
</template>

<style scoped>
.welcome-container {
  min-height: 80vh;
  animation: fadeIn 0.8s ease-out forwards;
}

.tracking-tight {
  letter-spacing: -1.5px;
}

.badge-ai {
  background-color: rgba(196, 122, 44, 0.1);
  backdrop-filter: blur(5px);
}

.transition-all {
  transition: all 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Fallback helper classes */
.text-accent { color: #C47A2C !important; }
.text-muted-custom { color: #A1A1AA !important; }
.border-accent-soft { border-color: rgba(196, 122, 44, 0.3) !important; }
</style>