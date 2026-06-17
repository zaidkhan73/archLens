chrome.runtime.onInstalled.addListener(() => {
  console.log('[Website X-Ray] Extension installed.')
})

chrome.runtime.onStartup.addListener(() => {
  console.log('[Website X-Ray] Browser started.')
})