/**
 *
 * @param {string} date - HH:MM:SS:ms string
 * @param {string} delimiter
 */
export default (date= '', delimiter = ':') :number => {
  const [hours = '0', minutes = '0', seconds = '0', milliseconds = '0'] = date.split(delimiter);
  return (parseInt(hours)*3600 + parseInt(minutes)*60 + parseInt(seconds)) * 1000 + parseInt(milliseconds)
};
