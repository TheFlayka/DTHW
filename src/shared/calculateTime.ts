export function calculateTimeSpentInDock(countOfBoxes: number) {
  if (countOfBoxes < 1 || countOfBoxes > 120) {
    return 0
  }
  return countOfBoxes * 300000 + 600000
}

// 300000 ms - 5 minutes, so every box will bring about 5 minutes
// and additional 10 minutes(600000 ms) for entering and leaving dock
