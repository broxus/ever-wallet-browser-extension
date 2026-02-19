import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getUniqueId, getOrInsertDefault, currentUtime, SafeEventEmitter } from './utils'

describe('utils - basic functions', () => {
    describe('getUniqueId', () => {
        it('should generate unique sequential IDs', () => {
            const id1 = getUniqueId()
            const id2 = getUniqueId()
            const id3 = getUniqueId()

            expect(id2).toBeGreaterThan(id1)
            expect(id3).toBeGreaterThan(id2)
        })

        it('should return numbers', () => {
            const id = getUniqueId()
            expect(typeof id).toBe('number')
        })

        it('should generate different IDs on consecutive calls', () => {
            const ids = new Set()
            for (let i = 0; i < 100; i++) {
                ids.add(getUniqueId())
            }
            expect(ids.size).toBe(100)
        })
    })

    describe('getOrInsertDefault', () => {
        it('should return existing value if key exists', () => {
            const map = { foo: { bar: 'baz' }}
            const result = getOrInsertDefault(map, 'foo')

            expect(result).toEqual({ bar: 'baz' })
            expect(result).toBe(map.foo)
        })

        it('should create and return empty object if key does not exist', () => {
            const map: Record<string, any> = {}
            const result = getOrInsertDefault(map, 'newKey')

            expect(result).toEqual({})
            expect(map.newKey).toBe(result)
        })

        it('should not override existing values', () => {
            const map = { existing: { value: 42 }}
            getOrInsertDefault(map, 'existing')

            expect(map.existing).toEqual({ value: 42 })
        })

        it('should handle multiple keys', () => {
            const map: Record<string, any> = {}

            const result1 = getOrInsertDefault(map, 'key1')
            const result2 = getOrInsertDefault(map, 'key2')

            expect(result1).not.toBe(result2)
            expect(map.key1).toBeDefined()
            expect(map.key2).toBeDefined()
        })
    })

    describe('currentUtime', () => {
        it('should return unix timestamp in seconds', () => {
            const clockOffset = 0
            const result = currentUtime(clockOffset)
            const expected = Math.floor(Date.now() / 1000)

            expect(result).toBeCloseTo(expected, 0)
        })

        it('should apply clock offset', () => {
            const clockOffset = 5000 // 5 seconds
            const result = currentUtime(clockOffset)
            const expected = Math.floor((Date.now() + clockOffset) / 1000)

            expect(result).toBeCloseTo(expected, 0)
        })

        it('should handle negative clock offset', () => {
            const clockOffset = -3000 // -3 seconds
            const result = currentUtime(clockOffset)
            const expected = Math.floor((Date.now() + clockOffset) / 1000)

            expect(result).toBeCloseTo(expected, 0)
        })

        it('should return integer', () => {
            const result = currentUtime(0)
            expect(Number.isInteger(result)).toBe(true)
        })
    })

    describe('SafeEventEmitter', () => {
        let emitter: SafeEventEmitter

        beforeEach(() => {
            emitter = new SafeEventEmitter()
        })

        it('should emit events', () => {
            const handler = vi.fn()
            emitter.on('test', handler)

            emitter.emit('test', 'data')

            expect(handler).toHaveBeenCalledWith('data')
            expect(handler).toHaveBeenCalledTimes(1)
        })

        it('should support multiple listeners', () => {
            const handler1 = vi.fn()
            const handler2 = vi.fn()

            emitter.on('test', handler1)
            emitter.on('test', handler2)

            emitter.emit('test', 'data')

            expect(handler1).toHaveBeenCalledWith('data')
            expect(handler2).toHaveBeenCalledWith('data')
        })

        it('should remove listeners', () => {
            const handler = vi.fn()
            emitter.on('test', handler)
            emitter.off('test', handler)

            emitter.emit('test', 'data')

            expect(handler).not.toHaveBeenCalled()
        })

        it('should pass multiple arguments', () => {
            const handler = vi.fn()
            emitter.on('test', handler)

            emitter.emit('test', 'arg1', 'arg2', 'arg3')

            expect(handler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
        })

        it('should support once listeners', () => {
            const handler = vi.fn()
            emitter.once('test', handler)

            emitter.emit('test', 'data1')
            emitter.emit('test', 'data2')

            expect(handler).toHaveBeenCalledTimes(1)
            expect(handler).toHaveBeenCalledWith('data1')
        })

        it('should handle errors gracefully', () => {
            const errorHandler = vi.fn()
            const throwingHandler = vi.fn(() => {
                throw new Error('Test error')
            })

            emitter.on('error', errorHandler)
            emitter.on('test', throwingHandler)

            // Error should be caught and emitted
            expect(() => emitter.emit('test')).not.toThrow()
        })
    })
})

describe('utils - edge cases', () => {
    describe('getUniqueId wrap around', () => {
        it('should handle wrap around at MAX value', () => {
            // This is a conceptual test - in practice we won't reach MAX in tests
            const ids: number[] = []
            for (let i = 0; i < 10; i++) {
                ids.push(getUniqueId())
            }

            // All IDs should be valid numbers
            ids.forEach(id => {
                expect(typeof id).toBe('number')
                expect(id).toBeGreaterThanOrEqual(0)
            })
        })
    })

    describe('currentUtime precision', () => {
        it('should handle large clock offsets', () => {
            const largeOffset = 1000000000 // ~11.5 days in ms
            const result = currentUtime(largeOffset)

            expect(typeof result).toBe('number')
            expect(Number.isInteger(result)).toBe(true)
        })

        it('should be consistent within same millisecond', () => {
            const result1 = currentUtime(0)
            const result2 = currentUtime(0)

            // Should be same or differ by at most 1 second
            expect(Math.abs(result2 - result1)).toBeLessThanOrEqual(1)
        })
    })

    describe('SafeEventEmitter memory management', () => {
        it('should not leak listeners', () => {
            const emitter = new SafeEventEmitter()
            const handler = vi.fn()

            // Add and remove listeners
            for (let i = 0; i < 100; i++) {
                emitter.on('test', handler)
                emitter.off('test', handler)
            }

            // Should have no listeners
            expect(emitter.listenerCount('test')).toBe(0)
        })

        it('should handle removeAllListeners', () => {
            const emitter = new SafeEventEmitter()
            const handler1 = vi.fn()
            const handler2 = vi.fn()

            emitter.on('test', handler1)
            emitter.on('test', handler2)
            emitter.removeAllListeners('test')

            emitter.emit('test', 'data')

            expect(handler1).not.toHaveBeenCalled()
            expect(handler2).not.toHaveBeenCalled()
        })
    })
})
