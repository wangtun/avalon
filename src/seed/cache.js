
/*
 https://github.com/rsms/js-lru
 entry             entry             entry             entry        
 ______            ______            ______            ______       
 | head |.newer => |      |.newer => |      |.newer => | tail |      
 |  A   |          |  B   |          |  C   |          |  D   |      
 |______| <= older.|______| <= older.|______| <= older.|______|      
 
 removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added 
 */
function LRU(maxLength) {
    // 标识当前缓存数组的大小
    this.size = 0
    // 标识缓存数组能达到的最大长度
    this.limit = maxLength
    //  head（最不常用的项），tail（最常用的项）全部初始化为undefined

    this.head = this.tail = void 0
    this._keymap = {}
}

var p = LRU.prototype

p.put = function (key, value) {
    var removed

    var entry = this.get(key, true)
    // 如果不存在 key 这样属性的缓存对象，才能调用 put 方法
    if (!entry) {
        if (this.size === this.limit) {
            // 如果缓存数组达到上限，则先删除 head 指向的缓存对象
            removed = this.shift()
        }
        // 初始化赋值
        entry = {
            key: key
        }
        this._keymap[key] = entry
        if (this.tail) {
            // 如果存在tail（缓存数组的长度不为0），将tail指向新的 entry
            this.tail.newer = entry
            entry.older = this.tail
        } else {
            // 如果缓存数组的长度为0，将head指向新的entry
            this.head = entry
        }
        this.tail = entry
        this.size++
    }
    entry.value = value

    return removed
}

p.shift = function () {
    var entry = this.head
    if (entry) {
        // 删除 head ，并改变指向
        this.head = this.head.newer
        this.head.older = undefined
        entry.newer = entry.older = undefined
        // 同步更新 _keymap 里面的属性值
        this._keymap[entry.key] = undefined
        // 同步更新 缓存数组的长度
        this.size--
    }
    return entry
}
p.get = function (key) {
    var entry = this._keymap[key]
    // 如果查找不到含有`key`这个属性的缓存对象
    if (entry === undefined)
        return
    // 如果查找到的缓存对象已经是 tail (最近使用过的)
    if (entry === this.tail) {
        return entry.value
    }
    // HEAD--------------TAIL
    //   <.older   .newer>
    //  <--- add direction --
    //   A  B  C  <D>  E
    if (entry.newer) {
        // 处理 newer 指向
        if (entry === this.head) {
            // 如果查找到的缓存对象是 head (最近最少使用过的)
            // 则将 head 指向原 head 的 newer 所指向的缓存对象
            this.head = entry.newer
        }
        // 将所查找的缓存对象的下一级的 older 指向所查找的缓存对象的older所指向的值
        // 例如：A B C D E
        // 如果查找到的是D，那么将E指向C，不再指向D
        entry.newer.older = entry.older // C <-- E.
    }
    if (entry.older) {
        // 处理 older 指向
        // 如果查找到的是D，那么C指向E，不再指向D
        entry.older.newer = entry.newer // C. --> E
    }
    // 处理所查找到的对象的 newer 以及 older 指向
    entry.newer = undefined // D --x
    // older指向之前使用过的变量，即D指向E
    entry.older = this.tail // D. --> E
    if (this.tail) {
        // 将E的newer指向D
        this.tail.newer = entry // E. <-- D
    }
    // 改变 tail 为D 
    this.tail = entry
    return entry.value
}

module.exports = LRU
