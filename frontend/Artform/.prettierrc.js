module.exports = {
  semi: true, // 문장 끝에 세미콜론(;)을 추가
  singleQuote: true, // 문자열을 작은따옴표(')로 변환
  trailingComma: 'all', // 여러 줄일 때 마지막 요소에도 쉼표 추가 (가독성 향상)
  printWidth: 80, // 한 줄 최대 80자로 제한 (자동 줄바꿈 적용)
  tabWidth: 2, // 들여쓰기 시 공백 2칸 사용
  useTabs: false, // 들여쓰기에 공백(Space) 사용 (true로 설정하면 탭 사용)
  arrowParens: 'always', // 화살표 함수에서 매개변수가 1개여도 괄호 추가
  endOfLine: 'lf', // 줄바꿈 형식을 LF(Line Feed)로 설정 (Windows CRLF 방지)
};
