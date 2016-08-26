var hypercore = require('hypercore')
var hyperdrive = require('hyperdrive')
var swarm = require('hyperdrive-archive-swarm')
var memdb = require('memdb')

module.exports = mirror

function mirror (link, opts, cb) {
  if (!cb) return mirror(link, {}, opts)
  if (!opts) opts = {}

  var sw
  var swarmOpts = {}
  if (opts.webrtc) swarmOpts.wrtc = require('electron-webrtc')({headless: false})

  getFeed(cb)

  function getFeed (cb) {
    var core = hypercore(memdb())
    var feed = core.createFeed(link, {sparse: true})
    sw = swarm(feed, swarmOpts)

    sw.once('connection', function () {
      console.info('Connected')
    })

    feed.open(function (err) {
      if (err) return cb(err)
      console.info('Getting Feed Information')
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
    var drive = hyperdrive(memdb())
    var archive = drive.createArchive(link)
    sw = swarm(archive, swarmOpts)
    cb(null, archive)
  }
}
