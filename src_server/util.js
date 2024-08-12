const roomNameTemplates = {
    prefix: ['React', 'Svelte', 'Vue', 'Preact', 'Solid', 'Angular'],
    middle: ['新手', '初级', '一般', '高级', '资深'],
    suffix: ['Java', 'CSharp', 'PHP', 'Go', 'Rust'],
}

let order = [];

// 添加校验位
const getCheckDigit = (p, m, s) => {
    const d = 10 - (p + m*3 + s) % 10;
    return d % 10;
}

// 生成随机房间名字
const generateRandomRoomNameAndCode = (index) => {
    const pLength = roomNameTemplates.prefix.length;
    const mLength = roomNameTemplates.middle.length;
    const sLength = roomNameTemplates.suffix.length;
    // 没有order就重新生成
    if (order.length == 0) {
        const len = pLength * mLength * sLength;
        for (let i = 0; i < len; ++i) {
            order.push(i);
        }

        for (let i = len - 1; i >= 0; --i) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            let temp = order[randIndex];
            order[randIndex] = order[i];
            order[i] = temp;
        }
    }

    const shuffleIndex = order[index % order.length]
    const pIndex = Math.floor(Math.floor(shuffleIndex / sLength) / mLength) % pLength;
    const mIndex = Math.floor(shuffleIndex / sLength) % mLength;
    const sIndex = shuffleIndex % sLength;
    const checkDigit = getCheckDigit(pIndex, mIndex, sIndex);

    return {
        name: `会${roomNameTemplates.prefix[pIndex]}的${roomNameTemplates.middle[mIndex]}${roomNameTemplates.suffix[sIndex]}开发者`,
        code: `${pIndex}${mIndex}${sIndex}${checkDigit}`
    }
}

export {
    generateRandomRoomNameAndCode
}