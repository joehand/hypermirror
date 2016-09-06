# HyperMirror

Mirror hypercore & hyperdrive feeds. 

Hypermirror mirror any type of hypercore or hyperdrive feed. It comes with electron-webrtc so you can mirror dat.land links or be a peer so dat.land users can access Dats shared with the CLI.

## Example

Let's say you want to mirror & backup a hyperdrive feed while also acting as a hybrid peer (node + webrtc for browsers). You would run:

```
hypermirror <dat-link> --dir=my_data --persist --webrtc
```

This will download the Dat, which includes all the files and a `.dat` folder, to the `my_data` folder. It will share the Dat via webrtc so users can access it on dat.land.

## Install

```
npm install -g hypermirror
```

## Usage

`hypermirror <link>`

Mirrors the hypercore or hyperdrive link. Minimal output right now.

### Options

* `--webrtc` to mirror a Dat across Dat CLI and dat.land.
* `--persist` or `-p` to persist hyperdrive database and files on the file system (currently only supported for hyperdrive feeds)
* `--dir=/my_dir` to put files and `.dat` folder. Only works with `--persist` option (currently only supported for hyperdrive feeds)

Use `DEBUG=hypermirror` to view debug information.

## API

### `mirror(link, [opts], [cb])`

cb is called with `cb(err, feed)` where `feed` is either the hypercore feed or the hyperdrive archive.

See CLI for example usage.

Options can include:

```js
{
  persist: false, // persist the hyperdrive via dat-js
  webrtc: false, // use electron-webrtc to share via webrtc
  dir: process.cwd() // if persisted, where to download dat
}
```

### TODO:

* Allow non-memory mirroring for hypercore
* kept all chunks rather than latest, e.g. if it used a content addressable chunk store
* Mirror many feeds with one process

## License

MIT
