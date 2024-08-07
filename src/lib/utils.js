const nameTemplates = [
    'Evan You',
    'Jordan Walke',
    'Rich Harris',
    'Jason Miller',
    'Ryan Carniato',
    ''
];

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



export { generateRandomPlayerName }