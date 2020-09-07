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
    screenHeight = 0,
    nodeRadius = 120;

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
    let before = index, after = index, length = nodes.length;
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
    let diff = (node.year - nodeBefore.year) / ratio;
    if(nodeBefore.layout.status === STATUS.ST) {
        if(diff >= nodeRadius) {
            return {
                y: nodeBefore.layout.y + diff,
                zoom: ratio,
                status: STATUS.ST
            }
        }
        else {
            return {
                y: nodeBefore.layout.y + nodeRadius,
                zoom: ratio,
                status: STATUS.DS
            }
        }
    }
    else {
        let originY = (node.year - minYear) / ratio;
        if(originY >= nodeBefore.layout.y + nodeRadius) {
            return {
                y: originY,
                zoom: ratio,
                status: STATUS.ST
            }
        }
        else {
            return false;
        }
    }
}

function getNodeStatus(node, index) {
    let {before, after} = getNeighborExists(index);
    if(before < 0 && after < 0) {
        return {
            y: (node.year - minYear) / ratio,
            zoom: ratio,
            status: STATUS.ST
        }
    }
    else if(before >= 0 && after < 0) {
        let nodeBefore = nodesList[before];
        return checkPositionWithBeforeNode(node, nodeBefore);
    }
    else if(before >= 0 && after >= 0) {
        let nodeBefore = nodesList[before], nodeAfter = nodesList[after];
        let distance = nodeAfter.layout.y - nodeBefore.layout.y;
        if(distance >= nodeRadius) {
            return checkPositionWithBeforeNode(node, nodeBefore)
        }
        else {
            return false
        }
    }
    else {
        return false
    }
}
export default function calcLayout(props) {
    nodes = props.nodes;
    minYear = props.minYear; 
    maxYear = props.maxYear;
    minRatio = props.minRatio || 2.9;
    step = props.step || 0.01;
    screenHeight = props.screenHeight || window.innerHeight;

    nodesList = JSON.parse(JSON.stringify(nodes));

    ratio = Math.floor((maxYear - minYear) / window.innerHeight);
    while(ratio > minRatio) {
        reCalcExistsNodes(nodesList);
        for(let i = 0; i < nodesList.length; i ++) {
            let node = nodesList[i];
            if(nodesList[i].layout) {
                continue;
            }
            else {
                let status = getNodeStatus(node, i);
                if(status) {
                    nodesList[i].layout = status;
                }
            }
        }
        ratio -= step;
    }
    console.log(nodesList.filter(node => node.layout).map(node => node.layout))
}