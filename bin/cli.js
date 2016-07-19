#!/usr/bin/env node

var minimist = require('minimist')
var mirror = require('..')

var argv = minimist(process.argv.slice(2), {
  boolean: ['webrtc'],
  default: {
    webrtc: false
  }
})

argv.link = argv._[0]

if (!argv.link) {
  console.error('link required')
  process.exit(1)
}

mirror(argv.link, argv, function (err, feed) {
  if (err) return console.error(err)
  var isArchive = (feed.metadata)
  if (isArchive) {
    feed.open(function () {
      feed.content.on('download-finished', function () {
        console.log('Done downloading content')
      })
    })
  } else {
    feed.on('download-finished', function () {
      console.log('finished downloading')
    })
  }

  console.log('Type of feed:', isArchive ? 'Hyperdrive' : 'Hypercore')
  console.log('mirroring feed', feed.key.toString('hex'))
})
