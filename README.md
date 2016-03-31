# swagger-raml-poc

Swagger to RAML conversions using stoplight.io's `api-spec-converter`.

### Installation

> You might have to prefix the following with `sudo`

```
npm install -g https://github.com/llattes/swagger-raml-poc.git
```

### Usage

```bash
$ convertSR -i yourSwaggerSpec.json -f
```

Usage: convertSR (-i | --input) (fileName) ((-r | --raml) | (-f | --full))

Options:

-h, --help              output usage information
-V, --version           output the version number
-i, --input <fileName>  The Swagger .json file to convert
-r, --raml              Convert to RAML only
-f, --full              Do the full roundtrip Swagger > RAML > Swagger

Usage examples:

For output to RAML only:
```bash
$ convertSR -i conversion_files/input/twitter.json -r
```
**Should generate a file named twitter-json-r.raml in the conversion_files/input directory**

For roundtrip conversion Swagger > RAML > Swagger:
```bash
$ convertSR -i yourSwaggerSpec.json -f
```
**Should generate two files named yourSwaggerSpec-json-f.raml and yourSwaggerSpec-json-f.json**

> type convertSR -h for help
