const input = document.getElementById('input');
const output = document.getElementById('output');

/**
 * 型推論エンジン
 */
function getTypeName(value) {
    if (/^\d+(\.\d+)?$/.test(value)) return 'number';
    if (/^["' ]/.test(value)) return 'string';
    if (/^(true|false)$/.test(value)) return 'boolean';
    if (/^\[/.test(value)) return 'object'; // Array
    return 'any';
}

/**
 * コンパイラ・コア
 */
function transpile(source) {
    const lines = source.split('\n');
    let compiled = "// --- Runtime Type Checked Code ---\n\n";

    lines.forEach(line => {
        const trimmed = line.trim();
        
        // 変数宣言を抽出: (let|const) name = value;
        const match = trimmed.match(/^(let|const|var)\s+(\w+)\s*=\s*(.*);?$/);

        if (match) {
            const [_, kind, name, val] = match;
            const value = val.replace(';', '').trim();
            const type = getTypeName(value);

            // Haxe風のランタイム・ガード・コードを生成
            compiled += `let __${name} = ${value};\n`;
            compiled += `Object.defineProperty(window, '${name}', {\n`;
            compiled += `    get: () => __${name},\n`;
            compiled += `    set: (v) => {\n`;
            compiled += `        if (typeof v !== "${type}") {\n`;
            compiled += `            throw new TypeError("Runtime Error: Property '${name}' must be ${type}. (Got " + typeof v + ")");\n`;
            compiled += `        }\n`;
            compiled += `        __${name} = v;\n`;
            compiled += `    }\n`;
            compiled += `});\n\n`;
        } else if (trimmed !== "") {
            compiled += line + "\n";
        }
    });

    return compiled;
}

// リアルタイム反映
input.addEventListener('input', () => {
    try {
        output.value = transpile(input.value);
    } catch (e) {
        output.value = "// Error during compilation...\n" + e.message;
    }
});
