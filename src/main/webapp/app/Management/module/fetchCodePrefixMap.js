let codePrefixMap
export default function fetchCodePrefixMap() {
  if (codePrefixMap) {
    return Promise.resolve(codePrefixMap)
  }
  return fetch('./app/Management/data/codePrefixMap.json')
    .then((data) => data.json())
    .then((data) => {
      codePrefixMap = data
      return data
    })
    .catch((err) => console.warn("Error: can't fetch codePrefixMap", err))
}
