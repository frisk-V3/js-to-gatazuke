/**
 * TypedJS: 実行時に型制約を強制するエンジン
 */
const Typed = (() => {
    const logger = document.getElementById('log');
    
    const print = (msg, type = 'info') => {
        const div = document.createElement('div');
        div.className = type;
        div.textContent = `> ${msg}`;
        logger.appendChild(div);
    };

    // 型定義のバリデータ
    const Validators = {
        number: (v) => typeof v === 'number' && !isNaN(v),
        string: (v) => typeof v === 'string',
        boolean: (v) => typeof v === 'boolean',
        array: (v) => Array.isArray(v)
    };

    return {
        /**
         * 型付けされたオブジェクトを作成する
         * @param {Object} schema - { key: 'type' } の形式
         * @param {Object} initial - 初期値
         */
        create: (schema, initial) => {
            const handler = {
                set(target, prop, value) {
                    const expectedType = schema[prop];
                    if (!expectedType) {
                        print(`Error: プロパティ '${prop}' はスキーマに定義されていません。`, 'error');
                        return false;
                    }
                    
                    const validator = Validators[expectedType];
                    if (validator && !validator(value)) {
                        const errorMsg = `TypeError: '${prop}' に不適切な型が代入されました。期待: ${expectedType}, 入力: ${typeof value} (${value})`;
                        print(errorMsg, 'error');
                        throw new TypeError(errorMsg);
                    }

                    print(`Assign: ${prop} = ${JSON.stringify(value)}`, 'success');
                    target[prop] = value;
                    return true;
                }
            };

            const proxy = new Proxy({}, handler);
            // 初期値の代入
            Object.keys(initial).forEach(key => {
                proxy[key] = initial[key];
            });
            return proxy;
        },

        /**
         * 型付けされた関数を作成する (引数と戻り値のガード)
         */
        fn: (argTypes, returnType, fn) => {
            return (...args) => {
                // 引数チェック
                args.forEach((arg, i) => {
                    if (!Validators[argTypes[i]](arg)) {
                        throw new TypeError(`Argument ${i} must be ${argTypes[i]}`);
                    }
                });

                const result = fn(...args);

                // 戻り値チェック
                if (!Validators[returnType](result)) {
                    throw new TypeError(`Return value must be ${returnType}`);
                }
                return result;
            };
        }
    };
})();

// --- メイン実行処理 ---

try {
    print("--- オブジェクトの型制約テスト ---");
    
    // 1. スキーマ定義
    const user = Typed.create(
        { id: 'number', name: 'string', active: 'boolean' },
        { id: 1, name: 'Gemini', active: true }
    );

    // 正しい代入
    user.id = 101; 

    // 2. 型付けされた関数の作成 (引数: number, number / 戻り値: number)
    const safeAdd = Typed.fn(['number', 'number'], 'number', (a, b) => a + b);
    
    print(`Function Call: safeAdd(10, 20) => ${safeAdd(10, 20)}`);

    // 3. 意図的にエラーを発生させる
    print("--- 異常系テスト (エラーをキャッチします) ---");
    
    // 文字列に数値を代入しようとする
    user.name = 12345; 

} catch (e) {
    console.error("Runtime Type Error caught:", e.message);
}
