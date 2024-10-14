const antlr4 = require('antlr4');

const FHIRPathLexer = require('./parser/generated/FHIRPathLexer.js');
const FHIRPathParser = require('./parser/generated/FHIRPathParser.js');
const FHIRPathVisitor = require('./parser/generated/FHIRPathVisitor.js');

function parse(input) {
    const chars = new antlr4.InputStream(input);
    const lexer = new FHIRPathLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new FHIRPathParser(tokens);

    const tree = parser.entireExpression();
    return { tree, tokens };
}

class FormatVisitor extends FHIRPathVisitor {
    constructor() {
        super();
        this.indentLevel = 0;
        this.tabWidth = 2;
        // TODO: explain why 30
        this.maxLength = 30;
    }

    indent() {
        return ' '.repeat(this.tabWidth);
    }

    getIndentation() {
        return this.indent().repeat(this.indentLevel);
    }

    visitEntireExpression(ctx) {
        return this.visit(ctx.expression());
    }

    visitFunctionInvocation(ctx) {
        const functionName = this.visit(ctx.functn().identifier());

        if (ctx.functn().paramList()) {
            const rawParams = this.visit(ctx.functn().paramList()).trim();
            if (rawParams.length > this.maxLength || rawParams.indexOf('\n') !== -1) {
                this.indentLevel++;
                const params = this.visit(ctx.functn().paramList());
                this.indentLevel--;
                return `${functionName}(\n${params}\n${this.getIndentation()})`;
            } else {
                return `${functionName}(${rawParams})`;
            }
        }

        return `${functionName}()`;
    }

    visitParamList(ctx) {
        const expressions = ctx
            .expression()
            .map((expr) => `${this.getIndentation()}${this.visit(expr)}`);
        return expressions.join(',\n');
    }

    visitBinaryExpression(ctx) {
        let left = this.visit(ctx.expression(0)).trim();
        let right = this.visit(ctx.expression(1)).trim();
        let operator = ctx.getChild(1).getText().trim();

        // Combine parts for length checking
        const expression = `${left} ${operator} ${right}`;
        const totalLength = expression.length;

        const isRightParenthesized =
            ctx.expression(1).children[0] instanceof FHIRPathParser.ParenthesizedTermContext;

        if (
            totalLength > this.maxLength &&
            !['=', '<=', '>=', '<', '>', '!=', 'contains', 'in'].includes(operator) &&
            !isRightParenthesized
        ) {
            left = this.visit(ctx.expression(0));
            this.indentLevel++;
            right = this.visit(ctx.expression(1));
            this.indentLevel--;
            operator = ctx.getChild(1).getText();
            return `${left} ${operator}\n${this.getIndentation()}${this.indent()}${right}`;
        } else {
            return `${left} ${operator} ${right}`;
        }
    }

    visitUnionExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitEqualityExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitAdditiveExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitMultiplicativeExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitAndExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitOrExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitXorExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitInequalityExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitMembershipExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitTypeExpression(ctx) {
        return this.visitBinaryExpression(ctx);
    }

    visitPolarityExpression(ctx) {
        const operator = ctx.getChild(0).getText();
        const expression = this.visit(ctx.expression());
        return `${operator}${expression}`;
    }

    visitInvocationExpression(ctx) {
        const left = this.visit(ctx.expression(0));
        const right = this.visit(ctx.invocation());
        return `${left}.${right}`;
    }

    visitParenthesizedTerm(ctx) {
        this.indentLevel++;
        const innerExpression = this.visit(ctx.expression());
        this.indentLevel--;
        return `(\n${this.getIndentation()}${this.indent()}${innerExpression}\n${this.getIndentation()})`;
    }

    visitLiteralTerm(ctx) {
        return ctx.getText();
    }

    visitIdentifier(ctx) {
        return ctx.getText();
    }

    visitTerminal(node) {
        return node.getText().trim();
    }

    visitChildren(ctx) {
        if (!ctx) {
            return '';
        }

        let result = '';
        for (let i = 0; i < ctx.getChildCount(); i++) {
            const child = ctx.getChild(i);
            if (child instanceof antlr4.ParserRuleContext) {
                result += this.visit(child);
            } else {
                result += this.visitTerminal(child);
            }
        }
        return result;
    }
}

function formatFHIRPath(input) {
    const { tree } = parse(input);

    const visitor = new FormatVisitor();

    return visitor.visit(tree);
}

module.exports = formatFHIRPath;
