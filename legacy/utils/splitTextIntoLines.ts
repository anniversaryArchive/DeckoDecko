// 기본 비율
const BASE_CHAR_RATIO = 0.97;
// 영문/숫자일 경우 추가로 곱해지는 비율
const ENGLISH_RATIO_MULTIPLIER = 0.7;
// 영문/숫자만 있는지 확인하는 정규식
const ENGLISH_NUM_REGEX = /^[a-zA-Z0-9]+$/;

export function splitTextIntoLines(text: string, containerWidth: number, fontSize: number) {
  //  원본 문자열을 단어 기준으로 나누기
  const words = text.split(/\s+/); // 공백 기준 분리
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    let estimatedCharWidth = fontSize;
    if (ENGLISH_NUM_REGEX.test(word)) {
      estimatedCharWidth *= ENGLISH_RATIO_MULTIPLIER; // 영문/숫자일 경우 추가 비율 적용
    } else {
      estimatedCharWidth *= BASE_CHAR_RATIO; // 기본 너비 (한글/기타)
    }

    const maxCharsPerLine = Math.floor(containerWidth / estimatedCharWidth); // 한 문장 내 최대 글자 수

    // 만약 단어 하나가 한 줄보다 길다면, 그 단어를 강제로 자릅니다.
    if (word.length > maxCharsPerLine) {
      // 강제 줄바꿈 전에, 현재까지의 라인을 먼저 추가합니다.
      if (currentLine.length > 0) {
        lines.push(currentLine.trim());
      }

      // 긴 단어를 한 줄 최대 길이에 맞게 자릅니다.
      let wordPart = word;
      while (wordPart.length > maxCharsPerLine) {
        lines.push(wordPart.substring(0, maxCharsPerLine));
        wordPart = wordPart.substring(maxCharsPerLine);
      }
      // 남은 단어 조각은 다음 라인의 시작이 됩니다.
      currentLine = wordPart + " ";
      continue;
    }

    // (현재 라인 + 새 단어 + 공백)이 최대 길이를 초과하는지 확인
    if ((currentLine + word + " ").length > maxCharsPerLine) {
      // 초과하면, 현재 라인을 배열에 추가
      lines.push(currentLine.trim());
      // 새 라인은 이 단어로 시작
      currentLine = word + " ";
    } else {
      // 초과하지 않으면, 현재 라인에 단어 추가
      currentLine += word + " ";
    }
  }

  // 4. 마지막에 남은 라인을 추가합니다.
  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
}
