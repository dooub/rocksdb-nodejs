const test = require('tape')
const testCommon = require('./common')

var db

const cfKey = 'test_cf'

test('setUp common for column families', testCommon.setUp)

test('setUp db', function (t) {
  db = testCommon.factory()
  db.open(t.end.bind(t))
})

test('column family creation test', function (t) {
  db.createColumnFamily(cfKey, (err) => {
    t.error(err)
    t.end()
  })
})

test('column family put test', function (t) {
  db.putWithColumnFamily(cfKey, 'testkey', 'awesomevalue', (err) => {
    t.error(err)
    t.end()
  })
})

test('column family get test', function (t) {
  db.getWithColumnFamily(cfKey, 'testkey', { asBuffer: false }, (err, value) => {
    t.error(err)
    t.equal(value, 'awesomevalue', 'value matches')
    t.end()
  })
})

test('column family del test', function (t) {
  db.delWithColumnFamily(cfKey, 'testkey', (err) => {
    t.error(err)
    t.end()
  })
})

test('column family deleted get test', function (t) {
  db.getWithColumnFamily(cfKey, 'testkey', { asBuffer: false }, (err, value) => {
    t.error(!err)
    t.equal(value, undefined, 'value undefined')
    t.end()
  })
})

test('column family batched put test', function (t) {
  var batch = db.batch()
  batch.putWithColumnFamily(cfKey, 'a', 1)
  batch.putWithColumnFamily(cfKey, 'b', 1)
  batch.putWithColumnFamily(cfKey, 'c', 1)
  batch.putWithColumnFamily(cfKey, 'd', 1)
  batch.putWithColumnFamily(cfKey, 'e', 1)
  batch.putWithColumnFamily(cfKey, 'f', 1)
  batch.putWithColumnFamily(cfKey, 'g', 1)
  batch.write(function (err) {
    t.error(err)
    t.end()
  })
})

test('column family iterator test', function (t) {
  var ite = db.iterator({ columnFamily: cfKey })
  ite.next(function (err, key, value) {
    t.ifError(err, 'no error from next()')
    t.equal(key.toString(), 'a', 'key matches')
    t.equal(ite.cache.length, 0, 'no cache')
    ite.next(function (err, key, value) {
      t.ifError(err, 'no error from next()')
      t.equal(key.toString(), 'b', 'key matches')
      t.ok(ite.cache.length > 0, 'has cached items')
      ite.seek('d')
      t.notOk(ite.cache, 'cache is removed')
      ite.next(function (err, key, value) {
        t.ifError(err, 'no error from next()')
        t.equal(key.toString(), 'd', 'key matches')
        t.equal(ite.cache.length, 0, 'no cache')
        ite.next(function (err, key, value) {
          t.ifError(err, 'no error from next()')
          t.equal(key.toString(), 'e', 'key matches')
          t.ok(ite.cache.length > 0, 'has cached items')
          ite.end(() => {
            t.end()
          })
        })
      })
    })
  })
})

test('column family drop test', function (t) {
  db.dropColumnFamily(cfKey, (err) => {
    t.error(err)
    t.end()
  })
})

test('tearDown', function (t) {
  db.close(testCommon.tearDown.bind(null, t))
})
