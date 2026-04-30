<script setup lang="ts">
import { ref } from 'vue'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useRecipeValidator } from '../composables/useRecipeValidator'

const emit = defineEmits(['recipeGenerated'])
const { validateRecipe } = useRecipeValidator()

const formData = ref({
  origin: '',
  roastLevel: 'Medium',
  process: 'Washed',
  coffeeWeight: 15,
  method: 'Hot V60',
  tasteProfile: 'Balanced'
})

const isLoading = ref(false)
const errorMessage = ref('')
const isQuotaError = ref(false)

const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

const submitForm = async () => {
  isLoading.value = true
  errorMessage.value = ''
  isQuotaError.value = false

  try {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest", 
      generationConfig: { responseMimeType: "application/json" }
    })

    const prompt = `
You are a precise V60 coffee recipe generator.
You must ONLY return a valid minified JSON object. Do not include any explanation, markdown, or text outside JSON.

User input:
- origin: ${formData.value.origin}
- roastLevel: ${formData.value.roastLevel}
- process: ${formData.value.process}
- coffeeWeight: ${formData.value.coffeeWeight} grams
- method: ${formData.value.method}
- tasteProfile: ${formData.value.tasteProfile}

Rules:
GENERAL:
- Always generate a realistic V60 recipe
- Total brew time must be between 120-210 seconds
- totalTime MUST equal sum of all durationSeconds
- First step MUST be bloom

WATER CALCULATION:
- ratioValue must be chosen based on tasteProfile
- totalWater = coffeeWeight * ratioValue (rounded to nearest integer)
- hotWater = totalWater - iceWeight
- The sum of all pouring steps MUST exactly equal hotWater

RATIO (based on tasteProfile):
- Bright & Fruity -> 15-17
- Balanced -> 14-16
- Bold & Strong -> 12-14

TEMPERATURE (based on roastLevel):
- Light -> 92-96 | Medium -> 90-94 | Dark -> 85-90

GRIND SIZE:
- Light -> Medium-Fine | Medium -> Medium | Dark -> Medium-Coarse

ICED METHOD:
- If method contains "Iced": iceWeight = 30-40% of totalWater.
- Otherwise: iceWeight = 0.

POURING RULES:
- Bloom must be 2-3x coffeeWeight (30-45 seconds)
- Final accumulatedWater MUST exactly equal hotWater.

OUTPUT FORMAT:
{
  "coffeeWeight": number,
  "ratio": "string",
  "ratioValue": number,
  "totalWater": number,
  "hotWater": number,
  "iceWeight": number,
  "temperature": number,
  "grindSize": "string",
  "totalTime": number,
  "expectedTaste": "string",
  "method": "${formData.value.method}",
  "steps": [
    {
      "stepName": "string",
      "waterAddedInThisStep": number,
      "accumulatedWater": number,
      "durationSeconds": number,
      "instruction": "string"
    }
  ]
}`

    let attempts = 0
    const maxAttempts = 1
    let isSuccess = false

    while (attempts < maxAttempts && !isSuccess) {
      attempts++
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()

      let recipeData
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error("AI did not return a valid JSON format")
        recipeData = JSON.parse(jsonMatch[0])
      } catch (err) {
        if (attempts === maxAttempts) throw new Error("Invalid JSON response from AI")
        continue
      }

      const validation = validateRecipe(recipeData, formData.value.method)

      if (validation.isValid) {
        emit('recipeGenerated', recipeData)
        isSuccess = true
      } else {
        if (attempts === maxAttempts) throw new Error(validation.error ?? 'Validation failed')
        await delay(1000)
      }
    }

  } catch (error: any) {
    if (error.message.includes('429') || error.message.includes('Quota')) {
      isQuotaError.value = true
      errorMessage.value = "Our AI Barista needs a break. Daily limit reached, please try again tomorrow!"
    } else {
      errorMessage.value = error.message || "Brewing engine failed to calculate. Please try again."
    }
  } finally {
    isLoading.value = false
  }
}

const quickBrew = () => {
  const origins = ['Ethiopia Yirgacheffe', 'Gunung Halu', 'Colombia Supremo', 'Kenya AA', 'Panama Geisha']
  const randomOrigin = origins[Math.floor(Math.random() * origins.length)] ?? 'House Blend'

  formData.value = {
    origin: randomOrigin,
    roastLevel: 'Medium',
    process: 'Washed',
    coffeeWeight: 15,
    method: 'Hot V60',
    tasteProfile: 'Balanced'
  }
  submitForm()
}

