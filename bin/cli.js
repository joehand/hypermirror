#!/usr/bin/env node

var minimist = require('minimist')
var mirror = require('..')

var argv = minimist(process.argv.slice(2), {
  boolean: ['webrtc', 'persist'],
  alias: {
    persist: 'p'
  },
  default: {
    webrtc: false,
    persist: false
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

mirror(argv.link, argv, function (err, feed) {
  if (err) return console.error(err)
  var isArchive = (feed.metadata)
  if (isArchive) {
    feed.open(function () {
      feed.content.on('download-finished', function () {
        debug('Done downloading content')
      })
    })
  } else {
    feed.on('download-finished', function () {
      debug('Done downloading content')
    })
  }

  debug('Type of feed: ' + (isArchive ? 'Hyperdrive' : 'Hypercore'))
  console.log('mirroring feed', feed.key.toString('hex'))
})
