var hypercore = require('hypercore')
var hyperdrive = require('hyperdrive')
var swarm = require('hyperdrive-archive-swarm')
var Dat = require('dat-js')
var debug = require('debug')('hypermirror')

module.exports = mirror

function mirror (link, opts, cb) {
  if (!cb) return mirror(link, {}, opts)
  if (!opts) opts = {}

  var persist = !(opts.persist === false)
  if (persist) var dir = opts.dir || process.cwd()
  var db = opts.db ? opts.db : require('memdb')() // todo: hookup opts.db
  var sw
  var swarmOpts = {}
  if (opts.webrtc) swarmOpts.wrtc = require('electron-webrtc')({headless: false})

  getFeed(cb)

  function getFeed (cb) {
    var core = hypercore(db)
    var feed = core.createFeed(link, {sparse: true})
    sw = swarm(feed, swarmOpts)

    sw.once('connection', function () {
      debug('Connection', 'Peers:', sw.connections)
    })

    feed.open(function (err) {
      if (err) return cb(err)
      debug('Getting Feed Information')
      feed.get(0, function (err, buf) {
        if (err) return cb(err)

        var indexBlock = feed.live ? 0 : feed.blocks - 1 // True for hypercore feeds too?
        feed.get(indexBlock, function (err, buf) {
          if (err) return cb(err)

          var type = buf[0]
          if (type !== 0) {
            feed.prioritize({priority: 0, start: 0, end: Infinity})
            return cb(null, feed)
          }
          sw.close(function () {
            // could i keep swarm connected? will keep discovery time lower.
            feed.close(function () {
              getArchive(cb)
            })
          })
        })
      })
    })
  }

  function getArchive (cb) {
    var archive
    if (!persist) {
      var drive = hyperdrive(db)
      archive = drive.createArchive(link)
      sw = swarm(archive, swarmOpts)
      return cb(null, archive)
    } else {
      debug('Persisting with Dat to:', dir)
      var dat = Dat({webrtc: swarmOpts.wrtc, dir: dir, key: link})
      dat.open(function (err) {
        if (err) return cb(err)
        dat.download()
        cb(null, dat.archive)
      })
    }
  }
}
