import antfu from '@antfu/eslint-config'

export default antfu({
    // 支持的语言特性
    typescript: true, // 启用 TypeScript 支持

    vue: { // Vue 文件的规则
        overrides: {
            // 强制 Vue 文件的顺序为 <template> -> <script> -> <style>
            'vue/block-order': [
                'error',
                {
                    order: ['template', 'script', 'style'],
                },
            ],
        },
    },

    // 规则覆盖（Rules）
    /**
     * 规则 https://www.wenjiangs.com/docs/eslint，vue规则：https://eslint.vuejs.org/rules/
     * 主要有如下的设置规则，可以设置字符串也可以设置数字，两者效果一致
     * 'off' 或 0 - 关闭规则
     * 'warn' 或 1 - 开启警告规则，使用警告级别的错误：warn (不会导致程序退出),
     * 'error' 或 2 - 开启错误规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
     */
    rules: {
        'no-console': 'off', // 允许 console
        // "no-debugger": "off", // 允许 debugger
        'prefer-arrow-callback': 'off', // 允许传统函数回调
        // "func-style": "off", // 允许非箭头函数
        // "@typescript-eslint/prefer-function-declarations": "off", // 关闭顶级函数必须用 function 声明的规则
    },
})
