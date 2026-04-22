const logDiv = document.getElementById('console');
const strictToggle = document.getElementById('strictMode');

const print = (msg, isError = false) => {
    const p = document.createElement('div');
    if (isError) p.className = 'error';
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logDiv.prepend(p);
};

/**
 * JSに型を強制させる「型安全コンテナ」
 */
function createTypedVar(initialValue, expectedType) {
    let _value = initialValue;

    return {
        get value() { return _value; },
        set value(newValue) {
            // チェックボックスがONの時だけ「本気で」型チェックする
            if (strictToggle.checked) {
                const actualType = typeof newValue;
                if (actualType !== expectedType) {
                    const errorMsg = `型エラー! 期待値: ${expectedType}, 入力値: ${actualType} (${newValue})`;
                    print(errorMsg, true);
                    throw new TypeError(errorMsg); // 実行を止める
                }
            }
            _value = newValue;
            print(`代入成功: ${newValue} (${typeof newValue})`);
        }
    };
}

// 数値型(number)として定義
const myData = createTypedVar(10, 'number');

function runTest() {
    try {
        print("テスト開始: myData.value に '20' (文字列) を入れます...");
        // ここで型チェックが走る
        myData.value = "20"; 
    } catch (e) {
        print("停止: 型が違うため処理をブロックしました。", true);
    }
}
