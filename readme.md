# HyperMirror

Mirrors hyperdrives locally with support for:

* **WebRTC** - Allowing a node service to act as a gateway between Dat's p2p network and Web-based clients.
* **http** - View files locally via http server, especially useful in sparse mode.

 WebRTC,  Nice for testing!

## Install

```
npm install -g hypermirror
```

## Usage

`hypermirror <link>`

### Options

* `--webrtc` to mirror a Dat across Dat CLI and dat.land.
* `--sparse` to keep dat sparse, otherwise all data is downloaded.
* `--temp` or `-m` to keep hyperdrives in memory, otherwise they are written to `<cwd>/hypermirror-data`

Use `DEBUG=hypermirror` to view debug information.

## API

### `mirror(link, [opts], [cb])`

cb is called with `cb(err, feed)` where `feed` is either the hypercore feed or the hyperdrive archive.

See CLI for example usage.

Options can include:

```js
{
  temp: false, // keep in memory
  webrtc: false, // use wrtc to share via webrtc
  sparse: false // only download data as requested
}
```

## License

MIT
