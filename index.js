#!/usr/bin/env node
'use strict';

var pkg       = require('./package.json');
var fs        = require('fs');
var program   = require('commander');
var chalk     = require("chalk");
var converter = require('api-spec-converter');

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

var convertRoundtrip = function convertRoundtrip(fileName) {
  console.log('Roundtrip conversion stage 1: SWAGGER >> RAML (' + fileName + ')');

  var swaggerToRamlConverter = new converter.Converter(converter.Formats.SWAGGER, converter.Formats.RAML);
  swaggerToRamlConverter.loadFile(fileName, function (err) {
    if (err) {
      console.log(err.stack);
      return;
    }

    swaggerToRamlConverter.convert('yaml')
      .then(function (convertedData) {
        var sanitized = convertedData.replace(/^(\s+)\'(.+)\'/gm, '$1$2');
        fs.writeFileSync(replaceAll(fileName, '.', '-') + '-f.raml', sanitized, 'utf8');
      })
      .then(function () {
        console.log('Roundtrip conversion stage 2: RAML >> SWAGGER');

        var ramlToSwaggerConverter = new converter.Converter(converter.Formats.RAML, converter.Formats.SWAGGER);
        ramlToSwaggerConverter.loadFile(replaceAll(fileName, '.', '-') + '-f.raml', function (err) {
          if (err) {
            console.log(err.stack);
            return;
          }

          ramlToSwaggerConverter.convert('json')
            .then(function (convertedData) {
              fs.writeFileSync(replaceAll(fileName, '.', '-') + '-f.json', JSON.stringify(convertedData, null, 4), 'utf8');
            })
            .catch(function (err) {
              console.log(err);
            })
          ;
        });
      })
      .catch(function (err) {
        console.log(err);
      })
    ;
  });
};

var convertToRaml = function convertToRaml(fileName) {
  console.log('Converting to RAML (' + fileName + ')');

  var swaggerToRamlConverter = new converter.Converter(converter.Formats.SWAGGER, converter.Formats.RAML);
  swaggerToRamlConverter.loadFile(fileName, function (err) {
    if (err) {
      console.log(err.stack);
      return;
    }

    swaggerToRamlConverter.convert('yaml')
      .then(function (convertedData) {
        var sanitized = convertedData.replace(/^(\s+)\'(.+)\'/gm, '$1$2');
        fs.writeFileSync(replaceAll(fileName, '.', '-') + '-r.raml', sanitized, 'utf8');
      })
      .catch(function (err) {
        console.log(err);
      })
    ;
  });
};

program
  .version(pkg.version)
  .usage('(-i | --input) (fileName) ((-r | --raml) | (-f | --full))')
  .option('-i, --input <fileName>', 'The Swagger .json file to convert')
  .option('-r, --raml', 'Convert to RAML only')
  .option('-f, --full', 'Do the full roundtrip Swagger > RAML > Swagger');

program.on('--help', function() {
  console.log(chalk.green('  Usage examples:'));
  console.log('');
  console.log(chalk.green('    For output to RAML only:'));
  console.log('      $ convertSR -i conversion_files/input/twitter.json -r');
  console.log(chalk.yellow('      Should generate a file named twitter-json-r.raml in the conversion_files/input directory'));
  console.log('');
  console.log(chalk.green('    For roundtrip conversion Swagger > RAML > Swagger:'));
  console.log('      $ convertSR -i yourSwaggerSpec.json -f');
  console.log(chalk.yellow('      Should generate two files named yourSwaggerSpec-json-f.raml and yourSwaggerSpec-json-f.json'));
  console.log('');
});

program.parse(process.argv);

if (program.input && (program.raml || program.full)) {
  if (program.full) {
    convertRoundtrip(program.input);
  } else {
    convertToRaml(program.input);
  }
} else {
  program.help();
}
