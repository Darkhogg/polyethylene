import PolySyncIterable, {IterablePolySyncIterable, baseImpls} from './poly-sync-iterable.ts'

import FilterSyncIterable from './filter-sync-iterable.ts'
import MapSyncIterable from './map-sync-iterable.ts'

baseImpls.map = MapSyncIterable.create
baseImpls.filter = FilterSyncIterable.create

export {PolySyncIterable, IterablePolySyncIterable}
