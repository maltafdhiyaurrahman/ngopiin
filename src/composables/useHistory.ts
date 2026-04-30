import { ref } from 'vue'

const HISTORY_KEY = 'ngopiin_recipe_history'

export function useHistory() {
  const history = ref<any[]>([])

  // Load data dari localStorage pas app dibuka
  const loadHistory = () => {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
      history.value = JSON.parse(saved)
    }
  }

  // Simpan resep baru (Max 10 resep terakhir biar rapi)
  const saveRecipe = (recipe: any) => {
    // Tambahin tanggal otomatis
    const recipeWithDate = { ...recipe, savedAt: new Date().toLocaleString() }
    
    history.value.unshift(recipeWithDate) // Masukin ke urutan paling atas
    if (history.value.length > 10) history.value.pop() // Buang yang paling lama kalau > 10
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  }

  const clearHistory = () => {
    history.value = []
    localStorage.removeItem(HISTORY_KEY)
  }

  return { history, loadHistory, saveRecipe, clearHistory }
}