// Page registry. Ids, names and demo order come from ../pages.json (the team file).
// Order here is the demo route: 09 Trips is last because it is off the route.
import pagesJson from '../../pages.json'

export type PageMeta = { id: string; name: string; designer: string; num: string }

const DEMO_ORDER = ['01','02','03','04','05','06','07','08','10','11','12','13','14','15','16','17','18','09']
export const pages: PageMeta[] = DEMO_ORDER.map((num) => {
  const p = pagesJson.pages.find((x: { id: string }) => x.id.startsWith(num + '-'))!
  return { ...p, num }
})
export const routeFor = (id: string) => '/' + id
