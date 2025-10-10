// 날짜를 yyyy.mm.dd | hh:mm 형식으로 변환
export const formatYmdHm = (date: Date | string) => {
  date = new Date(date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} | ${hours}:${minutes}`;
};
