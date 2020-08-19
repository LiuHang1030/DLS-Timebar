/**
 * 处理一系列关于时间轴的计算
 */

export default {
  /**
   * 通过传入的选中的起始时间，计算单位时间，与单位宽度 unitTime , unitWidth
   * 整个计算将根据初始缩放 ，单位长度，与单位时间计算
   * @param offsetLength 选中区域像素长度
   * 
   */
  calcUnitBySelectedOffset(timebar, start, end, _selectWidth = false) {

    let newUnitWidth = 0,
      newUnitTime = 0;

    let startOffset = timebar.startOffsetPx;
    let endOffset = timebar.endOffsetPx;

    /**
     * 获取选中区域宽度
     * 如果手动设置宽度，则使用手动设置的值 _selectWidth
     */
    let selectedWidth = endOffset + startOffset;
    if (_selectWidth) {
      selectedWidth = _selectWidth;
    }

    /**
     * 获取选中区域时间跨度
     */
    let selectedDuration = end - start;
    /**
     * 计算初始时间，选中区域时间跨度
     */
    let startUnitNumber = selectedWidth / timebar.startUnitWidth;
    let startDuration = startUnitNumber * timebar.startUnitTime;
    /**
     * 计算缩放倍数, ratio = 2;
     * D = d * 2 ** n
     */
    let n = Math.log2(selectedDuration / startDuration);

    /**
     * 计算新的单位时间
     */
    newUnitTime = timebar.startUnitTime * (2 ** Math.ceil(n));


    /**
     * 计算新的单位宽度
     */
    newUnitWidth = timebar.startUnitWidth * ((startUnitNumber * newUnitTime) / selectedDuration)

    console.log({
      selectedWidth,
      startUnitNumber,
      n,
      newUnitTime,
      newUnitWidth,
      selectedDuration
    })

    return {
      selectedWidth,
      startUnitNumber,
      n,
      newUnitTime,
      newUnitWidth,
      selectedDuration
    }


  }
}