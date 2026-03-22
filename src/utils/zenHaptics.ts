/** Zen haptics - subtle selection pulse and impact on collisions */
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

let supported = false
try {
  supported = Capacitor?.isNativePlatform?.() === true
} catch {
  supported = false
}

export async function selectionPulse(): Promise<void> {
  if (!supported) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // ignore
  }
}

export async function impactLight(): Promise<void> {
  if (!supported) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // ignore
  }
}

/** Success notification - for treasure reveal */
export async function notificationSuccess(): Promise<void> {
  if (!supported) return
  try {
    await Haptics.notification({ type: NotificationType.Success })
  } catch {
    // ignore
  }
}

/** Double pulse for mission success - "Golden Ripple" feel */
export async function successPulse(): Promise<void> {
  if (!supported) return
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
    await new Promise((r) => setTimeout(r, 80))
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // ignore
  }
}
