## HyperMirror

Mirror hypercore & hyperdrive feeds. 

### Install 

```
npm install -g hypermirror
```

### Usage

`hypermirror <link>`

Mirrors the hypercore or hyperdrive link. Tells you when content is done downloading. It is all in memory right now, so probably not great for large hyperdrives.

#### Options

`--webrtc`: mirror with webrtc too. Allows you to mirror dat.land links

### TODO: 

* Allow non-memory mirroring
* kept all chunks rather than latest, e.g. if it used a content addressable chunk store
* Mirror many feeds with one process