const decrementDose = () => { if (formData.value.coffeeWeight > 10 && !isLoading.value) formData.value.coffeeWeight-- }
const incrementDose = () => { if (formData.value.coffeeWeight < 40 && !isLoading.value) formData.value.coffeeWeight++ }
</script>

<template>
  <div class="container-fluid px-xl-5 animation-fade-in">
    <div class="text-center mb-3">
      <h3 class="fw-bold mb-1 text-white">Craft Your Recipe</h3>
      <p class="text-muted-custom small mb-0">Enter your coffee details and let AI design the perfect brew.</p>
    </div>

    <div v-if="errorMessage" class="alert mb-3 border-0 d-flex align-items-start gap-3 py-2" 
         :class="isQuotaError ? 'bg-warning bg-opacity-10 text-warning' : 'bg-danger bg-opacity-10 text-danger'">
        <i class="fa-solid fa-triangle-exclamation fs-5 mt-1 flex-shrink-0"></i>
        <div>
            <h6 class="fw-bold mb-0">{{ isQuotaError ? 'Daily Limit Reached' : 'Brewing Error' }}</h6>
            <p class="mb-0 small opacity-75">{{ errorMessage }}</p>
        </div>
    </div>

    <form @submit.prevent="submitForm" class="d-flex flex-column gap-3">
      <div class="card card-dark p-3 p-md-4 shadow-sm border-subtle">
        <div class="d-flex align-items-center mb-3">
          <i class="fa-brands fa-readme text-accent fs-5 me-2"></i>
          <h6 class="fw-bold mb-0 text-white">Coffee Information</h6>
        </div>

        <div class="row g-3 align-items-end">
          <div class="col-md-4 col-xl-3">
            <label class="form-label text-muted-custom small fw-semibold">Coffee Origin</label>
            <input type="text" class="form-control" v-model="formData.origin" placeholder="e.g., Ethiopia Yirgacheffe" required :disabled="isLoading">
          </div>
          <div class="col-md-4 col-xl-3">
            <label class="form-label text-muted-custom small fw-semibold">Roast Level</label>
            <select class="form-select" v-model="formData.roastLevel" :disabled="isLoading">
              <option>Light</option><option>Medium</option><option>Dark</option>
            </select>
          </div>
          <div class="col-md-4 col-xl-3">
            <label class="form-label text-muted-custom small fw-semibold">Process</label>
            <select class="form-select" v-model="formData.process" :disabled="isLoading">
              <option>Washed</option><option>Natural</option><option>Honey</option><option>Anaerobic</option>
            </select>
          </div>
          <div class="col-md-12 col-xl-3 mt-3 mt-xl-0">
            <label class="form-label text-muted-custom small fw-semibold d-flex justify-content-between">
              Dose <span class="fw-normal opacity-50">(10-40g)</span>
            </label>
            <div class="stepper-container d-flex align-items-center justify-content-between p-1 rounded-2">
              <button type="button" class="btn btn-stepper" @click="decrementDose"><i class="fa-solid fa-minus"></i></button>
              <input type="number" class="form-control border-0 text-center text-white fw-bold bg-transparent p-0 dose-input" v-model="formData.coffeeWeight" :disabled="isLoading">
              <button type="button" class="btn btn-stepper" @click="incrementDose"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-lg-5">
          <div class="card card-dark p-3 p-md-4 shadow-sm h-100 border-subtle">
            <div class="d-flex align-items-center mb-3">
              <i class="fa-solid fa-glass-water text-accent fs-5 me-2"></i>
              <h6 class="fw-bold mb-0 text-white">Brewing Method</h6>
            </div>
            <div class="row g-2">
              <div class="col-sm-6 col-lg-12">
                <div class="option-card px-3 py-2 d-flex align-items-center gap-3" :class="{ active: formData.method === 'Hot V60' }" @click="!isLoading && (formData.method = 'Hot V60')">
                  <i class="fa-solid fa-fire fs-4" :class="formData.method === 'Hot V60' ? 'text-accent' : 'text-muted-custom'"></i>
                  <div><strong class="d-block text-white small">Hot V60</strong><div class="text-muted-custom small" style="font-size: 0.75rem;">Classic pour-over.</div></div>
                </div>
              </div>
              <div class="col-sm-6 col-lg-12">
                <div class="option-card px-3 py-2 d-flex align-items-center gap-3" :class="{ active: formData.method === 'Japanese Iced Coffee' }" @click="!isLoading && (formData.method = 'Japanese Iced Coffee')">
                  <i class="fa-regular fa-snowflake fs-4" :class="formData.method === 'Japanese Iced Coffee' ? 'text-accent' : 'text-muted-custom'"></i>
                  <div><strong class="d-block text-white small">Japanese Iced</strong><div class="text-muted-custom small" style="font-size: 0.75rem;">Brewed over ice.</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card card-dark p-3 p-md-4 shadow-sm h-100 border-subtle">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="d-flex align-items-center">
                <i class="fa-solid fa-bullseye text-accent fs-5 me-2"></i>
                <h6 class="fw-bold mb-0 text-white">Target Taste</h6>
              </div>
            </div>
            <div class="row g-2 h-100">
              <div v-for="profile in ['Bright & Fruity', 'Balanced', 'Bold & Strong']" :key="profile" class="col-4">
                <div class="option-card text-center d-flex flex-column align-items-center justify-content-center p-3 h-100" :class="{ active: formData.tasteProfile === profile }" @click="!isLoading && (formData.tasteProfile = profile)">
                  <i :class="['fa-solid fs-3 mb-2', profile === 'Bright & Fruity' ? 'fa-lemon' : profile === 'Balanced' ? 'fa-scale-balanced' : 'fa-dumbbell', formData.tasteProfile === profile ? 'text-accent' : 'text-muted-custom']"></i>
                  <strong class="text-white d-block small mb-1">{{ profile }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-2 mt-1">
        <div class="col-md-9">
          <button type="submit" class="btn btn-primary-custom w-100 fs-6 py-2 shadow" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            <i class="fa-solid fa-wand-magic-sparkles me-2" v-if="!isLoading"></i>
            {{ isLoading ? 'AI is Crafting...' : 'Generate Recipe' }}
          </button>
        </div>
        <div class="col-md-3">
          <button type="button" class="btn btn-outline-secondary w-100 py-2 text-white border-subtle d-flex justify-content-center align-items-center h-100" @click="quickBrew" :disabled="isLoading">
            <i class="fa-solid fa-bolt me-2"></i> Quick Brew
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.card-dark { background-color: #1A1A1D !important; border: 1px solid #2A2A2E !important; border-radius: 12px !important; }
.border-subtle { border-color: #2A2A2E !important; }
.form-control, .form-select { background-color: #121214 !important; border: 1px solid #2A2A2E !important; color: #F5F5F5 !important; }
.form-control:focus, .form-select:focus { border-color: #C47A2C !important; box-shadow: 0 0 0 2px rgba(196, 122, 44, 0.2) !important; background-color: #121214 !important; color: #fff !important; }
.option-card { background-color: #121214; border: 1px solid #2A2A2E; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; }
.option-card:hover { border-color: rgba(196, 122, 44, 0.5); }
.option-card.active { border-color: #C47A2C; background: rgba(196, 122, 44, 0.05); }
.stepper-container { background-color: #121214; border: 1px solid #2A2A2E; }
.btn-stepper { width: 32px; height: 32px; color: #F5F5F5; border: none; background: transparent; }
.btn-stepper:hover { color: #C47A2C; }
.dose-input { width: 50px; outline: none !important; box-shadow: none !important; -moz-appearance: textfield; }
.dose-input::-webkit-outer-spin-button, .dose-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.btn-primary-custom { background: linear-gradient(135deg, #C47A2C, #E89B4A); border: none; border-radius: 10px; font-weight: 600; color: #1A1A1D; transition: all 0.3s ease; }
.btn-primary-custom:hover:not(:disabled) { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(196, 122, 44, 0.4); }
.btn-primary-custom:disabled { background: #2A2A2E; color: #A1A1AA !important; }
.text-muted-custom { color: #A1A1AA !important; }
.text-accent { color: #C47A2C !important; }
</style>