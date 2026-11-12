import PolySyncIterable, {IterablePolySyncIterable, baseImpls} from './poly-sync-iterable.js'

import FilterSyncIterable from './filter-sync-iterable.js'
import MapSyncIterable from './map-sync-iterable.js'

baseImpls.map = MapSyncIterable.create
baseImpls.filter = FilterSyncIterable.create

export {PolySyncIterable, IterablePolySyncIterable}
