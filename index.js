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

  const db = opts.db ? opts.db : require('random-access-memory') // todo: hookup opts.db

  getDatKey(link, (err, key) => {
    if (err) return cb(err)
    getArchive(key, cb)
  })

  function getArchive (key, cb) {
    const archive = hyperdrive(db, key, { sparse: opts.sparse || true })
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
