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
            if(node.layout.status === STATUS.ST) {
                node.layout.y = (node.year - minYear) / ratio;
            }
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

function checkPositionWithBeforeNode(node, nodeBefore, max = null) {
    let originY = (node.year - minYear) / ratio;
    let diff = originY - nodeBefore.layout.y;
    if(diff >= nodeRadius) {
        if(max && originY > max) {
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
        else {
            return {
                y: originY,
                zoom: ratio,
                status: STATUS.ST
            }
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
    let {before, after} = getNeighborExists(index);
    // if(node.itemId == '57e1ef980bd1be123f524e5e') {
    //     console.log(node, nodesList[before], nodesList[after]);
    //     debugger
    // }
    // if(ratio >= 0.001 && ratio < 0.002) {
    //     console.log(node, nodesList[before], nodesList[after])
    // }
    if(before < 0 && after < 0) {
        return {
            y: (node.year - minYear) / ratio,
            zoom: ratio,
            status: STATUS.ST
        }
    }
    else if(before >= 0 && after < 0) {
        let nodeBefore = nodesList[before];
        let status = checkPositionWithBeforeNode(node, nodeBefore);
        return status
    }
    else if(before >= 0 && after >= 0) {
        let nodeBefore = nodesList[before], nodeAfter = nodesList[after];
        let originY = (node.year - minYear) / ratio;
        if((nodeAfter.layout.y - originY) >= nodeRadius && (nodeAfter.layout.y - nodeBefore.layout.y) >= nodeRadius * 2) {
            return checkPositionWithBeforeNode(node, nodeBefore);
        }
        else {
            return false
        }
    }
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

    ratio = Math.ceil((maxYear - minYear) / window.innerHeight);
    while(ratio > minRatio) {
        reCalcExistsNodes(nodesList);
        nowLevel = [...new Set(nodesList.filter(node => !node.layout).map(node => node.importance))].sort((a,b) => a-b)[0];
        // console.log(nowLevel)
        // console.log(nodesList.filter(node => node.layout))
        // console.log(nodesList.filter(node => !node.layout && node.importance == nowLevel))
        // console.log(ratio)
        for(let i = 0; i < nodesList.length; i ++) {
            let node = nodesList[i];
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