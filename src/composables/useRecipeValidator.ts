export function useRecipeValidator() {
  const validateRecipe = (data: any, expectedMethod: string) => {
    try {
      if (!data || typeof data !== 'object') return fail('Not object')
      if (!Array.isArray(data.steps)) return fail('No steps')

      const nums = ['coffeeWeight','totalWater','hotWater','iceWeight','temperature','totalTime']
      for (const f of nums) {
        if (typeof data[f] !== 'number') return fail(`${f} invalid`)
      }

      // Ratio check
      const expectedRatio = Math.round(data.totalWater / data.coffeeWeight)
      if (expectedRatio !== data.ratioValue) return fail('ratio mismatch')

      // Water total check
      if (data.hotWater + data.iceWeight !== data.totalWater)
        return fail('water mismatch')

      // Step checks
      let totalStepWater = 0
      let prev = 0

      for (const step of data.steps) {
        if (step.durationSeconds <= 0) return fail('invalid duration')
        if (step.waterAddedInThisStep <= 0) return fail('invalid water')

        totalStepWater += step.waterAddedInThisStep

        if (step.accumulatedWater <= prev) return fail('accumulated error')
        prev = step.accumulatedWater
      }

      if (totalStepWater !== data.hotWater)
        return fail('step water mismatch')

      if (prev !== data.hotWater)
        return fail('final water mismatch')

      const totalTimeCalc = data.steps.reduce((s: number, st: any) => s + st.durationSeconds, 0)
      if (totalTimeCalc !== data.totalTime)
        return fail('time mismatch')

      // Ice logic
      const isIced = expectedMethod.toLowerCase().includes('iced')
      if (isIced && data.iceWeight <= 0) return fail('iced no ice')
      if (!isIced && data.iceWeight > 0) return fail('hot has ice')

      return { isValid: true, error: null }

    } catch (e: any) {
      return fail(e.message)
    }
  }

  const fail = (msg: string) => ({ isValid: false, error: msg })

  return { validateRecipe }
}