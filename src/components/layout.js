const STATUS = {
    ST: 'straight',
    DS: 'discount'
}

let nodesList = {},
    ratio = 0,
    nodes = [],
    minYear = 0,
    maxYear = 0,
    minRatio = 0,
    step = 0,
    nowLevel = 0,
    screenHeight = 0,
    nodeRadius = 50;

function reCalcExistsNodes() {
    let before = -1;
    for(let i = 0; i < nodesList.length; i ++) {
        if(nodesList[i].layout) {
            let node = nodesList[i];
            //之前直出的现在一定直出
            if(node.layout.status === STATUS.ST) {
                node.layout.y = (node.year - minYear) / ratio;
            }
            //之前斜出的，需要重新计算
            else if(before >= 0) {
                let status = checkPositionWithBeforeNode(node, nodesList[before]);
                nodesList[i].layout.y = status.y;
                nodesList[i].layout.status = status.status;
            }
            before = i;
        }
    }
}

function getNeighborExists(index) {
    let before = index, after = index, length = nodesList.length;
    while(before >= 0) {
        if(nodesList[before].layout) {
            break;
        }
        before --;
    }
    while(after < length) {
        if(nodesList[after].layout){
            break;
        }
        after ++;
    }
    if(after == length) {
        after = -1;
    }
    return {before, after}
}

function checkPositionWithBeforeNode(node, nodeBefore) {
    let originY = (node.year - minYear) / ratio;
    let diff = originY - nodeBefore.layout.y;
    if(diff >= nodeRadius) {
        return {
            y: originY,
            zoom: ratio,
            status: STATUS.ST
        }
    }
    else {
        if(nodeBefore.layout.status === STATUS.ST) {
            return {
                y: nodeBefore.layout.y + nodeRadius,
                zoom: ratio,
                status: STATUS.DS
            }
        }
        else {
            return false;
        }
    }
}

function getNodeStatus(node, index) {
    //获取前后已渲染的节点
    let {before, after} = getNeighborExists(index);
    // if(node.itemId == '57e1ef980bd1be123f524e5e') {
    //     console.log(node, nodesList[before], nodesList[after]);
    //     debugger
    // }
    // if(ratio >= 0.001 && ratio < 0.002) {
    //     console.log(node, nodesList[before], nodesList[after])
    // }

    // 前后无节点，直接计算自己
    if(before < 0 && after < 0) {
        return {
            y: (node.year - minYear) / ratio, //当前渲染y值
            zoom: ratio, // 可以进行渲染的最大缩放层级
            status: STATUS.ST // 当前渲染状态(直出 或 斜出)
        }
    }
    //只有前序节点
    else if(before >= 0 && after < 0) {
        let nodeBefore = nodesList[before];
        let status = checkPositionWithBeforeNode(node, nodeBefore);
        return status
    }
    //前后续都有
    else if(before >= 0 && after >= 0) {
        let nodeBefore = nodesList[before], nodeAfter = nodesList[after];
        let originY = (node.year - minYear) / ratio;
        //仅在前后节点中间有足够空隙，并且当前节点理论y值与后续节点无碰撞时进行计算
        if((nodeAfter.layout.y - originY) >= nodeRadius && (nodeAfter.layout.y - nodeBefore.layout.y) >= nodeRadius * 2) {
            return checkPositionWithBeforeNode(node, nodeBefore);
        }
        else {
            return false
        }
    }
    //只有后续节点
    else if(before < 0 && after >= 0) {
        let nodeAfter = nodesList[after];
        let originY = (node.year - minYear) / ratio;
        if((nodeAfter.layout.y - originY) >= nodeRadius) {
            return {
                y: originY,
                zoom: ratio,
                status: STATUS.ST
            }
        }
        else {
            return false
        }
    }
    else {
        return false;
    }
}

export default function calcLayout(props) {
    nodes = props.nodes;
    minYear = props.minYear; 
    maxYear = props.maxYear;
    minRatio = props.minRatio || 0.001;
    step = props.step || 0.001;
    screenHeight = props.screenHeight || window.innerHeight;
    nodeRadius = props.radius || 50;

    nodesList = JSON.parse(JSON.stringify(nodes));

    ratio = 1.7 // 初始缩放比：  year / pixel;
    while(ratio > minRatio) {
        //首先根据当前缩放比重新计算所有节点位置状态
        reCalcExistsNodes(nodesList);
        //计算出当前未渲染节点的最高优先级是多少，并以此优先级作为此次循环的优先级
        nowLevel = [...new Set(nodesList.filter(node => !node.layout).map(node => node.importance))].sort((a,b) => a-b)[0];
        // console.log(nowLevel)
        // console.log(nodesList.filter(node => node.layout))
        // console.log(nodesList.filter(node => !node.layout && node.importance == nowLevel))
        // console.log(ratio)

        //开始循环遍历
        for(let i = 0; i < nodesList.length; i ++) {
            let node = nodesList[i];
            //若已经计算过，或者未到达优先级，则跳过
            if(node.layout || node.importance > nowLevel) {
                continue;
            }
            else {
                let status = getNodeStatus(node, i);
                if(status) {
                    node.layout = status;
                }
            }
        }
        ratio -= step;
    }

    console.log(nodesList.filter(node => !node.layout))
    return nodesList;
}