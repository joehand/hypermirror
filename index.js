const hyperdrive = require('hyperdrive')
const swarm = require('hyperdiscovery')
const signalhub = require('signalhub')
const WebrtcSwarm = require('webrtc-swarm')
const pump = require('pump')
const getDatKey = require('dat-link-resolve')
const debug = require('debug')('hypermirror')

module.exports = mirror

function mirror (link, opts, cb) {
  if (!cb) return mirror(link, {}, opts)
  if (!opts) opts = {}

  const db = opts.temp ? require('random-access-memory') : './hypermirror-data'

  getDatKey(link, (err, key) => {
    if (err) return cb(err)
    getArchive(key, cb)
  })

  function getArchive (key, cb) {
    const archive = hyperdrive(db, key, { sparse: opts.sparse })
    archive.on('ready', () => {
      if (opts.webrtc) {
        webRtcSwarm()
        swarm(archive)
      } else {
        swarm(archive)
      }

      if (archive.content) return done()
      archive.metadata.get(0, () => {
        done()
      })
    })

    function done () {
      // why only work if webrtc connects fist?
      archive.content.get(0, () => {
        cb(null, archive)
      })
    }

    function webRtcSwarm () {
      const swarmKey = archive.discoveryKey.toString('hex').slice(40)
      const webSwarm = new WebrtcSwarm(signalhub(swarmKey, ['https://signalhub-jccqtwhdwc.now.sh/', 'http://gateway.mauve.moe:3300']), {
        wrtc: require('wrtc')
      })

      webSwarm.on('peer', function (conn, info) {
        debug('Webrtc peer', info)
        pump(conn, archive.replicate({ live: true }), conn)
      })
    }
  }
}
