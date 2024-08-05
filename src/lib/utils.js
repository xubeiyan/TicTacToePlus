const nameTemplates = [
    'Evan You',
    'Jordan Walke',
    'Rich Harris',
];

const roomNameTemplates = {
    prefix: ['React', 'Svelte', 'Vue', 'Preact', 'Solid', 'Angular'],
    middle: ['新手', '初级', '一般', '资深'],
    suffix: ['Java', 'C#', 'PHP', 'Go', 'Rust'],
}

// 生成0到value的随机整数（不包括value）
const randomIntFromZeroTo = (value) => {
    return Math.floor(Math.random() * value);
}

// 生成随机玩家名字
const generateRandomPlayerName = (params) => {
    let nameList = nameTemplates;
    if (typeof params == 'object') {
        const { except } = params;
        if (except !== undefined) {
            nameList = nameList.filter(one => one != except);
        }
    }
    const index = randomIntFromZeroTo(nameList.length);
    return nameList[index];
}

// 生成随机房间名字
const generateRandomRoomName = () => {
    const prefixIndex = randomIntFromZeroTo(roomNameTemplates.prefix.length);
    const middleIndex = randomIntFromZeroTo(roomNameTemplates.middle.length);
    const suffixIndex = randomIntFromZeroTo(roomNameTemplates.suffix.length);

    return `会${roomNameTemplates.prefix[prefixIndex]}的${roomNameTemplates.middle[middleIndex]}${roomNameTemplates.suffix[suffixIndex]}开发者`;
}

export { generateRandomPlayerName, generateRandomRoomName }