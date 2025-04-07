module.exports = {
    // ... 다른 설정들
    rules: {
       '@typescript-eslint/no-unused-vars': 'off', // 완전히 비활성화
      // 또는
    //   '@typescript-eslint/no-unused-vars': ['warn', { // 경고로만 표시
    //     'varsIgnorePattern': '^_',
    //     'argsIgnorePattern': '^_'
    //   }]
    }
  }