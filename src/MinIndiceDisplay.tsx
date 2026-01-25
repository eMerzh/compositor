import { Text, Tooltip } from "@mantine/core"
import { IconMoodSad, IconMoodSmile } from "@tabler/icons-react"
import { School } from "./compute"
import { round } from "./utils"

const THIS_YEAR = 2025

const getMinIndice = (school: School): { value: number; year: number } | null => {
  if (!school.fill) return null
  const years = Object.keys(school.fill)
    .map(Number)
    .sort((a, b) => b - a)
  for (const year of years) {
    if (school.fill[year]?.min_indice !== undefined) {
      return { value: school.fill[year].min_indice, year }
    }
  }
  return null
}

interface MinIndiceDisplayProps {
  school: School
  currentScore?: number
  withYear: boolean
}

const MinIndiceDisplay = ({ school, currentScore, withYear }: MinIndiceDisplayProps) => {
  const minIndice = getMinIndice(school)
  const fillLevel = school.fill?.[THIS_YEAR]?.fill_number
  const isNotFull = fillLevel !== undefined && fillLevel !== 1
  const url = new URL(window.location.href)

  if (!url.searchParams.has("score")) {
    return null
  }
  if (school.is_incomplete) {
    return (
      <Tooltip label="École présumée incomplète en 2026">
        <Text fz="xs" fw={500} c="green" span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconMoodSmile size={14} />
          non remplie
        </Text>
      </Tooltip>
    )
  }
  // If no min_indice, check fill level
  if (!minIndice) {
    if (isNotFull) {
      return (
        <Tooltip label="École non remplie en 2025 - bonnes chances">
          <Text fz="xs" fw={500} c="lime.2" span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <IconMoodSmile size={14} />
            non remplie?
          </Text>
        </Tooltip>
      )
    }
    return null
  }

  // We have a min_indice
  const isOld = minIndice.year < THIS_YEAR
  const hasScore = currentScore !== undefined
  const isAboveMin = hasScore && currentScore >= minIndice.value
  const isBelowMin = hasScore && currentScore < minIndice.value

  let color = isOld ? "dimmed" : "blue"
  if (isAboveMin || isNotFull) color = "green"
  if (isBelowMin && !isNotFull) color = "red"

  return (
    <Tooltip label={`Score minimum requis en ${minIndice.year}`}>
      <Text fz="xs" fw={500} c={color} span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {(isAboveMin || isNotFull) && <IconMoodSmile size={14} />}
        {isBelowMin && !isNotFull && <IconMoodSad size={14} />}
        min: {round(minIndice.value, 2)}
        {withYear && isOld && ` (${minIndice.year})`}
      </Text>
    </Tooltip>
  )
}

export default MinIndiceDisplay
