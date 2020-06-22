const monthShortEn = [
  'Jan','Feb','Mar','Apr','Mar','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
]
export default {
  /**
   * 转换年为 XXX-XX 或者 XXXX Sep
   * @param {number} year 
   */
  yearToMonth(year,format){
    let month = Math.floor(Math.abs(year) % 1 * 12);

    switch(format){
      case 'short-en':
        return monthShortEn[month] + '.';        
      default:
        return month + 1;
    }

  }
}