// var hypercore = require('hypercore')
const hyperdrive = require('hyperdrive')
const swarm = require('hyperdiscovery')
const signalhub = require('signalhub')
const WebrtcSwarm = require('webrtc-swarm')
const pump = require('pump')
const debug = require('debug')('hypermirror')

module.exports = mirror

function mirror (link, opts, cb) {
  if (!cb) return mirror(link, {}, opts)
  if (!opts) opts = {}

  var db = opts.db ? opts.db : require('random-access-memory') // todo: hookup opts.db
  // var persist = !(opts.persist === false)
  // if (persist) var dir = opts.dir || process.cwd()

  getArchive(cb)

  function getArchive (cb) {
    var archive = hyperdrive(db, link, { sparse: true })
    archive.on('ready', () => {
      if (opts.webrtc) {
        webRtcSwarm()
      } else {
        swarm(archive)
      }

      archive.metadata.update(() => {
        // why only work if webrtc connects fist?
        if (opts.webrtc) swarm(archive)
        cb(null, archive)
      })
    })

    function webRtcSwarm () {
      var swarmKey = archive.discoveryKey.toString('hex').slice(40)
      var webSwarm = new WebrtcSwarm(signalhub(swarmKey, ['https://signalhub-jccqtwhdwc.now.sh/', 'http://gateway.mauve.moe:3300']), {
        wrtc: require('wrtc')
      })

      webSwarm.on('peer', function (conn, info) {
        debug('Webrtc peer', info)
        pump(conn, archive.replicate({ live: true }), conn)
      })
    }
  }
}
