import { useRegisterSW } from 'virtual:pwa-register/react'

function PWABadge() {
  // Periodic sync is not enabled in this demo
  const period = 60 * 60 * 1000 // 1 hour
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl: string, r: any) {
      console.log(`Service Worker at: ${swUrl}`)
      if (period <= 0) return
      setInterval(async () => {
        if (!(!r.installing && r.waiting)) return
        const { state } = await r.getRegistration()
        if (state === 'activated') {
          // Periodic sync is not enabled in this demo
          console.log('Periodic sync triggered')
        }
      }, period)
    },
    onRegisterError(error: any) {
      console.error('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  if (offlineReady || needRefresh) {
    return (
      <div className="pwa-toast">
        <div className="pwa-toast-message">
          {offlineReady ? (
            <span className="pwa-toast-text">App ready to work offline</span>
          ) : (
            <div className="pwa-toast-content">
              <span className="pwa-toast-text">New content available, click on reload button to update.</span>
            </div>
          )}
        </div>
        {needRefresh && (
          <button
            className="pwa-toast-button"
            onClick={() => updateServiceWorker(true)}
          >
            Reload
          </button>
        )}
        <button
          className="pwa-toast-button pwa-toast-close"
          onClick={close}
        >
          Close
        </button>
      </div>
    )
  }
  return null
}

export default PWABadge