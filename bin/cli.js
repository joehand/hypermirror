#!/usr/bin/env node

var minimist = require('minimist')
var http = require('http')
var hyperHttp = require('hyperdrive-http')
var mirror = require('..')

var argv = minimist(process.argv.slice(2), {
  boolean: ['webrtc', 'sparse'],
  alias: {
    webrtc: 'w'
  },
  default: {
    webrtc: false,
    sparse: false
  }
})

argv.link = argv._[0]

if (!argv.link) {
  console.error('Link required')
  process.exit(1)
}

process.title = 'hypermirror'

// set debug before requiring other modules
if (argv.debug) {
  var debugArgs = argv.debug
  if (typeof argv.debug === 'boolean') debugArgs = '*' // default
  process.env.DEBUG = debugArgs
}
var debug = require('debug')('hypermirror') // require this after setting process.env.DEBUG
debug('options', argv)

mirror(argv.link, argv, function (err, archive) {
  if (err) return console.error(err)
  archive.readFile('dat.json', 'utf8', (err, data) => {
    if (err) return console.error(err)
    debug('dat.json:', data)
  })
  console.log('mirroring archive:\n', 'dat://' + archive.key.toString('hex'))

  var server = http.createServer().listen(() => {
    console.log(`http archive at: http://localhost:${server.address().port}`)
  })
  server.on('request', hyperHttp(archive))
})
