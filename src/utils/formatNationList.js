// Oxford-comma list grammar. Needed by the snapshot charts, where any number of
// nations can be missing the same moment -- unlike the comparison views, which
// never exceed "A and B".
export function formatNationList(names) {
  if (names.length <= 1) return names.join('')
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}
