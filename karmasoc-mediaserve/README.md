# karmasoc-mediaserve

This repository is used to serve files out of a mongodb.

This is a seperate internal server instance. All file related requests to [karmasoc-web-server](https://github.com/karmasoc/karmasoc-web-server) are proxied to this server. The files are stored/retrieved in/from a mongo db.
