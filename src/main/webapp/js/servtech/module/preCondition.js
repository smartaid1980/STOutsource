async function preCondition(obj = {}) {
  const nameArr = Object.keys(obj)
  const fnArr = Object.values(obj)
  const resultArr = await Promise.all(
    fnArr.map((fn) => new Promise((res) => fn(res)))
  )

  return Object.fromEntries(nameArr.map((name, i) => [name, resultArr[i]]))
}

export default preCondition
