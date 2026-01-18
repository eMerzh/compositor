import { getScoreGrid } from "./compute"

// Listen for messages from the main thread
self.onmessage = (e: MessageEvent) => {
  const {
    school,
    primarySchool,
    locHome,
    locInscription,
    date,
    immersion,
    inscriptionSecondaryDate,
    ise,
    score2026,
    factor,
    numberPoint,
  } = e.data

  try {
    console.time("getScoreGrid (worker)")
    const grid = getScoreGrid(
      school,
      primarySchool,
      locHome,
      locInscription,
      date,
      immersion,
      inscriptionSecondaryDate,
      ise,
      score2026,
      factor,
      numberPoint,
    )
    console.timeEnd("getScoreGrid (worker)")

    // Send the result back to the main thread
    self.postMessage({ success: true, data: grid })
  } catch (error) {
    self.postMessage({ success: false, error: error.message })
  }
}
