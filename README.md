# prettier-plugin-fhirpath

Prettier plugin for FHIRPath language using ANTLR4 grammar

## Installation

```
yarn add --dev prettier-plugin-fhirpath
```

## Configuration

In `.prettierrc.js`
```
    ...
    plugins: ["prettier-plugin-fhirpath"]
    ...
```

## Formatting rules

There are no general rules are described for the moment anywhere, so based on the experience of writing 
quite long and complex expressions there are some rules of formatting introduced for better readability:


- Parentheses content should be split by new lines if the content length is more than N characters  or more than one argument is used in the function

Should not be formatted with new lines:
```fhirpath
repeats(item)

(1 + 1)

where(code = 'value')
```

Should be formatted with new lines:
```fhirpath
iif(
    %var > 1,
    1,
    2
)

where(
    code = %var.very.long.path.to.the.value
)
```

- Union operator should be split by new lines if the total length is more than N characters

Should not be formatted with new lines:
```fhirpath
code in 'a' | 'b' | 'c'
```

Should be formatted with new lines:
```fhirpath
code in 
    'very-long-code-first' | 
    'very-long-code-second' | 
    'very-long-code-third'
```

- Spaces around operators and keywords always should be used

```fhirpath
where(code = 'value1' or code = 'value2')

1 + 1 / 1
```

## Supported extensions

- .fhirpath
- .yaml (embedded inside `expression`)


## Future plans
- .jsx?/.tsx? (embedded inside `fhirpath` template)


## Release Notes

### 0.0.1a (in development)

- Initial release
