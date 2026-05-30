import { track } from '@vercel/analytics'

/*
 * useTrack — événements de conversion à tracker
 *
 * Vercel Analytics enregistre ces events dans le dashboard.
 * Pour les voir : Vercel Dashboard → Projet → Analytics → Events
 *
 * Événements clés (objectif : abonnements + ventes accompagnements)
 */
export const EVENTS = {
  // ── Funnel quiz / onboarding ──────────────────
  QUIZ_STARTED:    'quiz_started',          // ouverture du quiz
  QUIZ_COMPLETED:  'quiz_completed',        // quiz terminé → profil créé
  QUIZ_SKIPPED:    'quiz_skipped',          // quiz ignoré

  // ── Funnel Premium ────────────────────────────
  PAYWALL_OPENED:  'paywall_opened',        // modal Premium affiché
  PREMIUM_CLICK:   'premium_cta_clicked',   // clic sur "Découvrir Premium"
  PREMIUM_STRIPE:  'premium_stripe_opened', // redirection vers Stripe Premium

  // ── Funnel accompagnements ────────────────────
  ACCOMP_OPENED:   'accompagnement_opened',   // page accompagnements vue
  ACCOMP_CLICK:    'accompagnement_clicked',  // clic CTA offre (Éclaireur, Cap…)
  ECLAIREUR_CLICK: 'eclaireur_stripe_opened', // Stripe Audit Éclaireur 290€
  CAP_CLICK:       'cap_stripe_opened',       // Stripe Cap Majorque 249€
  INTEGRALE_CLICK: 'integrale_stripe_opened', // Stripe Intégrale 449€

  // ── Guides ────────────────────────────────────
  GUIDE_OPENED:    'guide_opened',           // guide ouvert
  GUIDE_SAVED:     'guide_saved',            // guide sauvegardé
  GUIDE_BOUGHT:    'guide_purchased',        // achat guide lifestyle 4,90€

  // ── Simulateurs ───────────────────────────────
  SIMULATOR_USED:  'simulator_used',         // simulateur lancé

  // ── Engagement ────────────────────────────────
  COCKPIT_OPENED:  'cockpit_opened',         // cockpit ouvert
  STEP_CHECKED:    'cockpit_step_checked',   // étape cochée dans le cockpit
}

export function useTrack() {
  function trackEvent(eventName, properties = {}) {
    try {
      track(eventName, properties)
    } catch (_) {
      // Silencieux — ne jamais bloquer l'UX pour un event analytics
    }
  }
  return { track: trackEvent, EVENTS }
}
