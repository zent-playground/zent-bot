export const formatNumber = (num: number, length: number = 2): string => {
	const str = `${num}`;
	return str.length < length ? `${Array(length - str.length + 1).join("0")}${str}` : str;
};

export const formatTimestamp = (date?: Date | number) => {
	date = new Date(date || Date.now());

	const yyyy = date.getFullYear();
	const mm = formatNumber(date.getMonth() + 1);
	const hh = formatNumber(date.getHours());
	const ss = formatNumber(date.getSeconds());
	const dd = formatNumber(date.getDate());

	return `${yyyy}/${mm}/${dd} - ${hh}:${mm}:${ss}`;
};

export const capitalize = (value: string) => {
	return value[0].toUpperCase() + value.substring(1);
};
