<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    recipe: any
}>()

const expectedTotalTimeSeconds = computed(() => {
    if (!props.recipe || !props.recipe.steps) return 0
    return props.recipe.steps.reduce((total: number, step: any) => total + step.durationSeconds, 0)
})

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}
</script>

<template>
    <div class="recipe-summary-card p-4 rounded-4 shadow-sm mb-4" v-if="recipe">
        <div class="d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-25 pb-3 mb-3">
            <h5 class="fw-bold m-0 text-white">Recipe Target</h5>
            <span class="badge bg-dark border border-secondary border-opacity-50 text-accent font-monospace fs-6">
                {{ formatTime(expectedTotalTimeSeconds) }}
            </span>
        </div>
        
        <div v-if="recipe.expectedTaste" class="taste-note p-3 rounded-3 mb-4 small fw-semibold">
            <span class="text-white opacity-75 d-block mb-1 text-uppercase tracking-wider" style="font-size: 0.7rem;">Expected Taste</span>
            "{{ recipe.expectedTaste }}"
        </div>

        <div class="row text-center g-3">
            <div class="col-3">
                <div class="text-muted small mb-1">Dose</div>
                <div class="fw-bold fs-5 text-white">{{ recipe.coffeeWeight }}<span class="fs-6 text-muted">g</span></div>
            </div>
            <div class="col-3 border-start border-secondary border-opacity-25">
                <div class="text-muted small mb-1">Ratio</div>
                <div class="fw-bold fs-5 text-accent">{{ recipe.ratio }}</div>
            </div>
            <div class="col-3 border-start border-secondary border-opacity-25">
                <div class="text-muted small mb-1">Temp</div>
                <div class="fw-bold fs-5 text-white">{{ recipe.temperature }}<span class="fs-6 text-muted">°C</span></div>
            </div>
            <div class="col-3 border-start border-secondary border-opacity-25">
                <div class="text-muted small mb-1">Water</div>
                <div class="fw-bold fs-5 text-white">{{ recipe.totalWater }}<span class="fs-6 text-muted">g</span></div>
            </div>
        </div>

        <div v-if="recipe.iceWeight > 0" class="mt-4 p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded-3 text-info text-center small">
            <strong>🧊 Iced Method:</strong> Put <strong>{{ recipe.iceWeight }}g</strong> of ice in the server. Pour with <strong>{{ recipe.hotWater }}g</strong> hot water.
        </div>
    </div>
</template>

<style scoped>
.recipe-summary-card {
    background-color: #1F1F23;
    border: 1px solid var(--border-subtle);
}
.taste-note {
    background-color: var(--accent-soft);
    border-left: 4px solid var(--accent-coffee);
    color: var(--accent-hover);
}
.text-accent {
    color: var(--accent-coffee);
}
.tracking-wider { letter-spacing: 0.1em; }
</style>