const yamlPlugin = require('prettier/plugins/yaml');
const doc = require('prettier/doc');
const formatFHIRPath = require('./parse.js');

const b = doc.builders;

module.exports = {
    languages: [
        {
            name: 'FHIRPath',
            parsers: ['fhirpath'],
            extensions: ['.fhirpath'],
            vscodeLanguageIds: ['fhirpath'],
        },
    ],
    parsers: {
        fhirpath: {
            parse: (text, opts) => formatFHIRPath(text),
            astFormat: 'fhirpath',
            locStart: () => 0,
            locEnd: () => 0,
        },
        yaml: yamlPlugin.parsers.yaml,
    },
    printers: {
        fhirpath: {
            print: (path) => path.getValue(),
        },

        yaml: {
            ...yamlPlugin.printers.yaml,
            print: (path, opts, print) => {
                const node = path.getValue();

                if (node.type === 'mappingItem') {
                    if (
                        node.key.content.value === 'expression' &&
                        node.value.content.type === 'blockFolded'
                    ) {
                        return [
                            'expression:',
                            ' >-',

                            b.align(
                                ' '.repeat(opts.tabWidth),
                                formatFHIRPath(node.value.content.value)
                                    .split('\n')
                                    .flatMap((line) => [b.hardline, line]),
                            ),
                        ];
                    }
                }
                return yamlPlugin.printers.yaml.print(path, opts, print);
            },
        },
    },
};
