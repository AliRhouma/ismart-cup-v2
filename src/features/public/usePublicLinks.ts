import { useLocation, useParams } from "react-router-dom"

/**
 * Internal links for the public surface. Builds `{pathname, search}` targets so
 * the ?state= preview param rides along across every navigation (tabs, match &
 * team detail). Works from any public route — reads :slug + the current search.
 */
export function usePublicLinks() {
  const { slug } = useParams()
  const { search } = useLocation()
  const base = `/t/${slug}`
  return {
    search,
    tab: (seg: string) => ({ pathname: seg ? `${base}/${seg}` : base, search }),
    match: (id: string) => ({ pathname: `${base}/match/${id}`, search }),
    team: (id: string) => ({ pathname: `${base}/team/${id}`, search }),
    home: { pathname: base, search },
  }
}
