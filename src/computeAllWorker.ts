import { computeAll, UnexistingSchool } from "./compute"

// Listen for messages from the main thread
self.onmessage = (e: MessageEvent) => {
  const {
    secondarySchools,
    primarySchool,
    locHome,
    locInscription,
    date,
    immersion,
    inscriptionSecondaryYear,
    ise,
    score2026,
  } = e.data

  try {
    console.time("computeAll (worker)")
    const results = computeAll(
      secondarySchools,
      primarySchool,
      locHome,
      locInscription,
      date,
      immersion,
      inscriptionSecondaryYear,
      ise,
      score2026,
    )
    console.timeEnd("computeAll (worker)")

    // Send the result back to the main thread
    self.postMessage({ success: true, data: results })
  } catch (error) {
    if (error instanceof UnexistingSchool) {
      self.postMessage({ success: false, error: error.message, isUnexistingSchool: true })
    } else {
      self.postMessage({ success: false, error: error.message })
    }
  }
}
